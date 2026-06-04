// =============================================
// QUICKLAUNCH — APP.JS
// =============================================

let allSites = [];
let allCategories = [];
let activeCategory = 'all';
let searchQuery = '';

// ---- INIT ----
async function init() {
  try {
    const res = await fetch('sites.json');
    const data = await res.json();
    allSites = data.sites;
    allCategories = data.categories;
    buildFilters();
    renderGrid();
    updateCount();
  } catch (err) {
    console.error('Failed to load sites.json:', err);
    document.getElementById('siteGrid').innerHTML =
      `<p style="color:#f87171;padding:40px">⚠️ Could not load sites.json. Make sure the file exists next to index.html.</p>`;
  }
}

// ---- BUILD CATEGORY FILTERS ----
function buildFilters() {
  const bar = document.getElementById('filterBar').querySelector('.filter-scroll');
  // Keep the "All" button, inject category buttons
  allCategories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.cat = cat.id;
    btn.textContent = cat.label;
    btn.style.setProperty('--cat-color', cat.color);
    bar.appendChild(btn);
  });

  // Click handlers
  bar.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update active filter pill color
      if (btn.dataset.cat !== 'all') {
        const cat = allCategories.find(c => c.id === btn.dataset.cat);
        if (cat) {
          btn.style.background = cat.color;
          btn.style.borderColor = cat.color;
          btn.style.color = '#080b14';
          btn.style.boxShadow = `0 0 16px ${cat.color}55`;
        }
      } else {
        btn.style.removeProperty('background');
        btn.style.removeProperty('border-color');
        btn.style.removeProperty('color');
        btn.style.removeProperty('box-shadow');
      }
      // Reset previously active colored btn
      activeCategory = btn.dataset.cat;
      renderGrid();
    });
  });
}

// ---- FILTER SITES ----
function getFiltered() {
  let sites = allSites;

  if (activeCategory !== 'all') {
    sites = sites.filter(s => s.category === activeCategory);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    sites = sites.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      (s.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }

  return sites;
}

// ---- RENDER GRID ----
function renderGrid() {
  const grid = document.getElementById('siteGrid');
  const empty = document.getElementById('emptyState');
  const filtered = getFiltered();

  if (filtered.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    document.getElementById('emptyQuery').textContent = searchQuery || activeCategory;
    updateCount(0);
    return;
  }

  empty.style.display = 'none';

  // Group by category if "all" view
  let html = '';
  if (activeCategory === 'all' && !searchQuery) {
    const grouped = groupByCategory(filtered);
    grouped.forEach(({ cat, sites }) => {
      html += `<div class="cat-header">
        <div class="cat-dot" style="background:${cat.color}; box-shadow: 0 0 6px ${cat.color}88;"></div>
        <span class="cat-label" style="color:${cat.color}">${cat.label}</span>
        <span class="cat-count">${sites.length}</span>
      </div>`;
      sites.forEach((site, i) => {
        html += buildCard(site, i);
      });
    });
  } else {
    filtered.forEach((site, i) => {
      html += buildCard(site, i);
    });
  }

  grid.innerHTML = html;
  updateCount(filtered.length);
}

// ---- GROUP SITES BY CATEGORY ----
function groupByCategory(sites) {
  const map = new Map();
  allCategories.forEach(cat => map.set(cat.id, { cat, sites: [] }));

  sites.forEach(site => {
    if (map.has(site.category)) {
      map.get(site.category).sites.push(site);
    } else {
      if (!map.has('other')) {
        map.set('other', { cat: { id: 'other', label: '🗂️ Other', color: '#6b7280' }, sites: [] });
      }
      map.get('other').sites.push(site);
    }
  });

  return [...map.values()].filter(g => g.sites.length > 0);
}

// ---- BUILD CARD HTML ----
function buildCard(site, index) {
  const cat = allCategories.find(c => c.id === site.category);
  const accentColor = cat ? cat.color : 'var(--accent)';

  const pricingTag = buildPricingTag(site.pricing);
  const labelTags = (site.tags || [])
    .filter(t => !['free', 'paid', 'free/paid'].includes(t.toLowerCase()))
    .slice(0, 2)
    .map(t => `<span class="tag tag-label">${t}</span>`)
    .join('');
  const adultTag = site.adult ? `<span class="tag tag-adult">🔞 18+</span>` : '';

  const hostname = (() => {
    try { return new URL(site.url).hostname.replace('www.', ''); }
    catch { return site.url; }
  })();

  const delay = Math.min(index * 0.04, 0.5);

  return `
    <a
      class="card"
      href="${site.url}"
      target="_blank"
      rel="noopener noreferrer"
      style="--card-accent: ${accentColor}; animation-delay: ${delay}s"
      title="${site.name}"
    >
      <div class="card-header">
        <div class="card-icon">${site.icon || '🌐'}</div>
        <div class="card-title-wrap">
          <div class="card-title">${site.name}</div>
          <div class="card-url">${hostname}</div>
        </div>
      </div>
      <div class="card-desc">${site.description}</div>
      <div class="card-footer">
        ${pricingTag}
        ${adultTag}
        ${labelTags}
        <span class="card-arrow">↗</span>
      </div>
    </a>`;
}

// ---- PRICING TAG ----
function buildPricingTag(pricing) {
  if (!pricing) return '';
  const map = {
    free:      { cls: 'tag-free',     label: '✓ Free' },
    paid:      { cls: 'tag-paid',     label: '$ Paid' },
    freemium:  { cls: 'tag-freemium', label: '◑ Free/Paid' },
  };
  const info = map[pricing];
  if (!info) return '';
  return `<span class="tag ${info.cls}">${info.label}</span>`;
}

// ---- UPDATE COUNT ----
function updateCount(n) {
  const count = n !== undefined ? n : allSites.length;
  document.getElementById('siteCount').textContent = `${count} site${count !== 1 ? 's' : ''}`;
}

// ---- SEARCH ----
const searchInput = document.getElementById('searchInput');

searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value.trim();
  // Reset category filter when searching
  if (searchQuery) {
    activeCategory = 'all';
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.filter-btn[data-cat="all"]').classList.add('active');
  }
  renderGrid();
});

// Ctrl+K / Cmd+K to focus search
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
  if (e.key === 'Escape' && document.activeElement === searchInput) {
    searchInput.value = '';
    searchQuery = '';
    renderGrid();
    searchInput.blur();
  }
});

// ---- START ----
init();
