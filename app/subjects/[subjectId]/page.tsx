"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import CardDeckSearch from "../../card-deck-search";
import { RichMathText } from "../../statistics-math";
import { shuffle, storageRead, storageWrite } from "../../protocols";
import {
  DEFAULT_SUBJECTS,
  cardsStorageKey,
  isSubjectId,
  loadSubjects,
  normalizeStudyCards,
  normalizeStudyProgress,
  progressStorageKey,
  type StudyCard,
  type StudyProgress,
  type StudySubject,
  type SubjectId,
} from "../../study-data";

type WorkspaceMode = "study" | "test" | "edit";

function makeCard(subjectId: SubjectId, prompt: string, answer: string): StudyCard {
  return {
    id: `${subjectId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    subjectId,
    prompt: prompt.trim(),
    answer: answer.trim(),
    enabled: true,
  };
}

function parseBulk(text: string) {
  const valid: Array<{ prompt: string; answer: string }> = [];
  let invalid = 0;
  text.split(/\r?\n/).forEach((line) => {
    if (!line.trim()) return;
    const separator = line.includes("\t") ? "\t" : line.includes("::") ? "::" : null;
    if (!separator) {
      invalid += 1;
      return;
    }
    const [prompt, ...answerParts] = line.split(separator);
    const answer = answerParts.join(separator);
    if (!prompt.trim() || !answer.trim()) {
      invalid += 1;
      return;
    }
    valid.push({ prompt: prompt.trim(), answer: answer.trim() });
  });
  return { valid, invalid };
}

export default function GenericSubjectPage() {
  const params = useParams<{ subjectId: string }>();
  const rawSubjectId = Array.isArray(params.subjectId) ? params.subjectId[0] : params.subjectId;
  const subjectId = isSubjectId(rawSubjectId) && rawSubjectId !== "network" ? rawSubjectId : null;
  const [subjects, setSubjects] = useState<StudySubject[]>(DEFAULT_SUBJECTS);
  const [cards, setCards] = useState<StudyCard[]>([]);
  const [progress, setProgress] = useState<StudyProgress>({});
  const [deck, setDeck] = useState<StudyCard[]>([]);
  const [mode, setMode] = useState<WorkspaceMode>("study");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [newPrompt, setNewPrompt] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [deleteArmed, setDeleteArmed] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);
  const answerRef = useRef<HTMLInputElement>(null);

  /* Device-local subject cards and progress are restored after mount. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!subjectId) return;
    const restoredSubjects = loadSubjects();
    const restoredCards = normalizeStudyCards(
      storageRead<unknown>(cardsStorageKey(subjectId), []),
      subjectId,
    );
    const usableCards = restoredCards.filter((card) => card.enabled);
    setSubjects(restoredSubjects);
    setCards(restoredCards);
    setProgress(normalizeStudyProgress(
      storageRead<unknown>(progressStorageKey(subjectId), {}),
      restoredCards,
    ));
    setDeck(shuffle(usableCards));
    setMode(usableCards.length ? "study" : "edit");
    setHydrated(true);
  }, [subjectId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated || !subjectId) return;
    storageWrite(cardsStorageKey(subjectId), cards);
    storageWrite(progressStorageKey(subjectId), progress);
  }, [cards, progress, subjectId, hydrated]);

  const subject = subjectId ? subjects.find((item) => item.id === subjectId) : null;
  const usableCards = useMemo(
    () => cards.filter((card) => card.enabled && card.prompt.trim() && card.answer.trim()),
    [cards],
  );
  const masteredCount = usableCards.filter((card) => progress[card.id] === "mastered").length;
  const learningCount = usableCards.filter((card) => progress[card.id] === "learning").length;
  const completion = usableCards.length ? Math.round((masteredCount / usableCards.length) * 100) : 0;
  const currentCard = deck[index];
  const bulkPreview = useMemo(() => parseBulk(bulkText), [bulkText]);

  function focusCard() {
    window.setTimeout(() => cardRef.current?.focus(), 0);
  }

  function prepareDeck(source = usableCards) {
    const nextDeck = shuffle(source);
    setDeck(nextDeck);
    setIndex(0);
    setFlipped(false);
    setRevealed(false);
    setTypedAnswer("");
    return nextDeck;
  }

  function jumpToStudyCard(cardId: string) {
    const card = usableCards.find((item) => item.id === cardId);
    if (!card) return;
    const alreadyInDeck = deck.some((item) => item.id === cardId);
    const nextDeck = alreadyInDeck ? deck : [...usableCards];
    setDeck(nextDeck);
    setIndex(Math.max(0, nextDeck.findIndex((item) => item.id === cardId)));
    setFlipped(false);
    setRevealed(false);
    setTypedAnswer("");
    setAnnouncement(card.prompt + " のカードを開きました。" + (alreadyInDeck ? "" : "全カード表示へ戻しました。"));
    focusCard();
  }

  function changeMode(nextMode: WorkspaceMode) {
    if (nextMode !== "edit") prepareDeck();
    setMode(nextMode);
  }

  function move(delta: number) {
    if (!deck.length) return;
    setIndex((current) => (current + delta + deck.length) % deck.length);
    setFlipped(false);
    setRevealed(false);
    setTypedAnswer("");
    setAnnouncement("");
    if (mode === "test") {
      window.setTimeout(() => answerRef.current?.focus(), 0);
    } else {
      focusCard();
    }
  }

  function markCard(state: "learning" | "mastered") {
    if (!currentCard) return;
    setProgress((current) => ({ ...current, [currentCard.id]: state }));
    setAnnouncement(`${currentCard.prompt}を${state === "mastered" ? "「覚えた」" : "「もう一度」"}にしました。`);
    setIndex((current) => (current + 1) % deck.length);
    setFlipped(false);
    setRevealed(false);
    setTypedAnswer("");
    focusCard();
  }

  function reviewUnmastered() {
    const remaining = usableCards.filter((card) => progress[card.id] !== "mastered");
    prepareDeck(remaining.length ? remaining : usableCards);
    setAnnouncement(remaining.length ? `未暗記の${remaining.length}枚で復習します。` : "全カードをもう一周します。");
  }

  function addOneCard(event: React.FormEvent) {
    event.preventDefault();
    if (!subjectId || !newPrompt.trim() || !newAnswer.trim()) return;
    const card = makeCard(subjectId, newPrompt, newAnswer);
    setCards((current) => [...current, card]);
    setNewPrompt("");
    setNewAnswer("");
    setAnnouncement("カードを1枚追加しました。");
  }

  function importBulk() {
    if (!subjectId || !bulkPreview.valid.length) return;
    const imported = bulkPreview.valid.map((item) => makeCard(subjectId, item.prompt, item.answer));
    setCards((current) => [...current, ...imported]);
    setBulkText("");
    setAnnouncement(`${imported.length}枚のカードを追加しました。`);
  }

  function updateCard(id: string, patch: Partial<StudyCard>) {
    setCards((current) => current.map((card) => card.id === id ? { ...card, ...patch } : card));
  }

  function deleteCard(card: StudyCard) {
    if (deleteArmed !== card.id) {
      setDeleteArmed(card.id);
      setAnnouncement(`${card.prompt}を削除するには、もう一度削除ボタンを押してください。`);
      window.setTimeout(() => setDeleteArmed((current) => current === card.id ? null : current), 3500);
      return;
    }
    setCards((current) => current.filter((item) => item.id !== card.id));
    setProgress((current) => Object.fromEntries(Object.entries(current).filter(([id]) => id !== card.id)));
    setDeleteArmed(null);
    setAnnouncement(`${card.prompt}を削除しました。`);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (mode !== "study") return;
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, button, a")) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        move(1);
      } else if (event.code === "Space") {
        event.preventDefault();
        setFlipped((value) => !value);
      } else if (flipped && event.key === "1") {
        markCard("learning");
      } else if (flipped && event.key === "2") {
        markCard("mastered");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  if (!subjectId || !subject) {
    return (
      <main className="subject-invalid">
        <span>SUBJECT NOT FOUND</span>
        <h1>この科目は見つかりません。</h1>
        <Link href="/">9教科の一覧へ戻る</Link>
      </main>
    );
  }

  const pageStyle = { "--subject-accent": subject.accent } as CSSProperties;

  return (
    <div className="app-frame generic-subject-page" style={pageStyle}>
      <header className="topbar">
        <Link className="brand" href="/" aria-label="9教科の一覧へ戻る">
          <span className="brand-mark hub-brand-mark" aria-hidden="true">T/9</span>
          <span><strong>TEST//GRID</strong><small>SUBJECT WORKSPACE</small></span>
        </Link>
        <div className="header-actions">
          <span className="card-count-label"><i aria-hidden="true" /> {usableCards.length} CARDS</span>
          <Link className="outline-button header-link" href={"/cards?subject=" + subjectId}>暗記帳検索</Link>
          <Link className="outline-button header-link" href={`/rapid/${subjectId}`}>時間制限 即答</Link>
          <Link className="outline-button header-link" href="/">科目一覧</Link>
        </div>
      </header>

      <main className="generic-subject-main">
        <nav className="subject-breadcrumb" aria-label="現在位置"><Link href="/">科目一覧</Link><span>/</span><strong aria-current="page">{subject.name}</strong></nav>

        <section className="generic-subject-hero">
          <div>
            <p><span>SUBJECT {String(subject.order).padStart(2, "0")}</span><span>{subject.testDate || "DATE OPEN"}</span></p>
            <h1>{subject.name}</h1>
            <small>{subject.memo || "問題と答えを登録し、暗記カードと一問一答で繰り返します。"}</small>
          </div>
          <div className="generic-subject-stats">
            <div><span>CARDS</span><strong>{usableCards.length}</strong></div>
            <div><span>MASTERED</span><strong>{masteredCount}</strong></div>
            <div><span>REVIEW</span><strong>{learningCount}</strong></div>
          </div>
        </section>

        <div className="workspace-tabs" role="tablist" aria-label="学習モード">
          <button type="button" role="tab" aria-selected={mode === "study"} className={mode === "study" ? "active" : ""} onClick={() => changeMode("study")} disabled={!usableCards.length}>暗記カード</button>
          <button type="button" role="tab" aria-selected={mode === "test"} className={mode === "test" ? "active" : ""} onClick={() => changeMode("test")} disabled={!usableCards.length}>一問一答</button>
          <button type="button" role="tab" aria-selected={mode === "edit"} className={mode === "edit" ? "active" : ""} onClick={() => setMode("edit")}>教材を編集</button>
        </div>

        {mode !== "edit" && usableCards.length > 0 && (
          <section className="generic-progress" aria-label="暗記進捗">
            <div><span>MASTERED {masteredCount} / {usableCards.length}</span><strong>{completion}%</strong></div>
            <progress value={completion} max="100" aria-label={`暗記進捗 ${completion}%`} />
          </section>
        )}

        {mode === "study" && currentCard && (
          <section className="generic-card-workspace" aria-label="暗記カード">
            <CardDeckSearch
              items={usableCards.map((card) => ({
                id: card.id,
                label: card.prompt,
                description: card.answer,
                searchText: [subject?.name],
              }))}
              currentId={currentCard.id}
              label={(subject?.name ?? "この教科") + "の暗記カードを検索"}
              placeholder="問題・用語・答えを入力"
              onSelect={jumpToStudyCard}
            />
            <div className="generic-deck-meta"><span>CARD {index + 1} / {deck.length}</span><span>{progress[currentCard.id] === "mastered" ? "覚えた" : progress[currentCard.id] === "learning" ? "復習" : "未判定"}</span></div>
            <button ref={cardRef} type="button" className={`generic-flip-card ${flipped ? "is-flipped" : ""}`} onClick={() => setFlipped((value) => !value)} aria-label={flipped ? "問題に戻る" : "答えを表示"}>
              <span>{flipped ? "ANSWER" : "QUESTION"}</span>
              <strong><RichMathText text={flipped ? currentCard.answer : currentCard.prompt} /></strong>
              <small>{flipped ? "覚えていたか判定してください" : "タップして答えを確認"}</small>
            </button>
            <div className="generic-card-controls">
              <button type="button" onClick={() => move(-1)} aria-label="前のカード">← 前へ</button>
              <button type="button" className="again" disabled={!flipped} onClick={() => markCard("learning")}>1　もう一度</button>
              <button type="button" className="mastered" disabled={!flipped} onClick={() => markCard("mastered")}>2　覚えた</button>
              <button type="button" onClick={() => move(1)} aria-label="次のカード">次へ →</button>
            </div>
            <div className="generic-deck-tools">
              <button type="button" onClick={() => prepareDeck()}>全カードをシャッフル</button>
              <button type="button" onClick={reviewUnmastered}>未暗記だけ復習</button>
            </div>
            <p className="memory-hint"><kbd>SPACE</kbd> で反転 · <kbd>←</kbd><kbd>→</kbd> で移動 · 裏面で <kbd>1</kbd>/<kbd>2</kbd></p>
          </section>
        )}

        {mode === "test" && currentCard && (
          <section className="generic-test-workspace" aria-label="一問一答">
            <div className="generic-deck-meta"><span>QUESTION {index + 1} / {deck.length}</span><span>SELF CHECK</span></div>
            <div className="generic-test-question"><span>問題</span><h2><RichMathText text={currentCard.prompt} /></h2></div>
            {!revealed ? (
              <form onSubmit={(event) => { event.preventDefault(); setRevealed(true); }}>
                <label htmlFor="typed-answer">頭の中の答えを入力 <small>任意</small></label>
                <div><input ref={answerRef} id="typed-answer" autoComplete="off" value={typedAnswer} onChange={(event) => setTypedAnswer(event.target.value)} placeholder="答えを入力して確認" /><button type="submit">答えを見る →</button></div>
              </form>
            ) : (
              <div className="generic-test-answer">
                {typedAnswer && <p><span>あなたの回答</span>{typedAnswer}</p>}
                <p><span>正解</span><strong><RichMathText text={currentCard.answer} /></strong></p>
                <div><button type="button" className="again" onClick={() => markCard("learning")}>もう一度</button><button type="button" className="mastered" onClick={() => markCard("mastered")}>正解できた</button></div>
              </div>
            )}
          </section>
        )}

        {mode === "edit" && (
          <section className="generic-editor" aria-labelledby="generic-editor-title">
            <div className="generic-editor-heading"><div><span>CARD DATABASE</span><h2 id="generic-editor-title">教材を登録</h2></div><p>授業ノートやプリントから、問題と答えの組を作ります。</p></div>

            <form className="generic-add-form" onSubmit={addOneCard}>
              <label><span>問題・用語</span><textarea rows={2} required value={newPrompt} onChange={(event) => setNewPrompt(event.target.value)} placeholder="例：鎌倉幕府が成立した年は？" /></label>
              <label><span>答え・説明</span><textarea rows={2} required value={newAnswer} onChange={(event) => setNewAnswer(event.target.value)} placeholder="例：1192年（授業では1185年説にも注意）" /></label>
              <button type="submit">1枚追加 →</button>
            </form>

            <div className="generic-bulk-import">
              <div><span>BULK IMPORT</span><h3>まとめて貼り付け</h3><p>1行につき「問題［Tab］答え」または「問題::答え」で入力します。</p></div>
              <textarea rows={6} value={bulkText} onChange={(event) => setBulkText(event.target.value)} placeholder={"用語A\t説明A\n用語B::説明B"} aria-describedby="bulk-import-result" />
              <div id="bulk-import-result"><span>{bulkPreview.valid.length}枚を追加可能</span>{bulkPreview.invalid > 0 && <small>{bulkPreview.invalid}行は区切りを確認</small>}<button type="button" disabled={!bulkPreview.valid.length} onClick={importBulk}>まとめて追加</button></div>
            </div>

            <div className="generic-card-list">
              <div className="generic-card-list-head"><span>REGISTERED</span><strong>{cards.length}枚</strong></div>
              {cards.length === 0 ? (
                <div className="generic-empty"><span>EMPTY</span><h3>まだ教材がありません。</h3><p>上のフォームから最初のカードを追加してください。</p></div>
              ) : cards.map((card, cardIndex) => (
                <article key={card.id} className={card.enabled ? "" : "is-disabled"}>
                  <span>{String(cardIndex + 1).padStart(2, "0")}</span>
                  <label><small>問題</small><textarea rows={2} value={card.prompt} onChange={(event) => updateCard(card.id, { prompt: event.target.value })} /></label>
                  <label><small>答え</small><textarea rows={2} value={card.answer} onChange={(event) => updateCard(card.id, { answer: event.target.value })} /></label>
                  <div><button type="button" onClick={() => updateCard(card.id, { enabled: !card.enabled })}>{card.enabled ? "出題ON" : "出題OFF"}</button><button type="button" className={`delete ${deleteArmed === card.id ? "is-armed" : ""}`} onClick={() => deleteCard(card)}>{deleteArmed === card.id ? "もう一度で削除" : "削除"}</button></div>
                </article>
              ))}
            </div>
          </section>
        )}

        {!usableCards.length && mode !== "edit" && (
          <section className="generic-empty"><span>EMPTY SUBJECT</span><h2>まだ教材がありません。</h2><p>問題と答えを登録すると、暗記カードと一問一答を始められます。</p><button type="button" onClick={() => setMode("edit")}>最初のカードを追加</button></section>
        )}
        <p className="sr-announcement" aria-live="polite">{announcement}</p>
      </main>

      <footer><span>TEST//GRID</span><p>{subject.name} · LOCAL SAVE · SELF CHECK</p><span>SUBJECT {String(subject.order).padStart(2, "0")}</span></footer>
    </div>
  );
}
