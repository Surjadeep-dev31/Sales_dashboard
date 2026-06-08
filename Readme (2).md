# SalesMatrix — Sales Dashboard

A highly interactive, zero-dependency sales analytics dashboard built with vanilla HTML, CSS, and JavaScript. Visualizes eCommerce sales data for 2022, 2023, and 2024 across products, categories, and regions — inspired by Kaggle eCommerce datasets.

---

## 📁 Project Structure

```
sales-dashboard/
├── index.html   — Page structure, layout, and component markup
├── style.css    — Full design system (variables, animations, responsive layout)
├── data.js      — Sales dataset: monthly revenue, categories, regions, products
└── README.md    — You are here
└── app.js       — All chart logic, interactivity, filters, and animations
```

---

## 🚀 How to Run

No build tools, no npm, no config. Just open it.

```bash
# Clone or download the project folder, then:
open index.html
```

Or drag `index.html` into any modern browser (Chrome, Firefox, Edge, Safari). All dependencies are loaded via CDN — an internet connection is required on first load for fonts and Chart.js.

---

## ✨ Features

### Dashboard KPIs
Four animated metric cards display at the top, updating in real time when filters change:
- **Total Revenue** — aggregated across selected year(s)
- **Total Orders** — order volume for the period
- **Average Order Value** — mean transaction size
- **Customers** — unique customer count

Each card includes a sparkline mini-chart showing the 8-month trend.

### Charts

| Chart | Type | Description |
|---|---|---|
| Revenue Trend | Line / Bar / Area | Monthly revenue, switchable between 3 chart types |
| Sales by Category | Doughnut | Revenue split across 6 product categories |
| Regional Performance | Horizontal Bar | Revenue by 5 geographic regions |

All charts support hover tooltips with formatted values.

### Filters & Controls

**Year Filter** — toggle between All Years, 2022, 2023, or 2024. Every chart, KPI, and table updates simultaneously with smooth animations.

**Chart Type Switcher** — switch the main trend chart between Line, Bar, and Area modes on the fly.

**Custom Sales Threshold** — enter any dollar value and click Apply. A dashed gold line appears on the trend chart at that level, and an alert banner tells you how many months exceeded the threshold.

**Product Search** — live search box filters the Top Products table by name or category as you type.

### Top Products Table
Ranked by revenue for the selected year. Shows product name, category badge, revenue, YoY growth, and a proportional mini bar. Fully searchable.

### Year-by-Year Snapshot
Three summary cards at the bottom — one per year — showing total revenue, orders, customers, YoY growth percentage, and an animated progress bar relative to the peak year.

### Animated Background
A particle network canvas renders in the background with drifting nodes connected by proximity lines, giving the dashboard a live, data-centric atmosphere.

---

## 📊 Dataset

Data is defined in `data.js` as the global `SALES_DATA` object. It is structured as follows:

**Monthly Revenue** — 12 months × 3 years of revenue figures.

**Categories** — 6 product categories (Electronics, Clothing, Home & Garden, Sports, Books, Beauty) with per-year breakdowns.

**Regions** — 5 geographic markets (North America, Europe, Asia Pacific, Latin America, Middle East) with per-year revenue.

**Top Products** — 10 SKUs with revenue for each year and growth rate.

**KPI Totals** — Pre-aggregated annual totals for Revenue, Orders, Average Order Value, and Customers.

To swap in real data from Kaggle or another source, replace the values inside `data.js` while keeping the same key structure. No changes to `app.js` or `index.html` are needed.

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Semantic page structure |
| CSS3 | Custom design system, animations, responsive grid |
| Vanilla JavaScript (ES6+) | All interactivity, state management, DOM updates |
| [Chart.js 4.4](https://www.chartjs.org/) | Line, bar, doughnut, and sparkline charts |
| [Google Fonts](https://fonts.google.com/) | Syne (display), JetBrains Mono (data), Space Mono (UI) |
| HTML Canvas API | Animated particle background |

No frameworks. No build step. No package manager required.

---

## 🎨 Design System

The visual language is defined entirely through CSS custom properties in `:root` inside `style.css`. Key tokens:

```css
--accent-cyan:    #00c8ff   /* Primary interactive color */
--accent-gold:    #f0b429   /* Threshold lines, secondary highlights */
--accent-purple:  #a855f7   /* Category accents */
--accent-green:   #10d9a0   /* Positive growth indicators */
--accent-red:     #f43f5e   /* Negative indicators, alerts */

--bg-void:        #050810   /* Page background */
--bg-card:        rgba(12, 20, 40, 0.75)  /* Glassmorphism card surface */

--font-display:   'Syne'           /* Headings and KPI values */
--font-mono:      'JetBrains Mono' /* Data, numbers, labels */
--font-ui:        'Space Mono'     /* Navigation, badges */
```

To retheme the dashboard, update these variables — all components inherit from them automatically.

---

## 📱 Responsive Behaviour

| Breakpoint | Layout |
|---|---|
| > 1200px | Full 4-column KPI row, side-by-side charts |
| 900–1200px | 2-column KPIs, stacked charts |
| < 900px | Single-column, collapsible hamburger sidebar |
| < 500px | Threshold input hidden, single-column everything |

---

## 🔧 Customisation Guide

**Add a new year of data** — add a new key to `SALES_DATA.monthly`, `SALES_DATA.categories`, `SALES_DATA.regions`, and `SALES_DATA.kpiTotals` in `data.js`. Then add a new button in the `.year-filter-group` in `index.html`.

**Change chart colours** — edit the `yearColors` object inside the `buildMainDatasets()` function in `app.js`.

**Connect a real API** — replace the `SALES_DATA` object in `data.js` with a `fetch()` call to your API endpoint. Wrap the initialisation block in `app.js` inside the resolved promise.

**Add a new chart** — create a `<canvas>` element in `index.html`, write an `init` function and an `update` function in `app.js` following the same pattern as `initDonutChart()` / `updateDonutChart()`, then call both inside `updateAll()`.

---

## 📸 Sections at a Glance

```
┌─────────────────────────────────────────────────────────┐
│  Sidebar        │  Topbar (Year Filter + Threshold)      │
│  Navigation     ├─────────────────────────────────────── │
│                 │  KPI Cards × 4                         │
│  ─ Dashboard    ├───────────────────────┬─────────────── │
│  ─ Analytics    │  Revenue Trend Chart  │  Category      │
│  ─ Products     │  (Line/Bar/Area)      │  Donut Chart   │
│  ─ Regions      ├───────────────────────┴─────────────── │
│                 │  Regional Bar Chart  │  Products Table │
│                 ├──────────────────────────────────────  │
│                 │  Year Snapshot Cards (2022 / 2023 / 2024)│
└─────────────────────────────────────────────────────────┘
```

---

## 📄 License

This project was built as a front-end assessment submission. Free to use, modify, and extend.
