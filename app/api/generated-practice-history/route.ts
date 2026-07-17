import { getD1 } from "../../../db";
import {
  GENERATED_PRACTICE_SUBJECTS,
  GENERATED_PRACTICE_TEMPLATE_METADATA,
  generatePracticeQuestion,
  validateGeneratedPracticeQuestion,
  type GeneratedPracticeQuestion,
  type GeneratedPracticeSubjectId,
} from "../../generated-practice-engine";

export const dynamic = "force-dynamic";

const SUBJECT_IDS = new Set<GeneratedPracticeSubjectId>(
  GENERATED_PRACTICE_SUBJECTS.map((subject) => subject.id),
);
const MAX_BATCH_SIZE = 100;
const MAX_BODY_BYTES = 128_000;
const MAX_SEED_LENGTH = 512;
const MAX_TEMPLATE_ID_LENGTH = 128;
const MAX_HISTORY_ITEMS = 5_000;
const MAX_QUESTIONS_PER_MINUTE = 500;
const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 24;
const MAX_PAGE = 500;

type StoredHistoryRow = {
  id: string;
  subject_id: string;
  subject_name: string;
  template_id: string;
  format: string;
  category: string;
  title: string;
  payload: string;
  created_at: number;
};

type GenerationRequest = {
  subjectId: GeneratedPracticeSubjectId;
  seed: string;
  templateId?: string;
};

function boundedInteger(value: string | null, fallback: number, minimum: number, maximum: number) {
  if (value === null) return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum ? parsed : fallback;
}

function historyUnavailable() {
  return Response.json({ error: "HISTORY_UNAVAILABLE" }, { status: 503 });
}

const FALLBACK_WRITE_BUCKETS = new Map<string, { minuteBucket: number; questionCount: number }>();
const MAX_FALLBACK_CLIENTS = 5_000;

function anonymousClientAddress(request: Request) {
  return request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "unknown:" + (request.headers.get("user-agent") ?? "").slice(0, 160);
}

async function anonymousClientKey(address: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(address));
  return Array.from(new Uint8Array(digest).slice(0, 16))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

function claimFallbackWrite(address: string, minuteBucket: number, questionCount: number) {
  const current = FALLBACK_WRITE_BUCKETS.get(address);
  if (!current && FALLBACK_WRITE_BUCKETS.size >= MAX_FALLBACK_CLIENTS) return false;
  const nextCount = current?.minuteBucket === minuteBucket
    ? current.questionCount + questionCount
    : questionCount;
  if (nextCount > MAX_QUESTIONS_PER_MINUTE) return false;
  FALLBACK_WRITE_BUCKETS.set(address, { minuteBucket, questionCount: nextCount });
  if (FALLBACK_WRITE_BUCKETS.size > 1_000) {
    for (const [key, value] of FALLBACK_WRITE_BUCKETS) {
      if (value.minuteBucket < minuteBucket) FALLBACK_WRITE_BUCKETS.delete(key);
    }
  }
  return true;
}

function parseQuestion(value: unknown): GeneratedPracticeQuestion | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  try {
    const result = validateGeneratedPracticeQuestion(value as GeneratedPracticeQuestion);
    return result.ok ? value as GeneratedPracticeQuestion : null;
  } catch {
    return null;
  }
}

function parseGenerationRequest(value: unknown): GenerationRequest | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  const keys = Object.keys(candidate);
  if (keys.some((key) => !["subjectId", "seed", "templateId"].includes(key))) return null;
  if (typeof candidate.subjectId !== "string"
    || !SUBJECT_IDS.has(candidate.subjectId as GeneratedPracticeSubjectId)) return null;
  if (typeof candidate.seed !== "string"
    || candidate.seed.length < 1
    || candidate.seed.length > MAX_SEED_LENGTH) return null;
  if (candidate.templateId !== undefined
    && (typeof candidate.templateId !== "string"
      || candidate.templateId.length < 1
      || candidate.templateId.length > MAX_TEMPLATE_ID_LENGTH)) return null;
  if (typeof candidate.templateId === "string"
    && !GENERATED_PRACTICE_TEMPLATE_METADATA.some((template) =>
      template.id === candidate.templateId && template.subjectId === candidate.subjectId,
    )) return null;
  return {
    subjectId: candidate.subjectId as GeneratedPracticeSubjectId,
    seed: candidate.seed,
    ...(typeof candidate.templateId === "string" ? { templateId: candidate.templateId } : {}),
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedSubject = url.searchParams.get("subject");
  const subjectId = requestedSubject && SUBJECT_IDS.has(requestedSubject as GeneratedPracticeSubjectId)
    ? requestedSubject as GeneratedPracticeSubjectId
    : null;
  const page = boundedInteger(url.searchParams.get("page"), 0, 0, MAX_PAGE);
  const pageSize = boundedInteger(url.searchParams.get("limit"), DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
  const offset = page * pageSize;

  try {
    const statement = subjectId
      ? getD1().prepare(`
          SELECT id, subject_id, subject_name, template_id, format, category, title, payload, created_at
          FROM generated_practice_history
          WHERE subject_id = ?
          ORDER BY created_at DESC, id DESC
          LIMIT ? OFFSET ?
        `).bind(subjectId, pageSize + 1, offset)
      : getD1().prepare(`
          SELECT id, subject_id, subject_name, template_id, format, category, title, payload, created_at
          FROM generated_practice_history
          ORDER BY created_at DESC, id DESC
          LIMIT ? OFFSET ?
        `).bind(pageSize + 1, offset);
    const result = await statement.all<StoredHistoryRow>();
    const rows = result.results ?? [];
    const hasMore = rows.length > pageSize;
    const items = rows.slice(0, pageSize).flatMap((row) => {
      try {
        const question = parseQuestion(JSON.parse(row.payload));
        return question ? [{
          id: row.id,
          subjectId: row.subject_id,
          subjectName: row.subject_name,
          templateId: row.template_id,
          format: row.format,
          category: row.category,
          title: row.title,
          createdAt: row.created_at,
          question,
        }] : [];
      } catch {
        return [];
      }
    });

    return Response.json({ items, page, hasMore }, {
      headers: { "cache-control": "no-store" },
    });
  } catch {
    return historyUnavailable();
  }
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLocaleLowerCase().startsWith("application/json")) {
    return Response.json({ error: "JSON_REQUIRED" }, { status: 415 });
  }

  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if ((origin && origin !== requestUrl.origin)
    || (fetchSite && fetchSite !== "same-origin" && fetchSite !== "same-site")) {
    return Response.json({ error: "CROSS_SITE_WRITE_BLOCKED" }, { status: 403 });
  }

  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return Response.json({ error: "HISTORY_BATCH_TOO_LARGE" }, { status: 413 });
    }
    const body = JSON.parse(raw) as { requests?: unknown };
    const candidates = Array.isArray(body.requests) ? body.requests : [];
    if (!candidates.length || candidates.length > MAX_BATCH_SIZE) {
      return Response.json({ error: "INVALID_HISTORY_BATCH" }, { status: 400 });
    }

    const createdAt = Date.now();
    const database = getD1();
    const clientAddress = anonymousClientAddress(request);
    const minuteBucket = Math.floor(createdAt / 60_000);
    let writeAllowed = false;
    try {
      const clientKey = await anonymousClientKey(clientAddress);
      await database.prepare(`
          DELETE FROM generated_practice_write_limits
          WHERE updated_at < ?
        `).bind(createdAt - 3_600_000).run();
      const quota = await database.prepare(`
          INSERT INTO generated_practice_write_limits
            (client_key, bucket, question_count, updated_at)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(client_key, bucket) DO UPDATE SET
            question_count = question_count + excluded.question_count,
            updated_at = excluded.updated_at
          RETURNING question_count
        `).bind(clientKey, minuteBucket, candidates.length, createdAt)
        .first<{ question_count: number }>();
      if (!quota) throw new Error("PERSISTENT_QUOTA_UNAVAILABLE");
      writeAllowed = quota.question_count <= MAX_QUESTIONS_PER_MINUTE;
    } catch {
      writeAllowed = claimFallbackWrite(clientAddress, minuteBucket, candidates.length);
    }
    if (!writeAllowed) {
      return Response.json({ error: "HISTORY_WRITE_RATE_LIMITED" }, {
        status: 429,
        headers: { "retry-after": "60" },
      });
    }

    const questions: GeneratedPracticeQuestion[] = [];
    for (const candidate of candidates) {
      const generationRequest = parseGenerationRequest(candidate);
      if (!generationRequest) {
        return Response.json({ error: "INVALID_GENERATION_REQUEST" }, { status: 400 });
      }
      const question = generatePracticeQuestion(
        generationRequest.subjectId,
        generationRequest.seed,
        generationRequest.templateId ? { templateId: generationRequest.templateId } : {},
      );
      if (!parseQuestion(question)) {
        return Response.json({ error: "INVALID_GENERATED_QUESTION" }, { status: 400 });
      }
      questions.push(question);
    }

    const statements = questions.map((question, index) => database.prepare(`
        INSERT OR IGNORE INTO generated_practice_history
          (id, subject_id, subject_name, template_id, format, category, title, payload, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        question.id,
        question.subjectId,
        question.subjectName,
        question.templateId,
        question.format,
        question.category,
        question.title,
        JSON.stringify(question),
        createdAt + index,
      ));
    await database.batch(statements);
    await database.prepare(`
        DELETE FROM generated_practice_history
        WHERE id IN (
          SELECT id
          FROM generated_practice_history
          ORDER BY created_at DESC, id DESC
          LIMIT -1 OFFSET ?
        )
      `).bind(MAX_HISTORY_ITEMS).run();

    return Response.json({ saved: true, count: questions.length }, { status: 201 });
  } catch {
    return historyUnavailable();
  }
}
