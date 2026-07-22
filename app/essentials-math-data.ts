import type { EssentialItem } from "./essentials-data";

export const STATISTICS_ESSENTIALS: EssentialItem[] = [
  {
    id: "statistics-centers", kind: "formula", title: "代表値：平均・中央値・レンジ",
    value: "平均は合計÷個数。中央値は昇順の中央、レンジは最大−最小。",
    math: [
      { label: "Σ表示", tex: "\\bar{x}=\\frac1n\\sum_{i=1}^{n}x_i,\\qquad R=x_{max}-x_{min}" },
      { label: "Σなし", tex: "\\bar{x}=\\frac{x_1+x_2+\\cdots+x_n}{n}" },
    ],
    cue: "データ列の最初の集計。中央値を出す前に必ず昇順へ並べる。",
    pitfall: "偶数個の中央値は中央2値の平均。レンジを個数で割らない。",
  },
  {
    id: "statistics-spread", kind: "formula", title: "平均偏差・母分散・母標準偏差",
    value: "平均偏差は絶対値、分散は偏差の二乗、標準偏差は分散の平方根。",
    math: [
      { label: "Σ表示", tex: "MD=\\frac1n\\sum|x_i-\\bar{x}|,\\quad\\sigma^2=\\frac1n\\sum(x_i-\\bar{x})^2,\\quad\\sigma=\\sqrt{\\sigma^2}" },
      { label: "Σなし", tex: "\\sigma^2=\\frac{(x_1-\\bar{x})^2+\\cdots+(x_n-\\bar{x})^2}{n}" },
    ],
    cue: "ばらつきの種類を問う。今回の計算は母分散。",
    pitfall: "母分散はnで割る。平均偏差の絶対値と分散の二乗を取り違えない。",
  },
  {
    id: "statistics-pooled", kind: "formula", title: "2群の統合平均・母分散",
    value: "人数を重みにし、全体分散には群内のばらつきと群平均のずれを両方入れる。",
    math: [
      { tex: "\\bar{x}=\\frac{n_1\\bar{x}_1+n_2\\bar{x}_2}{n_1+n_2}" },
      { tex: "\\sigma^2=\\frac{n_1\\{\\sigma_1^2+(\\bar{x}_1-\\bar{x})^2\\}+n_2\\{\\sigma_2^2+(\\bar{x}_2-\\bar{x})^2\\}}{n_1+n_2}" },
    ],
    cue: "2クラスの人数・平均・標準偏差から全体を求める。",
    pitfall: "群平均や標準偏差を単純平均しない。標準偏差ではなく分散で合成する。",
  },
  {
    id: "statistics-relation", kind: "formula", title: "共分散・相関・単回帰",
    value: "同じ列のX,Yを対応させる。回帰の分母は説明変数Xの分散。",
    math: [
      { label: "Σ表示", tex: "\\sigma_{XY}=\\frac1n\\sum_{i=1}^{n}(x_i-\\bar{x})(y_i-\\bar{y}),\\qquad r=\\frac{\\sigma_{XY}}{\\sigma_X\\sigma_Y}" },
      { label: "Σなし", tex: "\\sigma_{XY}=\\frac{(x_1-\\bar{x})(y_1-\\bar{y})+\\cdots+(x_n-\\bar{x})(y_n-\\bar{y})}{n}" },
      { label: "回帰", tex: "b=\\frac{\\sigma_{XY}}{\\sigma_X^2},\\qquad a=\\bar{y}-b\\bar{x},\\qquad\\hat{y}=a+bx" },
    ],
    cue: "対応表から関係の強さ、またはXからYの予測式を求める。",
    pitfall: "対応の違う列を掛けない。相関は必ず−1〜1、回帰直線は \\((\\bar{x},\\bar{y})\\) を通る。",
  },
  {
    id: "statistics-counting", kind: "rule", title: "順列・組合せ・余事象",
    value: "順番を区別するならP、しないならC。『少なくとも』は余事象を先に疑う。",
    math: [
      { tex: "{}_nP_r=\\frac{n!}{(n-r)!},\\qquad{}_nC_r=\\frac{n!}{r!(n-r)!}" },
      { tex: "P(A\\cup B)=P(A)+P(B)-P(A\\cap B),\\qquad P(A^c)=1-P(A)" },
    ],
    cue: "選んで並べる／選ぶだけ、または『少なくとも1回』。",
    pitfall: "和事象では重なりを1回引く。PとCの判定を計算前に言葉で決める。",
  },
  {
    id: "statistics-bayes", kind: "formula", title: "全確率とBayes",
    value: "全確率は全経路を足す。Bayesは観測結果から原因の経路を逆算する。",
    math: [
      { label: "Σ表示", tex: "P(A)=\\sum_iP(A|H_i)P(H_i)" },
      { label: "Σなし", tex: "P(A)=P(A|H_1)P(H_1)+\\cdots+P(A|H_k)P(H_k)" },
      { tex: "P(H_j|A)=\\frac{P(A|H_j)P(H_j)}{P(A)}" },
    ],
    cue: "複数の箱・工場・経路から結果Aが生じ、原因を問う。",
    pitfall: "分母 \\(P(A)\\) はAへ至る全経路、分子は目的の1経路。",
  },
  {
    id: "statistics-discrete", kind: "formula", title: "離散分布の期待値・分散",
    value: "値と同じ列の確率を掛ける。確率の総和は1。",
    math: [
      { label: "Σ表示", tex: "E[X]=\\sum_i x_ip_i,\\qquad V(X)=\\sum_i(x_i-\\mu)^2p_i" },
      { label: "Σなし", tex: "E[X]=x_1p_1+\\cdots+x_kp_k,\\quad V(X)=(x_1-\\mu)^2p_1+\\cdots+(x_k-\\mu)^2p_k" },
      { label: "計算公式", tex: "V(X)=E[X^2]-\\{E[X]\\}^2" },
    ],
    cue: "値xと確率pの表から平均・分散を求める。",
    pitfall: "\\(E[X^2]\\) と \\(E[X]^2\\) は別物。表の列対応をずらさない。",
  },
  {
    id: "statistics-entropy", kind: "formula", title: "エントロピー",
    value: "確率分布の不確実さ。底2なら単位はbit。",
    math: [
      { label: "Σ表示", tex: "H(X)=-\\sum_i p_i\\log_2p_i" },
      { label: "Σなし", tex: "H(X)=-(p_1\\log_2p_1+\\cdots+p_k\\log_2p_k)" },
    ],
    cue: "離散確率表から情報量・不確実性を求める。",
    pitfall: "先頭の負号と底2を忘れない。\\(p=0\\) の項は0として扱う。",
  },
  {
    id: "statistics-means", kind: "formula", title: "算術・幾何・調和平均",
    value: "正のデータでは \\(H\\le G\\le A\\)。倍率はG、率や速度はHを疑う。",
    math: [{ tex: "A=\\frac{x_1+\\cdots+x_n}{n},\\qquad G=(x_1\\cdots x_n)^{1/n},\\qquad H=\\frac{n}{1/x_1+\\cdots+1/x_n}" }],
    cue: "同じデータに対して3種類の平均を連続して求める過去問型。",
    pitfall: "幾何平均は正の値が前提。調和平均は逆数和でnを割る。",
  },
  {
    id: "statistics-continuous", kind: "rule", title: "密度・標準化・チェビシェフ",
    value: "密度の面積が確率。正規分布は標準化し、分布形を仮定しない下限はチェビシェフ。",
    math: [
      { tex: "\\int_{-\\infty}^{\\infty}f(x)dx=1,\\qquad P(a\\le X\\le b)=\\int_a^bf(x)dx" },
      { tex: "Z=\\frac{X-\\mu}{\\sigma},\\qquad P(|X-\\mu|<k\\sigma)\\ge1-\\frac1{k^2}" },
    ],
    cue: "確率密度、正規分布表、または分布形を仮定しない確率下限。",
    pitfall: "連続型の一点確率は0。正規表の正確な確率とチェビシェフの最低保証を混同しない。",
  },
  {
    id: "statistics-ranks", kind: "formula", title: "スピアマン・ケンドール順位相関",
    value: "同順位なしの基本式。Kendallは一致ペアCと逆転ペアDを数える。",
    math: [
      { label: "Σ表示", tex: "r_s=1-\\frac{6\\sum_i d_i^2}{n(n^2-1)},\\qquad r_K=\\frac{C-D}{{}_nC_2}" },
      { label: "Σなし", tex: "r_s=1-\\frac{6(d_1^2+\\cdots+d_n^2)}{n(n^2-1)}" },
    ],
    cue: "数値そのものではなく順位の一致度を問う。",
    pitfall: "Kendallの全ペア数は \\({}_nC_2\\)。\\(n^2\\) ではない。",
  },
  {
    id: "statistics-squared-sum", kind: "formula", title: "平方和の恒等式",
    value: "証明の核心は平均からの偏差の和が0となり、展開した交差項が消えること。",
    math: [
      { label: "Σ表示", tex: "\\sum_{i=1}^{n}(x_i-a)^2=\\sum_{i=1}^{n}(x_i-\\bar{x})^2+n(\\bar{x}-a)^2" },
      { label: "Σなし", tex: "(x_1-a)^2+\\cdots+(x_n-a)^2=(x_1-\\bar{x})^2+\\cdots+(x_n-\\bar{x})^2+n(\\bar{x}-a)^2" },
    ],
    cue: "『次の等式を証明せよ』という過去問最後の記述。",
    pitfall: "結論だけでなく \\((x_1-\\bar{x})+\\cdots+(x_n-\\bar{x})=0\\) を明記する。",
  },
];

export const APPLIED_MATH_ESSENTIALS: EssentialItem[] = [
  {
    id: "applied-norm-unit", kind: "formula", title: "ベクトルの大きさ・単位化",
    value: "成分を二乗して足し、平方根。向きを保った単位ベクトルは自分の長さで割る。",
    math: [{ tex: "|\\mathbf a|=\\sqrt{a_x^2+a_y^2+a_z^2},\\qquad\\mathbf e=\\frac{\\mathbf a}{|\\mathbf a|}" }],
    cue: "方向だけ欲しい、または方向微分の前処理。",
    pitfall: "零ベクトルは単位化できない。方向ベクトルをそのまま方向微分へ入れない。",
  },
  {
    id: "applied-dot", kind: "formula", title: "内積・直交",
    value: "対応成分を掛けて足す。直交なら内積0。",
    math: [{ tex: "\\mathbf a\\cdot\\mathbf b=a_xb_x+a_yb_y+a_zb_z=|\\mathbf a||\\mathbf b|\\cos\\theta,\\qquad\\mathbf a\\perp\\mathbf b\\iff\\mathbf a\\cdot\\mathbf b=0" }],
    cue: "なす角、射影、未知成分を直交条件から求める。",
    pitfall: "角度式は両ベクトルが非零であることを確認する。",
  },
  {
    id: "applied-cross", kind: "formula", title: "外積・三角形面積",
    value: "外積は両ベクトルに垂直。大きさは平行四辺形面積。",
    math: [
      { tex: "\\mathbf a\\times\\mathbf b=(a_yb_z-a_zb_y,\\ a_zb_x-a_xb_z,\\ a_xb_y-a_yb_x)" },
      { tex: "S_{\\triangle ABC}=\\frac12|\\overrightarrow{AB}\\times\\overrightarrow{AC}|" },
    ],
    cue: "3点から面積・法線方向を求める。",
    pitfall: "外積の順序を逆にすると符号反転。三角形では1/2を忘れない。",
  },
  {
    id: "applied-curve", kind: "formula", title: "速度・単位接ベクトル・弧長",
    value: "速度はベクトル、速さはその大きさ。弧長は速さを積分する。",
    math: [{ tex: "\\mathbf v=\\mathbf r'(t),\\qquad\\mathbf T=\\frac{\\mathbf r'}{|\\mathbf r'|},\\qquad s=\\int_a^b|\\mathbf r'(t)|dt" }],
    cue: "パラメータ曲線の接線方向、速さ、長さ。",
    pitfall: "弧長は各成分を積分せず、まず \\(|\\mathbf r'|\\) を作る。",
  },
  {
    id: "applied-surface", kind: "formula", title: "曲面の法線・面積要素",
    value: "u,v方向の接ベクトルの外積が法線と面積の拡大率を与える。",
    math: [
      { tex: "\\mathbf r_u=\\frac{\\partial\\mathbf r}{\\partial u},\\quad\\mathbf r_v=\\frac{\\partial\\mathbf r}{\\partial v},\\quad\\mathbf n=\\pm\\frac{\\mathbf r_u\\times\\mathbf r_v}{|\\mathbf r_u\\times\\mathbf r_v|}" },
      { tex: "dS=|\\mathbf r_u\\times\\mathbf r_v|dudv" },
    ],
    cue: "パラメータ曲面の単位法線・表面積。",
    pitfall: "上向き・外向きの指定へ符号を合わせる。外積が0なら正則でない。",
  },
  {
    id: "applied-gradient", kind: "formula", title: "勾配・方向微分・最大方向",
    value: "勾配は最も急に増える方向。方向微分は単位方向への射影。",
    math: [{ tex: "\\nabla\\phi=(\\phi_x,\\phi_y,\\phi_z),\\qquad D_{\\mathbf e}\\phi=\\nabla\\phi\\cdot\\mathbf e,\\qquad\\max D_{\\mathbf e}\\phi=|\\nabla\\phi|" }],
    cue: "点Pで方向vへの増加率、最大増加率、等位面の法線。",
    pitfall: "方向ベクトルは先に \\(\\mathbf e=\\mathbf v/|\\mathbf v|\\) へ単位化する。",
  },
  {
    id: "applied-divergence", kind: "formula", title: "発散",
    value: "各成分を対応する同じ座標で偏微分して足す。答えはスカラー。",
    math: [{ tex: "\\nabla\\cdot\\mathbf a=\\frac{\\partial a_x}{\\partial x}+\\frac{\\partial a_y}{\\partial y}+\\frac{\\partial a_z}{\\partial z}" }],
    cue: "ベクトル場の湧き出し・吸い込みを調べる。",
    pitfall: "x成分をyで微分するなど、成分と座標の対応をずらさない。",
  },
  {
    id: "applied-curl", kind: "formula", title: "回転と基本恒等式",
    value: "回転はベクトル。十分滑らかな場では curl grad＝0、div curl＝0。",
    math: [
      { tex: "\\nabla\\times\\mathbf a=(\\partial_ya_z-\\partial_za_y,\\ \\partial_za_x-\\partial_xa_z,\\ \\partial_xa_y-\\partial_ya_x)" },
      { tex: "\\nabla\\times(\\nabla\\phi)=\\mathbf0,\\qquad\\nabla\\cdot(\\nabla\\times\\mathbf a)=0" },
    ],
    cue: "ベクトル場が局所的に回っているかを計算する。",
    pitfall: "特に第2成分の引き算が逆になりやすい。外積の順序で検算する。",
  },
  {
    id: "applied-scalar-line", kind: "formula", title: "スカラー線積分と成分線積分",
    value: "dsなら速さ、dxならx成分の導関数を掛ける。",
    math: [
      { tex: "\\int_C\\phi\\,ds=\\int_a^b\\phi(\\mathbf r(t))|\\mathbf r'(t)|dt" },
      { tex: "\\int_C\\phi\\,dx=\\int_a^b\\phi(\\mathbf r(t))x'(t)dt" },
    ],
    cue: "被積分記号の末尾がdsかdx・dy・dzかを見る。",
    pitfall: "dsとdxを同じにしない。経路反転でdx型は符号が変わる。",
  },
  {
    id: "applied-vector-line", kind: "formula", title: "ベクトル線積分・勾配定理",
    value: "場へ曲線を代入し、接ベクトルと内積。勾配場なら端点だけで決まる。",
    math: [
      { tex: "\\int_C\\mathbf a\\cdot d\\mathbf r=\\int_a^b\\mathbf a(\\mathbf r(t))\\cdot\\mathbf r'(t)dt" },
      { tex: "\\int_C\\nabla\\phi\\cdot d\\mathbf r=\\phi(B)-\\phi(A)" },
    ],
    cue: "力場の仕事、または場が勾配として与えられる。",
    pitfall: "始点A・終点Bの順を逆にしない。場へ曲線を代入してから内積する。",
  },
  {
    id: "applied-surface-integrals", kind: "formula", title: "スカラー面積分と流束",
    value: "スカラー面積分は外積の大きさ、流束は向き付き外積との内積。",
    math: [
      { tex: "\\int_S\\phi dS=\\iint_D\\phi(\\mathbf r)|\\mathbf r_u\\times\\mathbf r_v|dudv" },
      { tex: "\\int_S\\mathbf a\\cdot\\mathbf n\\,dS=\\iint_D\\mathbf a(\\mathbf r)\\cdot(\\mathbf r_u\\times\\mathbf r_v)dudv" },
    ],
    cue: "曲面上の総量か、曲面を通り抜ける流れかを判定する。",
    pitfall: "流束では外積の絶対値を取らない。指定法線方向へ外積の向きを合わせる。",
  },
  {
    id: "applied-green", kind: "formula", title: "グリーンの定理",
    value: "正向きの閉曲線上の線積分を、内部領域の二重積分へ変換する。",
    math: [{ tex: "\\oint_C(Pdx+Qdy)=\\iint_D\\left(\\frac{\\partial Q}{\\partial x}-\\frac{\\partial P}{\\partial y}\\right)dA" }],
    cue: "平面の閉曲線Cと、その内部領域Dがある。",
    pitfall: "反時計回りが正。時計回りなら符号反転。微分順は \\(Q_x-P_y\\)。",
  },
];

export const DIGITAL_CIRCUIT_ESSENTIALS: EssentialItem[] = [
  {
    id: "digital-gates", kind: "formula", title: "AND・OR・XOR",
    value: "ANDは両方1、ORは少なくとも一方1、XORは入力が異なるとき1。",
    math: [{ tex: "AND:Y=AB,\\qquad OR:Y=A+B,\\qquad XOR:Y=A\\oplus B=\\overline AB+A\\overline B" }],
    cue: "論理ゲートの真理値表・タイミング図。",
    pitfall: "論理和の＋は通常の加算ではない。XORは11で0。",
  },
  {
    id: "digital-timing", kind: "check", title: "タイミング図の作り方",
    value: "入力変化点で区切る → 各区間を真理値表へ代入 → 出力を水平に結ぶ。",
    cue: "複数入力の波形からゲート出力波形を完成させる。",
    pitfall: "波形全体を一度に推測せず、入力が変わらない各区間を1行の真理値として処理する。",
  },
  {
    id: "digital-sr", kind: "rule", title: "NOR形SRラッチ",
    value: "SR＝00：保持、10：セット、01：リセット、11：禁止。",
    math: [{ tex: "\\begin{array}{cc|c}S&R&Q^+\\\\0&0&Q\\\\1&0&1\\\\0&1&0\\\\1&1&\\text{禁止}\\end{array}" }],
    cue: "クロックなしで状態を保持する交差帰還回路。",
    pitfall: "11は解除後の状態が不定になり得るため禁止。",
  },
  {
    id: "digital-dff", kind: "formula", title: "Dフリップフロップとエッジ",
    value: "Dを読むのは有効エッジの瞬間だけで、次のエッジまで保持する。",
    math: [{ tex: "Q^+=D,\\qquad\\text{正エッジ}:0\\to1,\\quad\\text{負エッジ}:1\\to0" }],
    cue: "D入力とCLK波形からQを描く。",
    pitfall: "エッジ間でDが変わってもQは変えない。指定された正・負エッジだけを見る。",
  },
  {
    id: "digital-jk", kind: "formula", title: "JKフリップフロップ",
    value: "JK＝00保持、01リセット、10セット、11反転。",
    math: [{ tex: "Q^+=J\\overline Q+\\overline KQ,\\qquad J=K=1\\Rightarrow Q^+=\\overline Q" }],
    cue: "カウンタ各段の反転条件や次状態を求める。",
    pitfall: "JとKの役割を逆にしない。カウンタのトグルはJ=K=1。",
  },
  {
    id: "digital-async", kind: "rule", title: "プリセット・クリア",
    value: "CLKに無関係な非同期入力。通常のD/JK動作より優先して状態を強制する。",
    cue: "回路の初期化、カウンタの特定状態への再ロード。",
    pitfall: "クロックエッジを待たない。端子がアクティブLowかHighかは図の反転丸で確認する。",
  },
  {
    id: "digital-register", kind: "formula", title: "並列レジスタ",
    value: "全ビットを共通エッジで同時に読み、エッジ間は保持。",
    math: [{ tex: "\\boldsymbol Q^+=\\boldsymbol D,\\qquad Q_i[k+1]=D_i[k]" }],
    cue: "複数D-FFに共通CLKが入り、nビットを同時記憶する。",
    pitfall: "各ビットをずらしてシフトしない。並列レジスタは同時取り込み。",
  },
  {
    id: "digital-mod-divider", kind: "formula", title: "状態数と分周",
    value: "n個のFFで2のn乗状態。Q0はクロックの1/2、段ごとにさらに1/2。",
    math: [{ tex: "M=2^n,\\qquad f_{Q_i}=\\frac{f_{CLK}}{2^{i+1}}" }],
    cue: "カウンタの最大状態数・各段出力の周波数。",
    pitfall: "Q0を \\(f_{CLK}\\) としない。添字iは0から始まる。",
  },
  {
    id: "digital-sync-up", kind: "formula", title: "3ビット同期アップJK入力",
    value: "全FFは共通CLK。上位段は下位ビットが全て1のとき反転する。",
    math: [{ tex: "J_0=K_0=1,\\qquad J_1=K_1=Q_0,\\qquad J_2=K_2=Q_0Q_1" }],
    cue: "同期アップカウンタの各JK入力を設計する。",
    pitfall: "Q2の条件を \\(Q_0+Q_1\\) にしない。桁上がりはAND。",
  },
  {
    id: "digital-ripple", kind: "rule", title: "非同期リップルと巡回ダウン",
    value: "前段出力が次段CLKとなり、変化が順に伝わる。",
    math: [
      { tex: "CLK\\to Q_0\\to Q_1\\to Q_2" },
      { tex: "000\\to111\\to110\\to101\\to100\\to011\\to010\\to001\\to000" },
    ],
    cue: "共通CLKでなく、FF出力が次段クロックへ接続される。",
    pitfall: "正/負エッジとQ/\\(\\overline Q\\)接続で方向が変わる。同期回路と混同しない。",
  },
  {
    id: "digital-state-analysis", kind: "check", title: "順序回路の解析・Mealy/Moore",
    value: "FF番号 → 次状態式/出力式 → 状態表 → 状態図。Mealyは状態＋入力、Mooreは状態だけで出力が決まる。",
    math: [{ tex: "S^+=F(S,X),\\qquad Y_{Mealy}=G(S,X),\\qquad Y_{Moore}=G(S)" }],
    cue: "回路図から状態遷移図を完成させる本番型。",
    pitfall: "Mealyの枝ラベルX/Yは入力/出力。Mooreは状態内に出力を書く。",
  },
  {
    id: "digital-sequence-1001", kind: "rule", title: "1001系列検出器",
    value: "00＝初期、01＝1まで一致、10＝10まで一致、11＝100まで一致。状態は一致済み接頭辞。",
    math: [{ tex: "O=IS_1S_0,\\qquad 11\\xrightarrow{1/1}01" }],
    cue: "入力列から1001を検出し、最後の1で出力を1にする。",
    pitfall: "検出後は初期へ捨てず、末尾1を次の接頭辞として再利用し状態01へ進む。",
  },
  {
    id: "digital-sequence-design-flow", kind: "check", title: "系列検出器の設計手順",
    value: "状態図 → 状態割当 → 全状態×全入力の状態表 → 各次状態ビット・出力のK-map → 簡単化式 → D-FF回路。",
    math: [{ tex: "D_1=S_1^+,\\qquad D_0=S_0^+,\\qquad O=G(S_1,S_0,I)" }],
    cue: "仕様からD-FFとゲートの実回路まで設計する追加範囲。",
    pitfall: "状態表の行を省かない。D1・D0・Oは別々のカルノー図で簡単化する。",
  },
  {
    id: "digital-sequence-overlap", kind: "rule", title: "101・1011の重なり検出",
    value: "次状態は、入力後の末尾と一致する検出語の最長接頭辞状態。検出後の末尾1も次の先頭として残す。",
    math: [{ tex: "101:S_2\\xrightarrow{1/1}S_1,\\qquad 1011:S_3\\xrightarrow{1/1}S_1" }],
    cue: "10101や1011011のように検出語が1ビット重なる入力。",
    pitfall: "不一致・検出完了のたびに無条件で初期状態へ戻すと、重なった次の系列を見落とす。",
  },
];
