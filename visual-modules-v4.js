(() => {
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cut = (value, size = 42) => {
    const text = String(value ?? '').replace(/\s+/g, ' ').trim();
    return text.length > size ? `${text.slice(0, size - 1)}…` : text;
  };

  const roleTokens = new Set([
    'screen','form','formulario','detail','detalhe','details','lista','list','page','view','novo','nova',
    'cadastro','editar','edicao','edit','scanner','mapa','map','home','main','index','resumo','resultado'
  ]);
  const weakTokens = new Set(['meu','minha','meus','minhas','app','possebon']);
  let inventory = null;
  let screenById = new Map();
  let host = null;

  function camelWords(name) {
    return String(name || '')
      .replace(/Screen$/, '')
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
  }

  function semanticTokens(screen) {
    const tokens = camelWords(screen.class || screen.title)
      .filter((t) => !roleTokens.has(t) && !weakTokens.has(t));
    return [...new Set(tokens)];
  }

  function prettyToken(token) {
    const special = { qr: 'QR', rdo: 'RDO', epi: 'EPI', epis: 'EPIs', lgpd: 'LGPD' };
    return special[token] || token.charAt(0).toUpperCase() + token.slice(1);
  }

  function unionFind(ids) {
    const parent = new Map(ids.map((id) => [id, id]));
    const find = (id) => {
      let p = parent.get(id);
      while (p !== parent.get(p)) p = parent.get(p);
      let cur = id;
      while (parent.get(cur) !== p) {
        const next = parent.get(cur);
        parent.set(cur, p);
        cur = next;
      }
      return p;
    };
    const union = (a, b) => {
      const ra = find(a), rb = find(b);
      if (ra !== rb) parent.set(rb, ra);
    };
    return { find, union };
  }

  function buildModules() {
    const screens = inventory?.screens || [];
    const uf = unionFind(screens.map((s) => s.id));
    const byPath = new Map();
    for (const s of screens) {
      if (!byPath.has(s.path)) byPath.set(s.path, []);
      byPath.get(s.path).push(s);
    }

    // Regra mais forte: várias Screen no mesmo arquivo pertencem ao mesmo módulo funcional.
    for (const list of byPath.values()) {
      if (list.length < 2) continue;
      for (let i = 1; i < list.length; i++) uf.union(list[0].id, list[i].id);
    }

    // Regra semântica: nomes com a mesma raiz funcional dentro do mesmo domínio.
    for (let i = 0; i < screens.length; i++) {
      for (let j = i + 1; j < screens.length; j++) {
        const a = screens[i], b = screens[j];
        if ((a.domain || '') !== (b.domain || '')) continue;
        const ta = semanticTokens(a), tb = semanticTokens(b);
        const common = ta.filter((t) => tb.includes(t));
        if (!common.length) continue;
        const strong = common.some((t) => t.length >= 5 || ['qr','rdo','epi','cracha'].includes(t));
        if (strong) uf.union(a.id, b.id);
      }
    }

    // Navegação real pode unir arquivos do mesmo módulo, mas só quando existe raiz semântica em comum.
    for (const edge of inventory?.edges || []) {
      const a = screenById.get(edge.from), b = screenById.get(edge.to);
      if (!a || !b || (a.domain || '') !== (b.domain || '')) continue;
      const ta = semanticTokens(a), tb = semanticTokens(b);
      if (ta.some((t) => tb.includes(t))) uf.union(a.id, b.id);
    }

    const groups = new Map();
    for (const s of screens) {
      const key = uf.find(s.id);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(s);
    }

    return [...groups.values()].map((items) => ({
      id: items.map((s) => s.id).sort().join('|'),
      title: moduleTitle(items),
      domain: dominantDomain(items),
      screens: orderScreens(items),
    })).sort((a, b) => a.domain.localeCompare(b.domain, 'pt-BR') || a.title.localeCompare(b.title, 'pt-BR'));
  }

  function dominantDomain(items) {
    const counts = new Map();
    for (const s of items) counts.set(s.domain || 'App', (counts.get(s.domain || 'App') || 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'App';
  }

  function moduleTitle(items) {
    if (items.length === 1) return items[0].title;
    const tokenSets = items.map(semanticTokens).filter((x) => x.length);
    if (tokenSets.length) {
      const common = tokenSets[0].filter((t) => tokenSets.every((set) => set.includes(t)));
      if (common.length) return common.slice(0, 3).map(prettyToken).join(' ');
    }
    const samePath = items.every((s) => s.path === items[0].path);
    if (samePath) {
      const stem = (items[0].path.split('/').pop() || '').replace(/_screen\.dart$|\.dart$/g, '');
      return stem.split('_').filter((t) => !roleTokens.has(t)).map(prettyToken).join(' ') || items[0].title;
    }
    const all = items.flatMap(semanticTokens);
    const freq = new Map();
    for (const t of all) freq.set(t, (freq.get(t) || 0) + 1);
    const best = [...freq.entries()].sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)[0]?.[0];
    return best ? prettyToken(best) : items[0].title;
  }

  function roleWeight(screen) {
    const n = `${screen.class} ${screen.title}`.toLowerCase();
    if (/form|cadastro|novo|nova/.test(n)) return 20;
    if (/detalhe|detail|resultado/.test(n)) return 30;
    if (/mapa|map|scanner/.test(n)) return 12;
    return 0;
  }

  function orderScreens(items) {
    if (items.length < 2) return items.slice();
    const ids = new Set(items.map((s) => s.id));
    const incoming = new Map(items.map((s) => [s.id, 0]));
    const outgoing = new Map(items.map((s) => [s.id, []]));
    for (const edge of inventory?.edges || []) {
      if (!ids.has(edge.from) || !ids.has(edge.to)) continue;
      outgoing.get(edge.from).push(edge.to);
      incoming.set(edge.to, (incoming.get(edge.to) || 0) + 1);
    }
    let roots = items.filter((s) => (incoming.get(s.id) || 0) === 0);
    if (!roots.length) roots = items.slice().sort((a, b) => roleWeight(a) - roleWeight(b));
    roots.sort((a, b) => roleWeight(a) - roleWeight(b) || a.title.localeCompare(b.title, 'pt-BR'));

    const depth = new Map();
    const queue = roots.map((s) => s.id);
    roots.forEach((s) => depth.set(s.id, 0));
    while (queue.length) {
      const id = queue.shift();
      const d = depth.get(id) || 0;
      for (const next of outgoing.get(id) || []) {
        if (!depth.has(next) || depth.get(next) > d + 1) {
          depth.set(next, d + 1);
          queue.push(next);
        }
      }
    }
    return items.slice().sort((a, b) => {
      const da = depth.has(a.id) ? depth.get(a.id) : 99;
      const db = depth.has(b.id) ? depth.get(b.id) : 99;
      return da - db || roleWeight(a) - roleWeight(b) || a.title.localeCompare(b.title, 'pt-BR');
    });
  }

  function relevantLabels(screen) {
    const labels = screen?.preview?.visible_labels || [];
    const seen = new Set();
    return labels.filter((label) => {
      const value = String(label || '').trim();
      const key = value.toLowerCase();
      if (!value || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function nextLabel(layout, index) {
    for (let i = index + 1; i < Math.min(layout.length, index + 6); i++) {
      const item = layout[i];
      if (['text','field_label','tooltip'].includes(item?.type) && item.text) return item.text;
    }
    return '';
  }

  function phoneContent(screen) {
    const layout = Array.isArray(screen?.preview?.layout) ? screen.preview.layout : [];
    const title = relevantLabels(screen)[0] || screen.title;
    const special = `${screen.class} ${screen.title}`.toLowerCase();
    const out = [`<div class="vm4-appbar"><span>‹</span><b>${esc(cut(title, 23))}</b><span>•</span></div>`];

    if (screen?.preview?.kind === 'map' || /mapa|map screen/.test(special)) {
      out.push('<div class="vm4-map"></div>');
    }
    if (/qr|scanner/.test(special)) {
      out.push('<div class="vm4-camera"></div>');
    }

    let count = out.length;
    let listAdded = false;
    for (let i = 0; i < layout.length && count < 14; i++) {
      const item = layout[i];
      const widget = item?.widget || '';
      const label = nextLabel(layout, i);
      if (item?.type === 'text' || item?.type === 'field_label' || item?.type === 'tooltip') {
        const text = String(item.text || '').trim();
        if (text && text !== title) { out.push(`<div class="vm4-text">${esc(cut(text, 32))}</div>`); count++; }
        continue;
      }
      if (!widget || widget === 'AppBar' || /Scaffold|SafeArea|Column|Padding|SizedBox|Center|Expanded|Flexible|SingleChildScrollView|Align|Stack|Positioned|Container/.test(widget)) continue;
      if (/TextFormField|TextField|DropdownButton|SearchBar|SearchAnchor/.test(widget)) {
        out.push(`<div class="vm4-input">${esc(cut(label || 'campo', 27))}</div>`); count++; continue;
      }
      if (/FilledButton|ElevatedButton|OutlinedButton|TextButton|IconButton|FloatingActionButton/.test(widget)) {
        out.push(`<div class="vm4-button">${esc(cut(label || 'ação', 23))}</div>`); count++; continue;
      }
      if (/GoogleMap/.test(widget) && !out.some((x) => x.includes('vm4-map'))) {
        out.push('<div class="vm4-map"></div>'); count++; continue;
      }
      if (/GridView|Wrap/.test(widget)) {
        out.push('<div class="vm4-grid"><span></span><span></span></div>'); count++; continue;
      }
      if (/TabBar/.test(widget)) {
        out.push('<div class="vm4-tabs"><span></span><span></span><span></span></div>'); count++; continue;
      }
      if (/BottomNavigationBar|NavigationBar/.test(widget)) {
        out.push('<div class="vm4-bottom"><span></span><span></span><span></span><span></span></div>'); count++; continue;
      }
      if (/ListView|ListTile|ExpansionTile/.test(widget)) {
        if (!listAdded || /ListTile|ExpansionTile/.test(widget)) {
          out.push(`<div class="vm4-list"><i></i><span>${esc(cut(label || 'item', 24))}</span><b>›</b></div>`);
          count++; listAdded = true;
        }
        continue;
      }
      if (/Card|DataTable|Table|Stepper|PageView|Image|CircleAvatar|WebView/.test(widget)) {
        out.push(`<div class="vm4-card">${esc(cut(label || widget, 25))}</div>`); count++; continue;
      }
    }

    if (out.length === 1) {
      relevantLabels(screen).slice(1, 6).forEach((label) => out.push(`<div class="vm4-card">${esc(cut(label, 28))}</div>`));
    }
    return out.join('');
  }

  function internalTargets(screen, moduleIds) {
    return (screen.navigation_out || []).filter((id) => moduleIds.has(id)).map((id) => screenById.get(id)?.title).filter(Boolean);
  }

  function externalTargets(screen, moduleIds) {
    return (screen.navigation_out || []).filter((id) => !moduleIds.has(id)).map((id) => screenById.get(id)?.title).filter(Boolean);
  }

  function screenCard(screen, index, moduleIds) {
    const internal = internalTargets(screen, moduleIds);
    const external = externalTargets(screen, moduleIds);
    const kind = screen?.preview?.kind || 'tela';
    return `<article class="vm4-screen" data-screen-id="${esc(screen.id)}">
      <div class="vm4-screen-top"><span class="vm4-order">${index + 1}</span><span class="vm4-kind">${esc(kind)}</span></div>
      <h4 title="${esc(screen.title)}">${esc(screen.title)}</h4>
      <div class="vm4-phone"><div class="vm4-notch"></div><div class="vm4-screenbody">${phoneContent(screen)}</div></div>
      <div class="vm4-meta"><b>${esc(screen.path.split('/').pop() || screen.path)}</b><br>${esc(cut((relevantLabels(screen).slice(0, 3).join(' • ') || 'Estrutura extraída do código'), 92))}</div>
      <div class="vm4-flow">
        ${internal.map((t) => `<span>→ ${esc(cut(t, 22))}</span>`).join('')}
        ${external.slice(0, 2).map((t) => `<span>↗ ${esc(cut(t, 22))}</span>`).join('')}
      </div>
    </article>`;
  }

  function matchesScreen(screen, q, domain) {
    if (domain && screen.domain !== domain) return false;
    if (!q) return true;
    const hay = [screen.title, screen.class, screen.domain, screen.path, ...(screen?.preview?.visible_labels || [])].join(' ').toLowerCase();
    return hay.includes(q);
  }

  function render() {
    if (!host || !inventory) return;
    const q = (document.getElementById('search')?.value || '').trim().toLowerCase();
    const domain = document.getElementById('domainFilter')?.value || '';
    const modules = buildModules().map((module) => ({...module, screens: module.screens.filter((s) => matchesScreen(s, q, domain))})).filter((m) => m.screens.length);
    const totalScreens = modules.reduce((sum, m) => sum + m.screens.length, 0);
    host.innerHTML = `<div class="vm4-shell">
      <div class="vm4-intro">
        <div><h2>App por módulos e fluxo</h2><p>As telas são agrupadas por função e ordenadas pelas navegações confirmadas no Flutter. Setas internas indicam continuidade dentro do módulo; setas diagonais indicam saída para outro módulo.</p></div>
        <div class="vm4-stats"><span class="vm4-pill">${modules.length} módulos</span><span class="vm4-pill">${totalScreens} telas visíveis</span><span class="vm4-pill">ordem baseada em navegação</span></div>
      </div>
      <div class="vm4-modules">${modules.length ? modules.map((module, mi) => {
        const ids = new Set(module.screens.map((s) => s.id));
        return `<section class="vm4-module" data-module-index="${mi}">
          <header class="vm4-module-head"><div><h3>${esc(module.title)}</h3><p>${esc(module.domain)} • ${module.screens.length} tela(s)</p></div><span class="vm4-flow-badge">fluxo confirmado quando há aresta</span></header>
          <div class="vm4-carousel-wrap"><button class="vm4-arrow prev" type="button" aria-label="Telas anteriores">‹</button><div class="vm4-carousel">${module.screens.map((s, i) => screenCard(s, i, ids)).join('')}</div><button class="vm4-arrow next" type="button" aria-label="Próximas telas">›</button></div>
        </section>`;
      }).join('') : '<div class="vm4-empty">Nenhum módulo corresponde aos filtros atuais.</div>'}</div>
    </div>`;

    host.querySelectorAll('.vm4-screen').forEach((card) => card.addEventListener('click', () => openOriginal(card.dataset.screenId)));
    host.querySelectorAll('.vm4-module').forEach((module) => {
      const carousel = module.querySelector('.vm4-carousel');
      module.querySelector('.vm4-arrow.prev')?.addEventListener('click', (e) => { e.stopPropagation(); carousel?.scrollBy({left:-280,behavior:'smooth'}); });
      module.querySelector('.vm4-arrow.next')?.addEventListener('click', (e) => { e.stopPropagation(); carousel?.scrollBy({left:280,behavior:'smooth'}); });
    });
  }

  function openOriginal(id) {
    const node = document.querySelector(`#nodes .node[data-id="${CSS.escape(id)}"]`);
    if (node) node.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  }

  function syncMode() {
    if (!host) return;
    const visual = document.body.classList.contains('mode-visual');
    host.style.display = visual ? 'block' : 'none';
    if (visual) {
      const zoom = document.getElementById('zoomLabel');
      if (zoom) zoom.textContent = 'módulos';
      const mode = document.getElementById('modeLabel');
      if (mode) mode.textContent = 'modo visual • fluxo';
    }
  }

  async function boot() {
    const viewport = document.getElementById('viewport');
    if (!viewport) return;
    host = document.createElement('div');
    host.className = 'visual-modules-v4';
    host.id = 'visualModulesV4';
    viewport.appendChild(host);
    try {
      const response = await fetch(`./data/app-inventory.json?v=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('inventory');
      inventory = await response.json();
      screenById = new Map((inventory.screens || []).map((s) => [s.id, s]));
      render();
      syncMode();
    } catch (_) {
      host.innerHTML = '<div class="vm4-empty">Não foi possível carregar o inventário visual.</div>';
    }

    document.getElementById('search')?.addEventListener('input', render);
    document.getElementById('domainFilter')?.addEventListener('change', render);
    document.querySelectorAll('.mode-btn').forEach((button) => button.addEventListener('click', () => setTimeout(syncMode, 0)));
    document.getElementById('fitBtn')?.addEventListener('click', () => {
      if (document.body.classList.contains('mode-visual')) host?.scrollTo({top:0,left:0,behavior:'smooth'});
    });
    new MutationObserver(syncMode).observe(document.body, { attributes:true, attributeFilter:['class'] });
  }

  window.addEventListener('DOMContentLoaded', boot);
})();
