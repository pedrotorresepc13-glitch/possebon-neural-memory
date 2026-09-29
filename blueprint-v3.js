(() => {
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));

  const cut = (value, size = 34) => {
    const text = String(value ?? '').replace(/\s+/g, ' ').trim();
    return text.length > size ? `${text.slice(0, size - 1)}…` : text;
  };

  const ignoredWidgets = new Set([
    'Scaffold', 'SafeArea', 'Column', 'Padding', 'SizedBox', 'Center', 'Expanded',
    'Flexible', 'SingleChildScrollView', 'Align', 'Stack', 'Positioned', 'Builder',
    'FutureBuilder', 'StreamBuilder'
  ]);

  let screenMap = new Map();

  function nextText(layout, index, maxLookAhead = 6) {
    const baseLevel = Number(layout[index]?.level || 0);
    for (let i = index + 1; i < Math.min(layout.length, index + 1 + maxLookAhead); i++) {
      const item = layout[i];
      const level = Number(item?.level || 0);
      if (level <= baseLevel && i > index + 1) break;
      if (item?.type === 'text' || item?.type === 'field_label' || item?.type === 'tooltip') {
        const text = String(item.text || '').trim();
        if (text) return text;
      }
    }
    return '';
  }

  function blockFromItem(item, layout, index) {
    const widget = item?.widget || '';
    const label = nextText(layout, index);

    if (item?.type === 'text' || item?.type === 'field_label' || item?.type === 'tooltip') {
      const text = String(item.text || '').trim();
      if (!text) return '';
      return `<div class="bp-text" title="${esc(text)}">${esc(cut(text, 30))}</div>`;
    }

    if (item?.type === 'icon') {
      return `<span class="bp-icon" title="${esc(item.icon || 'ícone')}"></span>`;
    }

    if (!widget || ignoredWidgets.has(widget)) return '';

    if (widget === 'AppBar') {
      return `<div class="bp-appbar"><span class="bp-back">‹</span><b>${esc(cut(label || 'Tela', 24))}</b><span class="bp-dot"></span></div>`;
    }
    if (/TextFormField|TextField|DropdownButton|SearchBar|SearchAnchor/.test(widget)) {
      return `<div class="bp-input"><span>${esc(cut(label || 'campo', 25))}</span></div>`;
    }
    if (/FilledButton|ElevatedButton|OutlinedButton|TextButton|IconButton|FloatingActionButton/.test(widget)) {
      return `<div class="bp-button">${esc(cut(label || widget.replace('Button', ''), 22))}</div>`;
    }
    if (/GoogleMap/.test(widget)) {
      return `<div class="bp-map"><i></i><i></i><span>mapa</span></div>`;
    }
    if (/WebView/.test(widget)) {
      return `<div class="bp-web"><span>web</span><div></div><div></div><div></div></div>`;
    }
    if (/Image|CircleAvatar/.test(widget)) {
      return `<div class="bp-image ${widget === 'CircleAvatar' ? 'avatar' : ''}"><span>${widget === 'CircleAvatar' ? 'foto' : 'imagem'}</span></div>`;
    }
    if (/GridView|Wrap|Row/.test(widget)) {
      return `<div class="bp-grid"><span></span><span></span></div>`;
    }
    if (/ListView|ListTile|ExpansionTile/.test(widget)) {
      return `<div class="bp-list"><i></i><span>${esc(cut(label || 'item', 23))}</span><b>›</b></div>`;
    }
    if (/TabBar/.test(widget)) {
      return `<div class="bp-tabs"><span></span><span></span><span></span></div>`;
    }
    if (/BottomNavigationBar|NavigationBar/.test(widget)) {
      return `<div class="bp-bottom"><span></span><span></span><span></span><span></span></div>`;
    }
    if (/Card|Container|DataTable|Table|Stepper|PageView/.test(widget)) {
      return `<div class="bp-card"><span>${esc(cut(label || widget, 24))}</span></div>`;
    }
    if (/Divider/.test(widget)) return '<div class="bp-divider"></div>';
    if (/CircularProgressIndicator|LinearProgressIndicator/.test(widget)) return '<div class="bp-progress"><span></span></div>';
    return '';
  }

  function phoneBlueprint(screen, large = false) {
    const preview = screen?.preview || {};
    const layout = Array.isArray(preview.layout) ? preview.layout : [];
    const maxBlocks = large ? 34 : 20;
    const blocks = [];
    let lastText = '';

    for (let i = 0; i < layout.length && blocks.length < maxBlocks; i++) {
      const item = layout[i];
      if ((item?.type === 'text' || item?.type === 'field_label') && String(item.text || '').trim() === lastText) continue;
      const html = blockFromItem(item, layout, i);
      if (!html) continue;
      blocks.push(html);
      if (item?.type === 'text' || item?.type === 'field_label') lastText = String(item.text || '').trim();
    }

    if (!blocks.length) {
      const labels = (preview.visible_labels || []).slice(0, 5);
      blocks.push('<div class="bp-appbar"><span class="bp-back">‹</span><b>Tela</b><span class="bp-dot"></span></div>');
      labels.forEach((label) => blocks.push(`<div class="bp-card"><span>${esc(cut(label, 24))}</span></div>`));
    }

    return `<div class="phone-preview brain-blueprint${large ? ' large' : ''}" data-blueprint="ordered">
      <div class="phone-notch"></div>
      <div class="phone-screen">
        <div class="bp-scroll">${blocks.join('')}</div>
      </div>
    </div>`;
  }

  function enhanceNode(node) {
    if (!document.body.classList.contains('mode-visual')) return;
    const id = node?.dataset?.id;
    const screen = screenMap.get(id);
    if (!screen) return;
    const wireframe = node.querySelector('.wireframe');
    if (!wireframe || wireframe.dataset.enhanced === 'true') return;
    const holder = document.createElement('div');
    holder.innerHTML = phoneBlueprint(screen, false);
    const replacement = holder.firstElementChild;
    replacement.dataset.enhanced = 'true';
    wireframe.replaceWith(replacement);
  }

  function enhanceInspector() {
    if (!document.body.classList.contains('mode-visual')) return;
    const inspector = document.getElementById('inspector');
    if (!inspector || inspector.classList.contains('hidden')) return;
    const title = inspector.querySelector('h2')?.textContent?.trim();
    const screen = [...screenMap.values()].find((item) => item.title === title);
    if (!screen) return;
    const wireframe = inspector.querySelector('.wireframe');
    if (!wireframe || wireframe.dataset.enhanced === 'true') return;
    const holder = document.createElement('div');
    holder.innerHTML = phoneBlueprint(screen, true);
    const replacement = holder.firstElementChild;
    replacement.dataset.enhanced = 'true';
    wireframe.replaceWith(replacement);
  }

  function enhanceAll() {
    if (!screenMap.size) return;
    document.querySelectorAll('#nodes .node[data-id]').forEach(enhanceNode);
    enhanceInspector();
  }

  async function loadInventory() {
    try {
      const response = await fetch(`./data/app-inventory.json?v=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) return;
      const inventory = await response.json();
      screenMap = new Map((inventory.screens || []).map((screen) => [screen.id, screen]));
      enhanceAll();
    } catch (_) {
      // A camada visual é progressiva; o mapa principal continua funcional sem ela.
    }
  }

  const observer = new MutationObserver(() => requestAnimationFrame(enhanceAll));
  window.addEventListener('DOMContentLoaded', () => {
    const nodes = document.getElementById('nodes');
    const inspector = document.getElementById('inspector');
    if (nodes) observer.observe(nodes, { childList: true, subtree: true });
    if (inspector) observer.observe(inspector, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    document.querySelectorAll('.mode-btn').forEach((button) => button.addEventListener('click', () => setTimeout(enhanceAll, 0)));
    loadInventory();
  });
})();
