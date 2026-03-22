// ══════════════════════════════════════════════════════════════
// positions.js  ―  保有銘柄データ & 期間設定
//
// ★ 保有内容を更新するときはこのファイルだけ編集すれば OK
//
// positions 配列の各フィールド:
//   symbol  : 表示用ティッカー（例: "AAPL", "9983", "オルカン"）
//   name    : 銘柄名
//   cat     : カテゴリ（"日本株・ETF" | "米国株・ETF" | "投資信託"）
//   shares  : 保有数量（株・口）
//   price   : 現在値（CSVロード時点の値、ライブ更新で上書きされる）
//   avgCost : 平均取得単価
//   value   : 時価評価額（円建て）
//   pnl     : 含み損益（円建て）
//   pnlPct  : 損益率（%）
//   dayPct  : 当日騰落率（%）。null = APIから取得
//   dayCh   : 当日評価損益変化（円建て）。null = APIから取得
//   cur     : 通貨（"JPY" | "USD"）
//   ySymbol : Yahoo Finance ティッカー（チャート・価格取得に使用）
//   isProxy : true の場合、ySymbol は代替銘柄（投資信託など）
//   proxyName: 代替銘柄の説明名
// ══════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════
// POSITION DATA (from CSVs — 2026/03/22)
// ══════════════════════════════════════════════
const positions = [
  // 日本株・ETF
  { symbol:'1615', name:'NEXT FUNDS 東証銀行業ETF', cat:'日本株・ETF',
    shares:37870, price:574.6, avgCost:548.0,
    value:21760102, pnl:1007342, pnlPct:4.85,
    dayPct:null, dayCh:null, cur:'JPY', ySymbol:'1615.T' },
  { symbol:'1629', name:'NEXT FUNDS 商社・卸売ETF', cat:'日本株・ETF',
    shares:175, price:141500, avgCost:122489,
    value:24762500, pnl:3326925, pnlPct:15.52,
    dayPct:null, dayCh:null, cur:'JPY', ySymbol:'1629.T' },
  { symbol:'200A', name:'NEXT FUNDS 日経半導体ETF', cat:'日本株・ETF',
    shares:7400, price:3113, avgCost:2645,
    value:23036200, pnl:3463200, pnlPct:17.69,
    dayPct:null, dayCh:null, cur:'JPY', ySymbol:'200A.T' },
  { symbol:'6301', name:'小松製作所', cat:'日本株・ETF',
    shares:300, price:6344, avgCost:3181,
    value:1903200, pnl:948900, pnlPct:99.43,
    dayPct:null, dayCh:null, cur:'JPY', ySymbol:'6301.T' },
  { symbol:'8050', name:'セイコーグループ', cat:'日本株・ETF',
    shares:1000, price:11970, avgCost:6902,
    value:11970000, pnl:5068000, pnlPct:73.43,
    dayPct:null, dayCh:null, cur:'JPY', ySymbol:'8050.T' },
  { symbol:'9983', name:'ファーストリテイリング', cat:'日本株・ETF',
    shares:200, price:63430, avgCost:43966,
    value:12686000, pnl:3892800, pnlPct:44.27,
    dayPct:null, dayCh:null, cur:'JPY', ySymbol:'9983.T' },
  // 米国株・ETF
  { symbol:'AAPL', name:'アップル', cat:'米国株・ETF',
    shares:185, price:247.99, avgCost:208.43,
    value:7318483, pnl:1656558, pnlPct:29.26,
    dayPct:null, dayCh:null, cur:'USD', ySymbol:'AAPL' },
  { symbol:'AMZN', name:'アマゾン', cat:'米国株・ETF',
    shares:250, price:205.37, avgCost:224.81,
    value:8190156, pnl:-399094, pnlPct:-4.65,
    dayPct:null, dayCh:null, cur:'USD', ySymbol:'AMZN' },
  { symbol:'COPX', name:'グローバルX 銅ビジネスETF', cat:'米国株・ETF',
    shares:850, price:69.08, avgCost:79.83,
    value:9366696, pnl:-1422354, pnlPct:-13.18,
    dayPct:null, dayCh:null, cur:'USD', ySymbol:'COPX' },
  { symbol:'GDX', name:'ヴァンエック 金鉱株ETF', cat:'米国株・ETF',
    shares:1000, price:80.12, avgCost:103.22,
    value:12780743, pnl:-3401257, pnlPct:-21.02,
    dayPct:null, dayCh:null, cur:'USD', ySymbol:'GDX' },
  { symbol:'GLDM', name:'SPDR ゴールド・ミニシェアーズ', cat:'米国株・ETF',
    shares:1718, price:89.07, avgCost:81.25,
    value:24410111, pnl:2732387, pnlPct:12.60,
    dayPct:null, dayCh:null, cur:'USD', ySymbol:'GLDM' },
  { symbol:'GOOGL', name:'アルファベット', cat:'米国株・ETF',
    shares:260, price:301.0, avgCost:188.94,
    value:12484036, pnl:4872536, pnlPct:64.02,
    dayPct:null, dayCh:null, cur:'USD', ySymbol:'GOOGL' },
  { symbol:'ILF', name:'iシェアーズ ラテンアメリカ40', cat:'米国株・ETF',
    shares:2740, price:32.59, avgCost:32.14,
    value:14244594, pnl:481574, pnlPct:3.50,
    dayPct:null, dayCh:null, cur:'USD', ySymbol:'ILF' },
  { symbol:'MSFT', name:'マイクロソフト', cat:'米国株・ETF',
    shares:99, price:381.87, avgCost:482.45,
    value:6030675, pnl:-1008225, pnlPct:-14.32,
    dayPct:null, dayCh:null, cur:'USD', ySymbol:'MSFT' },
  { symbol:'REMX', name:'ヴァンエック レアアース・金属ETF', cat:'米国株・ETF',
    shares:590, price:79.1, avgCost:81.36,
    value:7444639, pnl:-37151, pnlPct:-0.50,
    dayPct:null, dayCh:null, cur:'USD', ySymbol:'REMX' },
  { symbol:'SHLD', name:'グローバルX 防衛テックETF', cat:'米国株・ETF',
    shares:300, price:73.14, avgCost:76.77,
    value:3500188, pnl:-193412, pnlPct:-5.24,
    dayPct:null, dayCh:null, cur:'USD', ySymbol:'SHLD' },
  { symbol:'SHV', name:'iシェアーズ 米国短期国債 0-1年ETF', cat:'米国株・ETF',
    shares:1667, price:110.28, avgCost:110.28,
    value:29325640, pnl:-128583, pnlPct:-0.44,
    dayPct:null, dayCh:null, cur:'USD', ySymbol:'SHV' },
  { symbol:'SLV', name:'iシェアーズ シルバー・トラスト', cat:'米国株・ETF',
    shares:840, price:61.52, avgCost:72.48,
    value:8243484, pnl:-1441716, pnlPct:-14.89,
    dayPct:null, dayCh:null, cur:'USD', ySymbol:'SLV' },
  { symbol:'SMH', name:'ヴァンエック半導体ETF', cat:'米国株・ETF',
    shares:471, price:384.74, avgCost:333.27,
    value:28907025, pnl:4611903, pnlPct:18.98,
    dayPct:null, dayCh:null, cur:'USD', ySymbol:'SMH' },
  { symbol:'TSLA', name:'テスラ', cat:'米国株・ETF',
    shares:100, price:367.96, avgCost:299.01,
    value:5869698, pnl:1249398, pnlPct:27.04,
    dayPct:null, dayCh:null, cur:'USD', ySymbol:'TSLA' },
  { symbol:'XLE', name:'エネルギー・セレクト・セクター SPDR ETF', cat:'米国株・ETF',
    shares:300, price:59.31, avgCost:57.72,
    value:2838340, pnl:61540, pnlPct:2.22,
    dayPct:null, dayCh:null, cur:'USD', ySymbol:'XLE' },
  // 投資信託
  { symbol:'オルカン', name:'eMAXIS Slim 全世界株式(AC)', cat:'投資信託',
    shares:31636296, price:33565, avgCost:27917,
    value:106187227, pnl:17868180, pnlPct:20.23,
    dayPct:null, dayCh:null, cur:'JPY',
    ySymbol:'ACWI', isProxy:true, proxyName:'iShares MSCI ACWI ETF' },
  { symbol:'ひふみ', name:'ひふみ投信', cat:'投資信託',
    shares:2690670, price:186716, avgCost:111660,
    value:50239114, pnl:20195093, pnlPct:67.22,
    dayPct:null, dayCh:null, cur:'JPY',
    ySymbol:'1306.T', isProxy:true, proxyName:'TOPIX連動型ETF (1306)' },
  { symbol:'マイクロSP', name:'ひふみマイクロスコープpro', cat:'投資信託',
    shares:1592436, price:23822, avgCost:20096,
    value:3793501, pnl:593342, pnlPct:18.54,
    dayPct:null, dayCh:null, cur:'JPY',
    ySymbol:'1477.T', isProxy:true, proxyName:'iShares MSCIジャパン小型株ETF (1477)' },
  { symbol:'ひふみXO', name:'ひふみクロスオーバーpro', cat:'投資信託',
    shares:1375624, price:26060, avgCost:20356,
    value:3584876, pnl:784656, pnlPct:28.02,
    dayPct:null, dayCh:null, cur:'JPY',
    ySymbol:'2516.T', isProxy:true, proxyName:'東証グロース市場250ETF (2516)' },
  { symbol:'PIMCO-ST', name:'ピムコ ショート・ターム ストラテジー USD', cat:'投資信託',
    shares:200, price:124.58, avgCost:122.84,
    value:3945669, pnl:55169, pnlPct:1.42,
    dayPct:null, dayCh:null, cur:'USD',
    ySymbol:'SHV', isProxy:true, proxyName:'iShares Short Treasury Bond ETF' },
];

// ══════════════════════════════════════════════
// PERIODS CONFIG
// ══════════════════════════════════════════════
const PERIODS = [
  { id: '1d',  label: '1d',  statsLabel: '1d',  days: 1,    range: '1y',  scale: 4   },
  { id: '1w',  label: '1w',  statsLabel: '1w',  days: 7,    range: '1y',  scale: 8   },
  { id: '1m',  label: '1m',  statsLabel: '1m',  days: 30,   range: '1y',  scale: 15  },
  { id: '3m',  label: '3m',  statsLabel: '3m',  days: 91,   range: '1y',  scale: 25  },
  { id: '6m',  label: '6m',  statsLabel: '6m',  days: 182,  range: '5y',  scale: 40  },
  { id: '9m',  label: '9m',  statsLabel: '9m',  days: 273,  range: '5y',  scale: 55  },
  { id: '1y',  label: '1y',  statsLabel: '1y',  days: 365,  range: '5y',  scale: 65  },
  { id: '3y',  label: '3y',  statsLabel: '3y',  days: 1095, range: '5y',  scale: 90  },
  { id: '5y',  label: '5y',  statsLabel: '5y',  days: 1825, range: '5y',  scale: 130 },
  { id: '10y', label: '10y', statsLabel: '10y', days: 3650, range: '10y', scale: 200 },
];
const PERIOD_MAP  = Object.fromEntries(PERIODS.map(p => [p.id, p]));
// テーブルヘッダー・セル描画用（PERIODS から自動生成）
const PERIOD_COLS = PERIODS.map(p => ({ id: p.id, label: p.label }));
const PERIOD_IDS  = PERIOD_COLS.map(pc => pc.id);
