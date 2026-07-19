"use client";

import type { ReactNode } from "react";
import { useId, useState } from "react";
import styles from "./card-face-list.module.css";

export type CardFaceListItem = {
  id: string;
  eyebrow?: string;
  meta?: string;
  front: ReactNode;
  back: ReactNode;
  explanation?: ReactNode;
};

type CardFaceListProps = {
  items: readonly CardFaceListItem[];
  title?: string;
  description?: string;
  emptyMessage?: string;
  pageSize?: number;
  tone?: "light" | "dark";
  onSelect?: (id: string) => void;
  selectLabel?: string;
};

export default function CardFaceList({
  items,
  title = "表・裏を一覧で確認",
  description = "カードをめくらず、問題面と答え面を並べて確認できます。",
  emptyMessage = "現在の条件に一致するカードはありません。",
  pageSize = 40,
  tone = "light",
  onSelect,
  selectLabel = "このカードを1枚で練習",
}: CardFaceListProps) {
  const generatedId = useId().replace(/:/g, "");
  const panelId = `card-face-list-${generatedId}`;
  const [open, setOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const visibleItems = items.slice(0, visibleCount);
  const remaining = Math.max(0, items.length - visibleItems.length);

  return (
    <section className={styles.list} data-tone={tone} data-card-face-list>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span><b>{open ? "一覧を閉じる" : "一覧で見る（表・裏）"}</b><small>{items.length}枚</small></span>
        <i aria-hidden="true">{open ? "−" : "+"}</i>
      </button>

      {open && (
        <div className={styles.panel} id={panelId}>
          <header>
            <div><span>FRONT / BACK LIST</span><h3>{title}</h3></div>
            <p>{description}</p>
          </header>

          {visibleItems.length ? (
            <ol className={styles.items}>
              {visibleItems.map((item, index) => (
                <li key={item.id} className={styles.item}>
                  <div className={styles.meta}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <p>{item.eyebrow && <b>{item.eyebrow}</b>}{item.meta && <small>{item.meta}</small>}</p>
                  </div>
                  <div className={styles.sides}>
                    <section className={styles.face} data-side="front" aria-label="表面">
                      <span>表 / FRONT</span>
                      <div>{item.front}</div>
                    </section>
                    <section className={styles.face} data-side="back" aria-label="裏面">
                      <span>裏 / BACK</span>
                      <div>{item.back}</div>
                    </section>
                  </div>
                  {item.explanation && <div className={styles.explanation}><span>解説・覚え方</span><div>{item.explanation}</div></div>}
                  {onSelect && (
                    <button
                      type="button"
                      className={styles.select}
                      onClick={() => {
                        setOpen(false);
                        onSelect(item.id);
                      }}
                    >
                      {selectLabel} →
                    </button>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.empty}>{emptyMessage}</p>
          )}

          {remaining > 0 && (
            <button
              type="button"
              className={styles.more}
              onClick={() => setVisibleCount((count) => count + pageSize)}
            >
              さらに{Math.min(pageSize, remaining)}枚表示 <small>残り {remaining}枚</small>
            </button>
          )}
        </div>
      )}
    </section>
  );
}
