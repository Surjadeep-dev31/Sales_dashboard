/**
 * app.js — SalesMatrix Dashboard Logic
 * Handles: charts, filters, animations, background canvas, interactions
 */

/* ================================================================
   STATE
================================================================ */
const state = {
  activeYear: 'all',
  chartType: 'line',
  threshold: null,
  productQuery: '',
  charts: {},
};

/* ================================================================
   UTILS
================================================================ */
const fmt = {
  currency: (n) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
    return `$${n}`;
  },
  number: (n) => n.toLocaleString(),
  pct:    (n) => `${n > 0 ? '+' : ''}${n.toFixed(1)}%`,
};

function lerp(a, b, t) { return a + (b - a) * t; }

function animateCount(el, from, to, duration, isCurrency) {
  el.classList.add('counting');
  const start = performance.now();
  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 4);
    const val = Math.round(lerp(from, to, ease));
    el.textContent = isCurrency ? fmt.currency(val) : fmt.number(val);
    if (t < 1) requestAnimationFrame(tick);
    else el.classList.remove('counting');
  }
  requestAnimationFrame(tick);
}

/* ================================================================
   CHART.JS GLOBAL DEFAULTS
================================================================ */
Chart.defaults.color = '#8ba8bb';
Chart.defaults.font.family = "'JetBrains Mono', monospace";
Chart.defaults.font.size = 10;

Chart.defaults.plugins.tooltip = {
  enabled: false,          // We use custom tooltips for main charts
};
Chart.defaults.plugins.legend.display = false;

/* ================================================================
   BACKGROUND CANVAS — ANIMATED PARTICLE GRID
================================================================ */
(function initBgCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, nodes = [], animId;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createNodes(count) {
    nodes = [];
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r:  Math.random() * 1.2 + 0.3,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const DIST = 140;

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,200,255,0.5)';
      ctx.fill();

      for (let j = i + 1; j < nodes.length; j++) {
        const m = nodes[j];
        const dx = n.x - m.x, dy = n.y - m.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < DIST) {
          const a = (1 - d / DIST) * 0.15;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(m.x, m.y);
          ctx.strokeStyle = `rgba(0,200,255,${a})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }
    animId = requestAnimationFrame(draw);
  }

  resize();
  createNodes(55);
  draw();
  window.addEventListener('resize', () => { resize(); createNodes(55); });
})();

/* ================================================================
   SPARKLINES
================================================================ */
function createSparkline(canvasId, data, color) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map((_, i) => i),
      datasets: [{
        data,
        borderColor: color,
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.4,
        fill: true,
        backgroundColor: `${color}18`,
      }],
    },
    options: {
      responsive: false,
      animation: { duration: 800, easing: 'easeInOutQuart' },
      scales: { x: { display: false }, y: { display: false } },
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
    },
  });
}

/* ================================================================
   MAIN TREND CHART
================================================================ */
function buildMainDatasets(year, type) {
  const yearColors = {
    2022: { line: '#f43f5e', fill: 'rgba(244,63,94,0.06)' },
    2023: { line: '#f0b429', fill: 'rgba(240,180,41,0.06)' },
    2024: { line: '#00c8ff', fill: 'rgba(0,200,255,0.08)'  },
  };

  const isArea = type === 'area';
  const effectiveType = type === 'area' ? 'line' : type;

  if (year !== 'all') {
    const yr = Number(year);
    return {
      type: effectiveType,
      datasets: [{
        label: `${yr}`,
        data: SALES_DATA.monthly[yr],
        borderColor: yearColors[yr].line,
        backgroundColor: isArea ? yearColors[yr].fill : (effectiveType === 'bar' ? yearColors[yr].fill : 'transparent'),
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: yearColors[yr].line,
        fill: isArea,
        tension: 0.45,
        borderRadius: effectiveType === 'bar' ? 4 : 0,
      }],
    };
  }

  return {
    type: effectiveType,
    datasets: [2022, 2023, 2024].map(yr => ({
      label: `${yr}`,
      data: SALES_DATA.monthly[yr],
      borderColor: yearColors[yr].line,
      backgroundColor: isArea ? yearColors[yr].fill : (effectiveType === 'bar' ? yearColors[yr].fill : 'transparent'),
      borderWidth: 2,
      pointRadius: effectiveType === 'bar' ? 0 : 3,
      pointHoverRadius: 5,
      pointBackgroundColor: yearColors[yr].line,
      fill: isArea,
      tension: 0.45,
      borderRadius: effectiveType === 'bar' ? 4 : 0,
      borderSkipped: false,
    })),
  };
}

function initMainChart() {
  const canvas = document.getElementById('main-chart');
  const ctx    = canvas.getContext('2d');
  const { type, datasets } = buildMainDatasets(state.activeYear, state.chartType);

  state.charts.main = new Chart(ctx, {
    type,
    data: {
      labels: SALES_DATA.monthly.labels,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      animation: { duration: 700, easing: 'easeInOutQuart' },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
          border: { color: 'transparent' },
          ticks: { color: '#3d5a6e', font: { size: 9 } },
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
          border: { color: 'transparent' },
          ticks: {
            color: '#3d5a6e',
            font: { size: 9 },
            callback: v => fmt.currency(v),
          },
        },
      },
      plugins: {
        legend: { display: true, position: 'top',
          labels: { color: '#8ba8bb', boxWidth: 10, padding: 16, font: { size: 9 } },
        },
        tooltip: { enabled: false },
      },
    },
  });

  // Custom tooltip on hover
  canvas.addEventListener('mousemove', (e) => handleMainChartHover(e, canvas));
  canvas.addEventListener('mouseleave', hideTooltip);
}

function handleMainChartHover(e, canvas) {
  const chart   = state.charts.main;
  const points  = chart.getElementsAtEventForMode(e, 'index', { intersect: false }, true);
  if (!points.length) { hideTooltip(); return; }

  const idx     = points[0].index;
  const month   = SALES_DATA.monthly.labels[idx];
  const datasets = chart.data.datasets;

  let html = `<strong style="color:#e8f4f8;font-family:'Syne',sans-serif;">${month}</strong><br/><br/>`;
  datasets.forEach(ds => {
    html += `<div style="display:flex;justify-content:space-between;gap:20px;margin-bottom:4px;">
      <span style="color:${ds.borderColor};font-size:0.65rem;">${ds.label}</span>
      <span style="color:#e8f4f8;font-family:'JetBrains Mono',monospace;font-size:0.68rem;">${fmt.currency(ds.data[idx])}</span>
    </div>`;
  });

  showTooltip(e.clientX, e.clientY, html);
}

function updateMainChart() {
  const chart = state.charts.main;
  if (!chart) return;

  const { type, datasets } = buildMainDatasets(state.activeYear, state.chartType);

  // Destroy and recreate if type changed
  if (chart.config.type !== type) {
    chart.destroy();
    initMainChart();
    updateThresholdLine();
    return;
  }

  chart.data.datasets = datasets;
  chart.update('active');
  updateThresholdLine();
}

/* ================================================================
   DONUT CHART
================================================================ */
function initDonutChart() {
  const canvas = document.getElementById('donut-chart');
  const ctx    = canvas.getContext('2d');
  const yr     = state.activeYear;
  const data   = yr === 'all'
    ? SALES_DATA.categories[2022].map((v, i) =>
        v + SALES_DATA.categories[2023][i] + SALES_DATA.categories[2024][i])
    : SALES_DATA.categories[Number(yr)];
  const total = data.reduce((a, b) => a + b, 0);

  document.getElementById('donut-total-value').textContent = fmt.currency(total);

  state.charts.donut = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: SALES_DATA.categories.labels,
      datasets: [{
        data,
        backgroundColor: SALES_DATA.categories.colors.map(c => `${c}cc`),
        borderColor:     SALES_DATA.categories.colors,
        borderWidth: 1.5,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      cutout: '68%',
      animation: { duration: 800, easing: 'easeInOutQuart' },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
    },
  });

  // Build legend
  buildDonutLegend(data, total);

  canvas.addEventListener('mousemove', (e) => handleDonutHover(e, canvas));
  canvas.addEventListener('mouseleave', hideTooltip);
}

function buildDonutLegend(data, total) {
  const el = document.getElementById('donut-legend');
  el.innerHTML = '';
  SALES_DATA.categories.labels.forEach((label, i) => {
    const pct = ((data[i] / total) * 100).toFixed(1);
    el.innerHTML += `
      <div class="legend-item">
        <div class="legend-dot" style="background:${SALES_DATA.categories.colors[i]};"></div>
        <span>${label}</span>
        <span>${pct}%</span>
      </div>
    `;
  });
}

function handleDonutHover(e, canvas) {
  const chart   = state.charts.donut;
  const elements = chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
  if (!elements.length) { hideTooltip(); return; }
  const idx   = elements[0].index;
  const label = SALES_DATA.categories.labels[idx];
  const value = chart.data.datasets[0].data[idx];
  const color = SALES_DATA.categories.colors[idx];
  const html  = `<span style="color:${color}">${label}</span><br/><strong style="color:#e8f4f8;font-family:'JetBrains Mono',monospace;">${fmt.currency(value)}</strong>`;
  showTooltip(e.clientX, e.clientY, html);
}

function updateDonutChart() {
  const chart = state.charts.donut;
  if (!chart) return;
  const yr   = state.activeYear;
  const data = yr === 'all'
    ? SALES_DATA.categories[2022].map((v, i) =>
        v + SALES_DATA.categories[2023][i] + SALES_DATA.categories[2024][i])
    : SALES_DATA.categories[Number(yr)];
  const total = data.reduce((a, b) => a + b, 0);
  chart.data.datasets[0].data = data;
  chart.update('active');
  document.getElementById('donut-total-value').textContent = fmt.currency(total);
  buildDonutLegend(data, total);
}

/* ================================================================
   REGIONAL CHART
================================================================ */
function initRegionalChart() {
  const canvas = document.getElementById('regional-chart');
  const ctx    = canvas.getContext('2d');
  const yr     = state.activeYear;
  const data   = yr === 'all'
    ? SALES_DATA.regions[2022].map((v, i) =>
        v + SALES_DATA.regions[2023][i] + SALES_DATA.regions[2024][i])
    : SALES_DATA.regions[Number(yr)];

  state.charts.regional = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: SALES_DATA.regions.labels,
      datasets: [{
        data,
        backgroundColor: SALES_DATA.regions.colors.map(c => `${c}88`),
        borderColor:     SALES_DATA.regions.colors,
        borderWidth: 1.5,
        borderRadius: 6,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      animation: { duration: 800, easing: 'easeInOutQuart' },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
          border: { color: 'transparent' },
          ticks: { color: '#3d5a6e', callback: v => fmt.currency(v), font: { size: 8 } },
        },
        y: {
          grid: { display: false },
          border: { color: 'transparent' },
          ticks: { color: '#8ba8bb', font: { size: 9 } },
        },
      },
      plugins: {
        tooltip: { enabled: false },
        legend:  { display: false },
      },
    },
  });

  canvas.addEventListener('mousemove', (e) => {
    const chart    = state.charts.regional;
    const elements = chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
    if (!elements.length) { hideTooltip(); return; }
    const idx   = elements[0].index;
    const label = SALES_DATA.regions.labels[idx];
    const value = chart.data.datasets[0].data[idx];
    const color = SALES_DATA.regions.colors[idx];
    const html  = `<span style="color:${color}">${label}</span><br/><strong style="color:#e8f4f8;font-family:'JetBrains Mono',monospace;">${fmt.currency(value)}</strong>`;
    showTooltip(e.clientX, e.clientY, html);
  });
  canvas.addEventListener('mouseleave', hideTooltip);
}

function updateRegionalChart() {
  const chart = state.charts.regional;
  if (!chart) return;
  const yr   = state.activeYear;
  const data = yr === 'all'
    ? SALES_DATA.regions[2022].map((v, i) =>
        v + SALES_DATA.regions[2023][i] + SALES_DATA.regions[2024][i])
    : SALES_DATA.regions[Number(yr)];
  chart.data.datasets[0].data = data;
  chart.update('active');
}

/* ================================================================
   KPI CARDS
================================================================ */
function updateKPIs() {
  const kpi = SALES_DATA.kpiTotals[state.activeYear];
  if (!kpi) return;

  const cards = [
    { id: 'kpi-revenue',   el: '.kpi-value', value: kpi.revenue,   isCurrency: true  },
    { id: 'kpi-orders',    el: '.kpi-value', value: kpi.orders,    isCurrency: false  },
    { id: 'kpi-avg',       el: '.kpi-value', value: kpi.avgOrder,  isCurrency: true  },
    { id: 'kpi-customers', el: '.kpi-value', value: kpi.customers, isCurrency: false  },
  ];

  cards.forEach(({ id, value, isCurrency }) => {
    const el = document.querySelector(`#${id} .kpi-value`);
    if (el) animateCount(el, 0, value, 900, isCurrency);
  });
}

/* ================================================================
   PRODUCTS TABLE
================================================================ */
function getProductRevenue(p) {
  const yr = state.activeYear;
  if (yr === 'all') return p.revenue2022 + p.revenue2023 + p.revenue2024;
  if (yr === '2022') return p.revenue2022;
  if (yr === '2023') return p.revenue2023;
  if (yr === '2024') return p.revenue2024;
}

function updateProductsTable() {
  const tbody  = document.getElementById('products-tbody');
  const query  = state.productQuery.toLowerCase();
  const maxRev = Math.max(...SALES_DATA.products.map(p => getProductRevenue(p)));

  const filtered = SALES_DATA.products
    .filter(p =>
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    )
    .sort((a, b) => getProductRevenue(b) - getProductRevenue(a));

  tbody.innerHTML = '';
  filtered.forEach((p, i) => {
    const rev  = getProductRevenue(p);
    const pct  = ((rev / maxRev) * 100).toFixed(1);
    const cat  = SALES_DATA.categoryColors[p.category];
    const grow = p.growth;
    tbody.innerHTML += `
      <tr style="animation:card-reveal 0.3s ease ${i * 0.04}s both;">
        <td>${i + 1}</td>
        <td class="product-name-cell">${p.name}</td>
        <td>
          <span class="category-badge" style="background:${cat.bg};color:${cat.color};">
            ${p.category}
          </span>
        </td>
        <td class="revenue-cell">${fmt.currency(rev)}</td>
        <td class="growth-cell ${grow >= 0 ? 'growth-pos' : 'growth-neg'}">${fmt.pct(grow)}</td>
        <td class="mini-bar-cell">
          <div class="mini-bar-track">
            <div class="mini-bar-fill" style="width:${pct}%;background:${cat.color}30;border-right:2px solid ${cat.color};"></div>
          </div>
        </td>
      </tr>
    `;
  });
}

/* ================================================================
   YEAR SNAPSHOT CARDS
================================================================ */
function buildYearSnapshotCards() {
  const row      = document.getElementById('year-cards-row');
  const maxRevenue = Math.max(
    SALES_DATA.kpiTotals[2022].revenue,
    SALES_DATA.kpiTotals[2023].revenue,
    SALES_DATA.kpiTotals[2024].revenue,
  );
  const yearColors = { 2022: '#f43f5e', 2023: '#f0b429', 2024: '#00c8ff' };

  row.innerHTML = '';
  [2022, 2023, 2024].forEach((yr, i) => {
    const kpi = SALES_DATA.kpiTotals[yr];
    const pct = ((kpi.revenue / maxRevenue) * 100).toFixed(1);
    const prevKpi = SALES_DATA.kpiTotals[yr - 1];
    const yoy = prevKpi
      ? (((kpi.revenue - prevKpi.revenue) / prevKpi.revenue) * 100).toFixed(1)
      : null;
    const color = yearColors[yr];

    const card = document.createElement('div');
    card.className = 'year-snapshot-card';
    card.style.animationDelay = `${0.4 + i * 0.08}s`;
    card.style.setProperty('--accent-color', color);
    card.style.borderTop = `2px solid ${color}40`;
    card.innerHTML = `
      <div class="year-badge">${yr}</div>
      <h3 style="color:${color};">${yr} Performance</h3>
      <div class="year-metrics">
        <div class="year-metric">
          <span class="year-metric-label">Total Revenue</span>
          <span class="year-metric-value" style="color:${color};">${fmt.currency(kpi.revenue)}</span>
        </div>
        <div class="year-metric">
          <span class="year-metric-label">Total Orders</span>
          <span class="year-metric-value">${fmt.number(kpi.orders)}</span>
        </div>
        <div class="year-metric">
          <span class="year-metric-label">Customers</span>
          <span class="year-metric-value">${fmt.number(kpi.customers)}</span>
        </div>
        ${yoy !== null ? `
        <div class="year-metric">
          <span class="year-metric-label">YoY Growth</span>
          <span class="year-metric-value" style="color:${Number(yoy)>=0?'var(--accent-green)':'var(--accent-red)'};">${yoy}%</span>
        </div>` : ''}
      </div>
      <div class="year-progress">
        <div class="year-progress-label">
          <span>Revenue vs Peak</span><span>${pct}%</span>
        </div>
        <div class="year-progress-bar">
          <div class="year-progress-fill" style="width:0%;background:linear-gradient(90deg,${color}44,${color});"></div>
        </div>
      </div>
    `;
    row.appendChild(card);

    // Animate bar
    setTimeout(() => {
      card.querySelector('.year-progress-fill').style.width = `${pct}%`;
    }, 200 + i * 80);
  });
}

/* ================================================================
   THRESHOLD FEATURE
================================================================ */
function updateThresholdLine() {
  const line = document.getElementById('threshold-line');
  if (!state.threshold || !state.charts.main) {
    line.style.display = 'none';
    return;
  }

  const chart = state.charts.main;
  const meta  = chart.getDatasetMeta(0);
  if (!meta || !chart.scales.y) { line.style.display = 'none'; return; }

  const yScale = chart.scales.y;
  const min = yScale.min, max = yScale.max;

  if (state.threshold < min || state.threshold > max) {
    line.style.display = 'none';
    checkThresholdAlert();
    return;
  }

  const yPos   = yScale.getPixelForValue(state.threshold);
  const chartH = chart.chartArea.height;
  const chartT = chart.chartArea.top;
  const topPct = ((yPos - chartT) / chartH) * 100;

  line.style.display = 'block';
  line.style.top      = `${topPct}%`;
  line.querySelector('.threshold-label').textContent = `Threshold: ${fmt.currency(state.threshold)}`;
  checkThresholdAlert();
}

function checkThresholdAlert() {
  const banner = document.getElementById('alert-banner');
  if (!state.threshold) { banner.style.display = 'none'; return; }

  const yr   = state.activeYear;
  const data = yr === 'all'
    ? SALES_DATA.monthly.labels.map((_, i) =>
        SALES_DATA.monthly[2022][i] + SALES_DATA.monthly[2023][i] + SALES_DATA.monthly[2024][i])
    : SALES_DATA.monthly[Number(yr)];
  const above = data.filter(v => v >= state.threshold).length;

  banner.style.display = 'block';
  banner.textContent   = `⚡ ${above} of 12 months exceeded the $${state.threshold.toLocaleString()} threshold`;
  setTimeout(() => { banner.style.display = 'none'; }, 4000);
}

/* ================================================================
   TOOLTIP
================================================================ */
const tooltip = document.getElementById('custom-tooltip');

function showTooltip(x, y, html) {
  tooltip.innerHTML = html;
  tooltip.classList.add('visible');

  const tw = tooltip.offsetWidth  || 200;
  const th = tooltip.offsetHeight || 80;
  const margin = 14;

  let left = x + margin;
  let top  = y - th / 2;
  if (left + tw > window.innerWidth)  left = x - tw - margin;
  if (top  < 0)                       top  = margin;
  if (top  + th > window.innerHeight) top  = window.innerHeight - th - margin;

  tooltip.style.left = `${left}px`;
  tooltip.style.top  = `${top}px`;
}

function hideTooltip() {
  tooltip.classList.remove('visible');
}

/* ================================================================
   FULL UPDATE — called on filter changes
================================================================ */
function updateAll() {
  updateKPIs();
  updateMainChart();
  updateDonutChart();
  updateRegionalChart();
  updateProductsTable();
  setTimeout(updateThresholdLine, 200);
}

/* ================================================================
   EVENT LISTENERS
================================================================ */
// Year buttons
document.querySelectorAll('.year-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.year-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.activeYear = btn.dataset.year;
    updateAll();
  });
});

// Chart type switcher
document.querySelectorAll('.chart-type-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.chart-type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.chartType = btn.dataset.type;
    updateMainChart();
  });
});

// Sidebar nav items (view switching UX hint)
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    const view = item.dataset.view;
    const headings = {
      dashboard: ['Dashboard Overview', 'Global sales performance across 2022–2024'],
      analytics:  ['Sales Analytics',   'Deep-dive metrics and trend analysis'],
      products:   ['Product Catalog',   'Revenue breakdown by product line'],
      regions:    ['Regional View',     'Geographic performance and distribution'],
    };
    const [h, s] = headings[view] || headings.dashboard;
    document.getElementById('page-heading').textContent  = h;
    document.getElementById('page-subtitle').textContent = s;

    // On mobile, close sidebar
    if (window.innerWidth < 900) {
      document.getElementById('sidebar').classList.remove('open');
    }
  });
});

// Hamburger
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// Threshold
document.getElementById('apply-threshold').addEventListener('click', () => {
  const val = parseFloat(document.getElementById('threshold-input').value);
  if (!isNaN(val) && val > 0) {
    state.threshold = val;
  } else {
    state.threshold = null;
  }
  updateThresholdLine();
});

document.getElementById('threshold-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('apply-threshold').click();
  }
});

// Product search
document.getElementById('product-search').addEventListener('input', (e) => {
  state.productQuery = e.target.value;
  updateProductsTable();
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
  const sidebar = document.getElementById('sidebar');
  const hamburger = document.getElementById('hamburger');
  if (window.innerWidth < 900 && sidebar.classList.contains('open')) {
    if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  }
});

/* ================================================================
   INIT
================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Sparklines
  createSparkline('spark-revenue',   SALES_DATA.sparklines.revenue,   '#00c8ff');
  createSparkline('spark-orders',    SALES_DATA.sparklines.orders,    '#f0b429');
  createSparkline('spark-avg',       SALES_DATA.sparklines.avg,       '#a855f7');
  createSparkline('spark-customers', SALES_DATA.sparklines.customers, '#f43f5e');

  // Charts
  initMainChart();
  initDonutChart();
  initRegionalChart();

  // Data fills
  updateKPIs();
  updateProductsTable();
  buildYearSnapshotCards();

  // After chart renders, handle threshold line on resize
  window.addEventListener('resize', () => {
    setTimeout(updateThresholdLine, 300);
  });
});
