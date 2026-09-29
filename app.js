(() => {
  const $ = (id) => document.getElementById(id);
  const viewport = $('viewport');
  const world = $('world');
  const nodesRoot = $('nodes');
  const edgesSvg = $('edges');
  const zoomLabel = $('zoomLabel');
  const modeLabel = $('modeLabel');
  const inspector = $('inspector');
  const inspectorContent = $('inspectorContent');
  const contextPanel = $('contextPanel');
  const contextContent = $('contextContent');
  const focusPanel = $('focusPanel');
  const focusContent = $('focusContent');
  const statePanel = $('statePanel');
  const stateContent = $('stateContent');
  const healthPanel = $('healthPanel');
  const healthContent = $('healthContent');
  const summaryBar = $('summaryBar');
  const sourceBadge = $('sourceBadge');
  const emptyState = $('emptyState');
  const search = $('search');
  const domainFilter = $('domainFilter');
  const impactHint = $('impactHint');

  let inventory = null;
  let currentState = null;
  let brainStatus = null;
  let invariants = null;
  let currentMode = 'visual';
  let selectedId = null;
  let scale = 0.72;
  let tx = -1500;
  let ty = -1050;
  let drag = false;
  let last = { x: 0, y: 0 };

  const esc = (v) => String(v ?? '').replace(/[&<>'\"]/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[m]));

  const cut = (value, size = 34) => {
    const text = String(value ?? '');
    return text.length > size ? `${text.slice(0, size - 1)}…` : text;
  };

  function confidenceClass(screen) {
    const c = Number(screen?.evidence?.confidence ?? 0);
    if (c >= 0.98) return 'stable';
    if (c >= 0.95) return 'active';
    return 'attention';
  }

  function confidenceLabel(screen) {
    const c = Number(screen?.evidence?.confidence ?? 0);
    if (c >= 0.98) return 'código confirmado';
    if (c >= 0.95) return 'navegação confirmada';
    return 'visual inferido';
  }

  function applyTransform() {
    if (!world) return;
    world.style.transform = `translate(${tx}px,${ty}px) scale(${scale})`;
    if (zoomLabel) zoomLabel.textContent = `${Math.round(scale * 100)}%`;
  }

  function layoutScreens() {
    const screens = [...(inventory?.screens || [])];
    const center = { x: 4200, y: 3150 };
    const home = screens.find((s) => s.id === 'home-screen');
    const domains = [...new Set(
      screens.filter((s) => s.id !== 'home-screen').map((s) => s.domain || 'Outros')
    )].sort((a, b) => a.localeCompare(b, 'pt-BR'));

    const positions = new Map();
    if (home) positions.set(home.id, center);

    const radiusX = currentMode === 'visual' ? 2100 : 2320;
    const radiusY = currentMode === 'visual' ? 1650 : 1850;
    domains.forEach((domain, di) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * di) / Math.max(domains.length, 1);
      const anchor = {
        x: center.x + Math.cos(angle) * radiusX,
        y: center.y + Math.sin(angle) * radiusY
      };
      const items = screens.filter(
        (s) => s.id !== 'home-screen' && (s.domain || 'Outros') === domain
      );
      items.forEach((screen, i) => {
        const cols = items.length >= 4 ? 2 : 1;
        const col = i % cols;
        const row = Math.floor(i / cols);
        const width = currentMode === 'visual' ? 390 : 350;
        const height = currentMode === 'visual' ? 350 : 270;
        positions.set(screen.id, {
          x: anchor.x + (col - (cols - 1) / 2) * width,
          y: anchor.y + (row - (Math.ceil(items.length / cols) - 1) / 2) * height
        });
      });
    });

    return screens.map((screen) => ({
      ...screen,
      ...positions.get(screen.id),
      kind: 'screen',
      status: confidenceClass(screen),
      summary: `${screen.domain || 'Sem domínio'} • ${screen.path}`
    }));
  }

  const nodes = () => layoutScreens();
  const nodeMap = () => new Map(nodes().map((n) => [n.id, n]));
  const edges = () => inventory?.edges || [];

  function adjacency() {
    const map = new Map();
    for (const n of nodes()) map.set(n.id, new Set());
    for (const e of edges()) {
      if (!map.has(e.from)) map.set(e.from, new Set());
      if (!map.has(e.to)) map.set(e.to, new Set());
      map.get(e.from).add(e.to);
      map.get(e.to).add(e.from);
    }
    return map;
  }

  function directRelations(id) {
    const out = [];
    for (const e of edges()) {
      if (e.from === id) out.push({ direction: 'out', id: e.to, edge: e });
      if (e.to === id) out.push({ direction: 'in', id: e.from, edge: e });
    }
    return out;
  }

  function impactSet(id, depth = 2) {
    const adj = adjacency();
    const seen = new Map([[id, 0]]);
    const queue = [id];
    while (queue.length) {
      const cur = queue.shift();
      const d = seen.get(cur);
      if (d >= depth) continue;
      for (const next of adj.get(cur) || []) {
        if (!seen.has(next)) {
          seen.set(next, d + 1);
          queue.push(next);
        }
      }
    }
    return seen;
  }

  function fallbackLayout(screen) {
    const widgets = screen?.preview?.widgets || {};
    const order = [];
    const add = (widget, amount = 1) => {
      for (let i = 0; i < Math.min(amount, 4); i++) {
        order.push({ type: 'widget', widget, level: i ? 1 : 0 });
      }
    };
    if (widgets.AppBar) add('AppBar');
    if (widgets.Image) add('Image', widgets.Image);
    if (widgets.GridView) add('GridView');
    if (widgets.ListView) add('ListView');
    if (widgets.Card) add('Card', widgets.Card);
    if (widgets.TextFormField || widgets.TextField) add('TextFormField', widgets.TextFormField || widgets.TextField);
    if (widgets.GoogleMap || screen?.preview?.kind === 'map') add('GoogleMap');
    if (widgets.WebView || screen?.preview?.kind === 'web') add('WebView');
    if (widgets.TabBar) add('TabBar');
    if (widgets.BottomNavigationBar || widgets.NavigationBar) add('BottomNavigationBar');
    if (!order.length) {
      const kind = screen?.preview?.kind || 'dashboard';
      if (kind === 'form') add('TextFormField', 3);
      else if (kind === 'list') add('ListTile', 3);
      else if (kind === 'map') add('GoogleMap');
      else add('Card', 4);
    }
    return order;
  }

  function blueprintItem(item, large = false) {
    const level = Math.min(Number(item.level || 0), 6);
    const indent = level * (large ? 6 : 4);
    const common = `margin-left:${indent}px;width:calc(100% - ${indent}px);box-sizing:border-box;`;
    const widget = item.widget || '';

    if (item.type === 'text' || item.type === 'field_label' || item.type === 'tooltip') {
      return `<div style="${common}height:${large ? 15 : 8}px;line-height:${large ? 15 : 8}px;font-size:${large ? 9 : 0}px;color:#9fd9ea;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:${large ? 3 : 2}px;opacity:.9">${large ? esc(cut(item.text, 48)) : ''}</div>`;
    }

    if (item.type === 'icon') {
      return `<div title="${esc(item.icon)}" style="${common}width:${large ? 18 : 10}px;height:${large ? 18 : 10}px;border-radius:50%;border:1px solid rgba(85,221,255,.45);margin-bottom:3px"></div>`;
    }

    if (widget === 'AppBar') {
      return `<div style="${common}height:${large ? 22 : 13}px;border-radius:5px;background:rgba(85,221,255,.20);border:1px solid rgba(85,221,255,.18);margin-bottom:5px"></div>`;
    }
    if (/TextFormField|TextField|DropdownButton/.test(widget)) {
      return `<div style="${common}height:${large ? 26 : 15}px;border-radius:6px;border:1px solid rgba(220,246,255,.18);background:rgba(255,255,255,.035);margin-bottom:5px"></div>`;
    }
    if (/FilledButton|ElevatedButton|OutlinedButton|TextButton|IconButton|FloatingActionButton/.test(widget)) {
      return `<div style="${common}height:${large ? 24 : 14}px;width:${large ? '68%' : '62%'};border-radius:999px;background:rgba(0,185,242,.18);border:1px solid rgba(85,221,255,.22);margin:4px auto 5px"></div>`;
    }
    if (/GoogleMap/.test(widget)) {
      return `<div style="${common}height:${large ? 100 : 58}px;border-radius:8px;background:radial-gradient(circle at 62% 45%,rgba(62,213,138,.55) 0 4px,transparent 5px),linear-gradient(135deg,rgba(0,185,242,.12),rgba(255,255,255,.045));border:1px solid rgba(62,213,138,.18);margin-bottom:5px"></div>`;
    }
    if (/Image|CircleAvatar/.test(widget)) {
      return `<div style="${common}height:${large ? 58 : 32}px;width:${large ? '42%' : '38%'};border-radius:${widget === 'CircleAvatar' ? '50%' : '7px'};background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.06);margin:4px auto 6px"></div>`;
    }
    if (/TabBar/.test(widget)) {
      return `<div style="${common}height:${large ? 21 : 12}px;background:linear-gradient(90deg,rgba(85,221,255,.22) 0 31%,transparent 31% 34%,rgba(255,255,255,.07) 34% 65%,transparent 65% 68%,rgba(255,255,255,.07) 68%);border-radius:5px;margin-bottom:5px"></div>`;
    }
    if (/BottomNavigationBar|NavigationBar/.test(widget)) {
      return `<div style="${common}height:${large ? 28 : 16}px;background:repeating-linear-gradient(90deg,rgba(85,221,255,.14) 0 18%,transparent 18% 25%);border-top:1px solid rgba(85,221,255,.18);margin-top:5px"></div>`;
    }
    if (/GridView|Wrap|Row/.test(widget)) {
      return `<div style="${common}display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:5px"><span style="height:${large ? 32 : 18}px;border-radius:6px;background:rgba(255,255,255,.065)"></span><span style="height:${large ? 32 : 18}px;border-radius:6px;background:rgba(255,255,255,.065)"></span></div>`;
    }
    if (/ListView|ListTile|ExpansionTile/.test(widget)) {
      return `<div style="${common}height:${large ? 28 : 16}px;border-radius:6px;background:linear-gradient(90deg,rgba(255,255,255,.075),rgba(255,255,255,.035));border:1px solid rgba(255,255,255,.04);margin-bottom:4px"></div>`;
    }
    if (/Divider/.test(widget)) {
      return `<div style="${common}height:1px;background:rgba(255,255,255,.12);margin:4px 0"></div>`;
    }
    if (/CircularProgressIndicator|LinearProgressIndicator/.test(widget)) {
      return `<div style="${common}height:${large ? 8 : 5}px;width:55%;border-radius:999px;background:rgba(85,221,255,.28);margin:5px auto"></div>`;
    }
    if (/Card|Container|ListTile|Table|DataTable|Stepper|PageView|WebView/.test(widget)) {
      return `<div style="${common}height:${large ? 42 : 24}px;border-radius:7px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.05);margin-bottom:5px"></div>`;
    }
    if (/Column|SafeArea|SingleChildScrollView|Padding|Center|Align|Stack|Expanded|Flexible|SizedBox|Positioned/.test(widget)) {
      return '';
    }
    return `<div style="${common}height:${large ? 18 : 10}px;border-radius:5px;background:rgba(255,255,255,.04);margin-bottom:3px"></div>`;
  }

  function screenBlueprint(screen, large = false) {
    const source = screen?.preview?.layout?.length ? screen.preview.layout : fallbackLayout(screen);
    const limit = large ? 36 : 18;
    const body = source.slice(0, limit).map((item) => blueprintItem(item, large)).join('');
    const derived = Boolean(screen?.preview?.layout?.length);
    const labels = screen?.preview?.visible_labels || [];
    return `<div class="wireframe ${esc(screen?.preview?.kind || 'dashboard')}${large ? ' large' : ''}" style="height:${large ? 330 : 170}px;padding:${large ? 10 : 7}px;display:flex;flex-direction:column;overflow:hidden;user-select:none">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;flex:0 0 auto">
        <span style="font-size:${large ? 9 : 0}px;color:#82b9ca">${large ? esc(cut(screen.title, 30)) : ''}</span>
        <span style="font-size:${large ? 8 : 0}px;color:${derived ? '#3ed58a' : '#ffad55'}">${large ? (derived ? 'estrutura do build()' : 'fallback estrutural') : ''}</span>
      </div>
      <div style="flex:1;overflow:hidden">${body}</div>
      ${large && labels.length ? `<div style="font-size:8px;color:#628a99;margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(labels.slice(0, 5).join(' • '))}</div>` : ''}
    </div>`;
  }

  function technicalStack(screen) {
    const deps = screen.technical_dependencies || [];
    const routes = screen.api_routes || [];
    const items = [
      ['TELA', screen.class || screen.title],
      ['ARQUIVO', screen.path],
      ...(deps.length ? [['DEP.', `${deps.length} dependência(s)`]] : []),
      ...(routes.length ? [['API', `${routes.length} rota(s)`]] : [])
    ];
    return `<div class="tech-stack">${items.map(([a, b], i) =>
      `<div class="tech-line"><span>${i ? '↳' : '●'}</span><b>${esc(a)}</b><span class="tech-arrow" style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(b)}</span></div>`
    ).join('')}</div>`;
  }

  function nodeBody(screen) {
    if (currentMode === 'visual') return screenBlueprint(screen);
    if (currentMode === 'technical') return technicalStack(screen);
    const impact = impactSet(screen.id, 2).size - 1;
    return `<div class="tech-stack">
      <div class="tech-line"><b>IMPACTO EM CADEIA</b><span class="tech-arrow">${impact} tela(s) em até 2 saltos</span></div>
      <div class="tech-line"><b>SAÍDAS</b><span class="tech-arrow">${(screen.navigation_out || []).length} navegação(ões)</span></div>
      <div class="tech-line"><b>ENTRADAS</b><span class="tech-arrow">${(screen.navigation_in || []).length} origem(ns)</span></div>
    </div>`;
  }

  function nodeCenter(n) {
    const visual = currentMode === 'visual';
    return {
      x: n.x + (n.id === 'home-screen' ? 170 : 146),
      y: n.y + (visual ? 150 : 105)
    };
  }

  function visibleByFilters(screen) {
    const q = (search?.value || '').trim().toLowerCase();
    const domain = domainFilter?.value || '';
    if (domain && screen.domain !== domain) return false;
    if (!q) return true;
    const labels = screen?.preview?.visible_labels || [];
    const hay = [
      screen.title, screen.class, screen.domain, screen.path,
      ...labels,
      ...(screen.technical_dependencies || []),
      ...(screen.api_routes || [])
    ].join(' ').toLowerCase();
    return hay.includes(q);
  }

  function render() {
    if (!nodesRoot || !edgesSvg || !inventory) return;
    nodesRoot.innerHTML = '';
    edgesSvg.innerHTML = '';
    const all = nodes();
    const map = new Map(all.map((n) => [n.id, n]));
    const visibleIds = new Set(all.filter(visibleByFilters).map((n) => n.id));

    document.body.classList.remove('mode-visual', 'mode-technical', 'mode-impact');
    document.body.classList.add(`mode-${currentMode}`);
    if (modeLabel) modeLabel.textContent = `modo ${currentMode === 'technical' ? 'técnico' : currentMode === 'impact' ? 'impacto' : 'visual'}`;
    if (impactHint) impactHint.classList.toggle('hidden', currentMode !== 'impact');

    for (const e of edges()) {
      const a = map.get(e.from), b = map.get(e.to);
      if (!a || !b || !visibleIds.has(a.id) || !visibleIds.has(b.id)) continue;
      const ca = nodeCenter(a), cb = nodeCenter(b);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', ca.x);
      line.setAttribute('y1', ca.y);
      line.setAttribute('x2', cb.x);
      line.setAttribute('y2', cb.y);
      line.dataset.a = e.from;
      line.dataset.b = e.to;
      edgesSvg.appendChild(line);
    }

    let visibleCount = 0;
    for (const screen of all) {
      if (!visibleIds.has(screen.id)) continue;
      visibleCount++;
      const el = document.createElement('article');
      el.className = `node ${screen.id === 'home-screen' ? 'core ' : ''}${screen.status}`;
      if (currentMode === 'visual') {
        el.style.width = screen.id === 'home-screen' ? '350px' : '300px';
        el.style.minHeight = '270px';
      }
      el.style.left = `${screen.x}px`;
      el.style.top = `${screen.y}px`;
      el.dataset.id = screen.id;
      el.innerHTML = `
        <div class="node-head">
          <span class="kind-chip">${esc(screen.domain || 'Tela')}</span>
          <span class="status"><i class="dot ${screen.status}"></i>${esc(confidenceLabel(screen))}</span>
        </div>
        <h3>${esc(screen.title)}</h3>
        ${nodeBody(screen)}
        ${currentMode === 'visual' ? '' : `<p style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(screen.path)}</p>`}`;
      el.addEventListener('click', (event) => {
        event.stopPropagation();
        selectedId = screen.id;
        if (currentMode === 'impact') highlightImpact(screen.id);
        openInspector(screen);
      });
      el.addEventListener('dblclick', (event) => {
        event.stopPropagation();
        focusNode(screen, currentMode === 'visual' ? 0.95 : 1.04);
      });
      nodesRoot.appendChild(el);
    }

    if (emptyState) emptyState.classList.toggle('hidden', visibleCount !== 0);
    renderSummary();
    applyTransform();
  }

  function renderSummary() {
    if (!summaryBar || !inventory) return;
    const s = inventory.stats || {};
    const blueprints = s.screens_with_layout ?? inventory.screens.filter((x) => x?.preview?.layout?.length).length;
    summaryBar.innerHTML = `
      <span><b>${s.screens ?? inventory.screens.length}</b> telas</span>
      <span><b>${s.navigation_edges ?? inventory.edges.length}</b> ligações</span>
      <span><b>${s.domains ?? new Set(inventory.screens.map((x) => x.domain)).size}</b> domínios</span>
      <span><b>${blueprints}</b> blueprints</span>
      <span class="updated">Flutter <code>${esc((inventory.source?.head || '').slice(0, 12))}</code></span>`;
    if (sourceBadge) {
      const attention = brainStatus?.sync?.state === 'attention';
      sourceBadge.innerHTML = `<span>${attention ? '⚠' : '●'}</span> ${esc(inventory.source?.branch || '')} @ ${esc((inventory.source?.head || '').slice(0, 8))}`;
      sourceBadge.classList.toggle('attention', attention);
    }
  }

  function relatedButtons(screen) {
    const map = nodeMap();
    const rel = directRelations(screen.id);
    if (!rel.length) return '<p>Não há navegação confirmada ligada diretamente a esta tela.</p>';
    return `<div class="related-grid">${rel.map((r) => {
      const target = map.get(r.id);
      if (!target) return '';
      const arrow = r.direction === 'out' ? '→' : '←';
      return `<button class="related-chip" data-related="${esc(r.id)}">${arrow} ${esc(target.title)}</button>`;
    }).join('')}</div>`;
  }

  function list(title, items, code = false) {
    if (!items?.length) return '';
    return `<section><h3>${esc(title)}</h3><ul>${items.map((x) => `<li>${code ? `<code>${esc(x)}</code>` : esc(x)}</li>`).join('')}</ul></section>`;
  }

  function openContextPack(screen) {
    if (!contextPanel || !contextContent) return;
    const related = directRelations(screen.id).map((r) => nodeMap().get(r.id)?.title).filter(Boolean);
    const inv = (invariants?.invariants || invariants?.rules || []).slice(0, 8);
    contextContent.innerHTML = `
      <p><b>${esc(screen.title)}</b> • ${esc(screen.domain || '')}</p>
      <p>Fonte: <code>${esc(screen.path)}</code></p>
      ${list('Navegações relacionadas', related)}
      ${list('Dependências', screen.technical_dependencies, true)}
      ${list('APIs', screen.api_routes, true)}
      ${list('Invariantes do projeto', inv.map((x) => typeof x === 'string' ? x : (x.title || x.rule || x.id || '')))}
    `;
    contextPanel.classList.remove('hidden');
  }

  function openInspector(screen) {
    if (!inspector || !inspectorContent) return;
    const rel = directRelations(screen.id);
    const confidence = Number(screen?.evidence?.confidence ?? 0);
    const hasRealBlueprint = Boolean(screen?.preview?.layout?.length);
    inspectorContent.innerHTML = `
      <div class="kind">${esc(screen.domain || 'Tela')} • confiança ${Math.round(confidence * 100)}%</div>
      <h2>${esc(screen.title)}</h2>
      <p class="lead"><code>${esc(screen.path)}</code></p>
      <div class="node-preview">${screenBlueprint(screen, true)}</div>
      <div class="alert" style="border-color:${hasRealBlueprint ? 'rgba(62,213,138,.3)' : 'rgba(255,173,85,.28)'}">
        <b>${hasRealBlueprint ? 'Blueprint estrutural extraído do build().' : 'Blueprint em fallback.'}</b>
        ${hasRealBlueprint ? ' Ordem de widgets/textos derivada do código.' : ' O inventário ainda não contém a árvore ordenada desta tela.'}
      </div>
      <section><h3>Navegação confirmada</h3>${relatedButtons(screen)}</section>
      ${list('Textos/labels detectados', screen?.preview?.visible_labels)}
      ${list('Dependências técnicas', screen.technical_dependencies, true)}
      ${list('Rotas de API detectadas', screen.api_routes, true)}
      <section><h3>Impacto</h3><p>${rel.length} relação(ões) direta(s); ${impactSet(screen.id, 2).size - 1} tela(s) em até dois saltos.</p></section>
      <section><button id="contextPackBtn" class="related-chip" type="button">Montar Context Pack para IA</button></section>
    `;
    inspector.classList.remove('hidden');
    inspectorContent.querySelectorAll('[data-related]').forEach((button) => {
      button.onclick = () => {
        const target = nodeMap().get(button.dataset.related);
        if (target) focusNode(target, currentMode === 'visual' ? 0.95 : 1.03);
      };
    });
    const pack = $('contextPackBtn');
    if (pack) pack.onclick = () => openContextPack(screen);
  }

  function highlightImpact(id) {
    selectedId = id;
    const set = impactSet(id, 2);
    document.querySelectorAll('.node').forEach((el) => {
      const depth = set.get(el.dataset.id);
      const on = depth !== undefined;
      el.classList.toggle('highlighted', on);
      el.classList.toggle('dimmed', !on);
      if (on) el.style.setProperty('--impact-depth', String(depth));
    });
    document.querySelectorAll('.edges line').forEach((line) => {
      const on = set.has(line.dataset.a) && set.has(line.dataset.b);
      line.classList.toggle('highlighted', on);
      line.classList.toggle('dimmed', !on);
    });
    const origin = nodeMap().get(id);
    if (impactHint && origin) impactHint.textContent = `${origin.title}: ${set.size - 1} tela(s) em até dois saltos.`;
  }

  function clearImpact() {
    selectedId = null;
    document.querySelectorAll('.node,.edges line').forEach((el) => el.classList.remove('highlighted', 'dimmed'));
    if (impactHint && currentMode === 'impact') impactHint.textContent = 'Selecione uma tela para calcular o impacto em cadeia.';
  }

  function focusNode(screen, target = 1) {
    const rect = viewport.getBoundingClientRect();
    const c = nodeCenter(screen);
    scale = Math.min(1.45, Math.max(0.35, target));
    tx = rect.width / 2 - c.x * scale;
    ty = rect.height / 2 - c.y * scale;
    applyTransform();
    openInspector(screen);
  }

  function fitAll() {
    const all = nodes().filter(visibleByFilters);
    if (!all.length || !viewport) return;
    const minX = Math.min(...all.map((n) => n.x)) - 280;
    const maxX = Math.max(...all.map((n) => n.x)) + 620;
    const minY = Math.min(...all.map((n) => n.y)) - 250;
    const maxY = Math.max(...all.map((n) => n.y)) + (currentMode === 'visual' ? 520 : 420);
    const w = maxX - minX, h = maxY - minY;
    const rect = viewport.getBoundingClientRect();
    scale = Math.min(currentMode === 'visual' ? 0.56 : 0.78, Math.max(0.25, Math.min(rect.width / w, rect.height / h) * 0.92));
    tx = (rect.width - w * scale) / 2 - minX * scale;
    ty = (rect.height - h * scale) / 2 - minY * scale;
    applyTransform();
  }

  function fillDomains() {
    if (!domainFilter || !inventory) return;
    const selected = domainFilter.value;
    const domains = [...new Set(inventory.screens.map((s) => s.domain || 'Outros'))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    domainFilter.innerHTML = '<option value="">Todos os domínios</option>' + domains.map((d) => `<option value="${esc(d)}">${esc(d)}</option>`).join('');
    if (domains.includes(selected)) domainFilter.value = selected;
  }

  function setMode(mode) {
    currentMode = mode;
    clearImpact();
    document.querySelectorAll('.mode-btn').forEach((btn) => btn.classList.toggle('selected', btn.dataset.mode === mode));
    render();
    fitAll();
  }

  function showHealth() {
    if (!healthPanel || !healthContent) return;
    const coverage = brainStatus?.coverage || {};
    const source = brainStatus?.source || inventory?.source || {};
    const warnings = brainStatus?.warnings || [];
    const blueprintCount = inventory?.stats?.screens_with_layout ?? inventory?.screens?.filter((s) => s?.preview?.layout?.length).length ?? 0;
    healthContent.innerHTML = `
      ${brainStatus?.sync?.state === 'attention' ? `<div class="alert">Atenção: ${esc(brainStatus?.sync?.automatic_blocker || 'sincronização requer revisão')}</div>` : ''}
      <div class="health-grid">
        <div class="health-card ok"><div><span>Telas indexadas</span><strong>${coverage.screens_indexed ?? inventory?.screens?.length ?? 0}</strong></div><small>Flutter atual</small></div>
        <div class="health-card ok"><div><span>Navegações</span><strong>${coverage.navigation_edges_verified ?? coverage.navigation_edges ?? inventory?.edges?.length ?? 0}</strong></div><small>código lido</small></div>
        <div class="health-card ${blueprintCount ? 'ok' : 'warn'}"><div><span>Blueprints reais</span><strong>${blueprintCount}</strong></div><small>layout ordenado do build()</small></div>
        <div class="health-card ${brainStatus?.sync?.state === 'attention' ? 'warn' : 'ok'}"><div><span>Sincronização</span><strong>${esc(brainStatus?.sync?.state || '—')}</strong></div><small>${esc(brainStatus?.sync?.method || '')}</small></div>
      </div>
      <h3 style="margin-top:20px">Fonte</h3>
      <p><b>${esc(source.repository || '')}</b><br>branch <code>${esc(source.branch || '')}</code><br>HEAD <code>${esc((source.head || '').slice(0, 12))}</code></p>
      ${list('Avisos', warnings)}
    `;
    healthPanel.classList.remove('hidden');
  }

  function showState() {
    if (!statePanel || !stateContent) return;
    if (!currentState) {
      stateContent.innerHTML = '<p>Estado operacional não carregado.</p>';
      statePanel.classList.remove('hidden');
      return;
    }
    const modules = currentState.modules || {};
    const entries = Object.entries(modules).slice(0, 18);
    stateContent.innerHTML = `
      <div class="state-meta"><span>Atualizado: ${esc(currentState.updated_at || '—')}</span></div>
      <div class="state-grid">${entries.length ? entries.map(([key, value]) => `<article class="state-card"><div><strong>${esc(key)}</strong><span>${esc(value.status || '')}</span></div><p>${esc(value.summary || '')}</p></article>`).join('') : '<p>O snapshot atual usa estrutura operacional sem bloco modules.</p>'}</div>
    `;
    statePanel.classList.remove('hidden');
  }

  function showFocus() {
    if (!focusPanel || !focusContent) return;
    const focus = currentState?.active_focus_order || currentState?.focus || [];
    focusContent.innerHTML = focus.length ? focus.map((item, i) => `<div class="focus-item"><strong>${i + 1}</strong><span>${esc(typeof item === 'string' ? item : (item.title || item.id || JSON.stringify(item)))}</span></div>`).join('') : '<p>Nenhum foco estruturado registrado neste snapshot.</p>';
    focusPanel.classList.remove('hidden');
  }

  function bindUI() {
    document.querySelectorAll('.mode-btn').forEach((btn) => btn.addEventListener('click', () => setMode(btn.dataset.mode)));
    if (search) search.addEventListener('input', () => render());
    if (search) search.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      const first = nodes().find(visibleByFilters);
      if (first) focusNode(first, currentMode === 'visual' ? 0.95 : 1.03);
    });
    if (domainFilter) domainFilter.addEventListener('change', () => { render(); fitAll(); });
    if ($('healthBtn')) $('healthBtn').onclick = showHealth;
    if ($('stateBtn')) $('stateBtn').onclick = showState;
    if ($('focusBtn')) $('focusBtn').onclick = showFocus;
    if ($('fitBtn')) $('fitBtn').onclick = fitAll;
    if ($('closeInspector')) $('closeInspector').onclick = () => inspector.classList.add('hidden');
    if ($('closeContext')) $('closeContext').onclick = () => contextPanel.classList.add('hidden');
    if ($('closeFocus')) $('closeFocus').onclick = () => focusPanel.classList.add('hidden');
    if ($('closeState')) $('closeState').onclick = () => statePanel.classList.add('hidden');
    if ($('closeHealth')) $('closeHealth').onclick = () => healthPanel.classList.add('hidden');

    if (viewport) {
      viewport.addEventListener('click', (event) => {
        if (event.target === viewport || event.target.classList.contains('ambient')) clearImpact();
      });
      viewport.addEventListener('pointerdown', (event) => {
        if (event.button !== 0 || event.target.closest('.node') || event.target.closest('.impact-hint')) return;
        drag = true;
        last = { x: event.clientX, y: event.clientY };
        viewport.classList.add('dragging');
        viewport.setPointerCapture(event.pointerId);
      });
      viewport.addEventListener('pointermove', (event) => {
        if (!drag) return;
        tx += event.clientX - last.x;
        ty += event.clientY - last.y;
        last = { x: event.clientX, y: event.clientY };
        applyTransform();
      });
      viewport.addEventListener('pointerup', () => {
        drag = false;
        viewport.classList.remove('dragging');
      });
      viewport.addEventListener('wheel', (event) => {
        event.preventDefault();
        const rect = viewport.getBoundingClientRect();
        const mx = event.clientX - rect.left;
        const my = event.clientY - rect.top;
        const wx = (mx - tx) / scale;
        const wy = (my - ty) / scale;
        const next = Math.min(1.8, Math.max(0.18, scale * (event.deltaY < 0 ? 1.1 : 0.9)));
        tx = mx - wx * next;
        ty = my - wy * next;
        scale = next;
        applyTransform();
      }, { passive: false });
    }

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      [inspector, contextPanel, focusPanel, statePanel, healthPanel].forEach((panel) => panel?.classList.add('hidden'));
      clearImpact();
    });
  }

  async function loadJson(path, required = false) {
    try {
      const response = await fetch(path, { cache: 'no-store' });
      if (!response.ok) {
        if (required) throw new Error(`${path} ${response.status}`);
        return null;
      }
      return await response.json();
    } catch (error) {
      if (required) throw error;
      return null;
    }
  }

  async function boot() {
    bindUI();
    try {
      [inventory, currentState, brainStatus, invariants] = await Promise.all([
        loadJson('./data/app-inventory.json', true),
        loadJson('./data/current-state.json'),
        loadJson('./data/brain-status.json'),
        loadJson('./data/invariants.json')
      ]);
      fillDomains();
      render();
      fitAll();
    } catch (error) {
      if (nodesRoot) nodesRoot.innerHTML = `<div class="load-error">Falha ao carregar o Project Brain: ${esc(error?.message || error)}</div>`;
    }
  }

  boot();
})();
