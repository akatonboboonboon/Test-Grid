import Image from "next/image";
import styles from "./english-weather-figure.module.css";

const SOURCE_IMAGE = "/english/ch16-weather-homepage-source.jpg";
const SOURCE_WIDTH = 2160;
const SOURCE_HEIGHT = 3840;

function SourcePhoto({ alt, className }: { alt: string; className: string }) {
  return (
    <Image
      src={SOURCE_IMAGE}
      width={SOURCE_WIDTH}
      height={SOURCE_HEIGHT}
      alt={alt}
      className={className}
      sizes="(max-width: 640px) 720px, 960px"
      unoptimized
      draggable={false}
    />
  );
}

export function EnglishWeatherFigure() {
  return (
    <figure className={styles.figure} aria-labelledby="ch16-weather-figure-title">
      <div className={styles.cropScroller} tabIndex={0} aria-label="Weather homepage の図。スマートフォンでは横方向にスクロールできます。">
        <div className={styles.cropViewport}>
          <div className={styles.cropPage}>
            <SourcePhoto
              className={styles.sourcePhoto}
              alt="Chapter 16のWeather homepage図。全国天気、地域天気、気象データ、気象警報から目的の情報を選ぶメニュー。"
            />
          </div>
        </div>
      </div>

      <figcaption className={styles.caption}>
        <span className={styles.eyebrow}>CHAPTER 16 · SOURCE FIGURE</span>
        <strong id="ch16-weather-figure-title">Weather homepage</strong>
        <p>問題文の目的に合う項目を、●の大分類と○の小分類から選びます。上の表示は原資料写真の右下だけをCSSで拡大したもので、画像自体は加工していません。</p>
      </figcaption>

      <details className={styles.sourceDetails}>
        <summary>原資料のページ全体を確認する</summary>
        <div className={styles.fullScroller}>
          <div className={styles.fullPage}>
            <SourcePhoto
              className={styles.sourcePhoto}
              alt="Chapter 16の演習プリント全体。右下にWeather homepageの選択図がある。"
            />
          </div>
        </div>
        <p className={styles.sourceNote}>写真は読みやすい向きへCSSで90度回転して表示しています。細部は原寸画像を開いて拡大できます。</p>
        <a className={styles.sourceLink} href={SOURCE_IMAGE} target="_blank" rel="noreferrer">原寸画像を別画面で開く</a>
      </details>
    </figure>
  );
}

export default EnglishWeatherFigure;
