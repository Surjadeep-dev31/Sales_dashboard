/**
 * data.js — SalesMatrix Sales Dataset
 * Inspired by Kaggle eCommerce Sales datasets
 * Covers 2022, 2023, 2024 with monthly breakdowns
 */

const SALES_DATA = {

  // ── Monthly Revenue by Year ─────────────────────────────────
  monthly: {
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],

    2022: [41200, 38700, 52400, 49800, 61300, 58900, 67200, 72100, 65800, 81400, 95600, 112300],
    2023: [48900, 44200, 61700, 58300, 72800, 69400, 79500, 85200, 77600, 96100, 113200, 132800],
    2024: [57400, 52100, 72600, 68900, 85700, 81200, 93600, 100400, 91200, 113200, 133500, 156800],
  },

  // ── Product Categories ──────────────────────────────────────
  categories: {
    labels: ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Beauty'],
    colors: ['#00c8ff', '#f0b429', '#a855f7', '#10d9a0', '#f43f5e', '#fb923c'],

    2022: [312400, 189600, 145200, 98700, 67300, 82400],
    2023: [368900, 224100, 171500, 116400, 79600, 97200],
    2024: [434200, 264000, 202100, 137200, 93700, 114600],
  },

  // ── Regional Performance ────────────────────────────────────
  regions: {
    labels: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East'],
    colors: ['#00c8ff', '#a855f7', '#f0b429', '#10d9a0', '#f43f5e'],

    2022: [412300, 298700, 184500, 67200, 33000],
    2023: [487600, 352800, 218200, 79500, 39000],
    2024: [574300, 415700, 257100, 93600, 45900],
  },

  // ── Top Products ────────────────────────────────────────────
  products: [
    { name: 'MacBook Pro 14"', category: 'Electronics', revenue2022: 92400, revenue2023: 109000, revenue2024: 128500, growth: 17.9, color: '#00c8ff' },
    { name: 'Sony WH-1000XM5', category: 'Electronics', revenue2022: 64800, revenue2023: 76500, revenue2024: 90200, growth: 17.9, color: '#00c8ff' },
    { name: 'Nike Air Max 270', category: 'Sports',     revenue2022: 48200, revenue2023: 56900, revenue2024: 67100, growth: 17.9, color: '#10d9a0' },
    { name: 'Dyson V15 Detect', category: 'Home & Garden', revenue2022: 43600, revenue2023: 51500, revenue2024: 60700, growth: 17.9, color: '#a855f7' },
    { name: 'iPad Air 5th Gen', category: 'Electronics', revenue2022: 39700, revenue2023: 46900, revenue2024: 55300, growth: 17.9, color: '#00c8ff' },
    { name: 'Levi\'s 501 Jeans', category: 'Clothing',   revenue2022: 36200, revenue2023: 42800, revenue2024: 50500, growth: 17.9, color: '#f0b429' },
    { name: 'Nespresso Vertuo', category: 'Home & Garden', revenue2022: 32100, revenue2023: 37900, revenue2024: 44700, growth: 17.9, color: '#a855f7' },
    { name: 'Samsung Galaxy S24', category: 'Electronics', revenue2022: 28900, revenue2023: 34100, revenue2024: 40200, growth: 17.9, color: '#00c8ff' },
    { name: 'Atomic Habits', category: 'Books',          revenue2022: 18700, revenue2023: 22100, revenue2024: 26100, growth: 18.1, color: '#f43f5e' },
    { name: 'L\'Oreal Revitalift', category: 'Beauty',   revenue2022: 17400, revenue2023: 20600, revenue2024: 24300, growth: 17.9, color: '#fb923c' },
  ],

  // ── KPI Totals per Year ─────────────────────────────────────
  kpiTotals: {
    2022: { revenue: 895600, orders: 14280, avgOrder: 627, customers: 8940  },
    2023: { revenue: 1057800, orders: 16850, avgOrder: 628, customers: 10560 },
    2024: { revenue: 1245700, orders: 19830, avgOrder: 628, customers: 12430 },
    all:  { revenue: 3199100, orders: 50960, avgOrder: 628, customers: 31930 },
  },

  // ── Sparkline data (last 8 months trend) ───────────────────
  sparklines: {
    revenue:   [62, 58, 71, 68, 80, 75, 92, 100],
    orders:    [55, 60, 65, 62, 78, 72, 88, 100],
    avg:       [100, 98, 102, 99, 97, 101, 98, 96],
    customers: [58, 62, 68, 66, 77, 74, 90, 100],
  },

  // Category color mapping for badges
  categoryColors: {
    'Electronics':   { bg: 'rgba(0,200,255,0.12)',    color: '#00c8ff' },
    'Clothing':      { bg: 'rgba(240,180,41,0.12)',   color: '#f0b429' },
    'Home & Garden': { bg: 'rgba(168,85,247,0.12)',   color: '#a855f7' },
    'Sports':        { bg: 'rgba(16,217,160,0.12)',   color: '#10d9a0' },
    'Books':         { bg: 'rgba(244,63,94,0.12)',    color: '#f43f5e' },
    'Beauty':        { bg: 'rgba(251,146,60,0.12)',   color: '#fb923c' },
  },
};
