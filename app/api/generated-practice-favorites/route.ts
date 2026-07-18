import { getD1 } from "../../../db";
import { getChatGPTUser } from "../../chatgpt-auth";

export const dynamic = "force-dynamic";

const CLIENT_TOKEN_HEADER = "x-generated-favorite-client";
const CLIENT_TOKEN_PATTERN = /^[A-Za-z0-9_-]{20,160}$/u;
const QUESTION_ID_PATTERN = /^generated-[A-Za-z0-9_-]{8,180}$/u;
const MAX_IDS = 24;
const MAX_BODY_BYTES = 4_096;
const UNFAVORITED_TTL_MS = 3 * 24 * 60 * 60 * 1_000;

type FavoriteRow = {
  id: string;
  favorite_count: number;
  viewer_favorited: number;
};

function sameSiteWriteAllowed(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  return (!origin || origin === requestUrl.origin)
    && (!fetchSite || fetchSite === "same-origin" || fetchSite === "same-site");
}

async function digestIdentity(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function favoriteActorKey(request: Request, required: boolean) {
  const user = await getChatGPTUser();
  if (user?.email) {
    return digestIdentity("account:" + user.email.trim().toLocaleLowerCase("en-US"));
  }
  const clientToken = request.headers.get(CLIENT_TOKEN_HEADER)?.trim() ?? "";
  if (CLIENT_TOKEN_PATTERN.test(clientToken)) {
    return digestIdentity("device:" + clientToken);
  }
  if (required) return null;
  return "__no_viewer__";
}

async function cleanupExpiredUnfavorited(now = Date.now()) {
  await getD1().prepare(`
      DELETE FROM generated_practice_history
      WHERE created_at < ?
        AND NOT EXISTS (
          SELECT 1
          FROM generated_practice_favorites
          WHERE generated_practice_favorites.question_id = generated_practice_history.id
        )
    `).bind(now - UNFAVORITED_TTL_MS).run();
}

function normalizeIds(url: URL) {
  const values = url.searchParams.getAll("id")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);
  const unique = [...new Set(values)];
  if (!unique.length || unique.length > MAX_IDS || unique.some((id) => !QUESTION_ID_PATTERN.test(id))) {
    return null;
  }
  return unique;
}

async function favoriteState(id: string, actorKey: string) {
  const row = await getD1().prepare(`
      SELECT
        history.id AS id,
        COUNT(favorite.actor_key) AS favorite_count,
        COALESCE(MAX(CASE WHEN favorite.actor_key = ? THEN 1 ELSE 0 END), 0) AS viewer_favorited
      FROM generated_practice_history AS history
      LEFT JOIN generated_practice_favorites AS favorite
        ON favorite.question_id = history.id
      WHERE history.id = ?
      GROUP BY history.id
    `).bind(actorKey, id).first<FavoriteRow>();
  return row ?? null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const ids = normalizeIds(url);
  if (!ids) return Response.json({ error: "INVALID_FAVORITE_IDS" }, { status: 400 });

  try {
    await cleanupExpiredUnfavorited();
    const actorKey = await favoriteActorKey(request, false) ?? "__no_viewer__";
    const placeholders = ids.map(() => "?").join(", ");
    const rows = await getD1().prepare(`
        SELECT
          history.id AS id,
          COUNT(favorite.actor_key) AS favorite_count,
          COALESCE(MAX(CASE WHEN favorite.actor_key = ? THEN 1 ELSE 0 END), 0) AS viewer_favorited
        FROM generated_practice_history AS history
        LEFT JOIN generated_practice_favorites AS favorite
          ON favorite.question_id = history.id
        WHERE history.id IN (__PLACEHOLDERS__)
        GROUP BY history.id
      `.replace("__PLACEHOLDERS__", placeholders))
      .bind(actorKey, ...ids)
      .all<FavoriteRow>();
    const favorites = Object.fromEntries((rows.results ?? []).map((row) => [
      row.id,
      {
        favoriteCount: Number(row.favorite_count) || 0,
        viewerFavorited: Boolean(row.viewer_favorited),
      },
    ]));
    return Response.json({ favorites }, { headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "FAVORITES_UNAVAILABLE" }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  if (!sameSiteWriteAllowed(request)) {
    return Response.json({ error: "CROSS_SITE_WRITE_BLOCKED" }, { status: 403 });
  }
  if (!request.headers.get("content-type")?.toLocaleLowerCase().startsWith("application/json")) {
    return Response.json({ error: "JSON_REQUIRED" }, { status: 415 });
  }

  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return Response.json({ error: "FAVORITE_REQUEST_TOO_LARGE" }, { status: 413 });
    }
    const body = JSON.parse(raw) as { id?: unknown; favorite?: unknown };
    if (typeof body.id !== "string"
      || !QUESTION_ID_PATTERN.test(body.id)
      || typeof body.favorite !== "boolean") {
      return Response.json({ error: "INVALID_FAVORITE_REQUEST" }, { status: 400 });
    }

    const actorKey = await favoriteActorKey(request, true);
    if (!actorKey) return Response.json({ error: "FAVORITE_CLIENT_REQUIRED" }, { status: 400 });

    const now = Date.now();
    await cleanupExpiredUnfavorited(now);
    const existing = await getD1().prepare(
      "SELECT id FROM generated_practice_history WHERE id = ?",
    ).bind(body.id).first<{ id: string }>();
    if (!existing) return Response.json({ error: "QUESTION_NOT_FOUND" }, { status: 404 });

    if (body.favorite) {
      await getD1().prepare(`
          INSERT OR IGNORE INTO generated_practice_favorites
            (question_id, actor_key, created_at)
          VALUES (?, ?, ?)
        `).bind(body.id, actorKey, now).run();
    } else {
      await getD1().prepare(`
          DELETE FROM generated_practice_favorites
          WHERE question_id = ? AND actor_key = ?
        `).bind(body.id, actorKey).run();
      await cleanupExpiredUnfavorited(now);
    }

    const state = await favoriteState(body.id, actorKey);
    if (!state) {
      return Response.json({
        id: body.id,
        deleted: true,
        favoriteCount: 0,
        viewerFavorited: false,
      });
    }
    return Response.json({
      id: state.id,
      deleted: false,
      favoriteCount: Number(state.favorite_count) || 0,
      viewerFavorited: Boolean(state.viewer_favorited),
    });
  } catch {
    return Response.json({ error: "FAVORITE_WRITE_FAILED" }, { status: 503 });
  }
}