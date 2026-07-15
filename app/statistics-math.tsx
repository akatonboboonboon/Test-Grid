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

export function RichMathText({ text, mathAriaLabels = [], className }: RichMathTextProps) {
  const parts: ReactNode[] = [];
  let cursor = 0;
  let mathIndex = 0;

  for (const match of text.matchAll(INLINE_MATH_PATTERN)) {
    const start = match.index;
    if (start > cursor) parts.push(text.slice(cursor, start));

    const source = match[0];
    const tex = match[1];
    if (tex.trim()) {
      parts.push(
        <InlineMath
          key={`math-${start}-${mathIndex}`}
          tex={tex}
          ariaLabel={mathAriaLabels[mathIndex] ?? tex}
          fallback={source}
        />,
      );
      mathIndex += 1;
    } else {
      parts.push(source);
    }

    cursor = start + source.length;
  }

  if (cursor < text.length) parts.push(text.slice(cursor));

  return <span className={joinClassNames("statistics-rich-math-text", className)}>{parts}</span>;
}
