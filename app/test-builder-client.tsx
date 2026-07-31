"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  TEST_BUILDER_MAX_IMPORT_JSON_LENGTH,
  TEST_BUILDER_STORAGE_KEY,
  exportProject,
  generateTestProject,
  importProject,
  readProjects,
  writeProjects,
  type TestBuilderInput,
  type TestBuilderProject,
} from "./test-builder-engine";
import styles from "./test-builder.module.css";

const PERIOD_OPTIONS: Array<{ value: TestBuilderInput["period"]; label: string }> = [
  { value: "first-midterm", label: "前期中間" },
  { value: "first-final", label: "前期末" },
  { value: "second-midterm", label: "後期中間" },
  { value: "second-final", label: "後期末" },
  { value: "other", label: "その他（資格・TOEICなど）" },
];

const QUESTION_KIND_LABELS: Record<string, string> = {
  choice: "4択",
  fill: "穴埋め",
  "true-false": "T/F",
  written: "記述",
};

const DEFAULT_INPUT: TestBuilderInput = {
  grade: 4,
  period: "first-final",
  subject: "",
  title: "",
  durationMinutes: 50,
  totalPoints: 100,
  questionCount: 10,
  difficulty: 2,
  scopeText: "",
  formatText: "50分・100点。4択4問、穴埋め2問、T/F2問、記述2問。全問に解説を付ける。",
  seed: "test-grid-1",
};

const SCOPE_TEXT_UI_MAX_LENGTH = 100_000;
const OCR_MAX_FILES = 5;
const OCR_MAX_FILE_BYTES = 12 * 1024 * 1024;
const TEST_BUILDER_DRAFT_STORAGE_KEY = "test-builder-draft:v1";

function restoreDraft(raw: string | null): TestBuilderInput | null {
  if (!raw) return null;
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const draft = value as Partial<TestBuilderInput>;
  const periods = PERIOD_OPTIONS.map((item) => item.value);
  return {
    grade: [1, 2, 3, 4, 5].includes(Number(draft.grade)) ? draft.grade as TestBuilderInput["grade"] : DEFAULT_INPUT.grade,
    period: periods.includes(draft.period as TestBuilderInput["period"]) ? draft.period as TestBuilderInput["period"] : DEFAULT_INPUT.period,
    subject: typeof draft.subject === "string" ? draft.subject.slice(0, 60) : "",
    title: typeof draft.title === "string" ? draft.title.slice(0, 100) : "",
    durationMinutes: Number.isInteger(draft.durationMinutes) && Number(draft.durationMinutes) >= 1 && Number(draft.durationMinutes) <= 300
      ? Number(draft.durationMinutes)
      : DEFAULT_INPUT.durationMinutes,
    totalPoints: typeof draft.totalPoints === "number" && Number.isFinite(draft.totalPoints) && draft.totalPoints >= 0.01 && draft.totalPoints <= 1_000_000
      ? draft.totalPoints
      : DEFAULT_INPUT.totalPoints,
    questionCount: Number.isInteger(draft.questionCount) && Number(draft.questionCount) >= 1 && Number(draft.questionCount) <= 100
      ? Number(draft.questionCount)
      : DEFAULT_INPUT.questionCount,
    difficulty: [1, 2, 3].includes(Number(draft.difficulty)) ? draft.difficulty as TestBuilderInput["difficulty"] : DEFAULT_INPUT.difficulty,
    scopeText: typeof draft.scopeText === "string" ? draft.scopeText.slice(0, SCOPE_TEXT_UI_MAX_LENGTH) : "",
    formatText: typeof draft.formatText === "string" ? draft.formatText.slice(0, 8_000) : DEFAULT_INPUT.formatText,
    seed: typeof draft.seed === "string" || typeof draft.seed === "number" ? draft.seed : DEFAULT_INPUT.seed,
  };
}

function periodLabel(period: TestBuilderInput["period"]) {
  return PERIOD_OPTIONS.find((item) => item.value === period)?.label ?? period;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "処理できませんでした。入力内容を確認してください。";
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function cleanFilename(value: string) {
  const cleaned = value.trim().replace(/[\\/:*?"<>|]+/g, "-").slice(0, 60);
  return cleaned || "test-grid-project";
}

export default function TestBuilderClient() {
  const [input, setInput] = useState<TestBuilderInput>(DEFAULT_INPUT);
  const [project, setProject] = useState<TestBuilderProject | null>(null);
  const [savedProjects, setSavedProjects] = useState<TestBuilderProject[]>([]);
  const [answersVisible, setAnswersVisible] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState("");
  const [printMode, setPrintMode] = useState<"questions" | "solutions" | null>(null);
  const projectImportRef = useRef<HTMLInputElement>(null);
  const restoredRef = useRef(false);
  const latestInputRef = useRef(input);
  latestInputRef.current = input;

  useEffect(() => {
    let restored: TestBuilderProject[] = [];
    try {
      restored = readProjects(window.localStorage.getItem(TEST_BUILDER_STORAGE_KEY));
      setSavedProjects(restored);
    } catch (restoreError) {
      setError(`保存済みテストを復元できませんでした。${errorMessage(restoreError)}`);
    }
    const requestedId = new URLSearchParams(window.location.search).get("project");
    const requested = requestedId ? restored.find((candidate) => candidate.projectId === requestedId) : null;
    if (requested) {
      setProject(requested);
      setInput(requested.input);
      setStatus("保存済みプロジェクトを開きました。");
    } else {
      try {
        const draft = restoreDraft(window.localStorage.getItem(TEST_BUILDER_DRAFT_STORAGE_KEY));
        if (draft) {
          setInput(draft);
          setStatus("この端末の入力途中の下書きを復元しました。");
        }
      } catch (draftError) {
        setError(`入力途中の下書きを復元できませんでした。${errorMessage(draftError)}`);
      }
    }
    restoredRef.current = true;
  }, []);

  useEffect(() => {
    if (!restoredRef.current) return undefined;
    const timeout = window.setTimeout(() => {
      try {
        window.localStorage.setItem(TEST_BUILDER_DRAFT_STORAGE_KEY, JSON.stringify(input));
      } catch (draftError) {
        setError(`入力途中の下書きを保存できませんでした。${errorMessage(draftError)}`);
      }
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [input]);

  useEffect(() => {
    const finishPrint = () => setPrintMode(null);
    window.addEventListener("afterprint", finishPrint);
    return () => window.removeEventListener("afterprint", finishPrint);
  }, []);

  const pointTotal = useMemo(
    () => project?.test.questions.reduce((sum, question) => sum + question.points, 0) ?? 0,
    [project],
  );

  function updateInput<K extends keyof TestBuilderInput>(key: K, value: TestBuilderInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
    setError("");
    setStatus("");
  }

  function persistProjects(next: TestBuilderProject[]) {
    let unique = next.filter((candidate, index, items) => (
      items.findIndex((item) => item.projectId === candidate.projectId) === index
    )).slice(0, 30);
    let trimmed = false;
    while (true) {
      try {
        window.localStorage.setItem(TEST_BUILDER_STORAGE_KEY, writeProjects(unique));
        setSavedProjects(unique);
        window.dispatchEvent(new CustomEvent("test-grid:test-builder-projects-changed"));
        return { ok: true, trimmed };
      } catch (storageError) {
        if (unique.length > 1) {
          unique = unique.slice(0, -1);
          trimmed = true;
          continue;
        }
        setError(`端末への保存に失敗しました。${errorMessage(storageError)}`);
        return { ok: false, trimmed };
      }
    }
  }

  function saveGeneratedProject(generated: TestBuilderProject) {
    const result = persistProjects([generated, ...savedProjects.filter((item) => item.projectId !== generated.projectId)]);
    if (!result.ok) return result;
    const url = new URL(window.location.href);
    url.searchParams.set("project", generated.projectId);
    window.history.replaceState({}, "", url);
    return result;
  }

  function generate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");
    try {
      const generated = generateTestProject(input);
      setProject(generated);
      setAnswersVisible(true);
      const saved = saveGeneratedProject(generated);
      if (saved.ok) {
        setStatus(`${generated.test.questions.length}問を作成し、この端末へ保存しました。${saved.trimmed ? "保存上限に合わせ、古いテストを整理しました。" : ""}`);
      }
    } catch (generationError) {
      setError(errorMessage(generationError));
    }
  }

  async function loadScopeFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 1_000_000) {
      setError("範囲ファイルが大きすぎます。100,000文字以内になるよう章ごとに分けてください。");
      return;
    }
    try {
      const text = await file.text();
      if (text.length > SCOPE_TEXT_UI_MAX_LENGTH) {
        setError("範囲テキストは100,000文字以内にしてください。");
        return;
      }
      updateInput("scopeText", text);
      if (!input.title) updateInput("title", file.name.replace(/\.[^.]+$/, ""));
      setStatus(`${file.name} を範囲欄へ読み込みました。`);
    } catch {
      setError("テキストを読み取れませんでした。UTF-8のTXT・MD・CSV・JSONを使ってください。");
    }
  }

  async function loadScopeImages(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    if (files.length > OCR_MAX_FILES) {
      setError(`画像は一度に${OCR_MAX_FILES}枚まで選べます。`);
      return;
    }
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    const invalid = files.find((file) => !allowedTypes.has(file.type) || file.size > OCR_MAX_FILE_BYTES);
    if (invalid) {
      setError(`${invalid.name} は対応形式ではないか、12MBを超えています。JPG・JPEG・PNG・WEBPを使ってください。`);
      return;
    }

    let worker: Awaited<ReturnType<(typeof import("tesseract.js"))["createWorker"]>> | null = null;
    let activeFileIndex = 0;
    setError("");
    setStatus("");
    setOcrBusy(true);
    setOcrProgress(0);
    setOcrStatus("OCRを準備しています。初回は日本語・英語の言語データを取得します。");
    try {
      const { createWorker } = await import("tesseract.js");
      worker = await createWorker(["jpn", "eng"], undefined, {
        logger(message) {
          const localProgress = typeof message.progress === "number" ? message.progress : 0;
          setOcrProgress(Math.min(100, Math.round(((activeFileIndex + localProgress) / files.length) * 100)));
          setOcrStatus(`${activeFileIndex + 1}/${files.length} ${message.status ?? "OCR処理中"}`);
        },
      });
      const sections: string[] = [];
      for (let index = 0; index < files.length; index += 1) {
        activeFileIndex = index;
        setOcrStatus(`${index + 1}/${files.length} ${files[index].name} を読み取っています。`);
        const result = await worker.recognize(files[index]);
        const recognized = result.data.text.trim();
        if (recognized) sections.push(`【OCR：${files[index].name}】\n${recognized}`);
      }
      if (!sections.length) throw new Error("画像から文字を認識できませんでした。");
      const existing = latestInputRef.current.scopeText.trimEnd();
      const combined = `${existing}${existing ? "\n\n" : ""}${sections.join("\n\n")}`;
      if (combined.length > SCOPE_TEXT_UI_MAX_LENGTH) {
        throw new Error("OCR結果を追加すると100,000文字を超えます。範囲を分けてください。");
      }
      updateInput("scopeText", combined);
      if (!latestInputRef.current.title && files[0]) updateInput("title", files[0].name.replace(/\.[^.]+$/, ""));
      setOcrProgress(100);
      setOcrStatus(`${files.length}枚のOCR結果を範囲欄へ追記しました。生成前に必ず見直してください。`);
    } catch (ocrError) {
      setError(`画像OCRに失敗しました。${errorMessage(ocrError)}`);
      setOcrStatus("OCRを完了できませんでした。範囲欄はそのまま編集できます。");
    } finally {
      try {
        await worker?.terminate();
      } catch {
        // OCR終了処理の失敗で画面全体を止めない。
      }
      setOcrBusy(false);
    }
  }

  async function loadProjectFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > TEST_BUILDER_MAX_IMPORT_JSON_LENGTH * 4) {
      setError(`プロジェクトJSONは${TEST_BUILDER_MAX_IMPORT_JSON_LENGTH.toLocaleString()}文字以内にしてください。`);
      return;
    }
    try {
      const json = await file.text();
      if (json.length > TEST_BUILDER_MAX_IMPORT_JSON_LENGTH) {
        setError(`プロジェクトJSONは${TEST_BUILDER_MAX_IMPORT_JSON_LENGTH.toLocaleString()}文字以内にしてください。`);
        return;
      }
      const imported = importProject(json);
      setProject(imported);
      setInput(imported.input);
      const saved = saveGeneratedProject(imported);
      if (saved.ok) setStatus(`${file.name} を検証して取り込みました。${saved.trimmed ? "保存上限に合わせ、古いテストを整理しました。" : ""}`);
    } catch (importError) {
      setError(`安全に取り込めませんでした。${errorMessage(importError)}`);
    }
  }

  function exportCurrentProject() {
    if (!project) return;
    downloadText(`${cleanFilename(project.test.title)}.testgrid.json`, exportProject(project));
    setStatus("共有用JSONを書き出しました。別の人はテスト作成室から再編集できます。");
  }

  function openSavedProject(saved: TestBuilderProject) {
    setProject(saved);
    setInput(saved.input);
    setAnswersVisible(true);
    setError("");
    setStatus("保存済みプロジェクトを開きました。");
    const url = new URL(window.location.href);
    url.searchParams.set("project", saved.projectId);
    window.history.replaceState({}, "", url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteSavedProject(projectId: string) {
    if (!window.confirm("この保存済みテストを削除しますか？この操作は元に戻せません。")) return;
    const next = savedProjects.filter((item) => item.projectId !== projectId);
    const persisted = persistProjects(next);
    if (!persisted.ok) return;
    if (project?.projectId === projectId) {
      setProject(null);
      const url = new URL(window.location.href);
      url.searchParams.delete("project");
      window.history.replaceState({}, "", url);
    }
    setStatus("保存済みプロジェクトを削除しました。");
  }

  function printTest(mode: "questions" | "solutions") {
    setPrintMode(mode);
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => window.print()));
  }

  return (
    <div className={styles.page} data-print-mode={printMode ?? undefined}>
      <header className={styles.topbar}>
        <Link className={styles.brand} href="/">
          <strong>TEST//GRID</strong>
          <span>LOCAL TEST BUILDER / SOURCE LOCKED</span>
        </Link>
        <Link className={styles.backLink} href="/">学年・試験区分へ戻る</Link>
      </header>

      <main className={styles.main}>
        <section className={styles.hero} aria-labelledby="test-builder-title">
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>LOCAL DETERMINISTIC ENGINE / AI &amp; API FREE</p>
            <h1 id="test-builder-title">範囲から作る、<br /><em>ローカルテスト生成エンジン。</em></h1>
            <p>AI/API不使用。範囲と形式を渡すと、入力された情報だけを決定的に組み替えてテストを作ります。同じseedなら同じ問題を再現でき、作った人が変わってもJSONで引き継げます。</p>
          </div>
          <aside className={styles.promise} aria-label="作成時の保証">
            <strong>作ったまま放置しない。</strong>
            <ul>
              <li>全問に解答・解説・出典</li>
              <li>配点合計を満点へ一致</li>
              <li>範囲外の知識を勝手に追加しない</li>
              <li>端末保存・アカウント同期・JSON共有</li>
            </ul>
          </aside>
        </section>

        <p className={styles.notice}>
          <strong>現在の読取り範囲：</strong> 貼り付けテキスト、TXT、MD、CSV、JSONと、JPG・JPEG・PNG・WEBPのブラウザーOCRに対応します。PDF・ZIPは未対応です。数式・図・手書き文字は誤認識しやすいため、生成前にOCR結果を必ず修正してください。
        </p>

        <div className={styles.workspace}>
          <section className={styles.controls} aria-labelledby="builder-settings-title">
            <p className={styles.sectionIndex}>01 / INPUT &amp; BLUEPRINT</p>
            <h2 id="builder-settings-title" className={styles.sectionTitle}>保存先・範囲・形式</h2>

            <form className={styles.form} onSubmit={generate}>
              <fieldset>
                <legend>1. 保存先</legend>
                <div className={styles.twoColumns}>
                  <label className={styles.field}>
                    <span>学年</span>
                    <select value={input.grade} onChange={(event) => updateInput("grade", Number(event.target.value) as TestBuilderInput["grade"])}>
                      {[1, 2, 3, 4, 5].map((grade) => <option key={grade} value={grade}>{grade}年</option>)}
                    </select>
                  </label>
                  <label className={styles.field}>
                    <span>試験区分</span>
                    <select value={input.period} onChange={(event) => updateInput("period", event.target.value as TestBuilderInput["period"])}>
                      {PERIOD_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </label>
                </div>
                <label className={styles.field}>
                  <span>教科名</span>
                  <input required maxLength={60} value={input.subject} onChange={(event) => updateInput("subject", event.target.value)} placeholder="例：確率統計" />
                </label>
                <label className={styles.field}>
                  <span>テスト名</span>
                  <input required maxLength={100} value={input.title} onChange={(event) => updateInput("title", event.target.value)} placeholder="例：前期末 想定模試01" />
                </label>
              </fieldset>

              <fieldset>
                <legend>2. テスト範囲</legend>
                <label className={styles.field}>
                  <span>範囲テキスト</span>
                  <textarea
                    required
                    maxLength={SCOPE_TEXT_UI_MAX_LENGTH}
                    value={input.scopeText}
                    onChange={(event) => updateInput("scopeText", event.target.value)}
                    placeholder={"推奨：1行につき1項目\n用語::答え::解説\n平均::データの合計を個数で割った値::代表値の一つ\n\nまたは\nQ: 問題文\nA: 解答"}
                  />
                  <small>100,000文字まで。文章だけでも作れますが、<code>用語::答え::解説</code> または <code>Q:/A:</code> にすると精度が上がります。</small>
                </label>
                <label className={styles.fileField}>
                  <span>テキストファイルから読み込む</span>
                  <input type="file" accept=".txt,.md,.csv,.json,text/plain,text/markdown,text/csv,application/json" onChange={loadScopeFile} />
                  <small>読取り後100,000文字まで。ファイルの内容はブラウザー内で読み、外部AIへ送信しません。</small>
                </label>
                <label className={styles.fileField}>
                  <span>教材画像をブラウザーOCRで追記する</span>
                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    disabled={ocrBusy}
                    onChange={loadScopeImages}
                  />
                  <small>JPG・JPEG・PNG・WEBPを一度に5枚まで、各12MBまで。初回のみ日本語・英語OCRの言語データを取得します。画像本体は外部AIへ送信せず、ブラウザー内で順番に処理します。</small>
                </label>
                <div className={styles.ocrPanel} aria-live="polite">
                  <div><strong>OCR</strong><span>{ocrProgress}%</span></div>
                  <progress max={100} value={ocrProgress}>{ocrProgress}%</progress>
                  <p>{ocrStatus || "画像を選ぶと、ファイル名見出し付きで範囲欄へ追記します。結果は生成前に自由に編集できます。"}</p>
                  <small>数式・図・手書き文字はOCRだけで確定せず、原画像と照合してください。</small>
                </div>
              </fieldset>

              <fieldset>
                <legend>3. 出題形式</legend>
                <div className={styles.threeColumns}>
                  <label className={styles.field}>
                    <span>時間（分）</span>
                    <input type="number" min={1} max={300} required value={input.durationMinutes} onChange={(event) => updateInput("durationMinutes", Number(event.target.value))} />
                  </label>
                  <label className={styles.field}>
                    <span>満点</span>
                    <input type="number" min={1} max={1000} required value={input.totalPoints} onChange={(event) => updateInput("totalPoints", Number(event.target.value))} />
                  </label>
                  <label className={styles.field}>
                    <span>問題数</span>
                    <input type="number" min={1} max={100} required value={input.questionCount} onChange={(event) => updateInput("questionCount", Number(event.target.value))} />
                  </label>
                </div>
                <div className={styles.twoColumns}>
                  <label className={styles.field}>
                    <span>難易度</span>
                    <select value={input.difficulty} onChange={(event) => updateInput("difficulty", Number(event.target.value) as TestBuilderInput["difficulty"])}>
                      <option value={1}>1 / 基礎確認</option>
                      <option value={2}>2 / 本番標準</option>
                      <option value={3}>3 / 本番上位</option>
                    </select>
                  </label>
                  <label className={styles.field}>
                    <span>再現seed</span>
                    <input maxLength={80} required value={String(input.seed)} onChange={(event) => updateInput("seed", event.target.value)} placeholder="同じ文字なら同じ問題" />
                  </label>
                </div>
                <label className={styles.field}>
                  <span>形式の説明</span>
                  <textarea required maxLength={8_000} value={input.formatText} onChange={(event) => updateInput("formatText", event.target.value)} />
                  <small>例：4択4問、穴埋め2問、T/F2問、記述2問。記述を多め、など。</small>
                </label>
              </fieldset>

              {error && <p className={styles.formError} role="alert">{error}</p>}
              {status && <p className={styles.formSuccess} role="status">{status}</p>}
              <button className={styles.generateButton} type="submit">範囲を固定してテストを作る →</button>
              <button className={styles.secondaryButton} type="button" onClick={() => projectImportRef.current?.click()}>共有JSONを取り込む</button>
              <input ref={projectImportRef} className={styles.srOnly} type="file" accept=".json,.testgrid.json,application/json" onChange={loadProjectFile} />
              <small className={styles.importHint}>共有JSONは最大 {TEST_BUILDER_MAX_IMPORT_JSON_LENGTH.toLocaleString()} 文字。内容を検証してから保存します。</small>
            </form>
          </section>

          <section className={styles.preview} aria-labelledby="test-preview-title">
            <div className={styles.previewToolbar}>
              <div>
                <p className={styles.previewLabel}>02 / A4 PREVIEW</p>
                <strong id="test-preview-title">問題用紙・模範解答</strong>
              </div>
              <div className={styles.previewActions}>
                <button className={styles.answerButton} type="button" disabled={!project} onClick={() => setAnswersVisible((current) => !current)}>
                  {answersVisible ? "解答・解説を隠す" : "解答・解説を表示"}
                </button>
                <button className={styles.secondaryButton} type="button" disabled={!project} onClick={exportCurrentProject}>共有JSON</button>
                <button className={styles.secondaryButton} type="button" disabled={!project} onClick={() => printTest("questions")}>問題用紙印刷</button>
                <button className={styles.secondaryButton} type="button" disabled={!project} onClick={() => printTest("solutions")}>解答解説付き印刷</button>
              </div>
            </div>

            {!project ? (
              <div className={styles.emptyPreview}>
                <div>
                  <strong>まだ問題用紙はありません。</strong>
                  <p>左側で教科・範囲・形式を入力してください。作成後は端末へ自動保存され、ログイン中なら既存の学習同期にも含まれます。</p>
                </div>
              </div>
            ) : (
              <article className={styles.paper} aria-label={`${project.test.title}の問題用紙`}>
                <header className={styles.paperHeader}>
                  <div>
                    <p className={styles.previewLabel}>{project.test.grade}年 / {periodLabel(project.test.period)} / {project.test.subject}</p>
                    <h2>{project.test.title}</h2>
                  </div>
                  <div className={styles.paperMeta}>
                    <span>{project.test.durationMinutes}分</span>
                    <span>{project.test.totalPoints}点</span>
                    <span>{project.test.questions.length}問 / 難易度{project.test.difficulty}</span>
                  </div>
                </header>
                <ol className={styles.questionList}>
                  {project.test.questions.map((question) => (
                    <li className={styles.question} key={question.id}>
                      <div className={styles.questionHead}>
                        <strong>問 {question.number}</strong>
                        <span>{QUESTION_KIND_LABELS[question.kind] ?? question.kind} / {question.points}点</span>
                      </div>
                      <p className={styles.questionPrompt}>{question.prompt}</p>
                      {question.options?.length ? (
                        <ol className={styles.choices}>
                          {question.options.map((option, index) => <li key={`${question.id}-option-${index}`}>{index + 1}. {option}</li>)}
                        </ol>
                      ) : null}
                      {answersVisible || printMode === "solutions" ? (
                        <div className={styles.answerBox}>
                          <h3>解答</h3>
                          <p>{question.answer}</p>
                          <h3>解説</h3>
                          <p>{question.explanation}</p>
                          <p className={styles.sourceExcerpt}><strong>出典：</strong>{question.sourceExcerpt}</p>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ol>
                <footer className={styles.answerBox}>
                  配点確認：{pointTotal} / {project.test.totalPoints}点　・　seed：{project.input.seed}
                </footer>
              </article>
            )}
          </section>
        </div>

        <section className={styles.history} aria-labelledby="saved-projects-title">
          <div className={styles.historyHead}>
            <div>
              <p className={styles.sectionIndex}>03 / SAVED PROJECTS</p>
              <h2 id="saved-projects-title" className={styles.sectionTitle}>端末内の作成済みテスト</h2>
            </div>
            <span>{savedProjects.length} / 30件</span>
          </div>
          {savedProjects.length === 0 ? (
            <p>まだ保存されたテストはありません。最初のテストを作るとここに残ります。</p>
          ) : (
            <div className={styles.historyList}>
              {savedProjects.map((saved) => (
                <article className={styles.historyCard} key={saved.projectId}>
                  <p>{saved.test.grade}年 / {periodLabel(saved.test.period)} / {saved.test.subject}</p>
                  <h3>{saved.test.title}</h3>
                  <p>{saved.test.questions.length}問・{saved.test.totalPoints}点・{saved.test.durationMinutes}分</p>
                  <div className={styles.historyActions}>
                    <button className={styles.secondaryButton} type="button" onClick={() => openSavedProject(saved)}>開く・再編集</button>
                    <button className={styles.dangerButton} type="button" onClick={() => deleteSavedProject(saved.projectId)}>削除</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
