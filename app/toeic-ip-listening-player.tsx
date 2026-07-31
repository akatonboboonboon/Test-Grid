"use client";

import { useEffect, useMemo, useState } from "react";

export type ToeicVoiceAccent = "US" | "UK" | "CA" | "AU";

const ACCENT_LANGS: Record<ToeicVoiceAccent, string[]> = {
  US: ["en-US"],
  UK: ["en-GB"],
  CA: ["en-CA", "en-US"],
  AU: ["en-AU", "en-NZ", "en-GB"],
};

function cleanForSpeech(value: string) {
  return value
    .replace(/^(?:Man|Woman|Speaker|Narrator|Customer|Clerk|Manager|Assistant|Agent|Caller|Guide|Announcer)\s*:\s*/gim, "")
    .replace(/\[[^\]]+\]/g, "")
    .trim();
}

function selectVoice(voices: SpeechSynthesisVoice[], accent: ToeicVoiceAccent) {
  const preferences = ACCENT_LANGS[accent];
  for (const lang of preferences) {
    const exact = voices.find((voice) => voice.lang.toLowerCase() === lang.toLowerCase());
    if (exact) return exact;
  }
  return voices.find((voice) => voice.lang.toLowerCase().startsWith("en"));
}

export default function ToeicListeningPlayer({
  text,
  recommendedAccent = "US",
  testOnce = false,
  compact = false,
  onPlayed,
}: {
  text: string;
  recommendedAccent?: ToeicVoiceAccent;
  testOnce?: boolean;
  compact?: boolean;
  onPlayed?: () => void;
}) {
  const [accent, setAccent] = useState<ToeicVoiceAccent>(recommendedAccent);
  const [rate, setRate] = useState(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [playing, setPlaying] = useState(false);
  const [plays, setPlays] = useState(0);
  const [status, setStatus] = useState("再生前");
  const canUseSpeech = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    if (!canUseSpeech) return;
    const refresh = () => setVoices(window.speechSynthesis.getVoices());
    refresh();
    window.speechSynthesis.addEventListener?.("voiceschanged", refresh);
    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.removeEventListener?.("voiceschanged", refresh);
    };
  }, [canUseSpeech]);

  useEffect(() => {
    setAccent(recommendedAccent);
    setPlays(0);
    setPlaying(false);
    setStatus("再生前");
    if (canUseSpeech) window.speechSynthesis.cancel();
  }, [canUseSpeech, recommendedAccent, text]);

  const voiceLabel = useMemo(() => {
    const voice = selectVoice(voices, accent);
    return voice ? `${voice.name} / ${voice.lang}` : "端末の英語音声";
  }, [accent, voices]);

  function play() {
    if (!canUseSpeech || !text.trim() || (testOnce && plays > 0)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanForSpeech(text));
    const voice = selectVoice(voices, accent);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = ACCENT_LANGS[accent][0];
    }
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.onstart = () => {
      setPlaying(true);
      setStatus("再生中");
    };
    utterance.onend = () => {
      setPlaying(false);
      setStatus("再生終了");
    };
    utterance.onerror = () => {
      setPlaying(false);
      setStatus("音声を再生できませんでした");
    };
    setPlays((value) => value + 1);
    onPlayed?.();
    window.speechSynthesis.speak(utterance);
  }

  function stop() {
    if (!canUseSpeech) return;
    window.speechSynthesis.cancel();
    setPlaying(false);
    setStatus("停止しました");
  }

  return (
    <div className={`toeic-audio-player${compact ? " is-compact" : ""}`}>
      <div className="toeic-audio-controls">
        <button type="button" onClick={play} disabled={!canUseSpeech || playing || (testOnce && plays > 0)}>
          {testOnce && plays > 0 ? "本番再生済み" : playing ? "再生中…" : "▶ 音声を再生"}
        </button>
        <button type="button" onClick={stop} disabled={!playing}>■ 停止</button>
        <label>
          <span>ACCENT</span>
          <select value={accent} onChange={(event) => setAccent(event.target.value as ToeicVoiceAccent)}>
            <option value="US">US</option>
            <option value="UK">UK</option>
            <option value="CA">CANADA</option>
            <option value="AU">AU/NZ</option>
          </select>
        </label>
        <label>
          <span>SPEED</span>
          <select value={rate} onChange={(event) => setRate(Number(event.target.value))}>
            <option value="0.8">0.8×</option>
            <option value="0.9">0.9×</option>
            <option value="1">1.0×</option>
            <option value="1.1">1.1×</option>
          </select>
        </label>
      </div>
      <p className="toeic-audio-status" aria-live="polite">
        <span>{status} · {plays}回</span>
        <small>{voiceLabel}（端末により声質は異なります）</small>
      </p>
      {!canUseSpeech && <p className="toeic-audio-error">このブラウザでは読み上げ音声を利用できません。Chrome / Edge / Safariで開いてください。</p>}
    </div>
  );
}