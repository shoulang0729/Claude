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
//   dayPct  : 当日騰落率（%）。null = Yahoo Financeから取得
//   dayCh   : 当日評価損益変化（円建て）。null = Yahoo Financeから取得
//   cur     : 通貨（"JPY" | "USD"）
//   ySymbol : Yahoo Finance ティッカー（チャート・価格取得に使用）
//   isProxy : true の場合、ySymbol は代替銘柄（投資信託など）
//   proxyName: 代替銘柄の説明名
// ══════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════
// POSITION DATA (from CSVs)
// ══════════════════════════════════════════════
const positions = [
  // 日本株・ETF
  { symbol:'1615', name:'NEXT FUNDS 東証銀行業ETF', cat:'日本株・ETF',
    shares:37870, price:599.5, avgCost:548.0,
    value:22703065, pnl:1950305, pnlPct:9.40,
    dayPct:null, dayCh:null, cur:'JPY', ySymbol:'1615.T' },
  { symbol:'1629', name:'NEXT FUNDS 商社・卸売ETF', cat:'日本株・ETF',
    shares:175, price:137200, avgCost:122489,
    value:24010000, pnl:2574425, pnlPct:12.01,
    dayPct:null, dayCh:null, cur:'JPY', ySymbol:'1629.T' },
  { symbol:'200A', name:'NEXT FUNDS 日経半導体ETF', cat:'日本株・ETF',
    shares:7400, price:3191, avgCost:2645,
    value:23613400, pnl:4040400, pnlPct:20.64,
    dayPct:null, dayCh:null, cur:'JPY', ySymbol:'200A.T' },
  { symbol:'6301', name:'小松製作所', cat:'日本株・ETF',
    shares:300, price:7173, avgCost:3181,
    value:2151900, pnl:1197600, pnlPct:125.50,
    dayPct:null, dayCh:null, cur:'JPY', ySymbol:'6301.T' },
  { symbol:'8050', name:'セイコーグループ', cat:'日本株・ETF',
    shares:1000, price:12690, avgCost:6902,
    value:12690000, pnl:5788000, pnlPct:83.86,
    dayPct:null, dayCh:null, cur:'JPY', ySymbol:'8050.T' },
  { symbol:'9983', name:'ファーストリテイリング', cat:'日本株・ETF',
    shares:200, price:65430, avgCost:43966,
    value:13086000, pnl:4292800, pnlPct:48.82,
    dayPct:null, dayCh:null, cur:'JPY', ySymbol:'9983.T' },
  // 米国株・ETF
  { symbol:'AAPL', name:'アップル', cat:'米国株・ETF',
    shares:185, price:260.29, avgCost:208.43,
    value:7476452, pnl:1814527, pnlPct:23.30,
    dayPct:-1.264, dayCh:-95710, cur:'USD', ySymbol:'AAPL' },
  { symbol:'AMZN', name:'アマゾン', cat:'米国株・ETF',
    shares:250, price:218.94, avgCost:224.81,
    value:8353907, pnl:-235343, pnlPct:-2.74,
    dayPct:-2.942, dayCh:-253172, cur:'USD', ySymbol:'AMZN' },
  { symbol:'COPX', name:'グローバルX 銅ビジネスETF', cat:'米国株・ETF',
    shares:850, price:82.30, avgCost:79.83,
    value:10686317, pnl:-102733, pnlPct:-0.95,
    dayPct:-2.855, dayCh:-314106, cur:'USD', ySymbol:'COPX' },
  { symbol:'EPI', name:'ウィズダムツリー インド株', cat:'米国株・ETF',
    shares:220, price:43.52, avgCost:45.17,
    value:1497272, pnl:-52628, pnlPct:-3.40,
    dayPct:-0.552, dayCh:-8302, cur:'USD', ySymbol:'EPI' },
  { symbol:'EPP', name:'iシェアーズ MSCIパシフィック', cat:'米国株・ETF',
    shares:900, price:54.21, avgCost:56.18,
    value:7608384, pnl:-320616, pnlPct:-4.04,
    dayPct:-0.830, dayCh:-63686, cur:'USD', ySymbol:'EPP' },
  { symbol:'GDX', name:'ヴァンエック 金鉱株ETF', cat:'米国株・ETF',
    shares:800, price:101.82, avgCost:102.93,
    value:12753604, pnl:-104796, pnlPct:-0.82,
    dayPct:-0.432, dayCh:-55352, cur:'USD', ySymbol:'GDX' },
  { symbol:'GLDM', name:'SPDR ゴールド・ミニシェアーズ', cat:'米国株・ETF',
    shares:1718, price:100.38, avgCost:81.25,
    value:27547757, pnl:5870033, pnlPct:27.08,
    dayPct:1.584, dayCh:429547, cur:'USD', ySymbol:'GLDM' },
  { symbol:'GOOGL', name:'アルファベット', cat:'米国株・ETF',
    shares:260, price:300.88, avgCost:188.94,
    value:12148161, pnl:4536661, pnlPct:59.60,
    dayPct:-1.246, dayCh:-153318, cur:'USD', ySymbol:'GOOGL' },
  { symbol:'ILF', name:'iシェアーズ ラテンアメリカ40', cat:'米国株・ETF',
    shares:2740, price:34.15, avgCost:32.14,
    value:14567546, pnl:804526, pnlPct:5.85,
    dayPct:-0.995, dayCh:-146494, cur:'USD', ySymbol:'ILF' },
  { symbol:'IXG', name:'iシェアーズ グローバル金融ETF', cat:'米国株・ETF',
    shares:90, price:116.46, avgCost:119.53,
    value:1625132, pnl:-61918, pnlPct:-3.67,
    dayPct:-1.399, dayCh:-23068, cur:'USD', ySymbol:'IXG' },
  { symbol:'META', name:'メタ・プラットフォームズ', cat:'米国株・ETF',
    shares:17, price:660.57, avgCost:625.55,
    value:1714436, pnl:81178, pnlPct:4.97,
    dayPct:-2.913, dayCh:-51433, cur:'USD', ySymbol:'META' },
  { symbol:'MSFT', name:'マイクロソフト', cat:'米国株・ETF',
    shares:99, price:410.68, avgCost:482.45,
    value:6345571, pnl:-693329, pnlPct:-9.85,
    dayPct:-0.748, dayCh:-47792, cur:'USD', ySymbol:'MSFT' },
  { symbol:'PLTR', name:'パランティア', cat:'米国株・ETF',
    shares:275, price:152.67, avgCost:161.32,
    value:6771972, pnl:-117603, pnlPct:-1.71,
    dayPct:2.574, dayCh:169947, cur:'USD', ySymbol:'PLTR' },
  { symbol:'REMX', name:'ヴァンエック レアアース・金属ETF', cat:'米国株・ETF',
    shares:590, price:93.40, avgCost:81.36,
    value:8584703, pnl:1102913, pnlPct:14.74,
    dayPct:-0.932, dayCh:-80716, cur:'USD', ySymbol:'REMX' },
  { symbol:'SLV', name:'iシェアーズ シルバー・トラスト', cat:'米国株・ETF',
    shares:840, price:74.27, avgCost:72.48,
    value:10100923, pnl:415723, pnlPct:4.29,
    dayPct:2.962, dayCh:290598, cur:'USD', ySymbol:'SLV' },
  { symbol:'SMH', name:'ヴァンエック半導体ETF', cat:'米国株・ETF',
    shares:471, price:395.35, avgCost:333.27,
    value:28181638, pnl:3886516, pnlPct:16.00,
    dayPct:-3.756, dayCh:-1099861, cur:'USD', ySymbol:'SMH' },
  { symbol:'TSLA', name:'テスラ', cat:'米国株・ETF',
    shares:100, price:405.55, avgCost:299.01,
    value:6206501, pnl:1586201, pnlPct:34.33,
    dayPct:-2.677, dayCh:-170773, cur:'USD', ySymbol:'TSLA' },
  { symbol:'VGK', name:'バンガード FTSEヨーロッパETF', cat:'米国株・ETF',
    shares:600, price:84.85, avgCost:89.94,
    value:7948988, pnl:-505012, pnlPct:-5.97,
    dayPct:-0.707, dayCh:-56610, cur:'USD', ySymbol:'VGK' },
  { symbol:'VNM', name:'ヴァンエック ベトナムETF', cat:'米国株・ETF',
    shares:1050, price:18.02, avgCost:19.11,
    value:2881214, pnl:-286636, pnlPct:-9.05,
    dayPct:-3.164, dayCh:-94114, cur:'USD', ySymbol:'VNM' },
  { symbol:'VTV', name:'バンガード 米国バリューETF', cat:'米国株・ETF',
    shares:250, price:202.33, avgCost:205.93,
    value:7863680, pnl:-210320, pnlPct:-2.60,
    dayPct:-1.137, dayCh:-90418, cur:'USD', ySymbol:'VTV' },
  { symbol:'VTWO', name:'バンガード ラッセル2000ETF', cat:'米国株・ETF',
    shares:100, price:103.79, avgCost:105.59,
    value:1592157, pnl:-53643, pnlPct:-3.26,
    dayPct:-2.448, dayCh:-39941, cur:'USD', ySymbol:'VTWO' },
  // 投資信託
  { symbol:'オルカン', name:'eMAXIS Slim 全世界株式(AC)', cat:'投資信託',
    shares:31636296, price:33888, avgCost:27917,
    value:107209079, pnl:18890032, pnlPct:21.39,
    dayPct:null, dayCh:null, cur:'JPY',
    ySymbol:'ACWI', isProxy:true, proxyName:'iShares MSCI ACWI ETF' },
  { symbol:'ひふみ', name:'ひふみ投信', cat:'投資信託',
    shares:2690670, price:193180, avgCost:55831,
    value:25989180, pnl:10967168, pnlPct:73.01,
    dayPct:null, dayCh:null, cur:'JPY',
    ySymbol:'1306.T', isProxy:true, proxyName:'TOPIX連動型ETF (1306)' },
  { symbol:'マイクロSP', name:'ひふみマイクロスコープpro', cat:'投資信託',
    shares:1592436, price:24578, avgCost:10048,
    value:1956944, pnl:356864, pnlPct:22.30,
    dayPct:null, dayCh:null, cur:'JPY',
    ySymbol:'1477.T', isProxy:true, proxyName:'iShares MSCIジャパン小型株ETF (1477)' },
  { symbol:'ひふみXO', name:'ひふみクロスオーバーpro', cat:'投資信託',
    shares:1375624, price:26988, avgCost:10179,
    value:1856266, pnl:456154, pnlPct:32.58,
    dayPct:null, dayCh:null, cur:'JPY',
    ySymbol:'2516.T', isProxy:true, proxyName:'東証グロース市場250ETF (2516)' },
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
