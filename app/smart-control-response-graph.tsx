"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import styles from "./smart-control-response-graph.module.css";

export type SmartControlResponseGraphProps = {
  className?: string;
  dampingRatio?: number;
  naturalFrequency?: number;
  initiallyRevealed?: boolean;
  title?: string;
};

type ResponseData = {
  dampingRatio: number;
  naturalFrequency: number;
  dampedNaturalFrequency: number;
  t10: number;
  td: number;
  t90: number;
  tr: number;
  tp: number;
  ts: number;
  overshootRatio: number;
  overshootPercent: number;
  yMax: number;
  tMax: number;
  responseAt: (time: number) => number;
};

type GraphColors = {
  background: string;
  ink: string;
  muted: string;
  grid: string;
  curve: string;
  accent: string;
  warning: string;
  surface: string;
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

const firstCrossing = (
  responseAt: (time: number) => number,
  level: number,
  upperTime: number,
) => {
  const steps = 6000;
  let previousTime = 0;
  let previousValue = responseAt(0);

  for (let index = 1; index <= steps; index += 1) {
    const time = (upperTime * index) / steps;
    const value = responseAt(time);
    if (previousValue < level && value >= level) {
      const fraction = (level - previousValue) / (value - previousValue);
      return previousTime + (time - previousTime) * fraction;
    }
    previousTime = time;
    previousValue = value;
  }

  return upperTime;
};

const createResponseData = (
  requestedDampingRatio: number,
  requestedNaturalFrequency: number,
): ResponseData => {
  const dampingRatio = clamp(requestedDampingRatio, 0.08, 0.85);
  const naturalFrequency = clamp(requestedNaturalFrequency, 0.25, 8);
  const root = Math.sqrt(1 - dampingRatio ** 2);
  const dampedNaturalFrequency = naturalFrequency * root;
  const phase = Math.acos(dampingRatio);
  const responseAt = (time: number) =>
    1 -
    (Math.exp(-dampingRatio * naturalFrequency * time) / root) *
      Math.sin(dampedNaturalFrequency * time + phase);

  const tp = Math.PI / dampedNaturalFrequency;
  const overshootRatio = Math.exp(
    (-dampingRatio * Math.PI) / Math.sqrt(1 - dampingRatio ** 2),
  );
  const yMax = 1 + overshootRatio;
  const approximateSettlingTime =
    -Math.log(0.05 * Math.sqrt(1 - dampingRatio ** 2)) /
    (dampingRatio * naturalFrequency);
  const searchEnd = Math.max(
    approximateSettlingTime * 1.7,
    tp * 4.2,
    10 / naturalFrequency,
  );
  const t10 = firstCrossing(responseAt, 0.1, searchEnd);
  const td = firstCrossing(responseAt, 0.5, searchEnd);
  const t90 = firstCrossing(responseAt, 0.9, searchEnd);

  const settlingSamples = 10000;
  let lastOutsideIndex = 0;
  for (let index = 0; index <= settlingSamples; index += 1) {
    const time = (searchEnd * index) / settlingSamples;
    if (Math.abs(responseAt(time) - 1) > 0.05) {
      lastOutsideIndex = index;
    }
  }
  const ts =
    (searchEnd * Math.min(lastOutsideIndex + 1, settlingSamples)) /
    settlingSamples;
  const tMax = Math.max(ts * 1.32, tp * 3.4, 8 / naturalFrequency);

  return {
    dampingRatio,
    naturalFrequency,
    dampedNaturalFrequency,
    t10,
    td,
    t90,
    tr: t90 - t10,
    tp,
    ts,
    overshootRatio,
    overshootPercent: overshootRatio * 100,
    yMax,
    tMax,
    responseAt,
  };
};

const cssColor = (
  computedStyle: CSSStyleDeclaration,
  variable: string,
  fallback: string,
) => computedStyle.getPropertyValue(variable).trim() || fallback;

const readGraphColors = (element: HTMLElement): GraphColors => {
  const computedStyle = window.getComputedStyle(element);
  return {
    background: cssColor(computedStyle, "--statistics-ink", "#121821"),
    ink: cssColor(computedStyle, "--statistics-paper", "#fffaf0"),
    muted: cssColor(computedStyle, "--statistics-muted", "#a9b2bd"),
    grid: cssColor(computedStyle, "--statistics-grid", "#3a4655"),
    curve: cssColor(computedStyle, "--statistics-blue", "#8fb5ff"),
    accent: cssColor(computedStyle, "--statistics-green", "#ff8fc7"),
    warning: cssColor(computedStyle, "--statistics-yellow", "#ffd65c"),
    surface: cssColor(computedStyle, "--statistics-surface", "#1a222e"),
  };
};

const drawLine = (
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width = 1,
  dash: number[] = [],
) => {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = width;
  context.setLineDash(dash);
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.restore();
};

const drawArrowHead = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  direction: "left" | "right" | "up" | "down",
  color: string,
) => {
  const size = 5;
  context.save();
  context.fillStyle = color;
  context.beginPath();
  if (direction === "left") {
    context.moveTo(x, y);
    context.lineTo(x + size, y - size * 0.65);
    context.lineTo(x + size, y + size * 0.65);
  } else if (direction === "right") {
    context.moveTo(x, y);
    context.lineTo(x - size, y - size * 0.65);
    context.lineTo(x - size, y + size * 0.65);
  } else if (direction === "up") {
    context.moveTo(x, y);
    context.lineTo(x - size * 0.65, y + size);
    context.lineTo(x + size * 0.65, y + size);
  } else {
    context.moveTo(x, y);
    context.lineTo(x - size * 0.65, y - size);
    context.lineTo(x + size * 0.65, y - size);
  }
  context.closePath();
  context.fill();
  context.restore();
};

const formatTime = (value: number) =>
  value >= 10 ? value.toFixed(1) : value.toFixed(2);

const drawResponseGraph = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  data: ResponseData,
  revealed: boolean,
) => {
  const context = canvas.getContext("2d");
  if (!context) return;

  const devicePixelRatio = clamp(window.devicePixelRatio || 1, 1, 3);
  canvas.width = Math.round(width * devicePixelRatio);
  canvas.height = Math.round(height * devicePixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

  const colors = readGraphColors(canvas);
  const compact = width < 560;
  const margin = {
    top: compact ? 30 : 34,
    right: compact ? 18 : 30,
    bottom: compact ? 70 : 62,
    left: compact ? 49 : 76,
  };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const maximumY = Math.max(1.36, data.yMax * 1.12);
  const xFor = (time: number) => margin.left + (time / data.tMax) * plotWidth;
  const yFor = (value: number) =>
    margin.top + plotHeight - (value / maximumY) * plotHeight;
  const axisY = yFor(0);
  const fontSize = compact ? 10 : 12;

  context.fillStyle = colors.background;
  context.fillRect(0, 0, width, height);

  const levels = [0.1, 0.5, 0.9, 0.95, 1, 1.05];
  for (const level of levels) {
    const isSettlingBand = level === 0.95 || level === 1.05;
    const isSteady = level === 1;
    drawLine(
      context,
      margin.left,
      yFor(level),
      width - margin.right,
      yFor(level),
      isSteady
        ? colors.accent
        : isSettlingBand
          ? colors.warning
          : colors.grid,
      isSteady ? 1.5 : 1,
      isSteady ? [] : isSettlingBand ? [6, 4] : [3, 5],
    );
  }

  drawLine(
    context,
    margin.left,
    margin.top,
    margin.left,
    axisY,
    colors.ink,
    1.5,
  );
  drawLine(
    context,
    margin.left,
    axisY,
    width - margin.right,
    axisY,
    colors.ink,
    1.5,
  );
  drawArrowHead(context, width - margin.right, axisY, "right", colors.ink);
  drawArrowHead(context, margin.left, margin.top, "up", colors.ink);

  context.save();
  context.strokeStyle = colors.curve;
  context.lineWidth = compact ? 2.3 : 2.8;
  context.lineJoin = "round";
  context.lineCap = "round";
  context.beginPath();
  const curveSamples = Math.max(500, Math.floor(plotWidth * 1.5));
  for (let index = 0; index <= curveSamples; index += 1) {
    const time = (data.tMax * index) / curveSamples;
    const x = xFor(time);
    const y = yFor(data.responseAt(time));
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.stroke();
  context.restore();

  const markers = [
    { time: data.t10, value: 0.1, key: "t₁₀" },
    { time: data.td, value: 0.5, key: "td" },
    { time: data.t90, value: 0.9, key: "t₉₀" },
    { time: data.tp, value: data.yMax, key: "tp" },
    { time: data.ts, value: 1.05, key: "ts" },
  ];

  for (const marker of markers) {
    const x = xFor(marker.time);
    drawLine(context, x, yFor(marker.value), x, axisY, colors.grid, 1, [4, 4]);
    context.fillStyle = colors.accent;
    context.beginPath();
    context.arc(x, yFor(data.responseAt(marker.time)), 3.1, 0, Math.PI * 2);
    context.fill();
  }

  const riseArrowY = axisY + (compact ? 49 : 42);
  drawLine(
    context,
    xFor(data.t10),
    riseArrowY,
    xFor(data.t90),
    riseArrowY,
    colors.accent,
    1.4,
  );
  drawArrowHead(context, xFor(data.t10), riseArrowY, "left", colors.accent);
  drawArrowHead(context, xFor(data.t90), riseArrowY, "right", colors.accent);

  const overshootX = Math.min(
    width - margin.right - 12,
    xFor(data.tp) + (compact ? 13 : 20),
  );
  drawLine(
    context,
    overshootX,
    yFor(1),
    overshootX,
    yFor(data.yMax),
    colors.warning,
    1.4,
  );
  drawArrowHead(context, overshootX, yFor(data.yMax), "up", colors.warning);
  drawArrowHead(context, overshootX, yFor(1), "down", colors.warning);

  context.font = `${fontSize}px ui-monospace, SFMono-Regular, Consolas, monospace`;
  context.textBaseline = "middle";
  context.fillStyle = colors.ink;
  context.fillText("y", margin.left - 2, margin.top - 13);
  context.fillText("t", width - margin.right + 7, axisY + 2);
  context.fillStyle = colors.muted;
  context.textAlign = "right";
  context.fillText("0", margin.left - 8, axisY + 1);

  if (revealed) {
    const levelLabels = [
      { level: 0.1, label: "0.1y∞" },
      { level: 0.5, label: "0.5y∞" },
      { level: 0.9, label: "0.9y∞" },
      { level: 0.95, label: "0.95y∞" },
      { level: 1, label: "y∞" },
      { level: 1.05, label: "1.05y∞" },
    ];
    for (const item of levelLabels) {
      context.fillStyle =
        item.level === 1
          ? colors.accent
          : item.level === 0.95 || item.level === 1.05
            ? colors.warning
            : colors.muted;
      context.fillText(item.label, margin.left - 7, yFor(item.level));
    }

    context.fillStyle = colors.warning;
    context.fillText("ymax", margin.left - 7, yFor(data.yMax));
    context.textAlign = "center";
    markers.forEach((marker, index) => {
      context.fillStyle = marker.key === "ts" ? colors.warning : colors.muted;
      const offset = compact && index % 2 === 1 ? 27 : 14;
      context.fillText(marker.key, xFor(marker.time), axisY + offset);
    });
    context.fillStyle = colors.accent;
    context.fillText("tr", (xFor(data.t10) + xFor(data.t90)) / 2, riseArrowY + 11);
    context.textAlign = "left";
    context.fillStyle = colors.warning;
    context.fillText("Os", overshootX + 6, (yFor(data.yMax) + yFor(1)) / 2);
  } else {
    context.textAlign = "center";
    context.fillStyle = colors.muted;
    context.fillText("?", (xFor(data.t10) + xFor(data.t90)) / 2, riseArrowY + 11);
    context.fillText("?", overshootX + 8, (yFor(data.yMax) + yFor(1)) / 2);
  }

  context.save();
  context.fillStyle = colors.surface;
  context.globalAlpha = 0.92;
  context.fillRect(margin.left + 8, margin.top + 8, compact ? 116 : 184, compact ? 34 : 38);
  context.globalAlpha = 1;
  context.fillStyle = colors.ink;
  context.textAlign = "left";
  context.font = `${compact ? 9 : 11}px ui-monospace, SFMono-Regular, Consolas, monospace`;
  context.fillText(
    compact ? "2次遅れ系 step" : "標準2次遅れ系・単位ステップ応答",
    margin.left + 15,
    margin.top + (compact ? 25 : 28),
  );
  context.restore();
};

const hiddenText = "答えを表示すると確認できます";

export default function SmartControlResponseGraph({
  className,
  dampingRatio = 0.35,
  naturalFrequency = 1,
  initiallyRevealed = false,
  title = "過渡応答の特性値を覚える",
}: SmartControlResponseGraphProps) {
  const [revealed, setRevealed] = useState(initiallyRevealed);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const graphShellRef = useRef<HTMLDivElement>(null);
  const descriptionId = useId();
  const statusId = useId();
  const data = useMemo(
    () => createResponseData(dampingRatio, naturalFrequency),
    [dampingRatio, naturalFrequency],
  );

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const graphShell = graphShellRef.current;
    if (!canvas || !graphShell || typeof window === "undefined") return;

    const width = Math.max(280, Math.floor(graphShell.getBoundingClientRect().width));
    const height = clamp(width * (width < 560 ? 0.94 : 0.56), 360, 520);
    drawResponseGraph(canvas, width, height, data, revealed);
  }, [data, revealed]);

  useEffect(() => {
    redraw();
    const graphShell = graphShellRef.current;
    if (!graphShell) return undefined;

    let animationFrame = 0;
    const requestRedraw = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(redraw);
    };

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(requestRedraw);
      observer.observe(graphShell);
      return () => {
        observer.disconnect();
        window.cancelAnimationFrame(animationFrame);
      };
    }

    window.addEventListener("resize", requestRedraw);
    return () => {
      window.removeEventListener("resize", requestRedraw);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [redraw]);

  const rows = [
    {
      symbol: "y∞",
      value: "1.000",
      meaning: "十分時間が経ったあとの定常値。この単位ステップ応答では1。",
    },
    {
      symbol: "ymax",
      value: data.yMax.toFixed(3),
      meaning: "最初の山で到達する最大値。y∞を超えた量がオーバーシュート。",
    },
    {
      symbol: "0.1 / 0.5 / 0.9 y∞",
      value: "0.100 / 0.500 / 0.900",
      meaning: "立上り時間と遅れ時間を測るための基準線。",
    },
    {
      symbol: "0.95 / 1.05 y∞",
      value: "0.950 / 1.050",
      meaning: "定常値の±5%帯。この帯内に収まった時刻から整定とみなす。",
    },
    {
      symbol: "td",
      value: `${formatTime(data.td)} s`,
      meaning: "遅れ時間。応答が初めて0.5y∞に達するまでの時間。",
    },
    {
      symbol: "tr",
      value: `${formatTime(data.tr)} s`,
      meaning: `立上り時間。0.1y∞到達（${formatTime(data.t10)} s）から0.9y∞到達（${formatTime(data.t90)} s）まで。`,
    },
    {
      symbol: "tp",
      value: `${formatTime(data.tp)} s`,
      meaning: "ピーク時間。応答が最初の最大値ymaxに達するまでの時間。",
    },
    {
      symbol: "ts",
      value: `${formatTime(data.ts)} s`,
      meaning: "整定時間。以後ずっと0.95y∞〜1.05y∞の範囲内に収まる最初の時刻。",
    },
    {
      symbol: "Os",
      value: `${data.overshootPercent.toFixed(1)} %`,
      meaning: "最大行き過ぎ量。Os=(ymax−y∞)/y∞×100%。",
    },
  ];

  const accessibleSummary = revealed
    ? `減衰比${data.dampingRatio.toFixed(2)}、固有角周波数${data.naturalFrequency.toFixed(2)}ラジアン毎秒の二次遅れ系。遅れ時間${formatTime(data.td)}秒、立上り時間${formatTime(data.tr)}秒、ピーク時間${formatTime(data.tp)}秒、整定時間${formatTime(data.ts)}秒、最大行き過ぎ量${data.overshootPercent.toFixed(1)}パーセント。`
    : "二次遅れ系の単位ステップ応答。特性値のラベルと数値は暗記練習のため非表示です。";

  return (
    <section className={`${styles.root}${className ? ` ${className}` : ""}`}>
      <div className={styles.headingRow}>
        <div>
          <p className={styles.eyebrow}>STEP RESPONSE MEMORY GRAPH</p>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.lead}>
            曲線の位置から、各記号・基準値・意味を口に出してから答えを開いてください。
          </p>
        </div>
        <button
          className={styles.revealButton}
          type="button"
          aria-controls={`${descriptionId} ${statusId}`}
          aria-pressed={revealed}
          onClick={() => setRevealed((current) => !current)}
        >
          {revealed ? "ラベルを隠す" : "答えを表示"}
        </button>
      </div>

      <div className={styles.graphShell} ref={graphShellRef}>
        <canvas
          className={styles.canvas}
          ref={canvasRef}
          role="img"
          aria-label={accessibleSummary}
          aria-describedby={descriptionId}
        >
          {accessibleSummary}
        </canvas>
      </div>

      <p className={styles.status} id={statusId} aria-live="polite">
        {revealed
          ? "答えを表示中です。表の数値と意味も確認できます。"
          : "暗記モードです。グラフ上の記号と表の答えを隠しています。"}
      </p>

      <div className={styles.tableWrap} id={descriptionId}>
        <table className={styles.table}>
          <caption>
            標準2次遅れ系（ζ={data.dampingRatio.toFixed(2)}、ωn=
            {data.naturalFrequency.toFixed(2)} rad/s）の応答特性値
          </caption>
          <thead>
            <tr>
              <th scope="col">記号・基準線</th>
              <th scope="col">数値</th>
              <th scope="col">意味</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.symbol}>
                <th scope="row">{row.symbol}</th>
                <td>
                  {revealed ? (
                    <span className={styles.answerValue}>{row.value}</span>
                  ) : (
                    <span className={styles.hiddenAnswer}>{hiddenText}</span>
                  )}
                </td>
                <td>
                  {revealed ? (
                    row.meaning
                  ) : (
                    <span className={styles.hiddenAnswer}>{hiddenText}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className={styles.note}>
        数値は表示中の代表例に対する計算値です。試験では、グラフ上の位置関係と定義を優先して覚えてください。
      </p>
    </section>
  );
}
