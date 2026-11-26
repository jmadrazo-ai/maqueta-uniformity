// Uniformity - mockup de propuesta. Todos los datos son inventados.
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Paleta: "new" aplica las cuatro reglas de color propuestas el 21 nov 2026 (verde solo para marca, navegación y botón principal;
// "normal" en neutro; gráficas sin verdes; dorado solo sobre fondo oscuro). "old" deja la maqueta como estaba.
// Se cambia con el control de abajo a la derecha, que recarga la página.
let PAL = new URLSearchParams(location.search).get('pal');
try { PAL = PAL || localStorage.getItem('uni-pal'); } catch (e) {}
PAL = PAL === 'old' ? 'old' : 'new';
const NEWPAL = PAL === 'new';
document.documentElement.dataset.pal = PAL;
$$('button[data-pal]').forEach(b => b.setAttribute('aria-pressed', b.dataset.pal === PAL));
document.addEventListener('click', e => {
  const b = e.target.closest('button[data-pal]'); if (!b || b.dataset.pal === PAL) return;
  try { localStorage.setItem('uni-pal', b.dataset.pal); } catch (err) {}
  location.href = location.pathname + '?pal=' + b.dataset.pal + location.hash;
});

const P = {
  home: '<path d="M3 11l9-7 9 7M5 9.500V20h5v-6h4v6h5V9.500"/>',
  cloud: '<path d="M7 18a4 4 0 0 1-.5-7.970A6 6 0 0 1 18 9.500a4.250 4.250 0 0 1-.5 8.500z"/>',
  calendar: '<rect x="3.500" y="5" width="17" height="15" rx="2.500"/><path d="M3.500 10h17M8 3v4M16 3v4"/>',
  cycle: '<path d="M20 12a8 8 0 0 1-14.300 4.900M4 12a8 8 0 0 1 14.300-4.900M18.500 3.500v4h-4M5.500 20.500v-4h4"/>',
  sprout: '<path d="M12 21v-9M12 12c0-4-3-6-7-6 0 4 3 6 7 6zM12 15c0-3.500 2.500-5.500 7-5.500 0 3.500-2.500 5.500-7 5.500z"/>',
  flower: '<circle cx="12" cy="12" r="2.500"/><path d="M12 9.500c-2-2-2-5.500 0-6.500 2 1 2 4.500 0 6.500zM12 14.500c2 2 2 5.500 0 6.500-2-1-2-4.500 0-6.500zM9.500 12c-2 2-5.500 2-6.500 0 1-2 4.500-2 6.500 0zM14.500 12c2-2 5.500-2 6.500 0-1 2-4.500 2-6.500 0z"/>',
  drop: '<path d="M12 3.500c3.500 4 6 7 6 10.500a6 6 0 0 1-12 0c0-3.500 2.500-6.500 6-10.500z"/>',
  bug: '<rect x="8" y="7" width="8" height="12" rx="4"/><path d="M9.500 4.500L11 7M14.500 4.500L13 7M8 11H4M8 15H4.500M16 11h4M16 15h3.500M12 11v8"/>',
  flask: '<path d="M9.500 3.500h5M10.500 3.500v6L5 18.500a1.500 1.500 0 0 0 1.300 2.250h11.400A1.500 1.500 0 0 0 19 18.500l-5.500-9v-6M7.500 15h9"/>',
  back: '<path d="M15 5l-7 7 7 7"/>', chev: '<path d="M9 5l7 7-7 7"/>', plus: '<path d="M12 5v14M5 12h14"/>',
  down: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  more: '<circle cx="5" cy="12" r="1.200"/><circle cx="12" cy="12" r="1.200"/><circle cx="19" cy="12" r="1.200"/>',
  morev: '<circle cx="12" cy="5" r="1.200"/><circle cx="12" cy="12" r="1.200"/><circle cx="12" cy="19" r="1.200"/>',
  bell: '<path d="M6 16.500V11a6 6 0 0 1 12 0v5.500l1.500 2h-15zM10 21h4"/>',
  sliders: '<path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h11M19 17h1M15 5v4M9 10v4M17 15v4"/>', // References (como en la app real)
  toggles: '<circle cx="8" cy="8" r="2.500"/><path d="M10.500 8H20"/><circle cx="16" cy="16" r="2.500"/><path d="M4 16h9.500"/>', // Manage sensors
  check: '<path d="M5 12.500l4.500 4.500L19 7.500"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
  alert: '<path d="M12 4l9 15.500H3zM12 10v4.500M12 17.200v.1"/>',
  clock: '<circle cx="12" cy="12" r="8.500"/><path d="M12 7.500V12l3 2"/>',
  user: '<circle cx="12" cy="8.500" r="3.500"/><path d="M5 20c.8-3.500 3.500-5.500 7-5.500s6.200 2 7 5.500"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16zM13.500 6.500l4 4"/>',
  copy: '<rect x="8.500" y="8.500" width="11" height="11" rx="2"/><path d="M5 15.500V6a1.500 1.500 0 0 1 1.500-1.500H15"/>',
  trash: '<path d="M4.500 7h15M9.500 7V4.500h5V7M6.500 7l1 12.500h9l1-12.500"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  suncloud: '<path d="M9 3v1.6M3.9 5.9l1.1 1.1M2 11h1.6M14.1 5.9L13 7M5.6 12.4a3.6 3.6 0 0 1 6-3.8"/><path d="M9.5 20a3.6 3.6 0 0 1-.4-7.200 5 5 0 0 1 9.600 1.300A3 3 0 0 1 18.200 20z"/>',
  rain: '<path d="M7 15a4 4 0 0 1-.5-7.970A6 6 0 0 1 18 6.500a4.250 4.250 0 0 1-.5 8.500zM8.500 18v2.500M12 18v2.500M15.500 18v2.500"/>',
};
const icon = n => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;

// Datos inventados
const RANCH = 'Rancho Los Álamos', TODAY = 'Tue, Nov 17';
const GH = [
  { n: 11, crop: 'Tomato · Roma', day: 96, of: 280 },
  { n: 12, crop: 'Tomato · Cherry', day: 96, of: 280, st: 'warn', at: 'irrigation', why: 'Irrigation not captured today' },
  { n: 13, crop: 'Strawberry · Albion', day: 41, of: 210, st: 'warn', at: 'irrigation', why: 'Irrigation not captured today' },
  { n: 14, crop: 'Cucumber · Persian', day: 58, of: 120, st: 'warn', at: 'irrigation', why: 'Irrigation not captured today' },
  { n: 15, crop: null },
];
const MODS = { crop: ['Crop', 'sprout'], pollination: ['Pollination', 'flower'], irrigation: ['Irrigation', 'drop'], pests: ['Pests & Diseases', 'bug'], applications: ['Applications', 'flask'] };
const MODS2 = {}; // módulos que no capturan reportes (MyTomatoVision): van en el menú, pero no en las listas de Home ni de Calendar
const NAV = [['home', 'Home', 'home'], ['weather', 'Weather', 'cloud'], ['calendar', 'Calendar', 'calendar'], ['cycles', 'Cycles', 'cycle']];
const S = { wx: { Temperature: true, Humidity: true, Radiation: true }, wxMode: 'Stacked' };
const V = {}, A = {}, SEG = {}, T = {};

// Piezas
const chip = (c, t) => `<span class="chip ${c}">${NEWPAL && (c === 'warn' || c === 'crit') ? icon('alert') : ''}${t}</span>`;
const range = (lo, hi, v, min, max, cls = '') => { const p = x => Math.max(0, Math.min(100, (x - min) / (max - min) * 100)); return `<div class="range ${cls}"><i class="band" style="left:${p(lo)}%;width:${p(hi) - p(lo)}%"></i><i class="dot" style="left:${p(v)}%"></i></div>`; };
const kpi = (ic, lbl, val, unit, note, rng) => `<div class="card kpi"><div class="lbl">${icon(ic)}${lbl}</div><div class="val">${val}${unit ? `<small>${unit}</small>` : ''}</div>${rng || ''}${note ? `<div class="note">${note}</div>` : ''}</div>`;
const seg = (id, opts, cur) => `<div class="seg" data-seg="${id}"><i class="thumb"></i>${opts.map(o => `<button data-action="seg" aria-pressed="${o === cur}">${o}</button>`).join('')}</div>`;
// Fix X1 (aprobación final de Julián, 24 nov 2026): en la fila de las listas de los módulos queda el botón que abre el reporte y,
// a su derecha, un botón de tres puntos con "Edit" y "Delete". La fila completa no es clicable. "Duplicate" sigue a la vista en Applications.
const ROWBTN = { crop: ['Report'], pollination: ['Report'], pests: ['Report'], irrigation: ['Daily report', 'Weekly report'], applications: ['View details'] };
const kebab = () => `<button class="kebab" data-action="rowmenu" aria-label="More actions">${icon('morev')}</button>`;
// Fix X3 (Jira BD-244): las listas de los módulos llevan la columna del invernadero, corta: encabezado "Greenhouse", filas "GH 11"
const table = (mod, head, rows) => { const acts = ROWBTN[mod], ghn = acts && +location.hash.split('/')[3]; if (ghn) { head = ['Greenhouse', ...head]; rows = rows.map(x => [`GH ${ghn}`, ...x]); } T[mod] = { head, rows }; const r = h => h[0] === '>' ? ' class="r"' : ''; return `<table><thead><tr>${head.map(h => `<th${r(h)}>${h.replace('>', '')}</th>`).join('')}<th${acts ? ' class="r"' : ''}>${acts ? 'Actions' : ''}</th></tr></thead><tbody>${rows.map((row, i) => `<tr${acts ? ' class="st"' : ` tabindex="0" data-action="report" data-mod="${mod}" data-i="${i}"`}>${row.map((c, j) => `<td${r(head[j])}>${c}</td>`).join('')}<td class="act">${acts ? `<span class="acts">${acts.map((t, k) => `<button class="btn" data-action="${k ? 'weekly' : 'report'}" data-mod="${mod}" data-i="${i}">${t}</button>`).join('')}${mod === 'applications' ? `<button class="btn" data-action="dup">${icon('copy')}Duplicate</button>` : ''}${kebab()}</span>` : `<span class="go">${icon('chev')}</span>`}</td></tr>`).join('')}</tbody></table>`; };
const field = (lbl, ctl, help = '') => `<label class="field"><span>${lbl}</span>${ctl}<em>${help}</em></label>`;
const select = (opts, attr = '') => `<select class="select" style="width:100%;height:40px" ${attr}>${opts.map(o => `<option>${o}</option>`).join('')}</select>`;

// Gráfica de líneas: cada serie usa su propia escala; ejes extra a la derecha
function chart(series, h = 170, lab = i => i % 4 ? '' : String(i % 24).padStart(2, '0') + ':00') {
  const W = 760, L = 38, R = series.length > 2 ? 92 : series.length > 1 ? 46 : 10, top = 10, B = 22, n = series[0].data.length;
  const x = i => L + (W - L - R) * i / (n - 1), y = (v, s) => top + (h - top - B) * (1 - (v - s.min) / (s.max - s.min));
  let o = `<svg class="chart" viewBox="0 0 ${W} ${h}" role="img" aria-label="${series.map(s => s.name).join(', ')}">`;
  for (let t = 0; t <= 4; t++) {
    const yy = top + (h - top - B) * t / 4;
    o += `<line class="gl" x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}"/>`;
    series.forEach((s, k) => { o += `<text x="${k ? W - R + 8 + (k - 1) * 44 : L - 6}" y="${yy + 4}" text-anchor="${k ? 'start' : 'end'}"${series.length > 1 ? ` style="fill:${s.color};font-weight:600"` : ''}>${+(s.max - (s.max - s.min) * t / 4).toFixed(1)}</text>`; });
  }
  for (let i = 0; i < n; i++) if (lab(i)) o += `<text x="${x(i)}" y="${h - 4}" text-anchor="middle">${lab(i)}</text>`;
  series.forEach(s => { o += `<path class="ln" pathLength="1" stroke="${s.color}" d="M${s.data.map((v, i) => `${x(i).toFixed(1)} ${y(v, s).toFixed(1)}`).join('L')}"/>`; });
  return o + '</svg>';
}

// Hoja lateral, menú, aviso
const sheet = $('#sheet'), scrim = $('#scrim'), toastEl = $('#toast'), main = $('#main');
let FORM = null, menu = null, undoFn = null, toastT, lastFocus, repRow = null;
sheet.inert = true;
function openSheet(title, body, foot = '', tools = '', pop = false) {
  lastFocus = document.activeElement;
  // pop = ventana centrada (pop-up) en vez de hoja lateral; se cambia sin animar el brinco
  sheet.style.transition = 'none'; sheet.classList.toggle('pop', pop); sheet.offsetWidth; sheet.style.transition = '';
  sheet.innerHTML = `<header><h2 id="sheet-title">${title}</h2>${tools}<button class="icon-btn" data-action="close" aria-label="Close">${icon('x')}</button></header><div class="body">${body}</div>${foot ? `<footer>${foot}</footer>` : ''}`;
  sheet.inert = false; sheet.classList.add('on'); scrim.classList.add('on'); $('[data-action="close"]', sheet).focus();
}
// Acciones del reporte: Edit visible; exportar y Move to Trash en "⋯". La fila de la tabla no lleva botones (Duplicate solo en Applications)
const REP_TOOLS = `<button class="btn" data-action="edit">${icon('edit')}Edit</button><button class="icon-btn" data-action="menu" aria-label="More actions">${icon('more')}</button>`;
function closeSheet() { sheet.classList.remove('on'); scrim.classList.remove('on'); sheet.inert = true; FORM = null; lastFocus && lastFocus.focus && lastFocus.focus(); }
function closeMenu() { menu && menu.remove(); menu = null; }
function toast(msg, undo) {
  toastEl.innerHTML = `<span style="padding-right:${undo ? 0 : 8}px">${msg}</span>${undo ? '<button data-action="undo">Undo</button>' : ''}`;
  undoFn = undo; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), 5000);
}
// Un selector recién dibujado pone su fondo blanco directo en su lugar; solo se desliza cuando la persona cambia de opción
function thumbs() { $$('.seg').forEach(s => { const b = $('[aria-pressed="true"]', s), t = $('.thumb', s), first = !t.style.width; if (first) t.style.transition = 'none'; t.style.width = b.offsetWidth + 'px'; t.style.transform = `translateX(${b.offsetLeft}px)`; if (first) { t.offsetWidth; t.style.transition = ''; } }); }

A.close = closeSheet;
A.go = el => { location.hash = el.dataset.href; };
A.seg = el => { const s = el.parentNode; $$('button', s).forEach(b => b.setAttribute('aria-pressed', b === el)); thumbs(); SEG[s.dataset.seg] && SEG[s.dataset.seg](el.textContent); };
A.undo = () => { undoFn && undoFn(); toastEl.classList.remove('on'); };
A.menu = el => {
  closeMenu();
  const r = el.getBoundingClientRect(), m = document.createElement('div');
  m.className = 'menu'; m.style.top = Math.min(r.bottom + 4, innerHeight - 140) + 'px'; m.style.right = innerWidth - r.right + 'px';
  m.innerHTML = `<button data-action="xlsx">${icon('down')}Download XLSX</button><hr><button class="danger" data-action="trash">${icon('trash')}Move to Trash</button>`;
  document.body.append(m); menu = m;
};
// Menú de los tres puntos de la fila: "Edit" arriba y "Delete" abajo, en rojo. Se abre pegado debajo del botón, alineado a su
// borde derecho; si no cabe hacia abajo, se abre hacia arriba. Se cierra al elegir, al hacer clic fuera o con Esc.
A.rowmenu = el => {
  closeMenu();
  const r = el.getBoundingClientRect(), m = document.createElement('div'), abajo = r.bottom + 4 + 76 < innerHeight;
  repRow = el.closest('tr');
  m.className = 'menu row'; m.style.top = (abajo ? r.bottom + 4 : r.top - 4 - 76) + 'px'; m.style.right = innerWidth - r.right + 'px';
  m.innerHTML = `<button data-action="edit">Edit</button><hr><button class="danger" data-action="trash">Delete</button>`;
  document.body.append(m); menu = m; m.firstChild.focus();
};
A.weekly = () => toast('Mockup: the weekly report opens here, over the list');
A.edit = () => toast('Edit opens the same form, already filled in');
A.xlsx = () => toast('Mockup: no file is created');
A.dup = () => toast('Duplicate asks for the new week first. A week that already has a plan cannot be chosen');
// Sin diálogo: va a la Papelera, regresa a la lista y ofrece Undo
A.trash = () => {
  const row = repRow; closeSheet();
  if (row) { row.classList.add('gone'); setTimeout(() => { row.hidden = row.classList.contains('gone'); }, 250); }
  toast('Moved to Trash', () => { if (row) { row.hidden = false; requestAnimationFrame(() => row.classList.remove('gone')); } });
};
A.report = el => {
  const { head, rows } = T[el.dataset.mod], row = rows[el.dataset.i];
  repRow = el.closest('tr');
  openSheet(`${MODS[el.dataset.mod] ? MODS[el.dataset.mod][0] + ' · ' : ''}${String(row[0]).replace(/<[^>]+>/g, '')}`,
    `<dl class="dl">${head.map((h, i) => `<dt>${h.replace('>', '')}</dt><dd>${row[i]}</dd>`).join('')}</dl><p class="hint" style="color:var(--ink-2);font-size:13px">The report opens here, over the list. Closing it returns to the same row, with the same filters.</p>`,
    `<span class="msg">Captured by a person, never edited silently: every change is logged.</span><button class="btn" data-action="close">Done</button>`, REP_TOOLS);
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]'), m = menu;
  if (el) A[el.dataset.action](el, e);
  if (m && menu === m) closeMenu();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeMenu(); sheet.classList.contains('on') && closeSheet(); }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('tr[data-action], li[data-action]')) { e.preventDefault(); e.target.click(); }
});
document.addEventListener('change', e => {
  const f = e.target.dataset.filter;
  if (f !== undefined) $$('tbody tr', e.target.closest('.card')).forEach(r => { r.style.display = e.target.selectedIndex && !r.textContent.includes(e.target.value) ? 'none' : ''; });
});
sheet.addEventListener('input', () => FORM && FORM());
sheet.addEventListener('change', () => FORM && FORM());
scrim.addEventListener('click', closeSheet);
main.addEventListener('scroll', () => main.classList.toggle('scrolled', main.scrollTop > 4));

// Ruteo
// render(true): cambio dentro de la misma pantalla (filtro, semana, vista). No sube al inicio ni repite la animación de entrada,
// para que nada brinque (pedido de Julián, 25 nov 2026). render() a secas es cambiar de pantalla.
function render(soft) {
  soft = soft === true; const y = main.scrollTop;
  const [a, b, c] = location.hash.slice(2).split('/');
  const gh = GH.find(g => g.n == c), v = a === 'm' && (MODS[b] || MODS2[b]) ? (gh && gh.crop ? V[b](gh) : (V[b + 'Picker'] || V.picker)(b)) : (V[a] || V.home)();
  const cur = a === 'm' ? 'm/' + b : a === 'cycle' ? 'cycles' : (V[a] ? a : 'home'); // la página de un ciclo vive dentro de Cycles
  const link = ([href, name, ic, badge]) => `<a href="#/${href}"${href === cur ? ' aria-current="page"' : ''}>${icon(ic)}${name}${badge ? `<span class="badge" aria-label="${badge} need attention">${badge}</span>` : ''}</a>`;
  $('#side').innerHTML = `<div class="brand"><span class="brand-mark">${icon('sprout')}</span>Uniformity</div>${NAV.map((n, i) => link(i ? n : [...n, 3])).join('')}<h6>Operational modules</h6>${Object.entries({ ...MODS, ...MODS2 }).map(([k, m]) => link(['m/' + k, ...m])).join('')}<div class="who"><span class="avatar">MR</span>Marta Rivas</div>`;
  $('#top').innerHTML = `${v.back ? `<button class="back ico" data-action="go" data-href="${v.back[1]}" aria-label="Back to ${v.back[0]}" title="Back to ${v.back[0]}">${icon('back')}</button>` : ''}<div class="grow"><h1>${v.title}</h1>${v.sub ? `<div class="sub">${v.sub}</div>` : ''}</div>${v.actions || ''}`;
  const view = $('#view');
  view.classList.toggle('still', soft); view.innerHTML = v.html;
  if (!soft) { view.style.animation = 'none'; view.offsetWidth; view.style.animation = ''; }
  document.title = v.title + ' · Uniformity (mockup)';
  main.scrollTop = soft ? y : 0; closeMenu(); !soft && sheet.classList.contains('on') && closeSheet(); thumbs(); v.after && v.after();
}
addEventListener('hashchange', render);
addEventListener('resize', thumbs);
addEventListener('DOMContentLoaded', render);
