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
  let scale = 0.62;
  let tx = -1500;
  let ty = -1050;
  let drag = false;
  let last = { x: 0, y: 0 };

  const esc = (v) => String(v ?? '').replace(/[&<>'\"]/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[m]));

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
    const center = { x: 4200, y: 3200 };
    const home = screens.find((s) => s.id === 'home-screen');
    const domains = [...new Set(screens.filter((s) => s.id !== 'home-screen').map((s) => s.domain || 'Outros'))]
      .sort((a, b) => a.localeCompare(b, 'pt-BR'));

    const positions = new Map();
    if (home) positions.set(home.id, { x: center.x, y: center.y });

    const radiusX = 2550;
    const radiusY = 2050;
    domains.forEach((domain, di) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * di) / Math.max(domains.length, 1);
      const anchor = {
        x: center.x + Math.cos(angle) * radiusX,
        y: center.y + Math.sin(angle) * radiusY
      };
      const items = screens.filter((s) => s.id !== 'home-screen' && (s.domain || 'Outros') === domain);
      items.forEach((screen, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        positions.set(screen.id, {
          x: anchor.x + (col - 0.5) * 360,
          y: anchor.y + (row - (items.length > 2 ? 0.5 : 0)) * 270
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

  function nodes() {
    return layoutScreens();
  }

  function nodeMap() {
    return new Map(nodes().map((n) => [n.id, n]));
  }

  function edges() {
    return inventory?.edges || [];
  }

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
    const q = [id];
    while (q.length) {
      const cur = q.shift();
      const d = seen.get(cur);
      if (d >= depth) continue;
      for (const next of adj.get(cur) || []) {
        if (!seen.has(next)) {
          seen.set(next, d + 1);
          q.push(next);
        }
      }
    }
    return seen;
  }

  function wireframe(screen, large = false) {
    const kind = screen?.preview?.kind || 'dashboard';
    const widgets = screen?.preview?.widgets || {};
    const chip = Object.entries(widgets)
      .slice(0, 4)
      .map(([name, count]) => `<span class="wf-chip">${esc(name)}${count > 1 ? ` ×${count}` : ''}</span>`)
      .join('');

    let body = '';
    if (kind === 'form') {
      body = '<div class="wf-row"><div class="wf-card"></div></div><div class="wf-row"><div class="wf-card"></div></div><div class="wf-row"><div class="wf-card"></div></div><div class="wf-line"></div>';
    } else if (kind === 'list' || kind === 'document') {
      body = '<div class="wf-row"><div class="wf-card"></div></div><div class="wf-row"><div class="wf-card"></div></div><div class="wf-row"><div class="wf-card"></div></div>';
    } else if (kind === 'map') {
      body = '<div class="wf-row"><div class="wf-card"></div></div><div class="wf-row"><div class="wf-card"></div><div class="wf-card"></div></div>';
    } else if (kind === 'camera') {
      body = '<div class="wf-row"><div class="wf-card"></div></div><div class="wf-line"></div>';
    } else if (kind === 'splash') {
      body = '<div class="wf-row"><div class="wf-card"></div></div><div class="wf-line"></div>';
    } else {
      body = '<div class="wf-row"><div class="wf-card"></div><div class="wf-card"></div></div><div class="wf-row"><div class="wf-card"></div><div class="wf-card"></div></div><div class="wf-line"></div>';
    }

    return `<div class="wireframe ${esc(kind)}${large ? ' large' : ''}">
      <div class="wf-top"></div>
      <div class="wf-title"></div>
      ${body}
      ${chip ? `<div class="wf-chips">${chip}</div>` : ''}
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
      `<div class="tech-line"><span>${i ? '↳' : '●'}</span><b>${esc(a)}</b><span class="tech-arrow">${esc(b)}</span></div>`
    ).join('')}</div>`;
  }

  function nodeBody(screen) {
    if (currentMode === 'technical') return technicalStack(screen);
    if (currentMode === 'impact') {
      const count = impactSet(screen.id, 2).size - 1;
      return `<div class="tech-stack"><div class="tech-line"><b>IMPACTO EM CADEIA</b><span class="tech-arrow">${count} tela(s) em até 2 saltos</span></div></div>`;
    }
    return wireframe(screen);
  }

  function nodeCenter(n) {
    return { x: n.x + (n.id === 'home-screen' ? 170 : 146), y: n.y + 105 };
  }

  function visibleByFilters(screen) {
    const q = (search?.value || '').trim().toLowerCase();
    const domain = domainFilter?.value || '';
    if (domain && screen.domain !== domain) return false;
    if (!q) return true;
    const hay = [
      screen.title, screen.class, screen.domain, screen.path,
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
      line.dataset.confidence = String(e.confidence ?? '');
      edgesSvg.appendChild(line);
    }

    let visibleCount = 0;
    for (const screen of all) {
      if (!visibleIds.has(screen.id)) continue;
      visibleCount++;
      const el = document.createElement('article');
      el.className = `node ${screen.id === 'home-screen' ? 'core ' : ''}${screen.status}`;
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
        <p>${esc(screen.path)}</p>`;
      el.addEventListener('click', (event) => {
        event.stopPropagation();
        selectedId = screen.id;
        if (currentMode === 'impact') highlightImpact(screen.id);
        openInspector(screen);
      });
      el.addEventListener('dblclick', (event) => {
        event.stopPropagation();
        focusNode(screen, 1.02);
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
    summaryBar.innerHTML = `
      <span><b>${s.screens ?? inventory.screens.length}</b> telas</span>
      <span><b>${s.navigation_edges ?? inventory.edges.length}</b> ligações</span>
      <span><b>${s.domains ?? new Set(inventory.screens.map((x) => x.domain)).size}</b> domínios</span>
      <span class="updated">Flutter <code>${esc((inventory.source?.head || '').slice(0, 12))}</code></span>`;
    if (sourceBadge) {
      sourceBadge.innerHTML = `<span>${brainStatus?.sync?.state === 'attention' ? '⚠' : '●'}</span> ${esc(inventory.source?.branch || '')} @ ${esc((inventory.source?.head || '').slice(0, 8))}`;
      sourceBadge.classList.toggle('attention', brainStatus?.sync?.state === 'attention');
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

  function openInspector(screen) {
    if (!inspector || !inspectorContent) return;
    const rel = directRelations(screen.id);
    const confidence = Number(screen?.evidence?.confidence ?? 0);
    inspectorContent.innerHTML = `
      <div class="kind">${esc(screen.domain || 'Tela')} • confiança ${Math.round(confidence * 100)}%</div>
      <h2>${esc(screen.title)}</h2>
      <p class="lead">${esc(screen.path)}</p>
      <div class="node-preview">${wireframe(screen, true)}</div>
      <section>
        <h3>Evidência</h3>
        <p><b>${esc(screen.evidence?.kind || 'não informada')}</b> • ${Math.round(confidence * 100)}% de confiança.</p>
      </section>
      <section><h3>Navegação confirmada</h3>${relatedButtons(screen)}</section>
      ${list('Dependências técnicas', screen.technical_dependencies, true)}
      ${list('Rotas de API detectadas', screen.api_routes, true)}
      <section>
        <h3>Impacto</h3>
        <p>${rel.length} relação(ões) direta(s); ${impactSet(screen.id, 2).size - 1} tela(s) alcançadas em até 2 saltos.</p>
      </section>
      <section>
        <button class="related-chip" data-context="${esc(screen.id)}">Gerar Context Pack para IA</button>
      </section>`;
    inspector.classList.remove('hidden');

    inspectorContent.querySelectorAll('[data-related]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = nodeMap().get(btn.dataset.related);
        if (target) {
          if (currentMode === 'impact') highlightImpact(target.id);
          focusNode(target, 1.02);
        }
      });
    });
    inspectorContent.querySelectorAll('[data-context]').forEach((btn) => {
      btn.addEventListener('click', () => showContextPack(screen));
    });
  }

  function showContextPack(screen) {
    if (!contextPanel || !contextContent) return;
    const map = nodeMap();
    const rel = directRelations(screen.id);
    const inv = (invariants?.invariants || invariants?.rules || []);
    const globalRules = Array.isArray(inv) ? inv.slice(0, 8) : [];
    contextContent.innerHTML = `
      <div class="alert">Pacote derivado do inventário atual. Não substitui a leitura do código-fonte antes de alterar.</div>
      <section><h3>Objetivo</h3><p>Trabalhar em <b>${esc(screen.title)}</b> preservando suas relações e invariantes conhecidos.</p></section>
      <section><h3>Fonte principal</h3><p><code>${esc(screen.path)}</code></p></section>
      ${list('Dependências que devem ser lidas', screen.technical_dependencies, true)}
      <section><h3>Telas relacionadas</h3><ul>${rel.map((r) => {
        const n = map.get(r.id);
        return `<li>${r.direction === 'out' ? 'abre' : 'é aberta por'} <b>${esc(n?.title || r.id)}</b></li>`;
      }).join('') || '<li>Nenhuma relação direta confirmada.</li>'}</ul></section>
      ${globalRules.length ? `<section><h3>Invariantes globais</h3><ul>${globalRules.map((r) => `<li>${esc(r.title || r.rule || r.id || JSON.stringify(r))}</li>`).join('')}</ul></section>` : ''}
      <section><h3>Pré-flight obrigatório</h3><p>Confirmar HEAD atual, ler arquivo e dependências, calcular impacto, definir rollback, implementar, validar e só então atualizar a memória.</p></section>`;
    contextPanel.classList.remove('hidden');
  }

  function highlightImpact(id) {
    const levels = impactSet(id, 2);
    document.querySelectorAll('.node').forEach((el) => {
      const level = levels.get(el.dataset.id);
      el.classList.toggle('highlighted', level !== undefined);
      el.classList.toggle('dimmed', level === undefined);
      if (level !== undefined) el.dataset.impactLevel = String(level);
      else delete el.dataset.impactLevel;
    });
    document.querySelectorAll('.edges line').forEach((line) => {
      const on = levels.has(line.dataset.a) && levels.has(line.dataset.b);
      line.classList.toggle('highlighted', on);
      line.classList.toggle('dimmed', !on);
    });
    const origin = nodeMap().get(id);
    if (impactHint) {
      impactHint.textContent = origin
        ? `${origin.title}: ${levels.size - 1} tela(s) potencialmente afetadas em até 2 saltos.`
        : 'Impacto calculado.';
    }
  }

  function clearImpact() {
    selectedId = null;
    document.querySelectorAll('.node,.edges line').forEach((el) => el.classList.remove('highlighted', 'dimmed'));
    if (impactHint && currentMode === 'impact') impactHint.textContent = 'Selecione uma tela para calcular o impacto em cadeia.';
  }

  function populateDomains() {
    if (!domainFilter || !inventory) return;
    const current = domainFilter.value;
    const domains = [...new Set(inventory.screens.map((x) => x.domain || 'Outros'))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    domainFilter.innerHTML = '<option value="">Todos os domínios</option>' +
      domains.map((d) => `<option value="${esc(d)}">${esc(d)}</option>`).join('');
    if (domains.includes(current)) domainFilter.value = current;
  }

  function fitAll() {
    const visible = nodes().filter(visibleByFilters);
    if (!visible.length || !viewport) return;
    const minX = Math.min(...visible.map((n) => n.x)) - 320;
    const maxX = Math.max(...visible.map((n) => n.x)) + 620;
    const minY = Math.min(...visible.map((n) => n.y)) - 260;
    const maxY = Math.max(...visible.map((n) => n.y)) + 520;
    const w = maxX - minX, h = maxY - minY;
    const rect = viewport.getBoundingClientRect();
    scale = Math.min(0.9, Math.max(0.22, Math.min(rect.width / w, rect.height / h) * 0.92));
    tx = (rect.width - w * scale) / 2 - minX * scale;
    ty = (rect.height - h * scale) / 2 - minY * scale;
    applyTransform();
  }

  function focusNode(node, target = 1) {
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    const c = nodeCenter(node);
    scale = Math.min(1.35, Math.max(0.45, target));
    tx = rect.width / 2 - c.x * scale;
    ty = rect.height / 2 - c.y * scale;
    applyTransform();
    openInspector(node);
  }

  function showHealth() {
    if (!healthPanel || !healthContent) return;
    const cov = brainStatus?.coverage || {};
    const sync = brainStatus?.sync || {};
    healthContent.innerHTML = `
      <div class="alert">${sync.state === 'attention' ? 'Atenção:' : 'Status:'} ${esc(sync.automatic_blocker || 'sincronização sem bloqueio conhecido')}</div>
      <div class="health-grid">
        <div class="health-card ok"><div><span>Telas indexadas</span><strong>${cov.screens_indexed ?? inventory?.screens?.length ?? 0}</strong></div><small>Flutter atual</small></div>
        <div class="health-card ok"><div><span>Navegações verificadas</span><strong>${cov.navigation_edges_verified ?? inventory?.edges?.length ?? 0}</strong></div><small>código lido</small></div>
        <div class="health-card ${sync.state === 'attention' ? 'warn' : 'ok'}"><div><span>Sincronização</span><strong>${esc(sync.state || 'desconhecida')}</strong></div><small>${esc(sync.method || '')}</small></div>
        <div class="health-card ${cov.runtime_visuals ? 'ok' : 'warn'}"><div><span>Visual runtime</span><strong>${cov.runtime_visuals ? 'sim' : 'não'}</strong></div><small>wireframes estruturais</small></div>
      </div>
      <h3 style="margin-top:20px">Fonte</h3>
      <p><code>${esc(brainStatus?.source?.repository || inventory?.source?.repository || '')}</code><br>
      branch <code>${esc(brainStatus?.source?.branch || inventory?.source?.branch || '')}</code><br>
      HEAD <code>${esc((brainStatus?.source?.head || inventory?.source?.head || '').slice(0, 12))}</code></p>
      ${list('Avisos', brainStatus?.warnings || [])}`;
    healthPanel.classList.remove('hidden');
  }

  function showState() {
    if (!statePanel || !stateContent) return;
    const sourceHead = currentState?.source_snapshot?.remote_head_observed ||
      currentState?.source_of_truth?.flutter_head_confirmed ||
      currentState?.flutter?.head ||
      inventory?.source?.head || '—';
    stateContent.innerHTML = `
      <div class="state-meta">
        <span>Memória: ${esc(currentState?.updated_at || 'sem data')}</span>
        <span>Inventário: ${esc(inventory?.generated_at || 'sem data')}</span>
        <span>Flutter HEAD: <code>${esc(String(sourceHead).slice(0, 12))}</code></span>
      </div>
      <div class="alert">O inventário visual usa o HEAD ${esc((inventory?.source?.head || '').slice(0, 12))}. O estado operacional pode ter datas próprias e deve ser revalidado quando suas fontes mudarem.</div>`;
    statePanel.classList.remove('hidden');
  }

  function showFocus() {
    if (!focusPanel || !focusContent) return;
    const focus = currentState?.active_focus_order || currentState?.current_focus || [];
    focusContent.innerHTML = focus.length
      ? focus.map((x, i) => `<div class="focus-item"><strong>${i + 1}</strong><span>${esc(typeof x === 'string' ? x : JSON.stringify(x))}</span></div>`).join('')
      : '<p>Nenhum foco estruturado foi registrado no snapshot atual.</p>';
    focusPanel.classList.remove('hidden');
  }

  function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach((btn) => btn.classList.toggle('selected', btn.dataset.mode === mode));
    clearImpact();
    render();
    fitAll();
  }

  function close(panel) {
    panel?.classList.add('hidden');
  }

  $('closeInspector')?.addEventListener('click', () => close(inspector));
  $('closeContext')?.addEventListener('click', () => close(contextPanel));
  $('closeFocus')?.addEventListener('click', () => close(focusPanel));
  $('closeState')?.addEventListener('click', () => close(statePanel));
  $('closeHealth')?.addEventListener('click', () => close(healthPanel));
  $('healthBtn')?.addEventListener('click', showHealth);
  $('stateBtn')?.addEventListener('click', showState);
  $('focusBtn')?.addEventListener('click', showFocus);
  $('fitBtn')?.addEventListener('click', fitAll);
  document.querySelectorAll('.mode-btn').forEach((btn) => btn.addEventListener('click', () => setMode(btn.dataset.mode)));
  search?.addEventListener('input', () => { render(); fitAll(); });
  domainFilter?.addEventListener('change', () => { render(); fitAll(); });

  search?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const first = nodes().find(visibleByFilters);
    if (first) focusNode(first, 1.03);
  });

  viewport?.addEventListener('click', (event) => {
    if (event.target === viewport || event.target.classList.contains('ambient')) clearImpact();
  });

  viewport?.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || event.target.closest('.node') || event.target.closest('.impact-hint')) return;
    drag = true;
    last = { x: event.clientX, y: event.clientY };
    viewport.classList.add('dragging');
    viewport.setPointerCapture(event.pointerId);
  });

  viewport?.addEventListener('pointermove', (event) => {
    if (!drag) return;
    tx += event.clientX - last.x;
    ty += event.clientY - last.y;
    last = { x: event.clientX, y: event.clientY };
    applyTransform();
  });

  viewport?.addEventListener('pointerup', () => {
    drag = false;
    viewport.classList.remove('dragging');
  });

  viewport?.addEventListener('wheel', (event) => {
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

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      close(inspector); close(contextPanel); close(focusPanel); close(statePanel); close(healthPanel); clearImpact();
    }
  });

  async function loadJson(path, required = false) {
    try {
      const response = await fetch(path, { cache: 'no-store' });
      if (!response.ok) {
        if (required) throw new Error(`${path} retornou HTTP ${response.status}`);
        return null;
      }
      return await response.json();
    } catch (error) {
      if (required) throw error;
      return null;
    }
  }

  Promise.all([
    loadJson('./data/app-inventory.json', true),
    loadJson('./data/current-state.json'),
    loadJson('./data/brain-status.json'),
    loadJson('./data/invariants.json')
  ]).then(([appInventory, state, status, inv]) => {
    inventory = appInventory;
    currentState = state;
    brainStatus = status;
    invariants = inv;
    populateDomains();
    render();
    fitAll();
  }).catch((error) => {
    if (nodesRoot) nodesRoot.innerHTML = `<div class="load-error">Falha ao carregar o Project Brain: ${esc(error.message || error)}</div>`;
    if (summaryBar) summaryBar.innerHTML = '<span><b>erro de carregamento</b></span>';
  });

  applyTransform();
})();
