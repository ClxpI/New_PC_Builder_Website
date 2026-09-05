// script.js

const State = {
  db: window.PCForgeData || [],
  build: [],
  filters: { search: '', yearFrom: '', yearTo: '', cat: 'all', brand: 'all', maxPrice: 3000 },
  
  // NEW: Currency Engine
  currency: 'GBP',
  // Hardcoded real-world approximate exchange rates (Base: USD)
  rates: { USD: 1.00, GBP: 0.78, EUR: 0.92 } 
};

// NEW: Advanced Currency Formatter
const Format = {
  money(baseAmount) {
    const converted = baseAmount * State.rates[State.currency];
    let locale = 'en-GB';
    if (State.currency === 'USD') locale = 'en-US';
    if (State.currency === 'EUR') locale = 'de-DE';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: State.currency,
      maximumFractionDigits: 0
    }).format(converted);
  }
};

// NEW: Premium Dual-Tone SVG Icons
const SVGs = {
  CPU: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" fill-opacity="0.1"></rect><rect x="9" y="9" width="6" height="6" rx="1"></rect><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3"></path></svg>`,
  GPU: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="12" rx="2" fill="currentColor" fill-opacity="0.1"></rect><path d="M6 16v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4"></path><path d="M14 16v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4"></path><circle cx="7" cy="10" r="2.5"></circle><circle cx="17" cy="10" r="2.5"></circle><path d="M12 16v2"></path></svg>`,
  Motherboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" fill-opacity="0.05"></rect><rect x="7" y="7" width="6" height="6" rx="1" fill="currentColor" fill-opacity="0.2"></rect><path d="M16 7v6M18 7v6M7 16h8M7 18h8"></path></svg>`,
  RAM: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 15V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8" fill="currentColor" fill-opacity="0.1"></path><path d="M3 15h3v2h2v-2h4v2h2v-2h4v2h2v-2h3"></path><path d="M7 9h10"></path></svg>`,
  Storage: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="9" width="16" height="6" rx="1" fill="currentColor" fill-opacity="0.1"></rect><path d="M20 11h2v2h-2"></path><rect x="6" y="11" width="3" height="2" fill="currentColor"></rect><rect x="11" y="11" width="3" height="2" fill="currentColor"></rect></svg>`,
  PSU: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="16" rx="2" fill="currentColor" fill-opacity="0.05"></rect><circle cx="12" cy="12" r="4.5" fill="currentColor" fill-opacity="0.1"></circle><path d="M12 7.5v9M7.5 12h9M18 7h.01M6 18h.01"></path></svg>`,
  Case: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="3" width="14" height="18" rx="2" fill="currentColor" fill-opacity="0.05"></rect><path d="M9 7h6M9 11h6"></path><rect x="9" y="15" width="6" height="3" rx="1" fill="currentColor" fill-opacity="0.2"></rect><path d="M5 9h14"></path></svg>`
};

const UI = {
  els: {
    searchInput: document.getElementById('search-input'),
    yearFrom: document.getElementById('year-from'),
    yearTo: document.getElementById('year-to'),
    catFilter: document.getElementById('cat-filter'),
    brandFilter: document.getElementById('brand-filter'),
    priceRange: document.getElementById('price-range'),
    priceMinVal: document.getElementById('price-min-val'),
    priceVal: document.getElementById('price-val'),
    grid: document.getElementById('component-grid'),
    buildList: document.getElementById('build-list'),
    compatStatus: document.getElementById('compat-status'),
    powerGauge: document.getElementById('power-gauge'),
    powerText: document.getElementById('power-text'),
    powerSub: document.getElementById('power-sub')
  },

  init() {
    const cats = [...new Set(State.db.map(c => c.cat))].sort();
    cats.forEach(c => this.els.catFilter.add(new Option(c, c)));
    
    this.updateBrandFilter();
    
    // Set initial filter prices based on currency
    this.updatePriceLabels();

    this.els.searchInput.addEventListener('input', e => { State.filters.search = e.target.value.toLowerCase(); this.renderGrid(); });
    this.els.yearFrom.addEventListener('input', e => { State.filters.yearFrom = e.target.value; this.renderGrid(); });
    this.els.yearTo.addEventListener('input', e => { State.filters.yearTo = e.target.value; this.renderGrid(); });
    
    this.els.catFilter.addEventListener('change', e => { 
      State.filters.cat = e.target.value; 
      this.updateBrandFilter();
      this.renderGrid(); 
    });
    
    this.els.brandFilter.addEventListener('change', e => { State.filters.brand = e.target.value; this.renderGrid(); });
    
    this.els.priceRange.addEventListener('input', e => { 
      State.filters.maxPrice = e.target.value; 
      this.updatePriceLabels();
      this.renderGrid(); 
    });
  },

  updateBrandFilter() {
    const currentBrand = State.filters.brand;
    const items = State.filters.cat === 'all' ? State.db : State.db.filter(c => c.cat === State.filters.cat);
    const brands = [...new Set(items.map(c => c.brand))].sort();
    
    this.els.brandFilter.innerHTML = '<option value="all">All Brands</option>';
    brands.forEach(b => this.els.brandFilter.add(new Option(b, b)));
    
    if (brands.includes(currentBrand)) {
      this.els.brandFilter.value = currentBrand;
    } else {
      State.filters.brand = 'all';
    }
  },

  updatePriceLabels() {
    this.els.priceMinVal.textContent = Format.money(0);
    this.els.priceVal.textContent = Format.money(State.filters.maxPrice);
  },

  resetFilters() {
    this.els.searchInput.value = '';
    this.els.yearFrom.value = '';
    this.els.yearTo.value = '';
    this.els.catFilter.value = 'all';
    
    State.filters = { search: '', yearFrom: '', yearTo: '', cat: 'all', brand: 'all', maxPrice: 3000 };
    
    this.updateBrandFilter();
    
    this.els.priceRange.value = 3000;
    this.updatePriceLabels();
    
    this.renderGrid();
  },

  renderGrid() {
    this.els.grid.innerHTML = '';
    
    let filtered = State.db.filter(c => {
      if (State.filters.search && !c.name.toLowerCase().includes(State.filters.search) && !c.brand.toLowerCase().includes(State.filters.search)) return false;
      if (State.filters.cat !== 'all' && c.cat !== State.filters.cat) return false;
      if (State.filters.brand !== 'all' && c.brand !== State.filters.brand) return false;
      if (c.price > State.filters.maxPrice) return false;
      
      const yFrom = parseInt(State.filters.yearFrom) || 0;
      const yTo = parseInt(State.filters.yearTo) || 9999;
      
      if (c.release_year < yFrom || c.release_year > yTo) return false;

      return true;
    });

    filtered.sort((a, b) => b.release_year - a.release_year);

    if(filtered.length === 0) {
      this.els.grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 3rem; color: var(--text-muted);">No components match your search criteria.</div>`;
      return;
    }

    filtered.forEach(c => {
      let tagsHtml = `<span class="tag" style="color:var(--accent-primary); border-color:var(--accent-primary);">${c.release_year}</span>`;
      if(c.tags) tagsHtml += c.tags.map(t => `<span class="tag">${t}</span>`).join('');
      if(c.socket) tagsHtml += `<span class="tag">${c.socket}</span>`;
      if(c.ram_type) tagsHtml += `<span class="tag">${c.ram_type}</span>`;
      if(c.tdp) tagsHtml += `<span class="tag">${c.tdp}W TDP</span>`;

      let btnText = "Add Part";
      let btnClass = "btn-add-sm";
      const inBuild = State.build.find(b => b.id === c.id);
      const catInBuild = State.build.find(b => b.cat === c.cat);

      if (inBuild) {
        btnText = "Remove";
        btnClass = "btn-add-sm remove";
      } else if (catInBuild) {
        btnText = "Replace";
        btnClass = "btn-add-sm replace";
      }

      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-img"><span class="card-brand">${c.brand}</span>${SVGs[c.cat]}</div>
        <div class="card-body">
          <h3 class="card-title">${c.name}</h3>
          <div class="card-tags">${tagsHtml}</div>
          <div class="card-footer">
            <span class="card-price">${Format.money(c.price)}</span>
            <button class="${btnClass}" onclick="${inBuild ? `App.removeFromBuildById('${c.id}', '${c.name.replace(/'/g, "\\'")}')` : `App.addToBuild('${c.id}')`}">${btnText}</button>
          </div>
        </div>
      `;
      this.els.grid.appendChild(card);
    });
  },

  renderBuild() {
    this.els.buildList.innerHTML = '';
    if (State.build.length === 0) {
      this.els.buildList.innerHTML = `<div class="empty-state">Cart is empty. Select components to begin.</div>`;
    } else {
      State.build.forEach((c) => {
        const li = document.createElement('li');
        li.className = 'build-item';
        li.innerHTML = `
          <div class="build-item-info">
            <span class="build-item-cat">${c.cat}</span>
            <span class="build-item-name">${c.name}</span>
            <span class="build-item-price">${Format.money(c.price)}</span>
          </div>
          <button class="btn-remove" onclick="App.removeFromBuildById('${c.id}', '${c.name.replace(/'/g, "\\'")}')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        `;
        this.els.buildList.appendChild(li);
      });
    }
    this.updateAnalytics();
    this.checkDeepCompatibility();
  },

  updateAnalytics() {
    const totalCost = State.build.reduce((s, c) => s + c.price, 0);
    const totalTdp = State.build.reduce((s, c) => s + (c.tdp || 0), 0);
    const psu = State.build.find(c => c.cat === 'PSU');
    const psuWattage = psu ? psu.wattage : 0;
    
    const formattedCost = Format.money(totalCost);
    document.getElementById('total-price').textContent = formattedCost;
    document.getElementById('mobile-total-price').textContent = formattedCost;

    const tierBadge = document.getElementById('build-tier');
    if (totalCost === 0) { tierBadge.textContent = "Draft Build"; tierBadge.style.color = "var(--text-muted)"; }
    else if (totalCost < 800) { tierBadge.textContent = "Budget Tier"; tierBadge.style.color = "var(--accent-primary)"; }
    else if (totalCost < 1600) { tierBadge.textContent = "Mid-Range Tier"; tierBadge.style.color = "var(--accent-success)"; }
    else if (totalCost < 2500) { tierBadge.textContent = "Enthusiast Tier"; tierBadge.style.color = "var(--accent-warning)"; }
    else { tierBadge.textContent = "God Tier"; tierBadge.style.color = "#a855f7"; }

    const presentCats = new Set(State.build.map(c => c.cat));
    let count = 0;
    document.querySelectorAll('.step-badge').forEach(badge => {
      if (presentCats.has(badge.dataset.cat)) { badge.classList.add('active'); count++; } 
      else { badge.classList.remove('active'); }
    });
    document.getElementById('progress-text').textContent = `${count} / 7 Core Parts`;

    const estDraw = Math.ceil(totalTdp * 1.2);
    this.els.powerText.textContent = `${estDraw}W / ${psuWattage ? psuWattage + 'W' : 'No PSU'}`;
    
    let percent = 0;
    this.els.powerGauge.className = 'gauge-fill';
    
    if (psuWattage > 0) {
      percent = Math.min((estDraw / psuWattage) * 100, 100);
      if (percent > 90) this.els.powerGauge.classList.add('danger');
      else if (percent > 75) this.els.powerGauge.classList.add('warning');
      this.els.powerSub.textContent = percent > 90 ? 'Critical: PSU wattage too low!' : 'Power draw looks stable.';
      this.els.powerSub.style.color = percent > 90 ? 'var(--accent-danger)' : 'var(--text-muted)';
    } else if (estDraw > 0) {
      percent = 100;
      this.els.powerGauge.classList.add('warning');
      this.els.powerSub.textContent = 'Please select a Power Supply.';
    } else {
      this.els.powerSub.textContent = 'Add components to calculate wattage.';
    }
    this.els.powerGauge.style.width = `${percent}%`;
  },

  checkDeepCompatibility() {
    const box = this.els.compatStatus;
    const cpus = State.build.filter(c => c.cat === 'CPU');
    const mobos = State.build.filter(c => c.cat === 'Motherboard');
    const rams = State.build.filter(c => c.cat === 'RAM');

    if (cpus.length === 0 || mobos.length === 0) {
      box.className = 'compat-box neutral';
      box.innerHTML = `<span>ℹ️ Add a CPU & Motherboard to verify socket and RAM compatibility.</span>`;
      return;
    }

    const cpu = cpus[0];
    const mobo = mobos[0];
    let errors = [];

    if (cpu.socket !== mobo.socket) {
      errors.push(`Socket mismatch: ${cpu.name} (${cpu.socket}) won't fit ${mobo.name} (${mobo.socket}).`);
    }
    
    if (rams.length > 0) {
      const ram = rams[0];
      if (ram.ram_type && mobo.ram_type && ram.ram_type !== mobo.ram_type) {
        errors.push(`RAM mismatch: ${ram.name} is ${ram.ram_type}, but Motherboard needs ${mobo.ram_type}.`);
      }
    }

    if (errors.length > 0) {
      box.className = 'compat-box error';
      box.innerHTML = `❌ <strong>Incompatible:</strong><ul style="margin-left: 1rem; margin-top:0.25rem;">${errors.map(e => `<li>${e}</li>`).join('')}</ul>`;
    } else {
      box.className = 'compat-box success';
      box.innerHTML = `✅ <strong>All Clear!</strong> Core components are fully compatible.`;
    }
  },

  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>` : `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    toast.innerHTML = `${icon} <span>${message}</span>`;
    document.getElementById('toast-container').appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3000);
  },

  toggleMobileCart() {
    const sidebar = document.getElementById('build-sidebar');
    sidebar.classList.toggle('mobile-active');
    document.getElementById('close-mobile-cart').style.display = sidebar.classList.contains('mobile-active') ? 'block' : 'none';
  }
};

const App = {
  init() {
    UI.init();
    UI.renderGrid();
    UI.renderBuild();

    document.getElementById('dark-toggle').addEventListener('click', () => {
      document.body.classList.toggle('dark');
      const isDark = document.body.classList.contains('dark');
      document.getElementById('moon-icon').innerHTML = isDark 
        ? '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line>'
        : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
    });
    document.getElementById('close-mobile-cart').addEventListener('click', () => UI.toggleMobileCart());
  },

  // NEW: Currency Change Handler
  changeCurrency(event) {
    State.currency = event.target.value;
    UI.updatePriceLabels();
    UI.renderGrid();
    UI.renderBuild();
  },

  addToBuild(id) {
    const comp = State.db.find(c => c.id === id);
    if (comp) {
      State.build = State.build.filter(c => c.cat !== comp.cat);
      State.build.push({ ...comp });
      
      UI.renderBuild();
      UI.renderGrid(); 
      UI.showToast(`Added ${comp.name}`, 'success');
    }
  },

  removeFromBuildById(id, name) {
    State.build = State.build.filter(b => b.id !== id);
    UI.renderBuild();
    UI.renderGrid(); 
    UI.showToast(`Removed ${name}`, 'danger');
  },

  clearBuild() {
    if(State.build.length === 0) return;
    if(confirm('Clear entire build?')) {
      State.build = [];
      UI.renderBuild();
      UI.renderGrid(); 
      UI.showToast('Build cleared', 'danger');
    }
  },

  applyPreset(type) {
    let presetIds = [];
    
    if (type === 'lowEnd') presetIds = ["cpu_13400f", "mb_b660", "ram_ddr4_3200_3", "gpu_3060", "st_nvme4_1tb_p3p", "psu_650g_2", "case_4000x"];
    if (type === 'midEnd') presetIds = ["cpu_7800x3d", "mb_b650", "ram_ddr5_6000", "gpu_4070tis", "st_nvme4_2tb_sn850", "psu_850g_2", "case_h7f"];
    if (type === 'highEnd') presetIds = ["cpu_285k", "mb_z890", "ram_ddr5_8200", "gpu_5090", "st_nvme5_2tb_t705", "psu_1600t", "case_y70"];
    
    State.build = [];
    presetIds.forEach(id => {
      const comp = State.db.find(c => c.id === id);
      if (comp) State.build.push({ ...comp });
    });
    
    UI.renderBuild();
    UI.renderGrid();
    UI.showToast('Preset loaded successfully!', 'success');
  },

  exportBuild() {
    if (State.build.length === 0) return alert('Your cart is empty.');
    
    // Add selected currency into the export data
    const data = { 
      name: "PCForge Build", 
      currency: State.currency,
      totalBaseCost: State.build.reduce((s,c)=>s+c.price,0), 
      parts: State.build 
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'pcforge-build.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  },

  importBuild(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data && data.parts && Array.isArray(data.parts)) {
          State.build = data.parts;
          
          // Optionally restore currency if it was saved
          if (data.currency && ['GBP', 'USD', 'EUR'].includes(data.currency)) {
            State.currency = data.currency;
            document.getElementById('currency-selector').value = data.currency;
          }

          UI.updatePriceLabels();
          UI.renderBuild();
          UI.renderGrid(); 
          UI.showToast('Build imported successfully!', 'success');
        } else {
          UI.showToast('Invalid build file format.', 'danger');
        }
      } catch (err) {
        UI.showToast('Error reading file.', 'danger');
      }
      event.target.value = '';
    };
    reader.readAsText(file);
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
