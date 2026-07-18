const DELIMITED_MATH_PATTERN = /\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$/u;
const PROSE_PATTERN = /[\u3000-\u9fff\u3040-\u30ff\u3001\u3002]/u;
const TEX_SIGNAL_PATTERN = /\\[A-Za-z]+|[=^_{}]|[+\-*/<>\u2264\u2265\u2248\u221e\u221a\u222b\u2211\u03c0]|^[\d\s.,()[\]]+$/u;

export function isPureRapidTex(value: string, mathOptions = false) {
  const trimmed = value.trim();
  if (!mathOptions || !trimmed || DELIMITED_MATH_PATTERN.test(trimmed) || PROSE_PATTERN.test(trimmed)) return false;
  return TEX_SIGNAL_PATTERN.test(trimmed) || /^[A-Za-z](?:\([^)]*\))?$/u.test(trimmed);
}
