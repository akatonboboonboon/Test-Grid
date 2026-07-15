import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";

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

async function snapshotObjectKey(email: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email));
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `users/${hex}/study-snapshot-v1.json`;
}

export async function GET() {
  const email = await authenticatedEmail();
  if (!email) return Response.json({ error: "SIGN_IN_REQUIRED" }, { status: 401 });

  try {
    const object = await env.STUDY_SNAPSHOTS.get(await snapshotObjectKey(email));
    if (!object) return Response.json({ snapshot: {}, updatedAt: null });
    const stored = JSON.parse(await object.text()) as { snapshot?: unknown; updatedAt?: unknown };
    const snapshot = normalizeSnapshot(stored.snapshot) ?? {};
    const updatedAt = typeof stored.updatedAt === "number" ? stored.updatedAt : null;
    return Response.json({ snapshot, updatedAt });
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
    await env.STUDY_SNAPSHOTS.put(
      await snapshotObjectKey(email),
      JSON.stringify({ snapshot, updatedAt }),
      { httpMetadata: { contentType: "application/json" } },
    );

    return Response.json({ snapshot, updatedAt });
  } catch (error) {
    const message = error instanceof Error ? error.message : "SYNC_WRITE_FAILED";
    return Response.json({ error: message }, { status: 500 });
  }
}
