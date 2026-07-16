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

const INLINE_MATH_PATTERN = /\\\(([\s\S]*?)\\\)/g;
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

  for (const match of text.matchAll(INLINE_MATH_PATTERN)) {
    const start = match.index;
    if (start > cursor) parts.push(text.slice(cursor, start));

    const source = match[0];
    const tex = match[1];
    const end = start + source.length;
    if (tex.trim()) {
      const displayMath = shouldDisplayMathSegment({ tex, start, end, text });
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
