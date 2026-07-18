export const RAPID_PROFILE_STORAGE_KEY = "test-grid:rapid-profile:v1";
export const RAPID_CLIENT_STORAGE_KEY = "test-grid:rapid-client:v1";
export const RAPID_CLIENT_TOKEN_HEADER = "x-rapid-ranking-client";
export const RAPID_CLIENT_TOKEN_PATTERN = /^[A-Za-z0-9_-]{20,160}$/u;

export type RapidRankingProfile = {
  version: 1;
  rankingName: string | null;
  updatedAt: number;
};

const FORBIDDEN_NAME_CHARACTERS = /[\u0000-\u001f\u007f-\u009f\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069]/u;

export function normalizeRankingName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const canonical = value.normalize("NFKC");
  if (!canonical || FORBIDDEN_NAME_CHARACTERS.test(canonical)) return null;
  const normalized = canonical.replace(/\s+/gu, " ").trim();
  if (!normalized) return null;
  const length = Array.from(normalized).length;
  return length >= 1 && length <= 24 ? normalized : null;
}

export function normalizeRapidRankingProfile(value: unknown): RapidRankingProfile | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Partial<RapidRankingProfile>;
  if (candidate.version !== 1
    || (candidate.rankingName !== null && normalizeRankingName(candidate.rankingName) === null)
    || typeof candidate.updatedAt !== "number"
    || !Number.isSafeInteger(candidate.updatedAt)
    || candidate.updatedAt < 1) return null;
  return {
    version: 1,
    rankingName: candidate.rankingName === null ? null : normalizeRankingName(candidate.rankingName),
    updatedAt: candidate.updatedAt,
  };
}

export function mergeRapidRankingProfiles(left: unknown, right: unknown): RapidRankingProfile | null {
  const leftProfile = normalizeRapidRankingProfile(left);
  const rightProfile = normalizeRapidRankingProfile(right);
  if (!leftProfile) return rightProfile;
  if (!rightProfile) return leftProfile;
  return rightProfile.updatedAt >= leftProfile.updatedAt ? rightProfile : leftProfile;
}
