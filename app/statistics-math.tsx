import type { ReactNode } from "react";
import { renderToString } from "./vendor/katex/katex.mjs";

type MathProps = {
  tex: string;
  ariaLabel?: string;
  fallback?: ReactNode;
  className?: string;
};

type RichMathTextProps = {
  text: string;
  mathAriaLabels?: readonly string[];
  className?: string;
};

const DELIMITED_MATH_PATTERN = /\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]|\$\$([\s\S]*?)\$\$/g;
const CONTAINS_DELIMITED_MATH_PATTERN = /\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$/u;
const STANDALONE_TEX_ALLOWED_PATTERN = /^[\sA-Za-z0-9\\{}()[\].,:;+\-*/=<>_^|!%&'\u00b1\u00b7\u00d7\u00f7\u03b1-\u03c9\u0391-\u03a9\u2211\u220f\u221a\u221e\u222b\u2248\u2260\u2264\u2265]+$/u;
const STANDALONE_TEX_SIGNAL_PATTERN = /\\[A-Za-z]+|[=^_{}]|[\u00b1\u00d7\u00f7\u2211\u220f\u221a\u221e\u222b\u2248\u2260\u2264\u2265]|^[\s+\-]?[\d.]+(?:\s*[,;:]\s*[+\-]?[\d.]+)+\s*$/u;
const MULTIWORD_LATIN_PROSE_PATTERN = /[A-Za-z]{2,}\s+[A-Za-z]{2,}/u;
const TEX_TEXT_GROUP_PATTERN = /\\(?:text|textrm|textbf|textit|mathrm|mathbf|operatorname)\{[^{}]*\}/gu;
const LONG_MATH_SEGMENT_LENGTH = 32;
const LEADING_PROSE_TRIM_PATTERN = /^[\s。、，,.!?！？:：;；]+/u;

type MathSegmentLayout = {
  tex: string;
  start: number;
  end: number;
  text: string;
};

export function shouldDisplayMathSegment({ tex, start, end, text }: MathSegmentLayout) {
  const compactLength = tex.replace(/\s+/g, "").length;
  const isLeading = text.slice(0, start).trim().length === 0;
  const trailingText = text.slice(end).replace(LEADING_PROSE_TRIM_PATTERN, "").trim();

    return compactLength >= LONG_MATH_SEGMENT_LENGTH || (isLeading && trailingText.length > 0);
}

/**
 * Recognises an entire value that is TeX even when legacy data omitted
 * delimiters. Mixed prose is deliberately rejected so ordinary labels and
 * English answers are never handed to KaTeX by accident.
 */
export function isStandaloneTex(text: string) {
  const trimmed = text.trim();
  const texShape = trimmed.replace(TEX_TEXT_GROUP_PATTERN, "T");
  if (CONTAINS_DELIMITED_MATH_PATTERN.test(trimmed)) return false;
  if (!trimmed || !STANDALONE_TEX_ALLOWED_PATTERN.test(texShape)) return false;
  if (MULTIWORD_LATIN_PROSE_PATTERN.test(texShape)) return false;
  return STANDALONE_TEX_SIGNAL_PATTERN.test(trimmed);
}

function joinClassNames(base: string, className?: string) {
  return className ? `${base} ${className}` : base;
}

function typeset(tex: string, displayMode: boolean) {
  try {
    return renderToString(tex, {
      displayMode,
      output: "htmlAndMathml",
      throwOnError: false,
      strict: "ignore",
      trust: false,
    });
  } catch {
    return null;
  }
}

export function InlineMath({ tex, ariaLabel = tex, fallback = tex, className }: MathProps) {
  const markup = typeset(tex, false);

  if (!markup) {
    return (
      <span className={joinClassNames("statistics-math statistics-math-inline is-fallback", className)} role="math" aria-label={ariaLabel}>
        {fallback}
      </span>
    );
  }

  return (
    <span className={joinClassNames("statistics-math statistics-math-inline", className)} role="math" aria-label={ariaLabel}>
      <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: markup }} />
    </span>
  );
}

export function DisplayMath({ tex, ariaLabel = tex, fallback = tex, className }: MathProps) {
  const markup = typeset(tex, true);

  if (!markup) {
    return (
      <div className={joinClassNames("statistics-math statistics-math-display is-fallback", className)} role="math" aria-label={ariaLabel}>
        {fallback}
      </div>
    );
  }

  return (
    <div className={joinClassNames("statistics-math statistics-math-display", className)} role="math" aria-label={ariaLabel}>
      <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: markup }} />
    </div>
  );
}

function ResponsiveMathSegment({ tex, ariaLabel = tex, fallback = tex }: MathProps) {
  const markup = typeset(tex, true);

  if (!markup) {
    return (
      <span className="statistics-math statistics-rich-math-display-segment is-fallback" role="math" aria-label={ariaLabel}>
        {fallback}
      </span>
    );
  }

  return (
    <span className="statistics-math statistics-rich-math-display-segment" role="math" aria-label={ariaLabel}>
      <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: markup }} />
    </span>
  );
}

export function RichMathText({ text, mathAriaLabels = [], className }: RichMathTextProps) {
  const parts: ReactNode[] = [];
  let cursor = 0;
  let mathIndex = 0;
  let hasDisplayMath = false;

  if (isStandaloneTex(text)) {
    const tex = text.trim();
    const displayMath = tex.replace(/\s+/g, "").length >= LONG_MATH_SEGMENT_LENGTH || /(?:\\\\|\n)/u.test(tex);
    const baseClassName = displayMath
      ? "statistics-rich-math-text has-display-math"
      : "statistics-rich-math-text";
    return (
      <span className={joinClassNames(baseClassName, className)}>
        {displayMath ? (
          <ResponsiveMathSegment tex={tex} ariaLabel={mathAriaLabels[0] ?? tex} fallback={text} />
        ) : (
          <InlineMath tex={tex} ariaLabel={mathAriaLabels[0] ?? tex} fallback={text} />
        )}
      </span>
    );
  }

  for (const match of text.matchAll(DELIMITED_MATH_PATTERN)) {
    const start = match.index;
    if (start > cursor) parts.push(text.slice(cursor, start));

    const source = match[0];
    const tex = match[1] ?? match[2] ?? match[3] ?? "";
    const explicitlyDisplayMath = match[2] !== undefined || match[3] !== undefined;
    const end = start + source.length;
    if (tex.trim()) {
      const displayMath = explicitlyDisplayMath || shouldDisplayMathSegment({ tex, start, end, text });
      hasDisplayMath ||= displayMath;
      parts.push(
        displayMath ? (
          <ResponsiveMathSegment
            key={`math-${start}-${mathIndex}`}
            tex={tex}
            ariaLabel={mathAriaLabels[mathIndex] ?? tex}
            fallback={source}
          />
        ) : (
          <InlineMath
            key={`math-${start}-${mathIndex}`}
            tex={tex}
            ariaLabel={mathAriaLabels[mathIndex] ?? tex}
            fallback={source}
          />
        ),
      );
      mathIndex += 1;
    } else {
      parts.push(source);
    }

    cursor = end;
  }

  if (cursor < text.length) parts.push(text.slice(cursor));

  const baseClassName = hasDisplayMath
    ? "statistics-rich-math-text has-display-math"
    : "statistics-rich-math-text";

  return <span className={joinClassNames(baseClassName, className)}>{parts}</span>;
}
