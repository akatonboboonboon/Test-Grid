export type KatexOutput = "html" | "mathml" | "htmlAndMathml";

export type KatexStrictness = boolean | "ignore" | "warn" | "error";

export interface KatexRenderOptions {
  displayMode?: boolean;
  output?: KatexOutput;
  throwOnError?: boolean;
  errorColor?: string;
  strict?: KatexStrictness;
  trust?: boolean;
}

export function renderToString(expression: string, options?: KatexRenderOptions): string;

declare const katex: {
  renderToString: typeof renderToString;
  version: string;
};

export default katex;
