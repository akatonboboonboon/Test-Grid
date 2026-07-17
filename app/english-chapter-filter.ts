export const ALL_CHAPTERS = "all";

export function normalizeChapterSelection(
  value: unknown,
  allowedChapterIds: readonly string[],
): string[] {
  const requested = Array.isArray(value)
    ? value
    : typeof value === "string" && value !== ALL_CHAPTERS
      ? [value]
      : [];
  const requestedIds = new Set(
    requested.filter((chapterId): chapterId is string => typeof chapterId === "string"),
  );
  return allowedChapterIds.filter((chapterId) => requestedIds.has(chapterId));
}

export function chapterMatches(unit: string, selectedChapterIds: readonly string[]) {
  return selectedChapterIds.length === 0 || selectedChapterIds.includes(unit);
}

export function toggleChapterSelection(
  selectedChapterIds: readonly string[],
  chapterId: string,
  allowedChapterIds: readonly string[],
): string[] {
  if (!allowedChapterIds.includes(chapterId)) return [...selectedChapterIds];
  const nextSelection = selectedChapterIds.includes(chapterId)
    ? selectedChapterIds.filter((selectedId) => selectedId !== chapterId)
    : [...selectedChapterIds, chapterId];
  return normalizeChapterSelection(nextSelection, allowedChapterIds);
}
