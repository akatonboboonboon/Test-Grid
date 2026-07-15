import { eq } from "drizzle-orm";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { userStudySnapshots } from "../../../db/schema";

export const dynamic = "force-dynamic";

const MAX_SNAPSHOT_BYTES = 750_000;
const STORAGE_KEY_PATTERN = /^(?:test-grid(?::|-)|layer-sum-)/;

type StudySnapshot = Record<string, string>;

function normalizeSnapshot(value: unknown): StudySnapshot | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length > 80) return null;

  const snapshot: StudySnapshot = {};
  for (const [key, item] of entries) {
    if (!STORAGE_KEY_PATTERN.test(key) || key.length > 160 || typeof item !== "string") return null;
    snapshot[key] = item;
  }

  return snapshot;
}

async function authenticatedEmail() {
  const user = await getChatGPTUser();
  return user?.email.trim().toLocaleLowerCase("en-US") ?? null;
}

export async function GET() {
  const email = await authenticatedEmail();
  if (!email) return Response.json({ error: "SIGN_IN_REQUIRED" }, { status: 401 });

  try {
    const rows = await getDb()
      .select({ snapshotJson: userStudySnapshots.snapshotJson, updatedAt: userStudySnapshots.updatedAt })
      .from(userStudySnapshots)
      .where(eq(userStudySnapshots.userEmail, email))
      .limit(1);
    const row = rows[0];
    if (!row) return Response.json({ snapshot: {}, updatedAt: null });

    const snapshot = normalizeSnapshot(JSON.parse(row.snapshotJson)) ?? {};
    return Response.json({ snapshot, updatedAt: row.updatedAt });
  } catch (error) {
    const message = error instanceof Error ? error.message : "SYNC_READ_FAILED";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const email = await authenticatedEmail();
  if (!email) return Response.json({ error: "SIGN_IN_REQUIRED" }, { status: 401 });

  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_SNAPSHOT_BYTES) {
      return Response.json({ error: "SNAPSHOT_TOO_LARGE" }, { status: 413 });
    }
    const body = JSON.parse(raw) as { snapshot?: unknown };
    const snapshot = normalizeSnapshot(body.snapshot);
    if (!snapshot) return Response.json({ error: "INVALID_SNAPSHOT" }, { status: 400 });

    const updatedAt = Date.now();
    const snapshotJson = JSON.stringify(snapshot);
    await getDb()
      .insert(userStudySnapshots)
      .values({ userEmail: email, snapshotJson, updatedAt })
      .onConflictDoUpdate({
        target: userStudySnapshots.userEmail,
        set: { snapshotJson, updatedAt },
      });

    return Response.json({ snapshot, updatedAt });
  } catch (error) {
    const message = error instanceof Error ? error.message : "SYNC_WRITE_FAILED";
    return Response.json({ error: message }, { status: 500 });
  }
}
