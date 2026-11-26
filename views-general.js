// Home, Weather, Calendar, Cycles. Datos inventados.

// ---------- Home ----------
// Contornos y números reales del rancho (leídos del Home de Uniformity el 17-nov-2026, precisión ±2 m). Estados y lecturas inventados.
const GEO = {
  11: [[20.939557, -100.665879], [20.939236, -100.664892], [20.941521, -100.664034], [20.941882, -100.664978]],
  12: [[20.942162, -100.665793], [20.939837, -100.666652], [20.939557, -100.665879], [20.941882, -100.664978]],
  13: [[20.942763, -100.667596], [20.941601, -100.668068], [20.941, -100.666265], [20.942162, -100.665836]],
  14: [[20.941601, -100.668068], [20.940479, -100.668497], [20.939878, -100.666738], [20.941, -100.666265]],
  15: [[20.939316, -100.666523], [20.937232, -100.667295], [20.936912, -100.666265], [20.938916, -100.66545]],
};
const ST = { crit: ['Critical', '#B3261E'], warn: ['Watch', '#D08A00'], ok: ['On track', NEWPAL ? '#46525A' : '#2D7A3E'], plain: ['No cycle', '#8A8F86'] };
const stOf = g => !g.crop ? 'plain' : g.st || 'ok';
// Mismo proveedor de teselas que usa Uniformity (Esri), para no pedirle esta zona a nadie más
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/', TILES = { Satellite: 'World_Imagery', Streets: 'World_Street_Map' };
const TABS = ['Overview', 'Details', 'Records', 'Summary'];
// Los registros del Home son los mismos que abren los módulos (views-modules.js), del más reciente al más antiguo
const recs = () => [
  ['pollination', 17, `Pollinated ${+n1(polOk(POLR.Both))} % · on target`],
  ['crop', 17, `Growth ${n1(cropAvg(1))} cm/week · in range`],
  ['irrigation', 17, `Drain ${n1(irrDrain)} % · in range`],
  ['applications', 16, `${PLAN.product} · ${STG[PLAN.stage - 1].toLowerCase()} · spray Wed, Nov 18`],
  ['pests', 16, `${PEST.name} · ${+n1(pestInc)} % of plants · follow-up ${PEST.follow}`],
  // Registros anteriores a esta semana, inventados, para poder probar "This month" y el rango de fechas en Home › Records
  ['irrigation', 13, 'Drain 24.1 % · in range', 'Nov 13 07:15'], ['crop', 12, 'Growth 17.9 cm/week · in range', 'Nov 12 07:50'],
  ['pollination', 10, 'Pollinated 88 % · on target', 'Nov 10 08:10'], ['pests', 9, 'Spider mite · 3 % of plants', 'Nov 9 08:00'],
  ['irrigation', 5, 'Drain 26.0 % · in range', 'Nov 5 07:05'], ['crop', 3, 'Growth 17.2 cm/week · in range', 'Nov 3 07:45'],
].map(([mod, day, line, when], i) => ({ mod, day, line, gh: 11, when: when || REC[mod].when, gps: RECGPS[i] }))
  .concat(RECX.map(([mod, day, line, when, gh, gps]) => ({ mod, day, line, gh, when, gps })))
  .sort((a, b) => b.day - a.day || b.when.slice(-5).localeCompare(a.when.slice(-5)));
// Más registros inventados del 2 al 14 nov en los invernaderos 11 a 14 (BD-254, 24 nov 2026), para que "This month" tenga muchos
// y se vea el agrupado por módulo. Todos son anteriores a esta semana: no cambian Overview, Details ni Summary.
// [módulo, día, renglón, día y hora, invernadero, punto GPS (null = sin GPS)]
const RECX = [
  ['irrigation', 14, 'Drain 23.8 % · in range', 'Nov 14 07:12', 12, [.5, .5]], ['crop', 14, 'Growth 17.6 cm/week · in range', 'Nov 14 07:40', 12, [.3, .6]],
  ['pests', 13, 'Whitefly · 2 % of plants', 'Nov 13 08:20', 14, [.6, .3]], ['irrigation', 13, 'Drain 27.4 % · in range', 'Nov 13 07:05', 13, null],
  ['applications', 12, 'Mitrex Oil · executed', 'Nov 12 06:30', 14, null], ['crop', 11, 'Growth 9.4 cm/week · in range', 'Nov 11 07:50', 13, [.4, .4]],
  ['pollination', 11, 'Pollinated 86 % · on target', 'Nov 11 08:15', 12, [.6, .7]], ['irrigation', 10, 'Drain 31.2 % · above target', 'Nov 10 07:10', 14, [.3, .3]],
  ['pests', 10, 'Spider mite · 4 % of plants', 'Nov 10 08:40', 12, null], ['crop', 9, 'Growth 11.2 cm/week · in range', 'Nov 9 07:45', 14, [.7, .6]],
  ['irrigation', 8, 'Drain 25.0 % · in range', 'Nov 8 07:00', 11, [.2, .8]], ['pollination', 7, 'Pollinated 84 % · below target', 'Nov 7 08:05', 11, null],
  ['crop', 7, 'Growth 16.9 cm/week · in range', 'Nov 7 07:30', 12, [.5, .2]], ['applications', 6, 'Vertimec · authorized', 'Nov 6 09:00', 11, null],
  ['irrigation', 6, 'Drain 22.1 % · in range', 'Nov 6 07:15', 12, [.45, .55]], ['pests', 5, 'Botrytis · 1 % of plants', 'Nov 5 08:30', 13, [.5, .6]],
  ['crop', 4, 'Growth 8.7 cm/week · in range', 'Nov 4 07:40', 13, null], ['irrigation', 3, 'Drain 26.3 % · in range', 'Nov 3 07:05', 14, [.6, .4]],
  ['pollination', 2, 'Pollinated 89 % · on target', 'Nov 2 08:10', 12, [.3, .5]], ['pests', 2, 'Spider mite · 2 % of plants', 'Nov 2 08:00', 11, [.65, .35]],
];
// Punto GPS de cada registro (fix 2.1, Jira BD-246). Julián, 24 nov 2026: los puntos se quieren siempre y van donde dicen sus
// coordenadas; solo el registro que no trae coordenadas se queda sin punto y lo dice. Posiciones inventadas: [u, v] dentro del
// contorno del invernadero; null = registro sin GPS.
const RECGPS = [[.25, .22], [.78, .42], null, null, [.35, .82], [.7, .25], null, [.25, .6], [.55, .4], null, [.4, .15]];
const recLL = r => { const [a, b, c, d] = GEO[r.gh], [u, v] = r.gps, k = i => (1 - u) * (1 - v) * a[i] + u * (1 - v) * b[i] + u * v * c[i] + (1 - u) * v * d[i]; return [k(0), k(1)]; };
// Dibuja en el mapa un punto por cada registro de la lista que tiene GPS; con la lista vacía los quita (al salir de Records)
function recPoints(list) {
  try { S.recLayer && S.recLayer.remove(); } catch (e) {}
  S.recLayer = null;
  if (!S.map || !window.L || !list.length) return;
  S.recLayer = L.layerGroup(list.filter(r => r.gps).map(r => L.circleMarker(recLL(r), { radius: 6, color: '#fff', weight: 2, fillColor: '#1B2A18', fillOpacity: 1 }).bindTooltip(`${MODS[r.mod][0]} · ${r.when}`))).addTo(S.map);
}
// Una fila de registro abre su reporte completo encima del Home, sin salir del mapa. gps = en Records, el que no tiene punto lo dice
const recLi = (r, g, gps) => `<li tabindex="0" data-action="report" data-mod="${r.mod}"><span class="ic">${icon(MODS[r.mod][1])}</span><span class="t"><b>${MODS[r.mod][0]}</b><span>${g ? '' : `Greenhouse ${r.gh} · `}${r.line}</span></span>${gps && !r.gps ? chip('plain', 'No GPS point') : ''}<span class="when">${r.when}</span><span class="go">${icon('chev')}</span></li>`;

// Tres propuestas de Home en la maqueta: C (nueva), B y A (intactas). Las tres usan el mismo mapa, las mismas cuatro pestañas y los mismos datos.
S.homeProp = 'C';
const HMP = { C: 'C · new', B: 'B', A: 'A' };
const homeSwitch = () => `<div class="toolbar wx-prop"><span>Mockup · Home proposal</span>${seg('homep', Object.values(HMP), HMP[S.homeProp])}</div>`;
SEG.homep = v => { S.homeProp = v[0]; render(true); };
V.home = () => ({ A: homeA, B: homeB, C: homeC })[S.homeProp]();

// Propuesta C: el mapa es la pantalla y el panel flota encima. Se entra a un invernadero desde la lista o el mapa y se sale con el botón de regreso.
const homeC = () => ({
  title: 'Home', sub: `${RANCH} · ${TODAY}`,
  html: `${homeSwitch()}
  <div class="card map-card home-c">
    <div class="map-wrap"><div id="map"></div></div>
    <div class="hc-tools"><button class="btn" data-action="fit">Recenter</button></div>
    <aside class="hc-panel" aria-label="Ranch and greenhouse information">
      <div id="hch"></div>
      ${seg('home', TABS, S.homeTab || 'Overview')}
      <div class="panel" id="panel"></div>
    </aside>
  </div>`,
  after: ranchMap,
});
function ghHead() {
  if (!$('#hch')) return;
  const g = GH.find(g => g.n === S.sel), k = g && stOf(g), att = GH.filter(g => g.st).length;
  $('#hch').innerHTML = `${g ? `<button class="back" data-action="unpick">${icon('back')}Whole ranch</button>` : ''}
    <div class="scope"><div><b>${g ? `Greenhouse ${g.n}` : 'Whole ranch'}</b>${g ? chip(k, ST[k][0]) : att ? chip('warn', `${att} need attention`) : chip('ok', 'On track')}<span>${!g ? `${GH.length} greenhouses · ${GH.filter(g => g.crop).length} with an active cycle` : g.crop ? `${g.crop} · day ${g.day} of ${g.of}` : 'No active cycle'}</span></div></div>`;
}
// La lista hace lo mismo que tocar el contorno: filas de 52 px en vez de atinarle a un polígono
const ghList = () => `<div class="card"><h2>Greenhouses</h2><ul class="list">${GH.map(g => { const k = stOf(g); return `<li tabindex="0" data-action="ghpick" data-n="${g.n}"><span class="ic num ${k}">${g.n}</span><span class="t"><b>Greenhouse ${g.n}</b><span>${g.crop ? `${g.crop} · day ${g.day} of ${g.of}` : 'No active cycle'}</span></span>${chip(k, ST[k][0])}<span class="go">${icon('chev')}</span></li>`; }).join('')}</ul></div>`;
// El panel tapa la izquierda del mapa: el encuadre deja los invernaderos en la parte libre
const fitPad = () => { const p = $('.hc-panel'); return p && getComputedStyle(p).position === 'absolute' ? { paddingTopLeft: [p.offsetWidth + 24, 56] } : {}; };
A.fit = () => S.map && S.map.flyToBounds(S.bounds, { duration: .6, animate: !matchMedia('(prefers-reduced-motion: reduce)').matches, ...fitPad() });

// Propuesta B: mapa arriba a todo lo ancho, tira de invernaderos siempre visible, pestañas abajo a todo lo ancho
const homeB = () => ({
  title: 'Home', sub: `${RANCH} · ${TODAY}`,
  html: `${homeSwitch()}
  <div class="home-b">
    <div class="card map-card">
      <div class="map-head"><h2>Ranch map</h2></div>
      <div class="map-wrap"><div id="map"></div><button class="btn map-btn" data-action="ranch">Whole ranch</button></div>
    </div>
    <div class="gh-strip" id="ghs" role="group" aria-label="Greenhouses"></div>
    ${seg('home', TABS, S.homeTab || 'Overview')}
    <div class="panel" id="panel"></div>
  </div>`,
  after: ranchMap,
});
// La tira hace lo mismo que tocar el contorno en el mapa: una segunda forma de elegir, con objetivos grandes
function ghStrip() {
  if (!$('#ghs')) return;
  const att = GH.filter(g => g.st).length;
  $('#ghs').innerHTML = `<button class="gh-b" data-action="ghpick" aria-pressed="${S.sel == null}"><em>Whole ranch</em><b>${GH.length}<span>greenhouses</span></b><small>${GH.filter(g => g.crop).length} with an active cycle</small>${att ? chip('warn', `${att} need attention`) : chip('ok', 'On track')}</button>`
    + GH.map(g => { const k = stOf(g); return `<button class="gh-b" data-action="ghpick" data-n="${g.n}" aria-pressed="${S.sel === g.n}"><em>Greenhouse</em><b>${g.n}</b><small>${g.crop || 'No active cycle'}</small><small>${g.crop ? `Day ${g.day} of ${g.of}` : 'Start a cycle to capture'}</small>${chip(k, ST[k][0])}</button>`; }).join('');
}
// En C la fila tocada desaparece al entrar: el foco pasa al botón de regreso para no perderse con teclado
A.ghpick = el => { pickGH(el.dataset.n ? +el.dataset.n : null); const b = $('#hch .back'); b && b.focus(); };

const homeA = () => ({
  title: 'Home', sub: `${RANCH} · ${TODAY}`,
  html: `${homeSwitch()}
  <div class="home">
    <div class="card map-card">
      <div class="map-head"><h2>Ranch map</h2></div>
      <div class="map-wrap"><div id="map"></div><button class="btn map-btn" data-action="ranch">Whole ranch</button></div>
      <div class="map-foot">${Object.keys(ST).map(k => `<span><i style="background:${ST[k][1]}"></i>${ST[k][0]} · ${GH.filter(g => stOf(g) === k).length}</span>`).join('')}</div>
    </div>
    <div class="home-col">${seg('home', TABS, S.homeTab || 'Overview')}<div class="panel" id="panel"></div></div>
  </div>`,
  after: ranchMap,
});

function ranchMap() {
  S.sel = null; homePanel();
  if (!window.L) { $('#map').innerHTML = '<p class="nodata" style="padding:20px">The map needs an internet connection to load its imagery.</p>'; return; }
  if (S.map) S.map.remove();
  const map = S.map = L.map('map', { scrollWheelZoom: false, zoomControl: false, zoomSnap: .25 });
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  let tiles;
  SEG.map = v => { S.mapMode = v; tiles && tiles.remove(); tiles = L.tileLayer(`${ESRI}${TILES[v]}/MapServer/tile/{z}/{y}/{x}`, { attribution: '© Esri', maxZoom: 19 }).addTo(map); };
  SEG.map('Satellite'); // el botón "Streets" se quitó del mapa (Julián, 24 nov 2026, Jira BD-248): el mapa queda siempre en satélite
  S.bounds = L.latLngBounds(Object.values(GEO).flat()).pad(.12);
  map.fitBounds(S.bounds, { animate: false, ...fitPad() });
  S.poly = GH.map(g => {
    const k = stOf(g), p = L.polygon(GEO[g.n], { color: '#fff', weight: 2, fillColor: ST[k][1], fillOpacity: .5 });
    // El contorno existe hasta que Leaflet lo agrega; el acceso por teclado se pone en ese momento
    p.on('add', () => {
      const el = p.getElement();
      el.setAttribute('tabindex', 0); el.setAttribute('role', 'button'); el.setAttribute('aria-label', `Greenhouse ${g.n}, ${ST[k][0]}`);
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickGH(g.n); } });
    }).addTo(map);
    // La etiqueta dice número y estado en todos, también On track (Julián, 24 nov 2026, BD-252)
    p.bindTooltip(`<i style="background:${ST[k][1]}"></i>${g.n} · ${ST[k][0]}`, { permanent: true, direction: 'center', className: 'gh-lbl' });
    p.on('click', () => pickGH(g.n));
    return p;
  });
}

// Seleccionar o quitar la selección no mueve el mapa; solo "Whole ranch" lo reencuadra
function pickGH(n) {
  S.sel = n;
  (S.poly || []).forEach((p, i) => {
    const on = GH[i].n === n, t = p.getTooltip().getElement(), el = p.getElement();
    p.setStyle({ weight: on ? 4 : 2, fillOpacity: n == null ? .5 : on ? .7 : .3 });
    t && t.classList.toggle('on', on); el && el.setAttribute('aria-pressed', on);
  });
  homePanel();
}

// "Pending application plans" del Summary (fix 2.4, Jira BD-241): una sola lista, sin grupos, el plan más reciente arriba. Los
// borradores (Draft) de más de 4 semanas se guardan detrás de "Older drafts (n)"; un "Submitted" o "Reviewed" nunca se esconde.
// Datos inventados: [invernadero, semana, estado, borrador viejo]. Hoy es 17 nov: viejo = semana anterior al 20 oct.
const PEND = [[12, 'Nov 16', 'Draft'], [11, 'Nov 9', 'Submitted'], [14, 'Nov 9', 'Draft'], [11, 'Nov 2', 'Reviewed'], [13, 'Oct 26', 'Draft'], [11, 'Oct 12', 'Draft', 1], [11, 'Oct 5', 'Reviewed'], [12, 'Sep 28', 'Submitted'], [13, 'Sep 21', 'Draft', 1], [11, 'Sep 7', 'Draft', 1], [12, 'Aug 24', 'Draft', 1]];
function pendPlans(g) {
  const all = PEND.filter(p => !g || p[0] === g.n), old = all.filter(p => p[3]);
  const li = p => `<li tabindex="0" data-action="go" data-href="#/m/applications/${p[0]}"><span class="t"><b>Greenhouse ${p[0]} · Week of ${p[1]}, 2026</b></span>${chip('plain', p[2])}<span class="go">${icon('chev')}</span></li>`;
  return `<div class="card"><h2>Pending application plans <span class="pend-n">${all.length}</span></h2>${all.length ? `<ul class="list">${all.filter(p => !p[3]).map(li).join('')}</ul>${old.length ? `<details class="older"><summary><span class="o">Older drafts (${old.length})</span><span class="h">Hide older drafts</span></summary><ul class="list">${old.map(li).join('')}</ul></details>` : ''}` : '<p class="nodata" style="margin:0">No pending plans.</p>'}</div>`;
}
// Las cuatro pestañas leen la misma selección del mapa: rancho completo o un invernadero
const HOME = {
  Overview: (g, list, mid = '') => {
    // Una fila por motivo, no por invernadero: el mismo aviso no se repite tres veces
    const att = GH.filter(x => x.st && (!g || x === g)), key = x => x.at + x.why, why = [...new Set(att.map(key))];
    return `<div class="card">${att.length ? `<h2>Needs attention</h2>
      <ul class="list">${why.map(w => { const xs = att.filter(x => key(x) === w), x = xs[0]; return `<li tabindex="0" data-action="go" data-href="#/m/${x.at}${xs.length > 1 ? '' : '/' + x.n}"><span class="ic ${x.st}">${icon(MODS[x.at][1])}</span><span class="t"><b>${x.why}</b><span>${g ? '' : `Greenhouse${xs.length > 1 ? 's' : ''} ${xs.map(x => x.n).join(', ')} · `}opens ${MODS[x.at][0]}</span></span>${chip(x.st, ST[x.st][0])}<span class="go">${icon('chev')}</span></li>`; }).join('')}</ul>`
      : `<h2>Nothing needs immediate attention</h2><p class="hint" style="margin:0">Today's readings are inside their target range.</p>`}</div>${mid}
    <div class="card"><h2>Latest by module</h2>
      <ul class="list">${Object.keys(MODS).map(m => { const r = list.find(r => r.mod === m); return r ? recLi(r, g) : `<li tabindex="0" data-action="go" data-href="#/m/${m}/${g.n}"><span class="ic">${icon(MODS[m][1])}</span><span class="t"><b>${MODS[m][0]}</b><span>No reports yet</span></span><span class="go">${icon('chev')}</span></li>`; }).join('')}</ul></div>`;
  },
  Details: (g, list) => {
    const pend = GH.filter(x => x.st && (!g || x === g)), worst = pend.some(x => x.st === 'crit') ? 'crit' : pend.length ? 'warn' : 'ok';
    const today = list.filter(r => r.day === 17), finds = list.filter(r => r.mod === 'pests');
    return `<div class="grid kpis">
      ${kpi('alert', 'Status', ST[worst][0], '', !pend.length ? 'Every reading inside its target' : g ? g.why : `${pend.length} greenhouses with a report pending today`)}
      ${kpi('check', 'Reports today', today.length, '', pend.length ? `Pending: ${MODS[pend[0].at][0]} in GH ${pend.map(x => x.n).join(', ')}` : 'Nothing pending')}
      ${kpi('calendar', 'Records this week', list.length, '', 'Week 47 · Nov 16 to 22')}
      ${kpi('bug', 'Open findings', finds.length, '', finds.length ? `${PEST.name} · GH 11 · ${LV[lv(pestInc)]}, ${+n1(pestInc)} % of plants` : 'No findings this week')}
    </div>
    <div class="card"><h2>Records by module</h2>
      ${rep(['Module', '>Records', '>Latest'], Object.keys(MODS).map(m => { const of = list.filter(r => r.mod === m); return [MODS[m][0], of.length, of[0] ? of[0].when : 'None']; }), ['Total', list.length, ''])}</div>`;
  },
  Records: () => `<div class="card"><div class="toolbar"><div class="rec-p">${seg('recp', RECP, S.recp || 'This week')}</div><div class="rec-dates" id="rec-dates" hidden><label><span>From</span><input class="input" type="date" id="rec-from" value="${S.recFrom || ''}" max="${S.recTo || RECMAX}"></label><label><span>To</span><input class="input" type="date" id="rec-to" value="${S.recTo || ''}" min="${S.recFrom || ''}" max="${RECMAX}"></label></div><span class="grow"></span><details class="msel" id="rec-mod"><summary class="select" aria-label="Filter by module">${recModTxt()}</summary><div class="msel-m">${Object.entries(MODS).map(([k, m]) => `<label><input type="checkbox" data-k="${k}"${(S.recOff || {})[k] ? '' : ' checked'}><i class="sq" style="background:${MC[k]}"></i>${m[0]}</label>`).join('')}<button type="button" data-action="recall">Select all</button></div></details></div><div id="recs"></div></div>`,
  Summary: (g, list) => {
    const has = m => list.find(r => r.mod === m);
    return `<div class="card"><h2>${MODS.pests[0]}</h2>${has('pests') ? `<p class="hint">Findings this week. The change against last week appears from the second scouting on.</p><ul class="list">${recLi(has('pests'), g)}</ul>` : '<p class="nodata" style="margin:0">No findings recorded this week.</p>'}</div>
    <div class="card"><h2>Applications</h2>${has('applications') ? `${meta([["This week's plan", `${PLAN.week.split(' · ')[0]} · ${STG[PLAN.stage - 1]}, step ${PLAN.stage} of 5`], ['Product', `${PLAN.product} · ${PLAN.dose} ${PROD[PLAN.product][2]}/L`], ['Next spray', `Wed, Nov 18 · 06:00${g ? '' : ' · Greenhouse 11'}`], ['Last application', 'None in the last 7 days'], ['Waiting for you', '0 plans']])}<button class="btn" data-action="report" data-mod="applications">Open plan</button>` : '<p class="nodata" style="margin:0">No treatment plan this week.</p>'}</div>${pendPlans(g)}
    <div class="card"><h2>Weather</h2>${meta([['Outside now', `${OUT.Temperature(0).toFixed(1)} °C · humidity ${OUT.Humidity(0).toFixed(0)} %`], ['Wind', `${OUT.Wind(0).toFixed(0)} km/h NW`], ['Tonight', `Frost risk: ${OUT.Temperature(wxCold()).toFixed(1)} °C at ${hh(wxCold())}`]])}<button class="btn" data-action="go" data-href="#/weather">Open Weather</button></div>`;
  },
};

function homePanel() {
  // Overview, Details y Summary siguen hablando de esta semana; los registros anteriores solo se ven en Records
  const g = GH.find(g => g.n === S.sel), k = g && stOf(g), list = recs().filter(r => r.day >= 16 && (!g || r.gh === g.n));
  // En B el alcance lo muestra la tira de invernaderos; en C, el encabezado del panel flotante; en A, este encabezado
  // En A el encabezado ya no lleva botón "Whole ranch" (Julián, 24 nov 2026): la selección se quita con el "Whole ranch" del mapa
  const c = $('#hch');
  $('#panel').scrollTop = 0;
  $('#panel').innerHTML = `${$('#ghs') || c ? '' : `<div class="scope"><div><b>${g ? `Greenhouse ${g.n}` : 'Whole ranch'}</b>${g ? chip(k, ST[k][0]) : ''}<span>${!g ? `${GH.length} greenhouses. Choose one on the map to narrow every tab.` : g.crop ? `${g.crop} · day ${g.day} of ${g.of}` : 'No active cycle'}</span></div></div>`}
    ${g && !g.crop ? `<div class="banner" style="flex-wrap:wrap"><span>Reports cannot be captured here until a cycle starts.</span><button class="btn" data-action="go" data-href="#/cycles">Start a cycle</button></div>` : HOME[S.homeTab || 'Overview'](g, list, c && !g ? ghList() : '')}`;
  $('#recs') ? recList() : recPoints([]);
  ghStrip(); ghHead();
  thumbs();
}
function recList() {
  // Módulos: una lista desplegable, como antes, pero con casillas para elegir varios a la vez (pedido de Julián, 24 nov 2026).
  // Todos marcados al entrar. Si alguien los desmarca todos o se queda sin registros, el texto dice qué está filtrado y hay
  // un botón para verlo todo. El botón de la lista siempre dice qué hay elegido, aunque esté cerrada.
  const g = GH.find(g => g.n === S.sel), p = S.recp || 'This week', off = S.recOff = S.recOff || {};
  const on = Object.keys(MODS).filter(k => !off[k]), m = on.length === Object.keys(MODS).length ? 'all modules' : on.length ? on.map(k => MODS[k][0]).join(', ') : 'no module selected';
  // Periodo: hoy, esta semana, este mes o un rango de fechas (pedido de Julián, 24 nov 2026). El rango son días completos y se
  // aplica solo, sin botón. Errores de la persona: "To" no deja elegir un día anterior a "From" ni posterior a hoy; si falta
  // una fecha o quedan al revés, en lugar de una lista vacía se dice qué falta.
  const f = S.recFrom, t = S.recTo, dates = p === 'Dates', dstr = r => `2026-11-${String(r.day).padStart(2, '0')}`, dfmt = s => new Date(s + 'T12:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  $('#rec-dates').hidden = !dates;
  const miss = !dates ? '' : !f && !t ? 'Choose a from date and a to date.' : !f ? 'Choose a from date.' : !t ? 'Choose a to date.' : t < f ? 'The end must be after the start.' : '';
  if (miss) { recPoints([]); $('#recs').innerHTML = `<p class="nodata" style="margin:14px 0 4px">${miss}</p>`; return; }
  const inP = r => p === 'Today' ? r.day === 17 : p === 'This week' ? r.day >= 16 : dates ? dstr(r) >= f && dstr(r) <= t : true, pTxt = dates ? `${dfmt(f)} to ${dfmt(t)}` : p.toLowerCase();
  const list = recs().filter(r => (!g || r.gh === g.n) && inP(r) && !off[r.mod]);
  recPoints(list);
  $('#recs').innerHTML = list.length ? `<p class="hint" style="margin:4px 0">${list.length} record${list.length > 1 ? 's' : ''}${dates ? ` · ${pTxt}` : ''}${m === 'all modules' ? '' : ` in ${m}`} · ${list.filter(r => r.gps).length} with GPS point, shown on the map.${list.some(r => !r.gps) ? ' Records without a GPS point are not drawn on the map.' : ''} Each one opens its full report.</p>${p === 'This month' || dates ? recGroups(list, g) : `<ul class="list">${list.map(r => recLi(r, g, 1)).join('')}</ul>`}`
    : `<p class="nodata" style="margin:14px 0 12px">No records for ${g ? `Greenhouse ${g.n}` : 'the ranch'} · ${pTxt} · ${m}.</p><button class="btn" data-action="recreset">Show all records</button>`;
}
const RECP = ['Today', 'This week', 'This month', 'Dates'], RECMAX = '2026-11-17'; // hoy en la maqueta
// H8 (idea de Julián, 24 nov 2026): con un mes o un rango de fechas los registros se juntan por módulo. Un renglón por módulo con
// cuántos hay y, a la derecha, el último; clic despliega sus registros; clic en uno abre su reporte. Va primero el módulo con el
// registro más reciente. Con Today y This week la lista sigue suelta.
const recGroups = (list, g) => `<div class="recg-list">${[...new Set(list.map(r => r.mod))].map(k => { const rs = list.filter(r => r.mod === k);
  return `<details class="recg"><summary><span class="ic">${icon(MODS[k][1])}</span><span class="t"><b>${MODS[k][0]}</b><span>${rs.length} record${rs.length > 1 ? 's' : ''}</span></span><span class="when">Latest ${rs[0].when}</span><span class="go">${icon('chev')}</span></summary><ul class="list">${rs.map(r => recSub(r, g)).join('')}</ul></details>`; }).join('')}</div>`;
// Registro dentro de un grupo: el módulo ya lo dice el grupo, así que el renglón empieza por día y hora; con todo el rancho dice el invernadero
const recSub = (r, g) => `<li tabindex="0" data-action="report" data-mod="${r.mod}"><span class="t"><b>${r.when}</b><span>${g ? '' : `Greenhouse ${r.gh} · `}${r.line}</span></span>${r.gps ? '' : chip('plain', 'No GPS point')}<span class="go">${icon('chev')}</span></li>`;
document.addEventListener('change', e => {
  if (e.target.id !== 'rec-from' && e.target.id !== 'rec-to') return;
  S.recFrom = $('#rec-from').value; S.recTo = $('#rec-to').value;
  $('#rec-to').min = S.recFrom; $('#rec-from').max = S.recTo || RECMAX; recList();
});
// Texto del botón de la lista: "All modules", los nombres si son uno o dos, o "3 modules"
function recModTxt() { const off = S.recOff || {}, on = Object.keys(MODS).filter(k => !off[k]); return on.length === Object.keys(MODS).length ? 'All modules' : !on.length ? 'No modules' : on.length < 3 ? on.map(k => MODS[k][0]).join(', ') : `${on.length} modules`; }
const recModSync = () => { $('#rec-mod > summary').textContent = recModTxt(); $$('#rec-mod input').forEach(i => { i.checked = !S.recOff[i.dataset.k]; }); recList(); };
document.addEventListener('change', e => { if (!e.target.matches('#rec-mod input')) return; S.recOff[e.target.dataset.k] = !e.target.checked; recModSync(); });
A.recall = () => { S.recOff = {}; recModSync(); };
// La lista se cierra al hacer clic fuera o con Escape
document.addEventListener('click', e => $$('details.msel[open]').forEach(d => { if (!d.contains(e.target)) d.open = false; }));
document.addEventListener('keydown', e => e.key === 'Escape' && $$('details.msel[open]').forEach(d => { d.open = false; $('summary', d).focus(); }));
// Al abrir, la lista no se debe cortar: si se sale por la izquierda del panel que la contiene se alinea a la izquierda del botón,
// y si queda debajo de lo visible la pantalla se desplaza lo necesario para verla completa.
document.addEventListener('toggle', e => {
  const d = e.target; if (!d.matches || !d.matches('details.msel') || !d.open) return;
  const m = $('.msel-m', d); m.classList.remove('l');
  let el = d.parentElement; while (el && el !== document.body && !/(auto|hidden|scroll)/.test(getComputedStyle(el).overflowX + getComputedStyle(el).overflowY)) el = el.parentElement;
  const box = (el && el !== document.body ? el : document.documentElement).getBoundingClientRect();
  if (m.getBoundingClientRect().left < box.left + 4) m.classList.add('l');
  m.scrollIntoView({ block: 'nearest' });
}, true);
SEG.home = v => { S.homeTab = v; homePanel(); };
SEG.recp = v => { S.recp = v; recList(); v === 'Dates' && !S.recFrom && $('#rec-from').focus(); };
A.recreset = () => { S.recp = 'This week'; S.recOff = {}; S.recFrom = S.recTo = ''; pickGH(null); };
A.unpick = () => { const n = S.sel; pickGH(null); const li = $(`#panel [data-action="ghpick"][data-n="${n}"]`); li && li.focus(); };
A.ranch = () => { pickGH(null); A.fit(); };

// ---------- Weather ----------
const HRS = [...Array(25).keys()], wave = h => Math.sin((h - 9) / 24 * 2 * Math.PI);
const WX = [
  { name: 'Temperature', unit: '°C', color: 'var(--c-temp)', min: 5, max: 35, data: HRS.map(h => +(16 + 9 * wave(h)).toFixed(1)) },
  { name: 'Humidity', unit: '%', color: 'var(--c-hum)', min: 20, max: 100, data: HRS.map(h => Math.round(66 - 24 * wave(h))) },
  { name: 'Radiation', unit: 'W/m²', color: 'var(--c-rad)', min: 0, max: 1000, data: HRS.map(h => Math.round(Math.max(0, 860 * Math.sin((h - 6.500) / 11.500 * Math.PI)))) },
];
function drawWx() {
  const on = WX.filter(s => S.wx[s.name]);
  $('#wx').innerHTML = !on.length ? '<p class="nodata">Turn on at least one variable.</p>'
    : S.wxMode === 'Stacked' ? on.map(s => `<div class="chart-title">${s.name}<span>${s.unit}</span></div>${chart([s], 130)}`).join('')
    : chart(on, 280) + `<p class="hint" style="margin:8px 0 0">Each line uses its own scale (axis of the same color). Where two lines cross has no meaning.</p>`;
}
SEG.wx = v => { S.wxMode = v; drawWx(); };
A.wxv = el => { const k = el.dataset.k; S.wx[k] = !S.wx[k]; el.setAttribute('aria-pressed', S.wx[k]); drawWx(); };
A.rules = () => openSheet(S.wxProp === 'C' ? 'References · alert rules' : 'Alert rules',
  `<p class="hint" style="color:var(--ink-2);font-size:13px">One rule per variable. An alert appears at the top of Weather and on Home while the forecast or the reading is outside the range.</p>
   ${[['Temperature', '4', '32', '°C'], ['Humidity', '45', '90', '%'], ['Wind', '0', '45', 'km/h']].map(r => `<div class="field"><span>${r[0]} (${r[3]})</span><div style="display:flex;gap:8px;align-items:center"><input class="input" value="${r[1]}" inputmode="decimal" aria-label="${r[0]} minimum"><span style="margin:0;font-weight:400;color:var(--ink-2)">to</span><input class="input" value="${r[2]}" inputmode="decimal" aria-label="${r[0]} maximum"></div></div>`).join('')}
   ${field('Applies to', select(['All greenhouses', ...(S.wxProp === 'C' ? WGH.map(g => g.n) : [11, 12, 13, 14, 15]).map(n => 'Greenhouse ' + n)]))}`,
  `<span class="msg">Changes apply from the next reading.</span><button class="btn" data-action="close">Cancel</button><button class="btn primary" data-action="close">Save</button>`);
// Tres propuestas de Weather en la maqueta: C (nueva), B y A (las anteriores, intactas)
const WXP = { C: 'C · new', B: 'B', A: 'A' };
const wxSwitch = () => `<div class="toolbar wx-prop"><span>Mockup · Weather proposal</span>${seg('wxp', Object.values(WXP), WXP[S.wxProp])}</div>`;
SEG.wxp = v => { S.wxProp = v[0]; render(true); };
V.weather = () => ({ A: weatherA, B: weatherB, C: weatherC })[S.wxProp]();
const weatherA = () => ({
  title: 'Weather', sub: `${RANCH} · updated 2 min ago`,
  actions: `<button class="btn" data-action="rules">${icon('bell')}Alert rules</button>`,
  html: `${wxSwitch()}
  <div class="banner crit">${icon('alert')}<span><b>Frost risk tonight.</b> 1 °C forecast at 05:00. Greenhouses 13 and 14 fall below their 4 °C limit.</span><button class="btn" data-action="rules">See rule</button></div>
  <div class="grid kpis">
    ${kpi('cloud', 'Temperature', '24.1', '°C', 'Today 7 to 25 °C', range(4, 32, 24.1, -5, 45))}
    ${kpi('drop', 'Humidity', '58', '%', 'Inside 45 to 90 %', range(45, 90, 58, 0, 100))}
    ${kpi('clock', 'Radiation', '742', 'W/m²', 'Sum today 14.2 MJ/m²')}
    ${kpi('cycle', 'Wind', '11', 'km/h NW', 'Gusts 19 km/h', range(0, 45, 11, 0, 80))}
  </div>
  <div class="card" style="margin-bottom:14px">
    <div class="toolbar"><h2 style="margin:0">Last 24 hours</h2><span class="grow"></span>${seg('wx', ['Stacked', 'Three axes'], S.wxMode)}</div>
    <div class="legend">${WX.map(s => `<button data-action="wxv" data-k="${s.name}" aria-pressed="${S.wx[s.name]}"><i style="background:${s.color}"></i>${s.name} · ${s.unit}</button>`).join('')}</div>
    <div id="wx"></div>
  </div>
  <div class="card table-card"><h2>Inside the greenhouses</h2><p class="hint" style="padding:0 12px">From the climate computer, against each greenhouse's setpoint.</p>
    ${table('climate', ['Greenhouse', '>Temp °C', '>Setpoint', '>Humidity %', '>CO₂ ppm', 'Status'], GH.filter(g => g.crop).map((g, i) => [`Greenhouse ${g.n}`, (22.4 + i * .7).toFixed(1), '23.0', 71 - i * 2, 640 + i * 35, i === 4 ? chip('warn', '+2.2 °C over setpoint') : chip('ok', 'On setpoint')]))}
  </div>`,
  after: drawWx,
});

// ---------- Weather, propuesta B: afuera contra adentro ----------
// Un solo modelo inventado alimenta toda la pantalla, para que los números cuadren entre sí. t = horas desde ahora (martes 14:00).
Object.assign(S, { wxProp: 'C', wxVar: 'Temperature', wxPast: 1, wxFc: 2, wxGH: 11, wxcVar: 'Temperature', wxcR: '48 hours' });
const NOW_H = 14, DAYN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], H24 = [...Array(24).keys()];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), hod = t => ((NOW_H + t) % 24 + 24) % 24, dayOf = t => Math.floor((NOW_H + t) / 24);
const dayName = d => d ? DAYN[((2 + d) % 7 + 7) % 7] : 'Today', hh = t => String(hod(t)).padStart(2, '0') + ':00', when = t => `${dayName(dayOf(t))} ${hh(t)}`;
const jit = t => .5 * Math.sin(t * 1.7) + .7 * Math.sin(t * .37 + 1);
const front = t => -6 * clamp(t / 10, 0, 1) * clamp((60 - t) / 24, 0, 1); // frente frío: entra esta noche, sale el jueves
const SKY = ['Partly cloudy', 'Clear', 'Cloudy', 'Rain', 'Partly cloudy'], SUN = { Clear: 1, 'Partly cloudy': .8, Cloudy: .45, Rain: .25 }, RAIN = [10, 0, 20, 70, 30];
const sky = t => SKY[dayOf(t)] || 'Partly cloudy';
const skyIcon = (t, s = sky(t)) => s === 'Rain' ? 'rain' : s === 'Cloudy' ? 'cloud' : hod(t) < 7 || hod(t) >= 19 ? 'moon' : s === 'Clear' ? 'sun' : 'suncloud';
const OUT = {
  Temperature: t => { const w = wave(hod(t)); return 16 + 9 * w * (w > 0 ? .55 + .45 * SUN[sky(t)] : 1) + front(t) + .4 * jit(t); }, // día nublado: máxima más baja
  Humidity: t => clamp(66 - 24 * wave(hod(t)) + 2 * jit(t), 20, 100),
  Radiation: t => Math.max(0, 860 * Math.sin((hod(t) - 6.5) / 11.5 * Math.PI)) * SUN[sky(t)],
  Wind: t => Math.max(0, 10 + 5 * wave(hod(t) - 6) + 2.5 * jit(t * 1.3) - 1.2 * front(t)),
};
const IN = { // k = invernadero - 11
  Temperature: (t, k) => 21 + 3 * wave(hod(t) - 1) + .9 * k + .12 * front(t) + .2 * jit(t + k),
  Humidity: (t, k) => 72 - 8 * wave(hod(t)) - 1.5 * k + jit(t + k),
  Radiation: t => OUT.Radiation(t) * .68,
};
const WB = {
  Temperature: { u: '°C', c: 'var(--c-temp)', lo: -5, hi: 35, d: 1, rules: [4, 32] },
  Humidity: { u: '%', c: 'var(--c-hum)', lo: 20, hi: 100, d: 0, rules: [45, 90] },
  Radiation: { u: 'W/m²', c: 'var(--c-rad)', lo: 0, hi: 1000, d: 0 },
  Wind: { u: 'km/h', c: 'var(--c-wind)', lo: 0, hi: 60, d: 0, rules: [45] },
};
const wxCold = () => { let c = 1; for (let t = 2; t <= 24; t++) if (OUT.Temperature(t) < OUT.Temperature(c)) c = t; return c; }; // hora más fría de las próximas 24
const OFF = { 13: -28 }, SET = [18, 26]; // sensor del 13 sin señal desde hace 28 h; rango objetivo interior

function drawWxB() {
  const name = S.wxVar, v = WB[name], P = S.wxPast * 24, F = S.wxFc * 24, n = S.wxGH, k = n - 11, end = OFF[n] || 0, fin = IN[name], fout = OUT[name];
  const W = 760, H = 280, L = 38, R = 12, T0 = 24, B = 26, pw = W - L - R, ph = H - T0 - B;
  const x = t => L + pw * (t + P) / (P + F), y = val => T0 + ph * (1 - (val - v.lo) / (v.hi - v.lo));
  const path = (f, a, b) => { let d = ''; for (let t = a; t <= b; t++) d += `${d ? 'L' : 'M'}${x(t).toFixed(1)} ${y(f(t)).toFixed(1)}`; return d; };
  let o = `<svg class="chart" id="wxb-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${name}: inside Greenhouse ${n} against outside, past ${P / 24} days and forecast ${F / 24} days">
    <rect class="fc" x="${x(0)}" y="${T0}" width="${x(F) - x(0)}" height="${ph}"/><text x="${x(0) - 8}" y="${T0 - 8}" text-anchor="end">Measured</text><text x="${x(0) + 8}" y="${T0 - 8}">Forecast</text>`;
  for (let i = 0; i <= 4; i++) { const val = v.hi - (v.hi - v.lo) * i / 4; o += `<line class="gl" x1="${L}" x2="${W - R}" y1="${y(val)}" y2="${y(val)}"/><text x="${L - 6}" y="${y(val) + 4}" text-anchor="end">${+val.toFixed(1)}</text>`; }
  for (let t = -P; t <= F; t++) {
    const h = hod(t), wide = P + F > 96;
    if (!h) o += `<line class="gl day" x1="${x(t)}" x2="${x(t)}" y1="${T0}" y2="${T0 + ph}"/>`;
    if (wide ? h === 12 : !(h % 6) && t > -P && t < F) o += `<text x="${x(t)}" y="${H - 6}" text-anchor="middle"${wide || !h ? ' style="font-weight:600;fill:var(--ink)"' : ''}>${wide || !h ? dayName(dayOf(t)) : hh(t)}</text>`;
  }
  (v.rules || []).forEach(r => { o += `<line class="rule" x1="${L}" x2="${W - R}" y1="${y(r)}" y2="${y(r)}"/><text class="rule-t" x="${W - R - 4}" y="${y(r) - 5}" text-anchor="end">Alert rule ${r} ${v.u}</text>`; });
  o += `<line class="now" x1="${x(0)}" x2="${x(0)}" y1="${T0 - 4}" y2="${T0 + ph}"/><path class="wxo" stroke="${v.c}" d="${path(fout, -P, F)}"/>`;
  if (fin && end >= -P) o += `<path class="ln" pathLength="1" stroke="${v.c}" d="${path(t => fin(t, k), -P, end)}"/>`;
  if (fin && end < 0) o += end >= -P ? `<circle cx="${x(end)}" cy="${y(fin(end, k))}" r="4" fill="var(--warn)"/><text x="${x(end) + 8}" y="${y(fin(end, k)) - 8}" class="off-t">No signal since ${when(end)}</text>`
    : `<text x="${L + 10}" y="${T0 + 18}" class="off-t">No interior readings in this period: sensor without signal since ${when(end)}</text>`;
  o += `<line class="cur" id="wxb-cur" y1="${T0}" y2="${T0 + ph}"/></svg>`;
  $('#wxb').innerHTML = `<div class="legend">${fin ? `<span><i style="background:${v.c}"></i>Inside · Greenhouse ${n}</span>` : '<span>No interior wind sensor</span>'}<span><i class="dash" style="color:${v.c}"></i>Outside</span><span class="read" id="wxb-read"></span></div>${o}`;
  const read = t => {
    const a = !fin ? '' : t > 0 ? '' : t <= end ? `Inside ${fin(t, k).toFixed(v.d)} ${v.u}` : 'Inside: no reading';
    $('#wxb-read').textContent = [t ? when(t) : 'Now', a, `Outside ${fout(t).toFixed(v.d)} ${v.u}${t > 0 ? ' (forecast)' : ''}`].filter(Boolean).join(' · ');
  };
  const svg = $('#wxb-svg'), cur = $('#wxb-cur');
  svg.onpointermove = e => { const r = svg.getBoundingClientRect(), t = clamp(Math.round(((e.clientX - r.left) / r.width * W - L) / pw * (P + F) - P), -P, F); cur.setAttribute('x1', x(t)); cur.setAttribute('x2', x(t)); cur.style.visibility = 'visible'; read(t); };
  svg.onpointerleave = () => { cur.style.visibility = 'hidden'; read(0); };
  read(0);
}
SEG.wxv = v => { S.wxVar = v; drawWxB(); };
A.wxgh = el => { S.wxGH = +el.dataset.n; $$('.wx-in').forEach(b => b.setAttribute('aria-pressed', b === el)); drawWxB(); };
A.sensors = () => toast('Manage sensors opens the same screen as today');
A.priva = () => toast('Import PRIVA CSV works as today; it only moves to the bottom');
document.addEventListener('change', e => { const m = { 'wxb-p': 'wxPast', 'wxb-f': 'wxFc', 'wxc-p': 'wxPast' }[e.target.id]; if (m) { S[m] = parseInt(e.target.value); $('#wxb') ? drawWxB() : drawWxC(); } });
// Avisos y fuentes de datos: los mismos en B y en C
// #22: "Hide alerts" las esconde mientras sigas en Weather (pestañas y filtros incluidos); al volver de otra pantalla se abren otra vez.
// Error que se evita: olvidar una helada escondida. Escondidas, queda un renglón que dice cuántas son y de qué.
S.wxHide = false;
addEventListener('hashchange', () => { S.wxHide = false; S.wxF = 'All'; }, true); // antes que render(), para que al llegar ya estén abiertas
A.wxhide = () => { S.wxHide = !S.wxHide; render(true); };
const wxAlerts = () => S.wxHide ? `<div class="wx-alh">${icon('alert')}<span><b>2 alerts hidden</b> · Frost risk tonight · Greenhouse 13 sensor has no signal</span><button class="btn" data-action="wxhide">Show alerts</button></div>` : `<div class="wx-alb"><span>2 alerts</span><button class="lnk" data-action="wxhide">Hide alerts</button></div>` + wxBanners();
const wxBanners = () => { const c = wxCold(); return `<div class="banner crit">${icon('alert')}<span><b>Frost risk tonight.</b> Outside forecast ${OUT.Temperature(c).toFixed(1)} °C at ${when(c)}, below the 4 °C alert rule.</span><button class="btn" data-action="rules">See rule</button></div>
  <div class="banner">${icon('alert')}<span><b>Greenhouse 13 sensor has no signal.</b> Last reading ${when(OFF[13])}. Check its power and Wi-Fi.</span><button class="btn" data-action="sensors">Manage sensors</button></div>`; };
const wxSources = () => `<div class="card">
    <h2>Data sources</h2>
    <div class="wx-src"><b>Outside station and forecast</b><span>Updated 2 min ago</span>${chip('ok', 'Online')}</div>
    <div class="wx-src"><b>Interior sensors</b><span>${S.wxProp === 'C' ? '17 of 18' : '3 of 4'} with signal · Greenhouse 13 since ${when(OFF[13])}</span><button class="btn" data-action="sensors">Manage sensors</button></div>
    <div class="wx-src"><b>PRIVA climate</b><span>Optional CSV source, saved by greenhouse. No files imported yet.</span><button class="btn" data-action="priva">Import PRIVA CSV</button></div>
  </div>`;

const weatherB = () => {
  const T = OUT.Temperature, today = H24.map(h => h - NOW_H), tt = today.map(T), hi = Math.max(...tt), lo = Math.min(...tt);
  const cold = wxCold();
  const days = [0, 1, 2, 3, 4].map(d => { const ts = H24.map(h => d * 24 + h - NOW_H), v = ts.map(T), l = Math.min(...v); return { d, lo: l, hi: Math.max(...v), at: ts[v.indexOf(l)], j: Math.round(ts.reduce((s, t) => s + OUT.Radiation(t), 0) * .36) }; }); // W/m² por hora a J/cm²: x 3600 / 10 000
  const g0 = Math.min(...days.map(d => d.lo)), g1 = Math.max(...days.map(d => d.hi)), pc = v => (v - g0) / (g1 - g0) * 100;
  const opt = (id, cur, list) => `<select class="select" id="${id}" aria-label="${id === 'wxb-p' ? 'Past days' : 'Forecast days'}">${list.map(n => `<option value="${n}"${n === cur ? ' selected' : ''}>${id === 'wxb-p' ? 'Past' : 'Forecast'} ${n} ${n > 1 ? 'days' : 'day'}</option>`).join('')}</select>`;
  return {
    title: 'Weather', sub: `${RANCH} · outside updated 2 min ago`,
    actions: `<button class="btn" data-action="sensors">Manage sensors</button><button class="btn" data-action="rules">${icon('bell')}Alerts</button>`,
    html: `${wxSwitch()}${wxAlerts()}
  <div class="grid wx-top">
    <div class="card wx-now">
      <div class="lbl">Outside now · weather station</div>
      <div class="wx-big">${icon(skyIcon(0))}<b>${T(0).toFixed(1)}</b><small>°C</small></div>
      <div class="wx-cond">${sky(0)} · today ${lo.toFixed(0)} to ${hi.toFixed(0)} °C</div>
      <dl class="wx-stats">${[['Humidity', OUT.Humidity(0).toFixed(0), '%'], ['Wind', OUT.Wind(0).toFixed(0), 'km/h NW'], ['Radiation', OUT.Radiation(0).toFixed(0), 'W/m²'], ['UV index', Math.round(OUT.Radiation(0) / 110), '']].map(s => `<div><dt>${s[0]}</dt><dd>${s[1]}<small>${s[2]}</small></dd></div>`).join('')}</dl>
    </div>
    <div class="card">
      <h2>Inside now</h2><p class="hint">Interior sensors against the outside. The bar is the ${SET[0]} to ${SET[1]} °C target. Select a greenhouse to chart it below.</p>
      ${GH.filter(g => g.crop).map(g => {
        const k = g.n - 11, t = OFF[g.n] || 0, ti = IN.Temperature(t, k), d = ti - T(0), over = ti > SET[1] ? ti - SET[1] : ti < SET[0] ? ti - SET[0] : 0;
        return `<button class="wx-in${t ? ' off' : ''}" data-action="wxgh" data-n="${g.n}" aria-pressed="${S.wxGH === g.n}"><span class="l"><b>Greenhouse ${g.n}</b><small>${g.crop}</small>${t ? chip('warn', `No signal since ${when(t)}`) : over ? chip('warn', `${Math.abs(over).toFixed(1)} °C ${over > 0 ? 'over' : 'under'} target`) : chip('ok', 'In target')}</span><span class="l"><b class="v">${ti.toFixed(1)} °C</b><small>${t ? 'Last reading' : `${d > 0 ? '+' : '−'}${Math.abs(d).toFixed(1)} °C vs outside`}</small>${range(SET[0], SET[1], ti, 10, 34, over ? 'warn' : '')}<span class="h">${IN.Humidity(t, k).toFixed(0)} % RH</span></span></button>`;
      }).join('')}
    </div>
  </div>
  <div class="card" style="margin-bottom:14px">
    <div class="toolbar"><h2 style="margin:0">Next 24 hours</h2><span class="sub">Outside forecast</span></div>
    <div class="wx-hours">${[...Array(12).keys()].map(i => { const t = i * 2, c = Math.round(T(t)) < 4; return `<div${c ? ' class="cold"' : ''}><span>${t ? hh(t) : 'Now'}</span>${icon(skyIcon(t))}<b>${T(t).toFixed(0)}°</b><span>${RAIN[dayOf(t)]} %</span>${c ? '<em>Below 4 °C</em>' : ''}</div>`; }).join('')}</div>
  </div>
  <div class="card" style="margin-bottom:14px">
    <div class="toolbar"><h2 style="margin:0">Inside against outside</h2><span class="grow"></span>${opt('wxb-p', S.wxPast, [1, 3, 7])}${opt('wxb-f', S.wxFc, [2, 5])}</div>
    <div class="toolbar">${seg('wxv', Object.keys(WB), S.wxVar)}</div>
    <div id="wxb"></div>
  </div>
  <div class="card" style="margin-bottom:14px">
    <h2>Next 5 days</h2><p class="hint">Outside forecast, with chance of rain and the daily radiation sum.</p>
    ${days.map(d => `<div class="wx-day"><b>${dayName(d.d)}</b><span class="c" title="${SKY[d.d]}">${icon(skyIcon(d.d * 24 - 2, SKY[d.d]))}<span>${SKY[d.d]}</span></span><span class="t lo">${d.lo.toFixed(0)}°</span><div class="range"><i class="band" style="left:${pc(d.lo)}%;width:${pc(d.hi) - pc(d.lo)}%"></i></div><span class="t">${d.hi.toFixed(0)}°</span><span class="m"><span>${RAIN[d.d]} % rain</span><span>${d.j.toLocaleString('en-US')} J/cm²</span>${d.lo < 4 ? chip('crit', `Below 4 °C at ${hh(d.at)}`) : ''}</span></div>`).join('')}
  </div>
  ${wxSources()}`,
    after: drawWxB,
  };
};

// ---------- Weather, propuesta C (rehecha el 25 nov 2026 con la tanda #1 a #17 de Julián) ----------
// Dos pestañas (#11): Interior, con una tarjeta por invernadero que se abre y se cierra y una gráfica de 3 ejes; y Exterior, con
// la gráfica tipo "Hourly conditions" de la app real, un invernadero para comparar y el pronóstico simplificado. Datos inventados.
Object.assign(S, { wxTab: 'Interior', wxShut: [], wxE: { past: 1, fc: 5, on: ['temp', 'hum', 'wind'], ins: ['itemp'], gh: [] }, wxDet: false });
// #3: 18 invernaderos. 11 a 15 son los reales de la maqueta; los demás son inventados para ver la pantalla a tamaño real.
const WCROP = ['Tomato · Roma', 'Tomato · Cherry', 'Strawberry · Albion', 'Cucumber · Persian', 'Pepper · Bell'];
const WGH = Array.from({ length: 18 }, (_, i) => { const n = i + 1, g = GH.find(x => x.n === n); return { n, crop: g ? g.crop : WCROP[n % 5] }; });
const kOff = n => n === 14 ? 3.4 : n === 6 ? -2.6 : ((n * 37) % 9 - 4) * .3; // el 14 se pasa del objetivo, el 6 se enfría de noche; los demás varían poco
const INC = { // inventado: la computadora de clima sostiene la noche cerca de 19.5 °C, así solo destacan los casos especiales
  Temperature: (t, n) => 22 + 2.5 * wave(hod(t) - 1) + kOff(n) + .12 * front(t) + .2 * jit(t + n),
  Humidity: (t, n) => clamp(72 - 8 * wave(hod(t)) - 1.5 * kOff(n) + jit(t + n), 30, 100),
  Radiation: (t, n) => OUT.Radiation(t) * (.62 + (n % 4) * .03),
};
const AX3 = [
  { k: 'Temperature', u: '°C', c: 'var(--c-temp)', lo: -5, hi: 35, d: 1 },
  { k: 'Humidity', u: '%', c: 'var(--c-hum)', lo: 0, hi: 100, d: 0 },
  { k: 'Radiation', u: 'W/m²', c: '#7A4E9A', lo: 0, hi: 1000, d: 0 }, // morado: el dorado de siempre se confunde con el naranja de la temperatura
];
// #8: eje de tiempo. Hasta 48 h, la hora (cada 3 o 6 h) y el día en cada medianoche; con más días, el nombre de cada día al centro.
const dayLbl = d => d === 0 ? 'Today' : d === -1 ? 'Yesterday' : d === 1 ? 'Tomorrow' : `${DAYN[((2 + d) % 7 + 7) % 7]} ${nd(TD + d).getDate()}`;
const tLbl = t => `${dayLbl(dayOf(t))} ${hh(t)}`;
function tAxis(a, b, x, top, bot) {
  const span = b - a, x0 = x(a), x1 = x(b); let o = '';
  for (let t = a; t <= b; t++) {
    const h = hod(t), X = x(t);
    if (!h && t > a) o += `<line class="gl day" x1="${X}" x2="${X}" y1="${top}" y2="${bot}"/>`;
    if (span <= 48 && !(h % (span <= 24 ? 3 : 6)) && X - x0 > 22 && x1 - X > 22) o += `<text x="${X}" y="${bot + 17}" text-anchor="middle"${!h ? ' class="dl"' : ''}>${!h ? dayLbl(dayOf(t)) : hh(t)}</text>`;
  }
  // Con más de 48 h, cada día lleva su nombre al centro de la parte que se ve (si se ven al menos 6 horas de ese día)
  // y si la gráfica es angosta, se salta el nombre que se encimaría con el anterior
  // (si choca con "Today", se queda "Today")
  const labs = [];
  if (span > 48) for (let d = dayOf(a); d <= dayOf(b); d++) {
    const s = Math.max(a, d * 24 - NOW_H), e = Math.min(b, d * 24 - NOW_H + 24), X = x((s + e) / 2), p = labs[labs.length - 1];
    if (e - s < 6) continue;
    if (p && X - p.X < 66) { if (d === 0) labs.pop(); else continue; }
    labs.push({ X, d });
  }
  labs.forEach(l => { o += `<text x="${l.X}" y="${bot + 17}" text-anchor="middle" class="dl">${dayLbl(l.d)}</text>`; });
  return o;
}
// #7: al pasar el cursor o picar una gráfica, una ficha con los valores de esa hora
const tipRow = (c, name, v, d, u, dash, none = 'No reading') => `<tr><td><i style="${dash ? 'color' : 'background'}:${c}"${dash ? ' class="dsh"' : ''}></i>${name}</td><td>${v == null ? none : `${v.toFixed(d)}${u ? ' ' + u : ''}`}</td></tr>`;
const TIP = {
  gh: (d, t) => { const n = +d.n, end = OFF[n] || 0; return `<b>${tLbl(t)}</b><table><tr><th></th><th>Inside</th><th>Outside</th></tr>${AX3.map(a => `<tr><td><i style="background:${a.c}"></i>${a.k}</td><td>${t > end ? 'No reading' : `${INC[a.k](t, n).toFixed(a.d)} ${a.u}`}</td><td>${OUT[a.k](t).toFixed(a.d)} ${a.u}</td></tr>`).join('')}</table>`; },
  ext: (d, t) => `<b>${tLbl(t)}${t > 0 ? ' · forecast' : ''}</b><table>${extSeries().map(s => tipRow(s.c, s.name, s.f(t), s.d, s.u, s.dash, t > 0 && s.k[0] === 'i' ? 'No forecast inside' : 'No reading')).join('')}</table>`,
};
const onTip = e => {
  const sv = e.target.closest && e.target.closest('svg[data-tip]');
  $$('.tip:not([hidden])').forEach(p => { if (!sv || p.parentElement !== sv.parentElement) { p.hidden = true; const s = p.parentElement.querySelector('svg'); s.querySelector('.cur').style.visibility = 'hidden'; if (s._dots) s._dots(0, false); } });
  if (!sv) return;
  const d = sv.dataset, r = sv.getBoundingClientRect(), W = +d.w, L = +d.l, pw = +d.pw, a = +d.a, b = +d.b;
  const t = clamp(Math.round(a + ((e.clientX - r.left) / r.width * W - L) / pw * (b - a)), a, b), X = L + pw * (t - a) / (b - a), cur = sv.querySelector('.cur'), tip = sv.parentElement.querySelector('.tip');
  cur.setAttribute('x1', X); cur.setAttribute('x2', X); cur.style.visibility = 'visible'; if (sv._dots) sv._dots(t - a, true);
  tip.innerHTML = TIP[d.tip](d, t); tip.hidden = false;
  const px = X / W * r.width; tip.style.left = Math.max(0, Math.min(px + 14, r.width - tip.offsetWidth - 4)) + 'px';
  if (px + 14 + tip.offsetWidth > r.width && px - 14 - tip.offsetWidth > 0) tip.style.left = px - 14 - tip.offsetWidth + 'px';
};
document.addEventListener('pointermove', onTip); document.addEventListener('pointerdown', onTip);

// ----- Pestaña Interior: #4 gráfica de 3 ejes por invernadero, #5 se abre y se cierra (todas abiertas al inicio), #6 más legible
function ghChart(g, P, W) {
  const n = g.n, H = 240, L = 46, R = 100, T0 = 24, B = 30, pw = W - L - R, ph = H - T0 - B, end = OFF[n] || 0;
  const x = t => L + pw * (t + P) / P, y = (a, v) => T0 + ph * (1 - (clamp(v, a.lo, a.hi) - a.lo) / (a.hi - a.lo));
  const path = (a, f, s, e) => { let d = ''; for (let t = s; t <= e; t++) d += `${d ? 'L' : 'M'}${x(t).toFixed(1)} ${y(a, f(t)).toFixed(1)}`; return d; };
  let o = `<svg class="chart wx3" viewBox="0 0 ${W} ${H}" data-tip="gh" data-n="${n}" data-w="${W}" data-l="${L}" data-pw="${pw}" data-a="${-P}" data-b="0" role="img" aria-label="Greenhouse ${n}: temperature, humidity and radiation, inside and outside">`;
  if (g.crop) o += `<rect class="tgt" x="${L}" y="${y(AX3[0], SET[1])}" width="${pw}" height="${y(AX3[0], SET[0]) - y(AX3[0], SET[1])}"/>`;
  for (let i = 0; i <= 4; i++) {
    const f = i / 4, yy = T0 + ph * f, v = a => +(a.hi - (a.hi - a.lo) * f).toFixed(0);
    o += `<line class="gl" x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}"/><text x="${L - 6}" y="${yy + 4}" text-anchor="end" style="fill:${AX3[0].c}">${v(AX3[0])}</text><text x="${W - R + 8}" y="${yy + 4}" style="fill:${AX3[1].c}">${v(AX3[1])}</text><text x="${W - R + 46}" y="${yy + 4}" style="fill:${AX3[2].c}">${v(AX3[2])}</text>`;
  }
  o += `<text class="ax" x="${L - 6}" y="${T0 - 10}" text-anchor="end" style="fill:${AX3[0].c}">°C</text><text class="ax" x="${W - R + 8}" y="${T0 - 10}" style="fill:${AX3[1].c}">%</text><text class="ax" x="${W - R + 46}" y="${T0 - 10}" style="fill:${AX3[2].c}">W/m²</text>`;
  o += tAxis(-P, 0, x, T0, T0 + ph);
  AX3.forEach(a => { o += `<path class="wxo" stroke="${a.c}" d="${path(a, OUT[a.k], -P, 0)}"/>`; if (end >= -P) o += `<path class="ln3" stroke="${a.c}" d="${path(a, t => INC[a.k](t, n), -P, end)}"/>`; });
  if (end < -P) o += `<text x="${L + 10}" y="${T0 + 18}" class="off-t">No interior readings in this period</text>`;
  else if (end) o += `<circle cx="${x(end)}" cy="${y(AX3[0], INC.Temperature(end, n))}" r="4" fill="var(--warn)"/>`;
  return o + `<line class="cur" y1="${T0}" y2="${T0 + ph}"/></svg>`;
}
// Filtro de Interior (25 nov 2026, aprobado por Julián): All · Needs attention · In target. "Needs attention" = salió del rango
// objetivo en cualquier hora del periodo elegido, o no tiene señal. Sin ciclo activo no hay rango: solo sale en All.
const ghStat = (g, P) => {
  const end = OFF[g.n] || 0; if (end < 0) return { k: 'att', why: `No signal since ${when(end)}` };
  if (!g.crop) return { k: 'none' };
  let hi = 0, lo = 0; for (let t = -P; t <= 0; t++) { const v = INC.Temperature(t, g.n); if (v > SET[1]) hi++; else if (v < SET[0]) lo++; }
  return hi + lo ? { k: 'att', why: `${hi && lo ? 'Out of' : hi ? 'Above' : 'Below'} target ${hi + lo} h` } : { k: 'ok' };
};
const ghCard = (g, P, W, s) => {
  const t0 = OFF[g.n] || 0, ti = INC.Temperature(t0, g.n), open = !S.wxShut.includes(g.n);
  const st = s.k === 'att' ? chip('warn', s.why) : s.k === 'none' ? chip('plain', 'No active cycle') : chip('ok', 'In target');
  return `<div class="wxc-gh"><button class="h" data-action="wxfold" data-n="${g.n}" aria-expanded="${open}"><b>Greenhouse ${g.n}</b><small>${g.crop || 'No crop'}</small>${st}<span class="now3">${t0 ? 'Last reading · ' : 'Now · '}<b>${ti.toFixed(1)} °C</b> · ${INC.Humidity(t0, g.n).toFixed(0)} % · ${INC.Radiation(t0, g.n).toFixed(0)} W/m²</span>${icon('chev')}</button><div class="wxt"${open ? '' : ' hidden'}>${ghChart(g, P, W)}<div class="tip" hidden></div></div></div>`;
};
function drawWxC() {
  const box = $('#wxc'); if (!box) return;
  const P = S.wxPast * 24, W = Math.max(340, box.clientWidth - 30), st = WGH.map(g => [g, ghStat(g, P)]), F = S.wxF || 'All';
  const att = st.filter(([, s]) => s.k === 'att'), ok = st.filter(([, s]) => s.k === 'ok'), lbl = { All: `All ${st.length}`, Needs: `Needs attention ${att.length}`, In: `In target ${ok.length}` };
  const list = F === 'Needs' ? att : F === 'In' ? ok : st; // All: en orden de número (Julián, 25 nov 2026)
  // Error que se evita: olvidar el filtro puesto. Siempre dice cuántos se ven de cuántos, con "Show all".
  $('#wxf').innerHTML = seg('wxf', Object.values(lbl), lbl[F]) + (F !== 'All' ? `<span class="wxf-n">Showing ${list.length} of ${st.length} · <button class="lnk" data-action="wxfall">Show all</button></span>` : '');
  box.innerHTML = list.length ? list.map(([g, s]) => ghCard(g, P, W, s)).join('') : `<p class="nodata">No greenhouse ${F === 'In' ? 'stayed in target' : 'needs attention'} in this period.</p>`;
  thumbs();
}
SEG.wxf = v => { S.wxF = v.startsWith('Needs') ? 'Needs' : v.startsWith('In') ? 'In' : 'All'; drawWxC(); };
A.wxfall = () => { S.wxF = 'All'; drawWxC(); };
const wxAllTxt = () => S.wxShut.length ? 'Expand all' : 'Collapse all';
A.wxfold = el => { const n = +el.dataset.n, open = el.getAttribute('aria-expanded') !== 'true'; el.setAttribute('aria-expanded', open); el.nextElementSibling.hidden = !open; S.wxShut = open ? S.wxShut.filter(x => x !== n) : [...S.wxShut, n]; $('#wx-all').textContent = wxAllTxt(); };
A.wxall = () => { S.wxShut = S.wxShut.length ? [] : WGH.map(g => g.n); $$('[data-action="wxfold"]').forEach(b => { const open = !S.wxShut.includes(+b.dataset.n); b.setAttribute('aria-expanded', open); b.nextElementSibling.hidden = !open; }); $('#wx-all').textContent = wxAllTxt(); };
const wxInterior = () => `<div class="card" style="margin-bottom:14px">
    <div class="toolbar"><h2 style="margin:0">Greenhouses</h2><span class="grow"></span><button class="btn" id="wx-all" data-action="wxall">${wxAllTxt()}</button><select class="select" id="wxc-p" aria-label="Period">${[1, 3, 7].map(n => `<option value="${n}"${n === S.wxPast ? ' selected' : ''}>Last ${n > 1 ? n + ' days' : '24 hours'}</option>`).join('')}</select></div>
    <div class="wxf" id="wxf"></div>
    <div class="legend wx3-leg">${AX3.map(a => `<span><i style="background:${a.c}"></i>${a.k} · ${a.u}</span>`).join('')}<span><i style="background:var(--ink-2)"></i>Inside</span><span><i class="dash" style="color:var(--ink-2)"></i>Outside</span><span><i class="sq" style="background:#BFDDC4"></i>Target ${SET[0]} to ${SET[1]} °C</span><span class="tap">Tap or hover a chart to see its values</span></div>
    <div id="wxc" class="wx3-list"></div>
  </div>`;

// ----- Pestaña Exterior (segunda tanda del 25 nov 2026, #18 a #25): la gráfica a todo lo ancho y los controles arriba
// #15 (decisión de Julián): eje izquierdo de 0 a 100 para todo lo que cabe ahí; eje derecho para W/m² y hPa
const smooth = f => t => (f(t - 2) + f(t - 1) + f(t) + f(t + 1) + f(t + 2)) / 5; // el viento sin picos de hora en hora
const EXV = [
  ['temp', 'Exterior temperature', '°C', 1, t => OUT.Temperature(t), '#D55E00'],
  ['feels', 'Feels like', '°C', 1, t => OUT.Temperature(t) - .12 * smooth(OUT.Wind)(t), '#E69F00'],
  ['hum', 'Exterior humidity', '%', 0, t => OUT.Humidity(t), '#0072B2'],
  ['rad', 'Exterior solar radiation', 'W/m²', 0, t => OUT.Radiation(t), '#7A4E9A'],
  ['rain', 'Precipitation', '%', 0, t => clamp((t < 0 ? 5 : RAIN[dayOf(t)] ?? 20) + 8 * Math.sin(t / 3), 0, 100), '#56B4E9'],
  ['wind', 'Exterior wind', 'km/h', 0, smooth(OUT.Wind), '#009E73'],
  ['gust', 'Exterior wind gust', 'km/h', 0, t => smooth(OUT.Wind)(t) * 1.6 + 3, '#6FB59A'],
  ['cloud', 'Cloud cover', '%', 0, t => clamp({ Clear: 10, 'Partly cloudy': 45, Cloudy: 85, Rain: 95 }[sky(t)] + 6 * jit(t), 0, 100), '#8A8A80'],
  ['pres', 'Pressure', 'hPa', 0, t => 1013 + 4 * Math.sin(t / 20) + .8 * front(t), '#3D4F8F'],
  ['vis', 'Visibility', 'km', 0, t => OUT.Humidity(t) > 90 ? 3 : sky(t) === 'Rain' ? 5 : sky(t) === 'Cloudy' ? 12 : 20, '#3D3D38'],
  ['uv', 'UV index', '', 0, t => Math.round(OUT.Radiation(t) / 110), '#CC79A7'],
];
const EXK = Object.fromEntries(EXV.map(v => [v[0], v]));
const INV = [['itemp', 'Temperature', '°C', 1, 'Temperature', ''], ['ihum', 'Humidity', '%', 0, 'Humidity', '7 4'], ['irad', 'Solar radiation', 'W/m²', 0, 'Radiation', '2 4']];
const AXR = ['rad', 'pres', 'irad'], GHC = ['#1E3D1A', '#9A5B00', '#6E1510', '#2F6F8F', '#5B6B2F'];
const extSeries = () => {
  const E = S.wxE, out = EXV.filter(v => E.on.includes(v[0])).map(([k, name, u, d, f, c]) => ({ k, name, u, d, f, c, ax: AXR.includes(k) ? 2 : 1 }));
  E.gh.forEach((n, i) => INV.filter(v => E.ins.includes(v[0])).forEach(([k, name, u, d, key, dash]) => out.push({ k, name: `GH ${n} · Interior ${name.toLowerCase()}`, u, d, dash, c: GHC[i % GHC.length], ax: AXR.includes(k) ? 2 : 1, f: t => t > 0 || t > (OFF[n] || 0) ? null : INC[key](t, n) })));
  return out;
};
// Curva suave que pasa por cada punto (Catmull-Rom a Bézier); se corta donde no hay dato
const curve = pts => { let d = ''; pts.forEach((p, i) => { if (!p) return; const a = pts[i - 1]; if (!a) { d += `M${p[0].toFixed(1)} ${p[1].toFixed(1)}`; return; } const z = pts[i - 2] || a, b = pts[i + 1] || p; d += `C${(a[0] + (p[0] - z[0]) / 6).toFixed(1)} ${(a[1] + (p[1] - z[1]) / 6).toFixed(1)} ${(p[0] - (b[0] - a[0]) / 6).toFixed(1)} ${(p[1] - (b[1] - a[1]) / 6).toFixed(1)} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`; }); return d; };
function drawWxE() {
  const box = $('#wxe-ch'); if (!box) return;
  const P = S.wxE.past * 24, F = S.wxE.fc * 24, ser = extSeries();
  if (!ser.length) { box.innerHTML = '<p class="nodata">Turn on at least one measurement above to draw the chart.</p>'; return; }
  const has2 = ser.some(s => s.ax === 2), W = Math.max(380, box.clientWidth), H = 420, L = 38, R = has2 ? 58 : 14, T0 = 34, B = 32, pw = W - L - R, ph = H - T0 - B;
  const A1 = { lo: 0, hi: 100 }, A2 = { lo: 0, hi: 1200 }, x = t => L + pw * (t + P) / (P + F), y = (a, v) => T0 + ph * (1 - (clamp(v, a.lo, a.hi) - a.lo) / (a.hi - a.lo));
  let o = `<svg class="chart wxe-svg" viewBox="0 0 ${W} ${H}" data-tip="ext" data-w="${W}" data-l="${L}" data-pw="${pw}" data-a="${-P}" data-b="${F}" role="img" aria-label="Hourly conditions, past ${S.wxE.past} and forecast ${S.wxE.fc} days">`;
  o += `<rect class="fc2" x="${x(0)}" y="${T0}" width="${x(F) - x(0)}" height="${ph}"/>`;
  for (let i = 0; i <= 4; i++) { const f = i / 4, yy = T0 + ph * f; o += `<line class="gl2" x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}"/><text x="${L - 8}" y="${yy + 4}" text-anchor="end">${A1.hi - (A1.hi - A1.lo) * f}</text>${has2 ? `<text x="${W - R + 8}" y="${yy + 4}">${(A2.hi - (A2.hi - A2.lo) * f).toLocaleString('en-US')}</text>` : ''}`; }
  if (has2) o += `<text class="ax2" x="${W - R + 8}" y="${T0 - 14}">W/m² · hPa</text>`; // #21: solo el eje derecho lleva título, chico y sin encimarse
  o += tAxis(-P, F, x, T0, T0 + ph);
  o += `<line class="now2" x1="${x(0)}" x2="${x(0)}" y1="${T0 - 6}" y2="${T0 + ph}"/><text class="now-t" x="${x(0)}" y="${T0 - 12}" text-anchor="middle">Now</text><text class="zone" x="${x(0) - 10}" y="${T0 + 16}" text-anchor="end">Measured</text><text class="zone" x="${x(0) + 10}" y="${T0 + 16}">Forecast</text>`;
  const ys = ser.map(s => { const a = s.ax === 2 ? A2 : A1, pts = []; for (let t = -P; t <= F; t++) { const v = s.f(t); pts.push(v == null ? null : [x(t), y(a, v)]); } o += `<path class="ln4" stroke="${s.c}"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''} d="${curve(pts)}"/>`; return pts; });
  o += `<line class="cur" y1="${T0}" y2="${T0 + ph}"/><g class="dots">${ser.map(s => `<circle r="4" fill="${s.c}"/>`).join('')}</g></svg>`;
  box.innerHTML = `<div class="wxt">${o}<div class="tip" hidden></div></div>`;
  const sv = $('svg', box); sv._dots = (t, on) => $$('.dots circle', sv).forEach((c, i) => { const p = on && ys[i][t]; c.style.visibility = p ? 'visible' : 'hidden'; if (p) { c.setAttribute('cx', p[0]); c.setAttribute('cy', p[1]); } });
}
// #23 y #24: las mediciones son botones que se prenden y se apagan (también hacen de leyenda); sin casillas del navegador
const mchip = (k, name, u, c, on, grp, dash) => `<button type="button" class="mchip" data-action="wxet" data-k="${k}" data-grp="${grp}" aria-pressed="${on}"><i${dash != null ? ` class="ls" style="border-top-style:${dash ? (dash[0] === '2' ? 'dotted' : 'dashed') : 'solid'}"` : ` style="background:${c}"`}></i>${name}${u ? `<small>${u}</small>` : ''}</button>`;
const wxeCtl = () => {
  const E = S.wxE, sel = (id, cur, list) => `<select class="select" id="${id}">${list.map(n => `<option value="${n}"${n === cur ? ' selected' : ''}>${n} ${n > 1 ? 'days' : 'day'}</option>`).join('')}</select>`;
  return `<div class="wxe-row">
      <label class="wxe-f"><span>Past</span>${sel('wxe-past', E.past, [1, 2])}</label>
      <label class="wxe-f"><span>Forecast</span>${sel('wxe-fc', E.fc, [1, 2, 3, 4, 5, 6, 7])}</label>
      <div class="wxe-f wxe-cmp"><span>Compare with a greenhouse</span><div class="wxe-find"><label class="pfx"><b>Greenhouse</b>${E.gh.map((n, i) => `<span class="tok${n === S.wxNew ? ' new' : ''}"><i style="background:${GHC[i % GHC.length]}"></i>${n}<button type="button" data-action="wxedel" data-n="${n}" aria-label="Remove Greenhouse ${n}">${icon('x')}</button></span>`).join('')}<input id="wxe-gh" placeholder="${E.gh.length ? 'Add another: number or name' : 'Enter number or name'}" autocomplete="off" aria-label="Greenhouse number or name"></label></div><div class="ev-wr" id="wxe-ghr"></div></div>
    </div>
    ${E.gh.length ? `<div class="wxe-ms wxe-in"><span class="k">Inside</span>${INV.map(([k, nm, u, , , dash]) => mchip(k, nm, u, '', E.ins.includes(k), 'in', dash)).join('')}</div>` : ''}
    <div class="wxe-ms"><span class="k">Outside</span>${EXV.map(([k, nm, u, , , c]) => mchip(k, nm.replace('Exterior ', '').replace(/^./, s => s.toUpperCase()), u, c, E.on.includes(k), 'ex')).join('')}</div>`;
};
A.wxet = el => { const L = el.dataset.grp === 'in' ? S.wxE.ins : S.wxE.on, k = el.dataset.k, i = L.indexOf(k); if (i < 0) L.push(k); else L.splice(i, 1); el.setAttribute('aria-pressed', i < 0); drawWxE(); };
// #20: "Greenhouse" queda fijo; solo se escribe el número o el nombre. Se agrega picando la sugerencia o con Enter.
// (25 nov 2026: Julián quitó "Add to chart" por obsoleto.) Errores: uno que no existe o uno ya agregado lo dicen y no se agregan.
const ghExact = q => WGH.find(g => String(g.n) === q || (g.crop || '').toLowerCase() === q);
const wxeFind = () => {
  const q = $('#wxe-gh').value.trim().toLowerCase(), ex = q && ghExact(q), dup = ex && S.wxE.gh.includes(ex.n);
  const hits = q ? WGH.filter(g => !S.wxE.gh.includes(g.n) && (String(g.n).startsWith(q) || (g.crop || '').toLowerCase().includes(q))).slice(0, 6) : [];
  $('#wxe-ghr').innerHTML = !q ? '' : dup ? `<span>Greenhouse ${ex.n} is already on the chart.</span>` : hits.length ? hits.map(g => `<button type="button" data-action="wxeadd" data-n="${g.n}">${icon('plus')}Greenhouse ${g.n}<small>${g.crop || 'No crop'}</small></button>`).join('') : `<span>No greenhouse "${clean($('#wxe-gh').value)}".</span>`;
};
// Al agregar o quitar, la página no se mueve: se guarda y se repone la posición, y el foco vuelve al campo sin desplazar.
// Queda claro que se agregó: el número aparece dentro del campo, se ilumina un momento y sale un aviso con "Undo".
const wxeRedo = () => { const y = main.scrollTop; $('#wxe-ctl').innerHTML = wxeCtl(); drawWxE(); main.scrollTop = y; const t = $('.tok.new'); if (t) setTimeout(() => t.classList.remove('new'), 900); S.wxNew = 0; };
A.wxeadd = el => {
  const q = $('#wxe-gh').value.trim().toLowerCase(), g = el.dataset.n ? +el.dataset.n : (ghExact(q) || {}).n; if (!g || S.wxE.gh.includes(g)) return;
  S.wxE.gh.push(g); if (!S.wxE.ins.length) S.wxE.ins = ['itemp']; S.wxNew = g; wxeRedo(); $('#wxe-gh').focus({ preventScroll: true });
  toast(`Greenhouse ${g} added to the chart`, () => { S.wxE.gh = S.wxE.gh.filter(n => n !== g); if ($('#wxe-ctl')) wxeRedo(); });
};
A.wxedel = el => { const g = +el.dataset.n, i = S.wxE.gh.indexOf(g); S.wxE.gh.splice(i, 1); wxeRedo(); toast(`Greenhouse ${g} removed from the chart`, () => { S.wxE.gh.splice(i, 0, g); if ($('#wxe-ctl')) wxeRedo(); }); };
document.addEventListener('input', e => { if (e.target.id === 'wxe-gh') wxeFind(); });
document.addEventListener('keydown', e => { if (e.target.id === 'wxe-gh' && e.key === 'Enter') { const g = ghExact(e.target.value.trim().toLowerCase()), b = $('#wxe-ghr button'); if (g) A.wxeadd({ dataset: { n: g.n } }); else if (b) b.click(); } });
document.addEventListener('change', e => { if (e.target.id === 'wxe-past' || e.target.id === 'wxe-fc') { S.wxE[e.target.id === 'wxe-past' ? 'past' : 'fc'] = +e.target.value; drawWxE(); } });
addEventListener('resize', () => { if ($('#wxc')) drawWxC(); if ($('#wxe-ch')) drawWxE(); });

// #10, #16 y #25: pronóstico con las mediciones de afuera de la app real. A la vista Sky, Cloud cover, Temperature, Radiation y
// Humidity; las demás en "More details". 48 horas cada 6 h y 5 días una columna por día: cabe sin deslizar de lado.
const FC_TOP = ['cloud', 'temp', 'rad', 'hum'], FC_MORE = ['feels', 'rain', 'wind', 'gust', 'pres', 'vis', 'uv'];
const FC_DAY = { temp: 'lh', feels: 'lh', hum: 'avg', rad: 'max', rain: 'day', wind: 'max', gust: 'max', cloud: 'avg', pres: 'avg', vis: 'min', uv: 'max' };
const FC_LBL = { lh: 'low · high', avg: 'avg', max: 'max', min: 'min', day: 'chance' };
function wxTimeline() {
  const T = OUT.Temperature, h48 = S.wxcR !== '5 days', frost = v => Math.round(v) < 4, hor = h48 ? 48 : 120;
  const cold = []; for (let t = 1; t <= hor; t++) if (frost(T(t))) cold.push(t);
  const runs = cold.filter((t, i) => t - cold[i - 1] !== 1), a = runs[0]; let b = a; while (cold.includes(b + 1)) b++;
  const dayT = d => H24.map(h => d * 24 + h - NOW_H), st = (d, f) => dayT(d).map(f), lo = d => Math.min(...st(d, T)), hi = d => Math.max(...st(d, T));
  const note = runs.length ? `<p class="wxc-note">${icon('alert')}<span>Outside stays below the 4 °C alert rule from <b>${tLbl(a)}</b> to <b>${tLbl(b)}</b>${runs.length > 1 ? `, and on ${runs.length - 1} more night${runs.length > 2 ? 's' : ''} in this period` : ''}.</span></p>` : '<p class="hint">No alert rule is crossed in this period.</p>';
  const more = `<button class="lnk" data-action="wxdet" aria-expanded="${S.wxDet}">${S.wxDet ? 'Fewer details' : `More details: ${FC_MORE.map(k => k === 'uv' ? 'UV index' : EXK[k][1].replace('Exterior ', '').toLowerCase()).join(', ')}`}</button>`;
  const name = k => EXK[k][1].replace('Exterior ', '').replace(/^./, s => s.toUpperCase());
  const row = (k, cells, det, unit = EXK[k][2]) => `<tr${det && !S.wxDet ? ' hidden' : ''}><th scope="row">${name(k)}${unit ? ` <small>${unit}</small>` : ''}</th>${cells}</tr>`;
  const bad = (k, v) => (k === 'temp' && frost(v)) || ((k === 'wind' || k === 'gust') && v > 45);
  if (h48) {
    const ts = [0]; for (let t = 1; t <= 48; t++) if (!(hod(t) % 6)) ts.push(t);
    const days = [...new Set(ts.map(dayOf))], d0 = t => t && dayOf(t) !== dayOf(ts[ts.indexOf(t) - 1]);
    const cells = k => ts.map(t => { const v = EXK[k][4](t), c = [d0(t) && 'd0', bad(k, v) && 'bad'].filter(Boolean).join(' '); return `<td${c ? ` class="${c}"` : ''}>${v.toFixed(0)}</td>`; }).join('');
    return `${note}<div class="wxc-tl"><table><thead><tr><th></th>${days.map(d => `<th class="day" colspan="${ts.filter(t => dayOf(t) === d).length}"><b>${dayLbl(d)}</b><span>${lo(d).toFixed(0)} to ${hi(d).toFixed(0)} °C · ${RAIN[d] ?? 20} % rain</span></th>`).join('')}</tr>
      <tr><th></th>${ts.map(t => `<th${d0(t) ? ' class="d0"' : ''}>${t ? hh(t) : 'Now'}</th>`).join('')}</tr></thead><tbody>
      <tr><th scope="row">Sky</th>${ts.map(t => `<td${d0(t) ? ' class="d0"' : ''} title="${sky(t)}">${icon(skyIcon(t))}</td>`).join('')}</tr>
      ${FC_TOP.map(k => row(k, cells(k))).join('')}${FC_MORE.map(k => row(k, cells(k), 1)).join('')}
    </tbody></table></div>${more}`;
  }
  const ds = [0, 1, 2, 3, 4], agg = (k, d) => { const v = st(d, EXK[k][4]), m = FC_DAY[k]; return m === 'lh' ? [Math.min(...v), Math.max(...v)] : m === 'avg' ? v.reduce((s, x) => s + x, 0) / 24 : m === 'max' ? Math.max(...v) : m === 'min' ? Math.min(...v) : RAIN[d] ?? 20; };
  const cells = k => ds.map(d => { const v = agg(k, d), lh = Array.isArray(v); return `<td${bad(k, lh ? v[0] : v) ? ' class="bad"' : ''}>${lh ? `${v[0].toFixed(0)} · ${v[1].toFixed(0)}` : v.toFixed(0)}</td>`; }).join('');
  const urow = (k, det) => row(k, cells(k), det, `${EXK[k][2]}${EXK[k][2] ? ' ' : ''}${FC_LBL[FC_DAY[k]]}`);
  return `${note}<div class="wxc-tl"><table><thead><tr><th></th>${ds.map(d => `<th class="dd"><b>${dayLbl(d)}</b></th>`).join('')}</tr></thead><tbody>
    <tr><th scope="row">Sky</th>${ds.map(d => `<td title="${SKY[d]}">${icon(skyIcon(d * 24 - 2, SKY[d]))}<small>${SKY[d]}</small></td>`).join('')}</tr>
    ${FC_TOP.map(k => urow(k)).join('')}${FC_MORE.map(k => urow(k, 1)).join('')}
  </tbody></table></div>${more}`;
}
SEG.wxcr = v => { S.wxcR = v; $('#wxc-tl').innerHTML = wxTimeline(); };
A.wxdet = () => { S.wxDet = !S.wxDet; $('#wxc-tl').innerHTML = wxTimeline(); };
SEG.wxtab = v => { S.wxTab = v; render(true); };
const wxExterior = () => `<div class="card" style="margin-bottom:14px">
    <h2>Hourly conditions</h2>
    <div class="wxe-ctl" id="wxe-ctl">${wxeCtl()}</div>
    <div class="wxe-ch" id="wxe-ch"></div>
  </div>
  <div class="card" style="margin-bottom:14px">
    <div class="toolbar"><h2 style="margin:0">Outside forecast</h2><span class="grow"></span>${seg('wxcr', ['48 hours', '5 days'], S.wxcR)}</div>
    <div id="wxc-tl"></div>
  </div>`;

const weatherC = () => {
  const T = OUT.Temperature, tt = H24.map(h => T(h - NOW_H));
  return {
    title: 'Weather', sub: RANCH, // #2
    actions: `<button class="btn" data-action="rules">${icon('sliders')}References</button><button class="btn" data-action="sensors">${icon('toggles')}Manage sensors</button>`, // #17
    html: `${wxSwitch()}${wxAlerts()}
  <div class="toolbar wx-tabs">${seg('wxtab', ['Interior', 'Exterior'], S.wxTab)}</div>
  <div class="card wxc-now">
    <div class="wx-big">${icon(skyIcon(0))}<b>${T(0).toFixed(1)}</b><small>°C</small></div>
    <div><div class="lbl">Outside now · weather station</div><div class="wx-cond">${sky(0)} · today ${Math.min(...tt).toFixed(0)} to ${Math.max(...tt).toFixed(0)} °C</div><div class="wx-upd">${icon('clock')}Updated 2 min ago · Tue, Nov 17, 13:58</div></div>
    <dl class="wx-stats">${[['Humidity', OUT.Humidity(0).toFixed(0), '%'], ['Wind', OUT.Wind(0).toFixed(0), 'km/h NW'], ['Radiation', OUT.Radiation(0).toFixed(0), 'W/m²'], ['UV index', Math.round(OUT.Radiation(0) / 110), '']].map(s => `<div><dt>${s[0]}</dt><dd>${s[1]}<small>${s[2]}</small></dd></div>`).join('')}</dl>
  </div>
  ${S.wxTab === 'Interior' ? wxInterior() : wxExterior()}
  ${wxSources()}`,
    after: () => { if (S.wxTab === 'Interior') drawWxC(); else { drawWxE(); $('#wxc-tl').innerHTML = wxTimeline(); } },
  };
};

// ---------- Calendar ----------
const CYA = NEWPAL ? '#0072B2' : '#4A7C3F';
const MC = { crop: NEWPAL ? 'var(--c-wind)' : 'var(--leaf)', pollination: 'var(--c-rad)', irrigation: 'var(--c-hum)', pests: 'var(--c-temp)', applications: 'var(--c-pink)', other: 'var(--ink-3)' };
// Calendario: los módulos más "Other" para lo que no es de ningún módulo (mantenimiento, limpieza). Pedido de Julián, 25 nov 2026.
// Solo vive en el calendario; el menú lateral y Home siguen con los cinco módulos.
const CMODS = { ...MODS, other: ['Other', 'dots'] };
// Actividades: [día de noviembre, módulo, nombre, invernaderos, responsables, invernaderos ya hechos, extra]. Datos inventados.
// extra = { from: quién la mandó, acc: { persona: 1 aceptó, 0 no puede }, notes: [[quién, cuándo, texto, 1 si es pregunta]] }
// Pedido de Julián (21 nov 2026): una actividad se manda a una o varias personas, en uno o varios invernaderos, cualquiera le
// manda a cualquiera; quien la recibe la acepta o dice que no puede; lleva notas y preguntas; hay vista de semana y de mes; y se
// distingue lo propio, lo que me mandaron y lo que mandé (si ya lo aceptaron y si tienen preguntas).
// Para que no sea un desmadre: es una sola ficha aunque tenga varios invernaderos; se cierra invernadero por invernadero (lo marca
// cualquiera de los responsables) y queda hecha cuando todos están hechos; "Overdue" se calcula solo; todo lo que necesita de mí
// (responder, contestar una pregunta, mandar a otra persona) sale junto arriba del calendario; decir que no se puede exige el
// motivo; las notas se agregan, nunca se editan; y una actividad que nadie puede hacer siempre ofrece mandarla a alguien más.
const PPL = ['Rubén S.', 'Lucía P.', 'Marta R.'], ME = 'Marta R.', TD = 17;
// Prueba pedida por Julián (21 nov 2026): una propiedad puede tener hasta 20 o 25 invernaderos. La maqueta tiene los 5 reales;
// el interruptor "25 greenhouses" usa 25 inventados (1 a 25) para ver si el calendario aguanta, y "One card per greenhouse"
// enseña la otra forma de dibujarlo. Los dos interruptores son solo de la maqueta, no del producto.
const R = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i), N25 = R(1, 25);
// 25 nov 2026: Julián pidió GH 1 a 18 en el filtro y en "New activity" para que se vea el renglón deslizable (los reales 11 a 15 van dentro)
const gha = () => S.cal.n25 ? N25 : R(1, 18), cgh = gha;
const X = (from, acc = {}, notes = []) => ({ from, acc, notes }), yes = (...p) => Object.fromEntries(p.map(n => [n, 1]));
const EV = [
  [9, 'pests', 'Weekly scouting', [11], ['Lucía P.'], [11], X('Marta R.', yes('Lucía P.'))],
  [10, 'crop', 'Leaf pruning', [11, 12], ['Rubén S.', 'Lucía P.'], [11, 12], X('Marta R.', yes('Rubén S.', 'Lucía P.'))],
  [13, 'pollination', 'Pollination sampling', [11, 12], ['Lucía P.'], [11, 12], X('Marta R.', yes('Lucía P.'))],
  [16, 'crop', 'Leaf pruning', [11], ['Rubén S.'], [11], X('Marta R.', yes('Rubén S.'))],
  [16, 'pests', 'Weekly scouting', [11], ['Lucía P.'], [11], X('Marta R.', yes('Lucía P.'))],
  [16, 'irrigation', 'Drain check', [13], ['Rubén S.'], [], X('Marta R.', yes('Rubén S.'), [['Rubén S.', 'Mon 16:40', 'Valve 3 was closed for repair. I will do it first thing tomorrow.']])],
  [17, 'pollination', 'Hive check', [12], ['Lucía P.'], [12], X('Lucía P.', yes('Lucía P.'))],
  [17, 'crop', 'Leaf pruning', [11, 12], ['Rubén S.', 'Lucía P.'], [11], X('Marta R.', yes('Rubén S.', 'Lucía P.'))],
  [17, 'irrigation', 'Irrigation report', [12, 13, 14], ['Rubén S.'], [], X('Marta R.', yes('Rubén S.'))],
  [18, 'applications', 'Spray: plan week 47', [11], ['Marta R.'], [], X('Lucía P.', {}, [['Lucía P.', 'Tue 09:10', 'Mitrex Oil is already in the warehouse.']])],
  [16, 'crop', 'Trellis check', [12], ['Marta R.'], [], X('Rubén S.', yes('Marta R.'))], // 25 nov 2026: ejemplo de la regla D (vencida)
  [18, 'irrigation', 'Valve 3 repair check', [13], ['Rubén S.'], [], X('Marta R.')], // 25 nov 2026: ejemplo de la regla E (sin respuesta)
  [18, 'applications', 'Re-entry opens 18:00', [11], ['Marta R.'], [], X('Marta R.', yes('Marta R.'))],
  [18, 'crop', 'Crop report', [11, 12, 13, 14], ['Rubén S.'], [], X('Marta R.', {}, [['Rubén S.', 'Tue 10:05', 'One report for the four greenhouses, or one each?', 1]])],
  [19, 'irrigation', 'EC and pH calibration', [11, 12, 13, 14], ['Rubén S.', 'Marta R.'], [], X('Rubén S.', yes('Rubén S.'))],
  [21, 'other', 'Clean drip filters', [13, 14], ['Rubén S.'], [], X('Marta R.', yes('Rubén S.'))],
  [20, 'pollination', 'Pollination sampling', [11, 12], ['Lucía P.'], [], X('Marta R.', yes('Lucía P.'))],
  [20, 'pests', 'Spider mite re-scout', [11], ['Lucía P.'], [], X('Marta R.', { 'Lucía P.': 0 }, [['Lucía P.', 'Tue 08:30', 'Can\'t do: I am off on Friday.']])],
  [21, 'crop', 'Harvest estimate', [11], ['Marta R.'], [], X('Marta R.', yes('Marta R.'))],
  [23, 'pests', 'Weekly scouting', [11], ['Lucía P.'], [], X('Marta R.', yes('Lucía P.'))],
  [24, 'crop', 'Leaf pruning', [11, 12], ['Rubén S.', 'Lucía P.'], [], X('Marta R.', yes('Rubén S.'))],
  [24, 'irrigation', 'Irrigation report', [12, 13, 14], ['Rubén S.'], [], X('Marta R.', yes('Rubén S.'))],
  [25, 'applications', 'Spray: plan week 48', [11], ['Marta R.'], [], X('Lucía P.', yes('Marta R.'))],
  [27, 'pollination', 'Pollination sampling', [11, 12], ['Lucía P.'], [], X('Marta R.', yes('Lucía P.'))],
  [30, 'pests', 'Weekly scouting', [11], ['Lucía P.'], [], X('Marta R.')],
];
// Con 25 invernaderos, las mismas actividades abarcan más: se cambian sus invernaderos (y lo ya hecho) al mover el interruptor
const ALT = { 'Leaf pruning': R(1, 12), 'Weekly scouting': N25, 'Drain check': [13], 'Hive check': R(1, 8), 'Irrigation report': N25, 'Spray: plan week 47': R(9, 14), 'Spray: plan week 48': R(9, 14), 'Re-entry opens 18:00': R(9, 14), 'Crop report': N25, 'EC and pH calibration': N25, 'Pollination sampling': R(1, 12), 'Spider mite re-scout': [11, 12, 17], 'Harvest estimate': R(1, 12) };
const BASE = EV.map(e => [e[3], e[5]]);
const calMode = () => EV.forEach((e, i) => { if (!BASE[i]) return; const [g, d] = BASE[i]; e[3] = S.cal.n25 ? ALT[e[2]] || g : g; e[5] = d.length >= g.length ? [...e[3]] : !d.length ? [] : S.cal.n25 ? e[3].slice(0, Math.ceil(e[3].length * .6)) : d; });
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const evSt = e => e[5].length >= e[3].length ? 'done' : e[0] < TD ? 'late' : '';
// Texto corto de los invernaderos: "All GH", "GH 11, 12", "GH 1–12" o "8 greenhouses" si no caben
const ghTxt = g => {
  if (g.length > 1 && g.length === gha().length) return 'All GH';
  const runs = []; [...g].sort((x, y) => x - y).forEach(n => { const r = runs[runs.length - 1]; r && r[1] === n - 1 ? r[1] = n : runs.push([n, n]); });
  return runs.length > 3 ? `${g.length} greenhouses` : 'GH ' + runs.map(([x, y]) => x === y ? x : y === x + 1 ? `${x}, ${y}` : `${x}–${y}`).join(', ');
};
const whoTxt = p => p.length > 2 ? `${p[0]} +${p.length - 1}` : p.join(', ');
const andList = a => new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format(a);
// Días como número desde el 31 oct 2026 (1 = 1 nov), así los de noviembre coinciden con su fecha y se puede pasar a otros meses
const nd = n => new Date(2026, 10, n), dn = d => Math.round((d - nd(0)) / 864e5);
const evDay = e => nd(e[0]).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), clean = s => s.trim().replace(/[<>&]/g, '');
const accOf = (e, p) => e[6].acc[p];
// Qué necesita de mí (reglas A a E aprobadas por Julián, 25 nov 2026). Nadie elige el botón: sale del estado de la actividad.
// A: me la mandaron, no he contestado y su fecha no ha pasado → I can't / I'll do it
// B: una pregunta dirigida a mí (por omisión a quien mandó la actividad) sin respuesta mía a esa pregunta → Reply
// C: alguien a quien yo se la mandé no puede → Give it to someone else / Do it myself / Cancel activity
// D: dije que la hago y su fecha ya pasó sin terminar → Move date / Mark as done
// E: la mandé, es para mañana o antes y alguien no ha contestado nada → Remind / Give it to someone else ("mañana" es supuesto aprobado)
// Notas: [autor, cuándo, texto, es pregunta, a quién va la pregunta, índice de la pregunta que contesta]
const live = e => evSt(e) !== 'done' && !e[6].cx;
const waitMe = e => e[4].includes(ME) && accOf(e, ME) === undefined && live(e);
const qTo = (e, n) => n[4] || e[6].from;
const openQs = e => e[6].notes.filter((n, i) => n[3] && !e[6].notes.some(m => m[5] === i));
const cantOf = e => e[4].filter(p => accOf(e, p) === 0);
const silentOf = e => e[4].filter(p => p !== ME && accOf(e, p) === undefined && !e[6].notes.some(n => n[0] === p));
const why = (e, p) => { const n = [...e[6].notes].reverse().find(n => n[0] === p && n[2].startsWith('Can\'t do: ')); return n ? n[2].slice(10) : ''; };
const asks = () => EV.flatMap((e, k) => {
  if (!live(e)) return [];
  const o = [], mine = e[6].from === ME;
  if (!mine && waitMe(e) && e[0] >= TD) o.push({ t: 'A' });
  e[6].notes.forEach((n, i) => { if (n[3] && n[0] !== ME && qTo(e, n) === ME && !e[6].notes.some(m => m[5] === i)) o.push({ t: 'B', i }); });
  if (mine && cantOf(e).length) o.push({ t: 'C' });
  if (e[4].includes(ME) && accOf(e, ME) === 1 && e[0] < TD) o.push({ t: 'D' });
  if (mine && e[0] <= TD + 1 && silentOf(e).length && e[6].rem !== TD) o.push({ t: 'E' });
  return o.map(a => ({ ...a, e, k }));
}).sort((a, b) => (b.t === 'D') - (a.t === 'D') || a.e[0] - b.e[0]); // vencidas primero, luego por fecha
// Comentarios sin leer: globito verde con el número, "9+" si son más de 9 (pedido de Julián)
const unread = e => e[6].notes.slice(e[6].seen || 0).filter(n => n[0] !== ME).length;
const bdg = e => { const u = unread(e); return u ? `<i class="bdg" aria-label="${u} new comment${u > 1 ? 's' : ''}">${u > 9 ? '9+' : u}</i>` : ''; };
// Las tres relaciones conmigo
const REL = { 'My own': e => e[6].from === ME && e[4].includes(ME), 'Sent to me': e => e[6].from !== ME && e[4].includes(ME), 'Sent by me': e => e[6].from === ME && e[4].some(p => p !== ME) };
// Lo que la ficha dice de la respuesta de los responsables
const flag = (c, t) => ` · <span class="flag" style="color:var(--${c});font-weight:600">${t}</span>`;
const evAns = e => {
  if (evSt(e) === 'done') return '';
  const no = e[4].filter(p => accOf(e, p) === 0), wait = e[4].filter(p => accOf(e, p) === undefined), q = openQs(e).length;
  return (waitMe(e) ? flag('info', 'Waiting for you') : no.length ? flag('warn', `${whoTxt(no)} can't`) : wait.length ? ` · waiting for ${whoTxt(wait)}` : '') + (q ? flag('info', `${q} question${q > 1 ? 's' : ''}`) : '');
};

// Filtros: vista (semana o mes), invernaderos (uno o varios), relación conmigo y módulos. Siempre a la vista, sin pantalla de
// ajustes, y recuerdan la última elección. Errores de la persona: un filtro olvidado se dice siempre en el renglón de conteo, con
// "Clear filters"; una vista sin nada dice qué se está filtrando; y una actividad nueva que el filtro escondería quita los filtros.
const CAL0 = () => ({ view: 'Week', gh: [], who: 'Everyone', off: {}, more: null, n25: false, split: false }), CALW = ['Everyone', ...Object.keys(REL)];
S.cal = CAL0();
try { Object.assign(S.cal, JSON.parse(localStorage.getItem('uni-cal')), { more: null }); } catch (e) {}
if (!Array.isArray(S.cal.gh) || !CALW.includes(S.cal.who) || !S.cal.off || !['Week', 'Month'].includes(S.cal.view)) S.cal = CAL0();
S.cal.n25 = false; // 25 nov 2026: Julián quitó la tarjeta "Mockup only"; la maqueta se queda con los 5 invernaderos
S.cal.d = TD; // día a la vista: al abrir siempre es hoy
calMode();
const calSave = () => { try { localStorage.setItem('uni-cal', JSON.stringify(S.cal)); } catch (e) {} };
// Periodo a la vista: la semana (lunes a domingo) o el mes que contiene S.cal.d
const calPer = () => {
  if (S.cal.view === 'Week') { const a = S.cal.d - (nd(S.cal.d).getDay() + 6) % 7; return [a, a + 6]; }
  const d = nd(S.cal.d); return [dn(new Date(d.getFullYear(), d.getMonth(), 1)), dn(new Date(d.getFullYear(), d.getMonth() + 1, 0))];
};
const inView = e => { const [a, z] = calPer(); return e[0] >= a && e[0] <= z; };
const isoW = d => { const t = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 3 - (d.getDay() + 6) % 7), w1 = new Date(t.getFullYear(), 0, 4); return 1 + Math.round((dn(t) - dn(w1) - 3 + (w1.getDay() + 6) % 7) / 7); };
const calSub = () => {
  const [a, z] = calPer(), A0 = nd(a), Z = nd(z), m = d => d.toLocaleDateString('en-US', { month: 'short' });
  return S.cal.view === 'Month' ? A0.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : `Week ${isoW(A0)} · ${m(A0)} ${A0.getDate()} to ${m(Z) === m(A0) ? '' : m(Z) + ' '}${Z.getDate()}`;
};
const calNav = () => { const [a, z] = calPer(), u = S.cal.view.toLowerCase(); return `<div class="cal-nav"><button class="btn ico" data-action="calp" data-s="-1" aria-label="Previous ${u}" title="Previous ${u}">${icon('back')}</button><button class="btn" data-action="calt"${TD >= a && TD <= z ? ' disabled' : ''}>Today</button><button class="btn ico" data-action="calp" data-s="1" aria-label="Next ${u}" title="Next ${u}">${icon('chev')}</button>${seg('calv', ['Week', 'Month'], S.cal.view)}</div>`; };
A.calp = el => { const s = +el.dataset.s, d = nd(S.cal.d); S.cal.d = S.cal.view === 'Week' ? S.cal.d + 7 * s : dn(new Date(d.getFullYear(), d.getMonth() + s, 1)); S.cal.more = null; render(true); };
A.calt = () => { S.cal.d = TD; S.cal.more = null; render(true); };
const calOn = e => (!S.cal.gh.length || e[3].some(n => S.cal.gh.includes(n))) && (S.cal.who === 'Everyone' || REL[S.cal.who](e)) && !S.cal.off[e[1]] && !e[6].cx; // cx: cancelada
const calFiltered = () => S.cal.gh.length || S.cal.who !== 'Everyone' || Object.values(S.cal.off).some(Boolean);
const calWhat = () => { const hid = Object.keys(CMODS).filter(k => S.cal.off[k]).map(k => CMODS[k][0]); return [S.cal.gh.length ? ghTxt(S.cal.gh) : 'all greenhouses', S.cal.who.toLowerCase(), ...(hid.length ? ['without ' + hid.join(', ')] : [])].join(' · '); };
// Renglón de conteo: cambia con la relación elegida, porque en cada una se pregunta otra cosa
const calInfo = () => {
  const on = EV.filter(e => calOn(e) && inView(e)), f = calFiltered(), n = on.length, c = fn => on.filter(fn).length, open = e => evSt(e) !== 'done';
  if (!n) return ''; // sin actividades el aviso de abajo ya lo dice (y trae "Show everything" si hay filtros)
  const txt = S.cal.who === 'Sent by me' ? `${n} sent by you · ${c(e => open(e) && e[4].every(p => accOf(e, p) === 1))} accepted · ${c(e => open(e) && e[4].some(p => accOf(e, p) === undefined))} waiting for an answer · ${c(e => open(e) && e[4].some(p => accOf(e, p) === 0))} can't · ${c(e => open(e) && openQs(e).length)} with a question · ${c(e => !open(e))} done`
    : S.cal.who === 'Sent to me' ? `${n} sent to you · ${c(e => open(e) && accOf(e, ME) === 1)} accepted · ${c(waitMe)} waiting for your answer · ${c(e => !open(e))} done`
    : S.cal.who === 'My own' ? `${n} of your own · ${c(open)} to finish · ${c(e => !open(e))} done · ${c(e => evSt(e) === 'late')} overdue`
    : `${c(e => !open(e))} of ${n} done · ${c(e => evSt(e) === 'late')} overdue`;
  const hid = Object.keys(CMODS).filter(k => S.cal.off[k]).map(k => CMODS[k][0]), pre = [...(S.cal.gh.length ? [ghTxt(S.cal.gh)] : []), ...(hid.length ? ['without ' + hid.join(', ')] : [])].join(' · ');
  return `${pre ? `Showing ${pre} · ` : ''}${txt}${f ? ' · <button data-action="calclear">Clear filters</button>' : ''}`;
};
// Lo que necesita de mí: siempre arriba, sin importar los filtros ni la vista
const askRow = ({ t, e, k, i }) => {
  const d = `${evDay(e)}${e[6].tm ? ' · ' + e[6].tm : ''}`, at = `data-k="${k}"`;
  const R = (title, sub, btns, q = '') => `<div><button class="cal-in" data-action="ev" ${at}${q}><b>${title}</b><span>${sub}</span></button>${btns}</div>`;
  if (t === 'A') return R(`${e[6].from} asks you to do ${e[2]}`, `${d} · ${ghTxt(e[3])}`, `<button class="btn" data-action="evcant" ${at}>I can't</button><button class="btn primary" data-action="evacc" ${at}>${icon('check')}I'll do it</button>`);
  if (t === 'B') { const q = e[6].notes[i]; return R(`${q[0]} asked you a question · ${e[2]}`, `"${q[2]}"`, `<button class="btn primary" data-action="ev" ${at} data-q="${i}">Reply to ${q[0]}</button>`, ` data-q="${i}"`); }
  if (t === 'C') { const no = cantOf(e), w = why(e, no[0]); return R(`${andList(no)} can't do ${e[2]}`, `${d}${w ? ` · "${w}"` : ''}`, `<button class="btn" data-action="evself" ${at}>Do it myself</button><button class="btn primary" data-action="ev" ${at}>Give it to someone else</button>`); }
  if (t === 'D') return R(`${e[2]} is overdue`, `Was due ${d} · ${ghTxt(e[3])} · you said you'd do it`, `<button class="btn" data-action="ev" ${at}>Move date</button><button class="btn primary" data-action="evfin" ${at}>${icon('check')}Mark as done</button>`);
  return R(`No answer yet from ${andList(silentOf(e))}`, `${e[2]} · ${d} · ${ghTxt(e[3])}`, `<button class="btn" data-action="ev" ${at}>Give it to someone else</button><button class="btn primary" data-action="evrem" ${at}>Remind</button>`);
};
const calInbox = () => { const r = asks(); return r.length ? `<div class="cal-inbox"><b>${r.length} ${r.length > 1 ? 'things need' : 'thing needs'} you</b>${r.map(askRow).join('')}</div>` : ''; };
// Las dos formas de dibujar: una ficha por actividad (la propuesta) o una ficha por cada invernadero de la actividad (la alternativa)
const cardsOf = on => S.cal.split ? on.flatMap(([e, k]) => e[3].filter(n => !S.cal.gh.length || S.cal.gh.includes(n)).map(n => [e, k, n])) : on;
const evCard = ([e, k, n]) => {
  if (n) { const st = e[5].includes(n) ? 'done' : e[0] < TD ? 'late' : ''; return `<button class="ev ${st}" data-action="ev" data-k="${k}" style="border-color:${MC[e[1]]}">${bdg(e)}<b>${e[2]}</b><span>${e[6].tm ? e[6].tm + ' · ' : ''}GH ${n} · ${whoTxt(e[4])}${st === 'late' ? flag('crit', 'Overdue') : ''}</span></button>`; }
  const st = evSt(e), part = e[3].length > 1 && e[5].length && st !== 'done' ? ` · ${e[5].length} of ${e[3].length} done` : '';
  return `<button class="ev ${st}" data-action="ev" data-k="${k}" style="border-color:${MC[e[1]]}">${bdg(e)}<b>${e[2]}</b><span>${e[6].tm ? e[6].tm + ' · ' : ''}${ghTxt(e[3])} · ${whoTxt(e[4])}${part}${st === 'late' ? flag('crit', 'Overdue') : ''}${evAns(e)}</span></button>`;
};
const calDemo = () => { const on = EV.map((e, k) => [e, k]).filter(([e]) => calOn(e) && inView(e)); return `${on.length} ${on.length === 1 ? 'activity' : 'activities'} this ${S.cal.view.toLowerCase()}`; }; // 25 nov 2026: Julián quitó "= N cards"
const calWeek = act => { const a = calPer()[0]; return `<div class="cal">${DAYS.map((d, i) => { const n = a + i, on = cardsOf(act), day = on.filter(([e]) => e[0] === n), big = day.length > 4, open = big && (S.cal.more || []).includes(n); return `<div class="day${n === TD ? ' today' : ''}"><div class="dh"><b>${nd(n).getDate()}</b>${d}</div>${(open || !big ? day : day.slice(0, 4)).map(evCard).join('')}${big ? `<button class="ev-more" data-action="calmore" data-d="${n}" aria-expanded="${open}">${open ? 'Show less' : `+ ${day.length - 4} more`}</button>` : ''}</div>`; }).join('')}</div>`; };
// 25 nov 2026: cada día se abre y se cierra por su cuenta ("Show less"); antes abrir uno cerraba el otro sin que la persona lo pidiera
// Mes: seis semanas de lunes a domingo desde el lunes de la semana del día 1. Cada día enseña hasta tres actividades y el resto en "+ N more".
const calMonth = act => { const a = calPer()[0], g0 = a - (nd(a).getDay() + 6) % 7, mo = nd(a).getMonth(); return `<div class="mon"><div class="mon-h">${DAYS.map(d => `<span>${d}</span>`).join('')}</div><div class="mon-g">${Array.from({ length: 42 }, (_, i) => {
  const on = cardsOf(act), n = g0 + i, inM = nd(n).getMonth() === mo, day = inM ? on.filter(([e]) => e[0] === n) : [];
  return `<div class="mon-c${inM ? '' : ' out'}${inM && n === TD ? ' today' : ''}"><b>${nd(n).getDate()}</b>${day.slice(0, 3).map(([e, k, g]) => `<button class="mev ${g ? (e[5].includes(g) ? 'done' : e[0] < TD ? 'late' : '') : evSt(e)}" data-action="ev" data-k="${k}" style="border-color:${MC[e[1]]}">${bdg(e)}${e[2]}${g ? ' · ' + g : ''}</button>`).join('')}${day.length > 3 ? `<button class="ev-more" data-action="calday" data-d="${n}">+ ${day.length - 3} more</button>` : ''}</div>`;
}).join('')}</div></div>`; };
const calHtml = () => {
  const on = EV.map((e, k) => [e, k]).filter(([e]) => calOn(e) && inView(e));
  if (!on.length) { const u = S.cal.view.toLowerCase(), [a, z] = calPer(); return calFiltered()
    ? `<div class="cal-empty"><b>Nothing scheduled this ${u} in this view</b><span>Showing ${calWhat()}</span><button class="btn" data-action="calclear">Show everything</button></div>`
    : `<div class="cal-empty"><b>Nothing scheduled this ${u}</b>${TD >= a && TD <= z ? '' : `<button class="btn" data-action="calt">Go to today</button>`}</div>`; }
  return S.cal.view === 'Month' ? calMonth(on) : calWeek(on);
};
const calDraw = () => {
  if (!$('#cal')) return;
  $('#view').classList.add('still'); // redibujar no repite la animación de entrada de las tarjetas
  $('#cal').innerHTML = calHtml(); $('#cal-info').innerHTML = calInfo(); $('#cal-inbox').innerHTML = calInbox(); $('#cal-cards').textContent = calDemo();
  $$('[data-action="calg"]').forEach(b => b.setAttribute('aria-pressed', b.dataset.n ? S.cal.gh.includes(+b.dataset.n) : !S.cal.gh.length));
};
// Invernaderos en un solo renglón que se desliza de lado (pedido de Julián, 25 nov 2026). "All" se queda fijo a la izquierda.
// Errores de la persona: no saber que hay más (flechas y borde difuminado del lado donde hay más) y olvidar uno elegido que quedó
// fuera de la vista (el renglón de conteo siempre dice "Showing GH …").
// Lo usan el filtro del calendario y el "Where" de "New activity" (25 nov 2026: Julián pidió lo mismo en el formulario).
const ghsEdge = r => {
  if (!r) return $$('.ghs-r').forEach(ghsEdge);
  const w = r.parentElement, l = r.scrollLeft > 2, m = r.scrollLeft + r.clientWidth < r.scrollWidth - 2;
  w.classList.toggle('l', l); w.classList.toggle('r', m); $('.ghs-a', w).hidden = !l; $('.ghs-a.r', w).hidden = !m;
};
document.addEventListener('scroll', e => e.target.classList?.contains('ghs-r') && ghsEdge(e.target), true);
addEventListener('resize', () => ghsEdge());
A.ghsc = el => { const r = $('.ghs-r', el.parentElement); r.scrollBy({ left: +el.dataset.s * r.clientWidth * .8, behavior: 'smooth' }); };
const ghBtns = (list, on, act) => list.map(n => `<button type="button" data-action="${act}" data-v="${n}" data-n="${n}" aria-pressed="${on.includes(n)}">GH ${n}</button>`).join('');
const ghScroll = (id, list, on, act, allAct, allOn) => `<div class="ghs"><button type="button" data-action="${allAct}" data-id="${id}" id="${id}-all" aria-pressed="${allOn}">All</button><div class="ghs-w"><button type="button" class="ghs-a" data-action="ghsc" data-s="-1" aria-label="Show previous greenhouses" hidden>${icon('back')}</button><div class="pick ghs-r" id="${id}">${ghBtns(list, on, act)}</div><button type="button" class="ghs-a r" data-action="ghsc" data-s="1" aria-label="Show more greenhouses" hidden>${icon('chev')}</button></div></div>`;
A.calg = el => { const n = +el.dataset.n; S.cal.gh = !el.dataset.n ? [] : S.cal.gh.includes(n) ? S.cal.gh.filter(x => x !== n) : [...S.cal.gh, n].sort((a, b) => a - b); calSave(); calDraw(); };
// "All" del formulario: elige todos; si ya estaban todos, los quita
A.ghall = el => { const bs = $$(`#${el.dataset.id} button`), all = bs.every(b => b.getAttribute('aria-pressed') === 'true'); bs.forEach(b => b.setAttribute('aria-pressed', !all)); FORM && FORM(); };
SEG.caln = v => { S.cal.n25 = v[0] === '2'; S.cal.gh = []; calMode(); calSave(); render(true); };
SEG.calc = v => { S.cal.split = v.includes('greenhouse'); S.cal.more = null; calSave(); render(true); };
SEG.calw = v => { S.cal.who = v; calSave(); calDraw(); };
SEG.calv = v => { S.cal.view = v; calSave(); render(true); };
A.calm = el => { const k = el.dataset.k; S.cal.off[k] = !S.cal.off[k]; el.setAttribute('aria-pressed', !S.cal.off[k]); calSave(); calDraw(); };
A.calmore = el => { const n = +el.dataset.d, m = S.cal.more || []; S.cal.more = m.includes(n) ? m.filter(x => x !== n) : [...m, n]; calDraw(); };
A.calday = el => { const n = +el.dataset.d; openSheet(evDay([n]), EV.map((e, k) => [e, k]).filter(([e]) => e[0] === n && calOn(e)).map(evCard).join(''), `<span class="msg">Open an activity to answer, add a note or close a greenhouse.</span><button class="btn" data-action="close">Close</button>`); };
A.calclear = () => { S.cal = { ...CAL0(), view: S.cal.view, n25: S.cal.n25, split: S.cal.split, d: S.cal.d }; calSave(); render(true); };

// Ficha de una actividad (25 nov 2026, aprobado por Julián): arriba "What you need to do" con solo lo que me toca y se resuelve
// ahí mismo; abajo los detalles en pocos renglones, la gente y su respuesta, los invernaderos y los comentarios.
// Errores de la persona: contestar a la persona equivocada (el botón trae el nombre), "I can't" sin motivo, pasarla sin elegir
// a nadie y mover la fecha sin elegirla (los botones no se activan), y deshacer cualquier acción desde el aviso ("Undo").
const peoplePick = (x = []) => `${pick('ev-w', [[ME, 'Me'], ...wTop().map(p => [p, p])].filter(([p]) => !x.includes(p)), [])}<input class="input ev-ws" id="ev-ws" placeholder="Search people by name" autocomplete="off" aria-label="Search people" data-x="${x.join('|')}"><div class="ev-wr" id="ev-wr"></div>`;
const wSearch = w => {
  const s = $('#ev-ws'); if (!s) return;
  const q = s.value.trim().toLowerCase(), x = s.dataset.x ? s.dataset.x.split('|') : [], hits = q ? PEOPLE.filter(p => p.toLowerCase().includes(q) && !w.includes(p) && !x.includes(p)).slice(0, 6) : [];
  $('#ev-wr').innerHTML = !q ? '' : hits.length ? hits.map(p => `<button type="button" data-action="wadd" data-v="${p}">${icon('plus')}${p === ME ? 'Me' : p}</button>`).join('') : `<span>No one matches "${clean(s.value)}". Check the spelling.</span>`;
};
const todo = ({ t, e, k, i }, d) => {
  const x = e[6], at = `data-k="${k}"`, T = (h, body) => `<div class="ev-todo"><span class="k">What you need to do</span><p>${h}</p>${body}</div>`;
  if (t === 'A') return d.cant
    ? T(`Tell <b>${x.from}</b> why you can't do it.`, `<input class="input" id="ev-why" placeholder="For example: I am off that day" autocomplete="off" aria-label="Why you can't"><div class="ev-ans"><button class="btn" data-action="ev" ${at}>Back</button><button class="btn primary" id="ev-no" data-action="evno" ${at} disabled>Send "I can't" to ${x.from}</button></div>`)
    : T(`<b>${x.from}</b> asks you to do this. Will you do it?`, `<div class="ev-ans"><button class="btn" data-action="evcant" ${at}>I can't</button><button class="btn primary" data-action="evacc" ${at}>${icon('check')}I'll do it</button></div>`);
  if (t === 'B') { const q = x.notes[i]; return T(`<b>${q[0]}</b> asks you: "${q[2]}"`, `<input class="input" id="ev-rep" placeholder="Your reply to ${q[0]}" autocomplete="off" aria-label="Your reply"><div class="ev-ans"><button class="btn primary" id="ev-rb" data-action="evrep" ${at} data-q="${i}" disabled>Reply to ${q[0]}</button></div>`); }
  if (t === 'D') return T(`This was due <b>${evDay(e)}</b>. Is it done?`, `<select class="select" id="ev-nd" aria-label="New date" style="width:100%;height:40px"><option value="" disabled selected>Choose a new date</option>${Array.from({ length: 14 }, (_, j) => `<option value="${TD + j}">${evDay([TD + j])}</option>`).join('')}</select><div class="ev-ans"><button class="btn" id="ev-mv" data-action="evmove" ${at} disabled>Move date</button><button class="btn primary" data-action="evfin" ${at}>${icon('check')}Mark as done</button></div>`);
  const rm = t === 'C' ? cantOf(e) : silentOf(e), w = t === 'C' ? why(e, rm[0]) : '';
  return T(t === 'C' ? `<b>${andList(rm)}</b> can't do it${w ? `: "${w}"` : '.'} Who does it now?` : `<b>${andList(rm)}</b> ${rm.length > 1 ? 'haven\'t' : 'hasn\'t'} answered. It's due ${evDay(e)}.`,
    `${peoplePick([...e[4]])}<div class="ev-ans">${t === 'C' ? `<button class="btn" data-action="evcx" ${at}>Cancel activity</button><button class="btn" data-action="evself" ${at}>Do it myself</button>` : `<button class="btn" data-action="evrem" ${at}>Remind ${andList(rm)}</button>`}<button class="btn primary" id="ev-gv" data-action="evgive" data-t="${t}" ${at} disabled>Give it to someone</button></div>`);
};
A.ev = el => {
  const k = +el.dataset.k, e = EV[k], st = evSt(e), x = e[6], d = el.dataset, my = asks().filter(a => a.k === k);
  const a = d.q != null ? my.find(y => y.t === 'B' && y.i === +d.q) : my[0], seen0 = x.seen || 0;
  const ppl = [x.from, ...e[4]].filter((p, j, s) => p !== ME && s.indexOf(p) === j), askTo = x.from === ME ? ppl[0] : x.from;
  const ans = p => accOf(e, p) === 1 ? chip('ok', 'Will do it') : accOf(e, p) === 0 ? chip('warn', 'Can\'t') : chip('info', 'No answer yet');
  const notes = x.notes.length ? `<ul class="ev-notes">${x.notes.map((n, j) => {
    const re = n[5] != null ? x.notes[n[5]] : null, open = n[3] && !x.notes.some(m => m[5] === j), to = n[3] ? qTo(e, n) : '';
    return `<li${j >= seen0 && n[0] !== ME ? ' class="new"' : ''}><b>${n[0] === ME ? 'You' : n[0]}</b><span>${n[1]}</span>${n[3] ? chip(open ? 'info' : 'ok', `Question to ${to === ME ? 'you' : to}${open ? '' : ' · answered'}`) : ''}${re ? chip('plain', `Reply to ${re[0] === ME ? 'you' : re[0]}`) : ''}<p>${n[2]}</p>`
      + `${open && to === ME && n[0] !== ME ? `<button class="lnk" data-action="ev" data-k="${k}" data-q="${j}">Reply to ${n[0]}</button>` : ''}`
      + `${!n[3] && !re && n[0] === ME && askTo && !n[2].startsWith('Can\'t do: ') ? `<button class="lnk" data-action="evtoq" data-k="${k}" data-j="${j}">Make it a question to ${askTo}</button>` : ''}</li>`;
  }).join('')}</ul>` : '<p class="hint" style="margin:0 0 10px">No comments yet.</p>';
  x.seen = x.notes.length; // abrir la actividad es leer sus comentarios
  openSheet(e[2], `${a ? todo(a, d) : ''}
    <p class="ev-line">${x.cx ? chip('plain', 'Cancelled') : st === 'done' ? chip('ok', 'Done') : st === 'late' ? chip('crit', 'Overdue') : chip('info', 'Scheduled')}<span>${CMODS[e[1]][0]} · ${evDay(e)}${x.tm ? ' · ' + x.tm : ''} · from ${x.from === ME ? 'you' : x.from}</span></p>
    <h3>Sent to</h3><ul class="ev-gh">${e[4].map(p => `<li><span class="avatar">${p.split(' ').map(w => w[0]).join('')}</span><b>${p === ME ? 'You' : p}</b>${ans(p)}</li>`).join('')}</ul>
    <h3>Greenhouses${e[3].length > 1 ? ` · ${e[5].length} of ${e[3].length} done` : ''}</h3>${e[3].length > 8
      ? `<div class="gh-done">${e[3].map(n => `<button data-action="evdone" data-k="${k}" data-n="${n}" aria-label="Greenhouse ${n}, ${e[5].includes(n) ? 'done' : 'mark as done'}"${e[5].includes(n) ? ' class="on" disabled' : ''}>${n}</button>`).join('')}</div><div class="ev-ans"><span style="flex:1;font-size:13px;color:var(--ink-2)">Tap a number to mark it.</span>${st === 'done' ? '' : `<button class="btn" data-action="evall" data-k="${k}">Mark all as done</button>`}</div>`
      : `<ul class="ev-gh">${e[3].map(n => `<li><span class="avatar">${n}</span><b>Greenhouse ${n}</b>${e[5].includes(n) ? chip('ok', 'Done') : `<button class="btn" data-action="evdone" data-k="${k}" data-n="${n}">${icon('check')}Mark as done</button>`}</li>`).join('')}</ul>`}
    <h3>Comments and questions</h3>${notes}
    <div class="ev-add"><input class="input" id="ev-n" placeholder="Write a comment or a question" autocomplete="off" aria-label="Comment or question"></div>
    <div class="ev-ans">${askTo ? `<select class="select" id="ev-qt" aria-label="Who the question is for" style="width:auto;height:36px">${ppl.map(p => `<option${p === askTo ? ' selected' : ''}>${p}</option>`).join('')}</select><button class="btn" id="ev-qb" data-action="evask" data-k="${k}" disabled>Ask</button>` : ''}<button class="btn" id="ev-nb" data-action="evnote" data-k="${k}" disabled>Comment</button></div>
    <p class="ev-hint" id="ev-hint"></p>`,
    `<span class="msg">Comments are added, never edited.</span><button class="btn" data-action="close">Close</button>`);
  FORM = () => {
    const v = id => $(id) ? $(id).value.trim() : '';
    if ($('#ev-no')) $('#ev-no').disabled = v('#ev-why').length < 3;
    if ($('#ev-rb')) $('#ev-rb').disabled = v('#ev-rep').length < 2;
    if ($('#ev-mv')) $('#ev-mv').disabled = !$('#ev-nd').value;
    if ($('#ev-gv')) { const w = picked('ev-w'); wSearch(w); $('#ev-gv').disabled = !w.length; $('#ev-gv').textContent = w.length ? `Give it to ${andList(w.map(p => p === ME ? 'me' : p))}` : 'Give it to someone'; }
    const n = v('#ev-n'); $('#ev-nb').disabled = n.length < 2; if ($('#ev-qb')) $('#ev-qb').disabled = n.length < 2;
    $('#ev-hint').textContent = n.endsWith('?') && askTo ? `This looks like a question. Ask ${$('#ev-qt').value} instead?` : '';
  };
  calDraw();
  if (d.cant) $('#ev-why').focus(); else if (a && a.t === 'B') $('#ev-rep').focus();
};
// Cada acción deja la ficha al día y un aviso con "Undo"
const evDid = (k, msg, undo) => { calDraw(); sheet.classList.contains('on') && A.ev({ dataset: { k } }); toast(msg, () => { undo(); calDraw(); sheet.classList.contains('on') && A.ev({ dataset: { k } }); }); };
A.evacc = el => { const k = +el.dataset.k, e = EV[k]; e[6].acc[ME] = 1; evDid(k, `You'll do ${e[2]} · ${e[6].from} was told`, () => delete e[6].acc[ME]); };
A.evcant = el => A.ev({ dataset: { k: el.dataset.k, cant: 1 } });
A.evno = el => { const k = +el.dataset.k, e = EV[k], n = [ME, 'Now', 'Can\'t do: ' + clean($('#ev-why').value)]; e[6].acc[ME] = 0; e[6].notes.push(n); e[6].seen = e[6].notes.length; A.ev({ dataset: { k } }); evDid(k, `${e[6].from} was told you can't`, () => { delete e[6].acc[ME]; e[6].notes.splice(e[6].notes.indexOf(n), 1); }); };
const addNote = (k, n, msg) => { const e = EV[k]; e[6].notes.push(n); e[6].seen = e[6].notes.length; A.ev({ dataset: { k } }); evDid(k, msg, () => e[6].notes.splice(e[6].notes.indexOf(n), 1)); };
A.evrep = el => { const k = +el.dataset.k, i = +el.dataset.q, q = EV[k][6].notes[i]; addNote(k, [ME, 'Now', clean($('#ev-rep').value), 0, undefined, i], `Reply sent to ${q[0]}`); };
A.evnote = el => addNote(+el.dataset.k, [ME, 'Now', clean($('#ev-n').value)], 'Comment added');
A.evask = el => { const to = $('#ev-qt').value; addNote(+el.dataset.k, [ME, 'Now', clean($('#ev-n').value), 1, to], `Question sent to ${to}`); };
A.evtoq = el => { const k = +el.dataset.k, e = EV[k], n = e[6].notes[+el.dataset.j], to = e[6].from === ME ? e[4].find(p => p !== ME) : e[6].from; n[3] = 1; n[4] = to; A.ev({ dataset: { k } }); evDid(k, `Now a question to ${to}`, () => { n[3] = 0; n[4] = undefined; }); };
const swap = (e, out, add) => { const old = [[...e[4]], { ...e[6].acc }]; e[4] = [...e[4].filter(p => !out.includes(p)), ...add.filter(p => !e[4].includes(p) || out.includes(p))]; out.forEach(p => delete e[6].acc[p]); if (add.includes(ME)) e[6].acc[ME] = 1; return () => { e[4] = old[0]; e[6].acc = old[1]; }; };
A.evgive = el => { const k = +el.dataset.k, e = EV[k], out = el.dataset.t === 'C' ? cantOf(e) : silentOf(e), p = picked('ev-w'), undo = swap(e, out, p); evDid(k, `${e[2]} given to ${andList(p.map(x => x === ME ? 'you' : x))} · ${andList(out)} ${out.length > 1 ? 'were' : 'was'} told`, undo); };
A.evself = el => { const k = +el.dataset.k, e = EV[k], out = cantOf(e), undo = swap(e, out, [ME]); evDid(k, `You'll do ${e[2]} · ${andList(out)} ${out.length > 1 ? 'were' : 'was'} told`, undo); };
A.evcx = el => { const k = +el.dataset.k, e = EV[k]; e[6].cx = 1; closeSheet(); calDraw(); toast(`${e[2]} cancelled · everyone on it was told`, () => { e[6].cx = 0; calDraw(); }); };
A.evfin = el => { const k = +el.dataset.k, e = EV[k], old = [...e[5]]; e[5] = [...e[3]]; evDid(k, `${e[2]} marked as done`, () => { e[5] = old; }); };
A.evmove = el => { const k = +el.dataset.k, e = EV[k], old = e[0]; e[0] = +$('#ev-nd').value; evDid(k, `${e[2]} moved to ${evDay(e)}`, () => { e[0] = old; }); };
A.evrem = el => { const k = +el.dataset.k, e = EV[k], who = silentOf(e); e[6].rem = TD; evDid(k, `Reminder sent to ${andList(who)}`, () => { delete e[6].rem; }); };
A.evdone = el => {
  const k = +el.dataset.k, e = EV[k], n = +el.dataset.n, auto = e[4].includes(ME) && accOf(e, ME) === undefined;
  e[5] = [...e[5], n]; if (auto) e[6].acc[ME] = 1; // marcar como hecho algo mío es aceptarlo
  calDraw(); A.ev({ dataset: { k } });
  toast(`${e[2]} · GH ${n} marked as done`, () => { e[5] = e[5].filter(x => x !== n); if (auto) delete e[6].acc[ME]; calDraw(); });
};
A.evall = el => { const k = +el.dataset.k, e = EV[k], left = e[3].filter(n => !e[5].includes(n)), auto = e[4].includes(ME) && accOf(e, ME) === undefined; e[5] = [...e[3]]; if (auto) e[6].acc[ME] = 1; calDraw(); A.ev({ dataset: { k } }); toast(`${e[2]} · ${left.length} greenhouses marked as done`, () => { e[5] = e[5].filter(n => !left.includes(n)); if (auto) delete e[6].acc[ME]; calDraw(); }); };

// Formulario "New activity": qué, dónde, cuándo y quién. "Send" no se activa hasta tener las cuatro; el pie dice qué falta.
const pick = (id, items, on) => `<div class="pick" id="${id}">${items.map(([v, t]) => `<button type="button" data-action="pick" data-v="${v}" aria-pressed="${on.includes(v)}">${t}</button>`).join('')}</div>`;
const picked = id => $$(`#${id} [aria-pressed="true"]`).map(b => b.dataset.v);
A.pick = el => { el.setAttribute('aria-pressed', el.getAttribute('aria-pressed') !== 'true'); FORM && FORM(); };
// Hora de la actividad (pedido de Julián, 25 nov 2026): cualquier hora, a una hora o de una hora a otra, cada 30 minutos.
// Errores de la persona: no hay hora puesta de antemano (se elige o "Send" no se activa) y "to" solo ofrece horas después de "from".
const TMS = Array.from({ length: 49 }, (_, i) => `${String(i >> 1).padStart(2, '0')}:${i % 2 ? '30' : '00'}`);
const tmTxt = () => { const tm = $('[data-seg="evtm"] [aria-pressed="true"]').textContent, a = $('#ev-t1').value, b = $('#ev-t2').value; return tm === 'Any time' || a === '' ? '' : tm === 'At a time' ? TMS[a] : b ? `${TMS[a]} to ${TMS[b]}` : ''; };
SEG.evtm = () => FORM && FORM();
// "Send to" (pedido de Julián, 25 nov 2026): a quien se le manda no siempre es responsable (ej. una junta). Arriba "Me" y las 3
// personas a las que más les mandas; a cualquier otra se le busca por nombre. Errores de la persona: nombre mal escrito (dice que
// nadie coincide), persona equivocada (se quita picando su nombre) y mandarla sin nadie ("Send" no se activa).
const PEOPLE = [...PPL, 'Ana L.', 'Carlos V.', 'Diego R.', 'Elena M.', 'Fernanda C.', 'Gabriel O.', 'Iván T.', 'Jimena S.', 'Karla N.']; // inventados
const USE0 = { 'Rubén S.': 14, 'Lucía P.': 11, 'Jimena S.': 6, 'Carlos V.': 2 }; // historial inventado de la maqueta
const wTop = () => { const c = { ...USE0 }; EV.forEach(e => e[6].from === ME && e[4].forEach(p => { c[p] = (c[p] || 0) + 1; })); delete c[ME]; return Object.keys(c).sort((a, b) => c[b] - c[a]).slice(0, 3); };
A.wadd = el => { const v = el.dataset.v, b = $(`#ev-w [data-v="${v}"]`); if (b) b.setAttribute('aria-pressed', 'true'); else $('#ev-w').insertAdjacentHTML('beforeend', `<button type="button" data-action="pick" data-v="${v}" aria-pressed="true">${v}</button>`); $('#ev-ws').value = ''; FORM(); $('#ev-ws').focus(); };
A.newev = () => {
  const gl = gha();
  openSheet('New activity',
    `${field('What', '<input class="input" id="ev-t" placeholder="For example: Leaf pruning" autocomplete="off">')}
     ${field('Module', select(Object.values(CMODS).map(m => m[0]), 'id="ev-m"'))}
     <div class="field"><span>Where · one or several greenhouses</span>${ghScroll('ev-g', gl, S.cal.gh.filter(n => gl.includes(n)), 'pick', 'ghall', false)}<em id="ev-gc"></em></div>
     ${field('When', select(Array.from({ length: 14 }, (_, i) => evDay([TD + i])), 'id="ev-d"'))}
     <div class="field"><span>Time</span>${seg('evtm', ['Any time', 'At a time', 'From – to'], 'Any time')}<div class="ev-tm" id="ev-tm" hidden><select class="select" id="ev-t1" aria-label="Start time"><option value="" disabled selected>Choose a time</option>${TMS.slice(0, 48).map((t, i) => `<option value="${i}">${t}</option>`).join('')}</select><span class="ev-to">to</span><select class="select" id="ev-t2" aria-label="End time" disabled><option value="" disabled selected>Choose a time</option></select></div><em></em></div>
     ${field('Repeat', select(['Never', 'Every day', 'Every week', 'Every 2 weeks', 'Every month'], 'id="ev-r"'))}
     <div id="ev-end" hidden>${field('Ends', select(['At the end of the cycle', 'After 4 times', 'After 8 times', 'Never · repeats always']), 'Choose when it stops. "Never" keeps it in the calendar until someone stops it.')}</div>
     <div class="field"><span>Send to · one or several people</span>${peoplePick()}<em>Your 3 most used are shown. Each person gets it in their own list and answers: I'll do it or I can't.</em></div>
     ${field('Note · optional', '<input class="input" id="ev-note" placeholder="Anything they need to know" autocomplete="off">')}`,
    `<span class="msg" id="ev-msg"></span><button class="btn" data-action="close">Cancel</button><button class="btn primary" id="ev-save" data-action="evsave" disabled>Send</button>`);
  FORM = () => {
    const t = $('#ev-t').value.trim(), g = picked('ev-g').map(Number), w = picked('ev-w'), day = TD + $('#ev-d').selectedIndex, b = $('#ev-save');
    const tm = $('[data-seg="evtm"] [aria-pressed="true"]').textContent, rng = tm === 'From – to', a = $('#ev-t1').value, t2 = $('#ev-t2');
    $('#ev-tm').hidden = tm === 'Any time'; $('.ev-to').hidden = t2.hidden = !rng; t2.disabled = a === '';
    if (a !== '' && t2.dataset.f !== a) { const keep = t2.value; t2.innerHTML = `<option value="" disabled selected>Choose a time</option>${TMS.slice(+a + 1).map((x, j) => `<option value="${+a + 1 + j}">${x}</option>`).join('')}`; if (keep !== '' && +keep > +a) t2.value = keep; t2.dataset.f = a; }
    const miss = t.length < 2 ? 'Write the activity.' : !g.length ? 'Choose at least one greenhouse.' : tm !== 'Any time' && a === '' ? 'Choose the time.' : rng && !t2.value ? 'Choose when it ends.' : !w.length ? 'Choose who to send it to.' : '';
    wSearch(w);
    const when = $('#ev-d').value + (tmTxt() ? ' · ' + tmTxt() : '');
    const dup = miss ? -1 : EV.findIndex(e => e[0] === day && e[2].toLowerCase() === t.toLowerCase() && e[3].some(n => g.includes(n)));
    $('#ev-g-all').setAttribute('aria-pressed', g.length === gl.length);
    $('#ev-end').hidden = !$('#ev-r').selectedIndex; $('#ev-gc').textContent = g.length ? `${ghTxt(g)} · ${g.length} selected` : '';
    if (dup >= 0) { b.disabled = false; b.textContent = 'Open the existing one'; b.dataset.action = 'ev'; b.dataset.k = dup; $('#ev-msg').textContent = 'Already scheduled that day in one of those greenhouses.'; return; }
    b.disabled = !!miss; b.textContent = w.length && w.every(p => p === ME) ? 'Save' : 'Send'; b.dataset.action = 'evsave';
    $('#ev-msg').textContent = miss || (w.every(p => p === ME) ? `It goes to your own list for ${when}.` : `${andList(w.map(p => p === ME ? 'you' : p)).replace(/^y/, 'Y')} ${w.length === 1 && w[0] !== ME ? 'gets' : 'get'} it for ${when}.`);
  };
  FORM(); ghsEdge(); thumbs(); $('#ev-t').focus();
};
A.evsave = () => {
  const w = picked('ev-w'), note = clean($('#ev-note').value);
  const e = [TD + $('#ev-d').selectedIndex, Object.keys(CMODS)[$('#ev-m').selectedIndex], clean($('#ev-t').value), picked('ev-g').map(Number), w, [], X(ME, w.includes(ME) ? yes(ME) : {}, note ? [[ME, 'Now', note]] : [])];
  e[6].tm = tmTxt();
  const others = w.filter(p => p !== ME);
  EV.push(e); closeSheet();
  if (calOn(e) && inView(e)) calDraw(); else { S.cal = { ...CAL0(), view: S.cal.view, split: S.cal.split, d: e[0] }; calSave(); render(true); } // la lleva a la semana o mes de la actividad
  toast(others.length ? `Sent to ${whoTxt(others)} · waiting for their answer` : 'Added to your own list', () => { EV.splice(EV.indexOf(e), 1); calDraw(); });
};
V.calendar = () => ({
  title: 'Calendar', sub: calSub(),
  actions: `<button class="btn primary" data-action="newev">${icon('plus')}New activity</button>`,
  html: `<div id="cal-inbox">${calInbox()}</div><div class="card">
    <div class="cal-f"><span>Cards</span>${seg('calc', ['One card per activity', 'One card per greenhouse'], S.cal.split ? 'One card per greenhouse' : 'One card per activity')}<b class="cal-n" id="cal-cards">${calDemo()}</b></div>
    <div class="cal-f"><span>Greenhouses</span>${ghScroll('cal-gh', cgh(), S.cal.gh, 'calg', 'calg', !S.cal.gh.length)}</div>
    <div class="cal-f"><span>Show</span>${seg('calw', CALW, S.cal.who)}</div>
    <div class="cal-f"><span>Modules</span><div class="legend">${Object.entries(CMODS).map(([k, m]) => `<button data-action="calm" data-k="${k}" aria-pressed="${!S.cal.off[k]}"><i class="sq" style="background:${MC[k]}"></i>${m[0]}</button>`).join('')}</div></div>
    <div class="cal-bar"><div class="cal-info" id="cal-info">${calInfo()}</div>${calNav()}</div>
    <div id="cal">${calHtml()}</div></div>`,
  after: () => ghsEdge(),
});

// ---------- Cycles ----------
// Pedido de Julián (19 nov 2026): Active, Planned y Past; botón "View cycle" a la derecha de Status; y una segunda vista,
// "Calendar", con todos los ciclos del año por invernadero. Los activos salen de GH (día x de n); pasados y planeados son inventados.
const D0 = new Date(2026, 10, 17); // hoy en la maqueta: martes 17 nov 2026
const dAdd = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n), dDiff = (a, b) => Math.round((b - a) / 864e5);
const dFmt = (d, y) => d.toLocaleDateString('en-US', y ? { month: 'short', day: 'numeric', year: 'numeric' } : { month: 'short', day: 'numeric' });
const CYC = [
  ...GH.filter(g => g.crop).map(g => { const s = dAdd(D0, 1 - g.day); return { gh: g.n, crop: g.crop, code: g.n === 14 ? '2026-C' : '2026-B', s, e: dAdd(s, g.of - 1) }; }),
  { gh: 11, crop: 'Tomato · Roma', code: '2026-A', s: new Date(2026, 0, 12), e: new Date(2026, 7, 3) },
  { gh: 14, crop: 'Cucumber · Persian', code: '2026-B', s: new Date(2026, 4, 4), e: new Date(2026, 8, 14) },
  { gh: 15, crop: 'Bell pepper · Yellow', code: '2026-A', s: new Date(2026, 1, 2), e: new Date(2026, 9, 30) },
  { gh: 15, crop: 'Tomato · Roma', code: '2026-C', s: new Date(2026, 11, 7), e: new Date(2027, 8, 12) },
  { gh: 14, crop: 'Cucumber · Persian', code: '2027-A', s: new Date(2027, 0, 25), e: new Date(2027, 4, 24) },
];
S.cyc = { view: 'Cycles', tab: 'Active', year: 2026 };
const cycSt = c => c.e < D0 ? 'Past' : c.s > D0 ? 'Planned' : 'Active';
const cycCrop = c => c.crop.replace(' ·', ''), cycName = c => `GH ${c.gh} · ${cycCrop(c)} · ${c.code}`, cycLen = c => dDiff(c.s, c.e) + 1;
const cycChip = c => { const st = cycSt(c), left = dDiff(D0, c.e); return st === 'Past' ? chip('plain', 'Closed') : st === 'Planned' ? chip('info', `Starts in ${dDiff(D0, c.s)} days`) : left < 70 ? chip('warn', `Ends in ${left} days`) : chip('ok', 'Active'); };
const cycTable = tab => {
  const rows = CYC.map((c, i) => [c, i]).filter(([c]) => cycSt(c) === tab).sort((a, b) => a[0].gh - b[0].gh || a[0].s - b[0].s);
  if (!rows.length) return `<p class="hint" style="padding:16px 12px;margin:0">No ${tab.toLowerCase()} cycles.</p>`;
  return `<table class="mtv-led cyc"><thead><tr>${['Cycle', 'Greenhouse', 'Crop · Variety', tab === 'Active' ? 'Progress' : 'Period', 'Status', ''].map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(([c, i]) => {
    const n = cycLen(c);
    return `<tr><td>${cycName(c)}</td><td>Greenhouse ${c.gh}</td><td>${c.crop}</td><td>${tab === 'Active' ? `<span style="white-space:nowrap"><span class="bar"><i style="width:${(dDiff(c.s, D0) + 1) / n * 100}%"></i></span>Day ${dDiff(c.s, D0) + 1} of ${n}</span>` : `${dFmt(c.s, 1)} to ${dFmt(c.e, 1)} · ${n} days`}</td><td>${cycChip(c)}</td><td class="act"><span class="acts"><button class="btn" data-action="cycview" data-i="${i}">View cycle</button>${kebab()}</span></td></tr>`;
  }).join('')}</tbody></table>`;
};
SEG.cycv = v => { S.cyc.view = v; render(true); };
SEG.cyc = v => { S.cyc.tab = v.split(' ')[0]; $('#cyc').innerHTML = cycTable(S.cyc.tab); };
A.cycyr = el => { S.cyc.year += +el.dataset.d; render(true); };
// Calendario anual: una fila por invernadero, doce meses, una barra por ciclo. Se dibuja al ancho real para que el texto mida 12 px.
function cycYear(W) {
  const y = S.cyc.year, a = new Date(y, 0, 1), z = new Date(y + 1, 0, 1), days = dDiff(a, z), L = 112, top = 30, RH = 48, H = top + RH * GH.length + 28;
  const x = d => L + (W - L) * Math.max(0, Math.min(days, dDiff(a, d))) / days;
  let o = `<svg class="chart px" viewBox="0 0 ${W} ${H}" role="img" aria-label="Cycles of ${y}, one row per greenhouse">`;
  for (let m = 0; m < 12; m++) { const xm = x(new Date(y, m, 1)); o += `<line class="gl day" x1="${xm}" x2="${xm}" y1="${top - 8}" y2="${H - 28}"/><text x="${xm + 6}" y="16">${new Date(y, m, 1).toLocaleDateString('en-US', { month: 'short' })}</text>`; }
  GH.forEach((g, r) => {
    const yy = top + RH * r;
    o += `<line class="gl" x1="0" x2="${W}" y1="${yy + RH}" y2="${yy + RH}"/><text x="0" y="${yy + RH / 2 + 4}" style="fill:var(--ink);font-weight:600">Greenhouse ${g.n}</text>`;
    CYC.forEach((c, i) => {
      if (c.gh !== g.n || c.e < a || c.s >= z) return;
      const st = cycSt(c), x1 = x(c.s), w = Math.max(6, x(dAdd(c.e, 1)) - x1);
      const look = st === 'Past' ? 'fill="#C9CEC4"' : st === 'Active' ? 'fill="' + CYA + '"' : 'fill="#0072B2" fill-opacity=".12" stroke="#0072B2" stroke-width="1.5" stroke-dasharray="5 4"';
      const full = `${cycCrop(c)} · ${dFmt(c.s, c.s < a)} to ${dFmt(c.e, c.e >= z)}`, lbl = w > full.length * 6.6 + 16 ? full : w > cycCrop(c).length * 6.6 + 16 ? cycCrop(c) : '';
      o += `<g data-action="cycview" data-i="${i}" style="cursor:pointer"><title>${cycName(c)} · ${dFmt(c.s, 1)} to ${dFmt(c.e, 1)} · ${st}</title><rect x="${x1}" y="${yy + 9}" width="${w}" height="${RH - 18}" rx="6" ${look}/>${lbl ? `<text x="${x1 + 8}" y="${yy + RH / 2 + 4}" style="fill:${st === 'Active' ? '#fff' : 'var(--ink)'};font-weight:600">${lbl}</text>` : ''}</g>`;
    });
  });
  if (D0 >= a && D0 < z) o += `<line class="now" x1="${x(D0)}" x2="${x(D0)}" y1="${top - 8}" y2="${H - 28}"/><text x="${x(D0)}" y="${H - 8}" text-anchor="middle" style="fill:var(--ink);font-weight:600">Today · ${dFmt(D0)}</text>`;
  return o + '</svg>';
}
const cycDraw = () => { const el = $('#cyc-year'); if (el) el.innerHTML = cycYear(el.clientWidth); };
addEventListener('resize', cycDraw);
V.cycles = () => {
  const n = st => CYC.filter(c => cycSt(c) === st).length, cal = S.cyc.view === 'Calendar', y = S.cyc.year;
  const next = CYC.filter(c => cycSt(c) !== 'Past').map(c => cycSt(c) === 'Planned' ? [c.s, `Greenhouse ${c.gh} starts ${cycCrop(c)}`] : [c.e, `Greenhouse ${c.gh} ends ${cycCrop(c)}`]).sort((p, q) => p[0] - q[0]);
  const sw = (css, t) => `<span style="display:inline-flex;align-items:center;gap:6px;margin-left:10px"><i style="width:22px;height:12px;border-radius:4px;${css}"></i>${t}</span>`;
  return { title: 'Cycles', sub: `${n('Active')} active · ${n('Planned')} planned · 1 greenhouse without an active cycle · 1 ends within 70 days`,
    actions: `<button class="btn primary" data-action="newcyc">${icon('plus')}Start a cycle</button>`,
    html: `<div class="toolbar">${seg('cycv', ['Cycles', 'Calendar'], S.cyc.view)}</div>
    <div class="banner">${icon('alert')}<span><b>Greenhouse 15 has no active cycle.</b> Reports cannot be captured there until one starts. The next one is planned for Dec 7.</span><button class="btn" data-action="newcyc">Start a cycle</button></div>
    ${cal ? `<div class="card"><div class="toolbar"><div><h2>${y}</h2><div class="sub">Every cycle of the year, one row per greenhouse</div></div><span class="grow"></span><span class="mtv-leg">${sw('background:#C9CEC4', 'Past')}${sw('background:' + CYA, 'Active')}${sw('background:rgba(0,114,178,.12);border:1.5px dashed #0072B2', 'Planned')}</span><button class="btn" data-action="cycyr" data-d="-1"${y <= 2026 ? ' disabled' : ''}>${icon('back')}${y - 1}</button><button class="btn" data-action="cycyr" data-d="1"${y >= 2027 ? ' disabled' : ''}>${y + 1}${icon('chev')}</button></div>
      <div id="cyc-year"></div>
      <h2 style="margin-top:18px">What changes next</h2><ul style="margin:6px 0 0;padding-left:18px;font-size:14px">${next.map(([d, t]) => `<li style="margin:4px 0"><b>${dFmt(d, 1)}</b> · ${t} · in ${dDiff(D0, d)} days</li>`).join('')}</ul>
      ${hint('Click a bar to view that cycle. Bars cannot overlap in a row: a greenhouse has one cycle at a time.')}</div>`
    : `<div class="card table-card"><div class="toolbar">${seg('cyc', ['Active', 'Planned', 'Past'].map(t => `${t} (${n(t)})`), `${S.cyc.tab} (${n(S.cyc.tab)})`)}<span class="grow"></span><select class="select" data-filter aria-label="Filter by greenhouse"><option>All greenhouses</option>${GH.map(g => `<option>Greenhouse ${g.n}</option>`).join('')}</select></div>
      <div id="cyc">${cycTable(S.cyc.tab)}</div></div>`}`,
    after: cycDraw };
};

// ---------- Cycle: página completa para ver, editar y empezar un ciclo (pedido de Julián, 25 nov 2026) ----------
// "View cycle" y "Start a cycle" abren una página (#/cycle/<n> y #/cycle/new), ya no un pop-up.
// View cycle, revisión 1 (#1 a #8): lo que ya pasó o no cambia se informa como texto; se editan fechas futuras, metas y el
// calendario de registros; arriba progreso, cosecha, fase actual, clima en rango, completion rate y cosecha planeada contra real.
// Revisión 2 (#9 a #14): timeline en una barra continua con contorno; cosecha interactiva con barras por semana, escenarios y
// "you need to harvest X"; tarjetas de clima y completion compactas; calendario propio para elegir fechas; más color.
// Errores de la persona y cómo se evitan:
// - Cambiar algo que ya pasó: las fechas pasadas no tienen campo. El calendario propio no deja picar días antes del mínimo.
// - Mínimos mayores que máximos o valores fuera de rango: se marca el campo y "Save" no se activa.
// - Un módulo sin día de registro: se marca y no deja guardar (Irrigation es diario y no se toca).
// - Irse sin guardar: barra fija abajo; al salir pregunta si descartar. Ciclos cerrados: solo lectura.
// Datos inventados para la maqueta: días de vivero y crecimiento por cultivo, metas, rangos, áreas de invernadero y cosecha real.
const CROPD = {
  Tomato: { vars: ['Roma', 'Cherry', 'Beefsteak'], nurs: 30, grow: 55, len: 280, goal: { Roma: 55, Cherry: 30, Beefsteak: 60 }, t: [18, 26], h: [60, 85], r: [1000, 2500] },
  Cucumber: { vars: ['Persian', 'Long English'], nurs: 21, grow: 30, len: 120, goal: { Persian: 40, 'Long English': 55 }, t: [18, 26], h: [55, 85], r: [1000, 2200] }, // mismo rango de temperatura que Weather (18 a 26 °C)
  Strawberry: { vars: ['Albion', 'San Andreas'], nurs: 30, grow: 60, len: 210, goal: { Albion: 8, 'San Andreas': 7 }, t: [15, 24], h: [60, 80], r: [800, 2000] },
  'Bell pepper': { vars: ['Yellow', 'Red', 'Orange'], nurs: 45, grow: 80, len: 270, goal: { Yellow: 25, Red: 25, Orange: 24 }, t: [18, 28], h: [60, 85], r: [1000, 2500] },
};
const AREA = { 11: 5000, 12: 4800, 13: 3600, 14: 5200, 15: 4000 }; // m² de cada invernadero, inventados
const METHODS = ['Seedlings from a nursery', 'Grafted seedlings', 'Plug plants', 'Sown in the greenhouse'];
const CYD = [['plan', 'Planning starts'], ['sow', 'Sowing'], ['tr', 'Transplant'], ['hs', 'Harvest starts'], ['e', 'Cycle closes']];
const WD = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SCHED0 = () => ({ crop: ['Mon'], pollination: ['Mon', 'Thu'], pests: ['Wed'] });
// #14: colores con intención: cada fase, cada medición y cada tarjeta tiene el suyo
const PHC = { Planning: '#8FA3C2', Nursery: '#8CC97A', Germination: '#8CC97A', Growing: '#2D5A27', Harvest: '#E07B2C', Closed: '#9AA096', 'Not started': '#8FA3C2' };
const CLC = { t: '#D55E00', h: '#0072B2', r: '#7A4E9A' };
const cySplit = c => { const [crop, variety] = c.crop.split(' · '); return { crop, variety }; };
const cyPlan = c => {
  if (c.p) return c.p;
  const { crop, variety } = cySplit(c), k = CROPD[crop], tr = dAdd(c.s, k.nurs);
  return c.p = { gh: c.gh, crop, variety, method: crop === 'Strawberry' ? 'Plug plants' : 'Seedlings from a nursery', plan: dAdd(c.s, -21), sow: c.s, tr, hs: dAdd(tr, k.grow), e: c.e, goal: k.goal[variety], tmin: k.t[0], tmax: k.t[1], hmin: k.h[0], hmax: k.h[1], rmin: k.r[0], rmax: k.r[1], ppr: 10, code: c.code, sched: SCHED0() };
};
// Cosecha por semana. Plan: la meta repartida parejo entre las semanas de cosecha. Real (inventado): entre 84 y 96 % del plan.
const cyWks = p => Math.max(1, Math.ceil(dDiff(p.hs, p.e) / 7));
const planWk = p => p.goal / cyWks(p);
const realF = (p, i) => .84 + .12 * ((i * 37 + p.gh) % 7) / 6;
const cyNowW = p => !p.hs || D0 < p.hs ? 0 : Math.min(cyWks(p), dDiff(p.hs, D0 < p.e ? D0 : p.e) / 7); // semanas de cosecha que van (con fracción)
const planCum = (p, w) => Math.min(p.goal, planWk(p) * w);
const realCum = (p, w) => { let s = 0; for (let i = 0; i < Math.floor(w); i++) s += planWk(p) * realF(p, i); return s + (w % 1) * planWk(p) * realF(p, Math.floor(w)); };
const cyDone = p => !p.hs || !p.e || !p.goal ? 0 : realCum(p, cyNowW(p));
const cyPace = p => { const w = cyNowW(p), a = Math.max(0, w - 4), pl = planCum(p, w) - planCum(p, a); return pl > 0 ? (realCum(p, w) - realCum(p, a)) / pl : 1; }; // últimas 4 semanas
const iso = d => d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : '';
const unIso = s => { if (!s) return null; const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const cyCode = (gh, sow) => { if (!sow) return '—'; const y = sow.getFullYear(), used = CYC.filter(c => c.gh === gh && c.code.startsWith(y + '-') && c !== S.cy.c).map(c => c.code.slice(-1)); return `${y}-${'ABCDEFGH'.split('').find(l => !used.includes(l))}`; };
const cyNameOf = p => p.gh && p.crop && p.variety ? `GH ${p.gh} · ${p.crop} ${p.variety} · ${p.code}` : 'New cycle';
const RANGES = [['t', 'Temperature', '°C', 0, 45], ['h', 'Humidity', '%', 0, 100], ['r', 'Radiation · daily sum', 'J/cm²', 0, 5000]];
const cyN1 = v => v.toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 }), cyN0 = v => Math.round(v).toLocaleString('en-US');

function cyCheck(p) {
  const bad = {}, f = d => dFmt(d, 1), C = S.cy;
  if (!p.gh) bad.gh = 'Choose a greenhouse.';
  if (!p.crop) bad.crop = 'Choose a crop.'; else if (!p.variety) bad.variety = 'Choose a variety.';
  if (!p.method) bad.method = 'Choose how it is planted.';
  CYD.forEach(([k, n], i) => {
    if (C.past && C.past.includes(k)) return;
    const prev = CYD.slice(0, i).reverse().find(([q]) => p[q]);
    if (!p[k]) bad[k] = `Choose the ${n.toLowerCase()} date.`;
    else if (!C.isNew && p[k] <= D0) bad[k] = `Choose a date after today (${f(D0)}).`;
    else if (prev && p[k] <= p[prev[0]]) bad[k] = `Must be after ${prev[1].toLowerCase()} (${f(p[prev[0]])}).`;
  });
  if (!bad.hs && !bad.e && p.hs && p.e && dDiff(p.hs, p.e) < 7) bad.e = 'Harvest must last at least 7 days.';
  if (C.isNew && p.gh && p.sow && p.e && !bad.e) { const o = CYC.find(c => c !== C.c && c.gh === p.gh && c.s <= p.e && c.e >= p.sow); if (o) bad.gh = `Greenhouse ${p.gh} has ${cycName(o)} from ${f(o.s)} to ${f(o.e)}. Choose other dates or another greenhouse.`; }
  if (!(p.goal >= .5 && p.goal <= 200)) bad.goal = 'Between 0.5 and 200 kg/m².';
  RANGES.forEach(([k, , u, lo, hi]) => { const a = p[k + 'min'], b = p[k + 'max']; if (!(a >= lo && a <= hi)) bad[k + 'min'] = `Between ${lo} and ${hi.toLocaleString('en-US')} ${u}.`; if (!(b > a && b <= hi)) bad[k + 'max'] = b <= a ? 'Must be higher than the minimum.' : `At most ${hi.toLocaleString('en-US')} ${u}.`; });
  if (!(Number.isInteger(p.ppr) && p.ppr >= 1 && p.ppr <= 50)) bad.ppr = 'Whole number from 1 to 50.';
  if (p.sched) Object.entries(p.sched).forEach(([m, d]) => { if (!d.length) bad['s_' + m] = `${MODS[m][0]} needs at least one day.`; });
  return bad;
}
// Círculo de progreso. #12: sin puntas redondas cuando casi se cierra (antes se enciman y parece un error).
const ring = (pct, c, size = 120, sw = 12) => { const r = (size - sw) / 2, L = 2 * Math.PI * r, v = Math.max(0, Math.min(1, pct)), m = size / 2; return `<circle cx="${m}" cy="${m}" r="${r}" class="dn-bg" style="stroke-width:${sw}"/><circle cx="${m}" cy="${m}" r="${r}" class="dn-fg" stroke="${c}" stroke-width="${sw}" stroke-linecap="${v > .94 || v < .04 ? 'butt' : 'round'}" stroke-dasharray="${(L * v).toFixed(1)} ${L.toFixed(1)}" transform="rotate(-90 ${m} ${m})"/>`; };
const donut = (pct, big, unit, sub, c = 'var(--forest)') => `<svg class="donut" viewBox="0 0 120 120" role="img" aria-label="${Math.round(Math.max(0, Math.min(1, pct)) * 100)} %">${ring(pct, c)}<text x="60" y="58" text-anchor="middle" class="dn-big">${big}</text><text x="60" y="76" text-anchor="middle" class="dn-sub">${unit}</text></svg><div class="dn-txt">${sub}</div>`;
const cyH = (ic, t, c) => `<h2 class="cy-h"><span class="cy-ic" style="--c:${c}">${icon(ic)}</span>${t}</h2>`;

// Timeline por pasos (26 nov 2026, tercera versión). La barra proporcional no funcionaba: la cosecha (194 días) se comía todo y
// las fases cortas no cabían. Ahora: 5 puntos espaciados parejo (como el seguimiento de un pedido), cada uno con su fecha; entre
// puntos, el nombre de la fase arriba de la línea y sus días abajo; los pasos que ya pasaron con palomita; la fase actual llena
// hasta hoy y, abajo de todo, un renglón con dónde va hoy.
function cyTimeline(p) {
  if (CYD.some(([k]) => !p[k])) return '<p class="hint" style="margin:0">The timeline appears when all five dates are set.</p>';
  const gr = p.method === 'Sown in the greenhouse' ? 'Germination' : 'Nursery';
  const MS = [['plan', 'Planning'], ['sow', 'Sowing'], ['tr', 'Transplant'], ['hs', 'Harvest starts'], ['e', 'Close']];
  const PH = ['Planning', gr, 'Growing', 'Harvest'];
  let o = '<ol class="stp">', cur = null;
  MS.forEach(([k, n], i) => {
    const done = p[k] <= D0, c = PH[i] ? PHC[PH[i]] : '#9AA096';
    o += `<li class="st${done ? ' done' : ''}" style="--c:${c}"><span class="nd">${done ? icon('check') : i + 1}</span><b>${n}</b><small>${dFmt(p[k], p[k].getFullYear() !== D0.getFullYear())}</small></li>`;
    if (i < PH.length) {
      const a = p[k], z = p[MS[i + 1][0]], d = dDiff(a, z), now = D0 >= a && D0 < z, pct = D0 >= z ? 100 : now ? Math.round(dDiff(a, D0) / d * 100) : 0;
      if (now) cur = { n: PH[i], c: PHC[PH[i]], day: dDiff(a, D0) + 1, d, left: dDiff(D0, z) };
      o += `<li class="cn${now ? ' now' : ''}" style="--c:${PHC[PH[i]]}" title="${PH[i]} · ${d} days · ${dFmt(a, 1)} to ${dFmt(z, 1)}"><span class="cn-t">${PH[i]}</span><span class="cn-l"><i style="width:${pct}%"></i>${now ? `<u style="left:${pct}%"></u>` : ''}</span><span class="cn-d">${d} days</span></li>`;
    }
  });
  o += '</ol>';
  return o + (cur ? `<p class="stp-now"><span class="ph-pill" style="--c:${cur.c}">${cur.n}</span><span><b>Day ${cur.day} of ${cur.d}</b> · ${cur.left} days left in this phase · cycle day ${dDiff(p.sow, D0) + 1}</span></p>` : D0 > p.e ? `<p class="stp-now"><span>The cycle closed on ${dFmt(p.e, 1)}.</span></p>` : `<p class="stp-now"><span>Starts on ${dFmt(p.plan, 1)}.</span></p>`);
}

const cyPhase = p => !p.sow ? '' : D0 < p.plan ? 'Not started' : D0 < p.sow ? 'Planning' : D0 < p.tr ? (p.method === 'Sown in the greenhouse' ? 'Germination' : 'Nursery') : D0 < p.hs ? 'Growing' : D0 <= p.e ? 'Harvest' : 'Closed';
// Clima en rango: horas de los últimos 30 días con temperatura, humedad y radiación del día dentro de las metas del ciclo (datos de Weather)
const cyClimate = p => {
  const n = p.gh; if (!p.tr || D0 < p.tr) return null; const from = Math.max(-720, -dDiff(p.tr, D0) * 24); if (from >= 0) return null;
  let t = 0, hu = 0, ra = 0, all = 0, cnt = 0; const day = {};
  for (let s = from; s <= 0; s++) { const k = dayOf(s); day[k] = (day[k] || 0) + INC.Radiation(s, n) * .36; } // W/m² por hora a J/cm²
  for (let s = from; s <= 0; s++) { if (s > (OFF[n] || 0)) continue; const a = INC.Temperature(s, n), b = INC.Humidity(s, n), r = day[dayOf(s)], A = a >= p.tmin && a <= p.tmax, B = b >= p.hmin && b <= p.hmax, Rr = r >= p.rmin && r <= p.rmax; t += A; hu += B; ra += Rr; all += A && B && Rr; cnt++; }
  return cnt ? { all: all / cnt, t: t / cnt, h: hu / cnt, r: ra / cnt, days: Math.round(-from / 24), off: !!OFF[n] } : null;
};
const CYCR = { crop: .95, pollination: 1, irrigation: .99, pests: .97, applications: 1 }; // inventado
const cyCompletion = p => {
  if (!p.tr || D0 < p.tr) return null;
  const days = dDiff(p.tr, D0), wk = days / 7, wob = (k, i) => Math.max(0, Math.min(1, CYCR[k] - ((p.gh * (i + 3)) % 4) * .01));
  const rows = Object.keys(MODS).map((k, i) => { const exp = k === 'irrigation' ? days : k === 'applications' ? Math.max(1, Math.round(wk / 2)) : Math.round(wk * (p.sched[k] || []).length); const got = Math.round(exp * wob(k, i)); return { k, name: MODS[k][0], exp, got, pct: exp ? got / exp : 1 }; });
  return { avg: rows.reduce((s, r) => s + r.pct, 0) / rows.length, rows };
};
// #12: tarjeta compacta. 26 nov 2026: sin anillo (al 97-99 % parecía una "O" con un hueco); cifra grande y una barra a lo ancho
const kpiRow = (pct, c, big, sub) => `<div class="cy-kpi"><b class="cy-big" style="color:${c}">${big}</b><span class="cy-sub">${sub}</span><span class="cy-gauge" role="img" aria-label="${big}"><b style="width:${Math.round(Math.max(0, Math.min(1, pct)) * 100)}%;background:${c}"></b></span></div>`;
const barRow = (c, name, small, pct, extra = '') => `<div class="cy-row"><i class="dot" style="background:${c}"></i><span class="nm">${name}${small ? ` <small>${small}</small>` : ''}</span><span class="br"><b style="width:${Math.round(pct * 100)}%;background:${c}"></b></span><em>${Math.round(pct * 100)} %</em>${extra}</div>`;

// #10 y #11: cosecha planeada contra real. Aviso de cuánto hay que cosechar, escenarios, barras por semana y ficha al picar.
function cyYield(p, W) {
  if (!p.hs || !p.e || !p.goal) return '<p class="hint" style="margin:0">Set the harvest dates and the yield goal.</p>';
  const wks = cyWks(p), w = cyNowW(p), done = cyDone(p), pace = cyPace(p), area = AREA[p.gh] || 0, left = Math.max(0, wks - w), started = D0 >= p.hs, closed = D0 > p.e;
  const fc = done + pace * (p.goal - planCum(p, w)), back = done + (p.goal - planCum(p, w)), need = left > 0 ? Math.max(0, p.goal - done) / left : 0, plw = planWk(p), ahead = done - planCum(p, w);
  const kg = v => area ? ` (≈ ${cyN0(v * area)} kg in the greenhouse)` : '';
  const call = !started ? `<div class="cy-call info">${icon('clock')}<span><b>Harvest starts ${dFmt(p.hs, 1)}.</b> The plan is ${cyN1(plw)} kg/m² per week${kg(plw)} for ${wks} weeks.</span></div>`
    : closed ? `<div class="cy-call ${done >= p.goal ? 'ok' : 'warn'}">${icon(done >= p.goal ? 'check' : 'alert')}<span><b>Closed at ${cyN1(done)} of ${p.goal} kg/m²</b> · ${Math.round(done / p.goal * 100)} % of the goal.</span></div>`
    : ahead >= 0 ? `<div class="cy-call ok">${icon('check')}<span><b>On target.</b> ${cyN1(ahead)} kg/m² ahead of the plan. Keep ${cyN1(need)} kg/m² per week${kg(need)} to reach ${p.goal} kg/m².</span></div>`
    : `<div class="cy-call warn">${icon('alert')}<span><b>You need to harvest ${cyN1(need)} kg/m² per week${kg(need)} to reach the ${p.goal} kg/m² goal.</b> You are ${cyN1(-ahead)} kg/m² behind the plan${need - plw >= .05 ? `, so that is ${cyN1(need - plw)} kg/m² more per week than planned` : ''}.</span></div>`;
  const scen = started && !closed ? `<div class="cy-scen"><div><span>At this pace</span><b>${cyN1(fc)} kg/m²</b><small>${Math.round(fc / p.goal * 100)} % of the goal · pace of the last 4 weeks (${Math.round(pace * 100)} % of the plan)</small></div><div><span>If it returns to the plan next week</span><b>${cyN1(back)} kg/m²</b><small>${Math.round(back / p.goal * 100)} % of the goal</small></div><div><span>To reach the goal</span><b>${cyN1(need)} kg/m² per week</b><small>for the ${Math.ceil(left)} weeks left${area ? ` · ≈ ${cyN0(need * area)} kg per week` : ''}</small></div></div>` : '';
  // 26 nov 2026: una sola gráfica acumulada (antes eran dos en una y no se entendía). Meses abajo, el nombre pegado al final de
  // cada línea, la diferencia contra el plan sombreada y hoy marcado con su número. La ficha al picar sigue dando cada semana.
  const fcF = i => done + pace * (planCum(p, i) - planCum(p, w)), endV = closed ? done : started ? fc : p.goal;
  const L = 46, R = 132, T0 = 30, H1 = 240, B = 30, H = T0 + H1 + B, pw = W - L - R;
  // Eje con números redondos que llega justo arriba de la meta (55 → 60), sin espacio vacío
  const tgt = Math.max(p.goal, endV) * 1.05, mag = 10 ** Math.floor(Math.log10(tgt / 5)), stp = [1, 2, 2.5, 5, 10, 20].map(m => m * mag).find(v => Math.ceil(tgt / v) <= 6), nT = Math.ceil(tgt / stp), top = stp * nT;
  const x = i => L + pw * i / wks, y = v => T0 + H1 * (1 - v / top);
  const pts = (f, a, b) => { const xs = [a]; for (let i = Math.floor(a) + 1; i < b; i++) xs.push(i); if (b > a) xs.push(b); return xs.map(i => [x(i), y(f(i))]); };
  const path = (f, a, b) => pts(f, a, b).map(([X, Y], j) => `${j ? 'L' : 'M'}${X.toFixed(1)} ${Y.toFixed(1)}`).join('');
  let o = `<svg class="chart cy-y" viewBox="0 0 ${W} ${H}" data-tip="yld" data-w="${W}" data-l="${L}" data-pw="${pw}" data-a="0" data-b="${wks}" role="img" aria-label="Cumulative yield, planned against real">`;
  for (let k = 0; k <= nT; k++) { const v = stp * k; o += `<line class="gl2" x1="${L}" x2="${L + pw}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${v}</text>`; }
  o += `<text x="${L - 8}" y="${T0 - 14}" text-anchor="end" class="ax2">kg/m²</text>`;
  // Meses: una línea tenue al inicio de cada mes; el año solo en enero
  o += `<text x="${x(0)}" y="${H - 8}" text-anchor="start" class="mo">${dFmt(p.hs)}</text>`;
  for (let d = new Date(p.hs.getFullYear(), p.hs.getMonth() + 1, 1); d <= p.e; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) { const X = x(dDiff(p.hs, d) / 7); if (X - x(0) < 50) continue; o += `<line class="gl2" x1="${X}" x2="${X}" y1="${T0}" y2="${T0 + H1}"/><text x="${X}" y="${H - 8}" text-anchor="middle" class="mo">${d.toLocaleDateString('en-US', d.getMonth() ? { month: 'short' } : { month: 'short', year: 'numeric' })}</text>`; }
  // Lo que falta contra el plan, sombreado entre el plan y el pronóstico
  if (started && !closed) { const a = pts(i => planCum(p, i), w, wks), b = pts(fcF, w, wks).reverse(); o += `<polygon points="${a.concat(b).map(q => q.map(v => v.toFixed(1)).join(',')).join(' ')}" fill="#E07B2C" opacity=".14"/>`; }
  o += `<path class="wxo" stroke="#6E786A" style="stroke-width:2.2" d="${path(i => planCum(p, i), 0, wks)}"/>`;
  if (started) o += `<path class="ln4" stroke="#E07B2C" style="stroke-width:3.5" d="${path(i => realCum(p, i), 0, w)}"/>`;
  if (started && !closed) o += `<path class="ln4" stroke="#E07B2C" stroke-dasharray="3 5" style="stroke-width:2.2" d="${path(fcF, w, wks)}"/>`;
  // Hoy: línea, píldora y el número de hoy contra el plan
  if (started && !closed) { const X = x(w), Y = y(done), t = `${cyN1(done)} kg/m² · plan ${cyN1(planCum(p, w))}`, tw = t.length * 6.9 + 16; o += `<line class="tl-now" x1="${X}" x2="${X}" y1="${T0 - 4}" y2="${T0 + H1}" style="stroke-width:1.5;stroke-dasharray:3 3"/><rect x="${X - 26}" y="${T0 - 26}" width="52" height="20" rx="10" class="tl-pill"/><text x="${X}" y="${T0 - 12}" text-anchor="middle" class="tl-pt">Today</text><circle cx="${X}" cy="${Y}" r="6" fill="#E07B2C" stroke="#fff" stroke-width="2.5"/><rect x="${X + 12}" y="${Y - 34}" width="${tw}" height="22" rx="6" fill="#fff" stroke="#E7D3BF"/><text x="${X + 20}" y="${Y - 19}" class="now-v">${t}</text>`; }
  // Nombre al final de cada línea (sin leyenda aparte). Si quedan muy juntos, se separan.
  const ends = [[y(p.goal), 'Plan', `${cyN1(p.goal)} kg/m² · goal`, '#4E574B']];
  if (started) ends.push([y(endV), closed ? 'Closed at' : 'At this pace', `${cyN1(endV)} kg/m²`, '#C2560B']);
  ends.sort((a, b) => a[0] - b[0]); for (let i = 1; i < ends.length; i++) if (ends[i][0] - ends[i - 1][0] < 34) ends[i][0] = ends[i - 1][0] + 34;
  ends.forEach(([Y, a, b, c]) => { o += `<text x="${L + pw + 10}" y="${Y - 2}" class="end-a" style="fill:${c}">${a}</text><text x="${L + pw + 10}" y="${Y + 13}" class="end-b" style="fill:${c}">${b}</text>`; });
  o += `<line class="cur" y1="${T0}" y2="${T0 + H1}"/></svg>`;
  return `${call}${scen}<div class="cy-leg"><span class="ln-k"><i style="background:#6E786A"></i>Plan</span><span class="ln-k"><i style="background:#E07B2C"></i>Harvested so far</span>${started && !closed ? '<span class="ln-k"><i class="dt" style="color:#E07B2C"></i>Forecast at this pace</span><span class="ln-k"><i class="sh"></i>Short of the plan</span>' : ''}<span class="tap">Tap or hover the chart to see each week</span></div><div class="wxt">${o}<div class="tip" hidden></div></div>`;

}
// Ficha de una semana de cosecha (se suma a las fichas de Weather)
TIP.yld = (d, t) => {
  const p = S.cy.d, wks = cyWks(p), w = cyNowW(p), i = Math.min(t, wks - 1), s = dAdd(p.hs, i * 7), e = dAdd(s, 6), rv = planWk(p) * realF(p, i), part = i < Math.floor(w) ? 1 : i === Math.floor(w) ? w % 1 : 0;
  const real = part ? rv * part : null, cumR = i < w ? realCum(p, Math.min(w, i + 1)) : null, fcC = cyDone(p) + cyPace(p) * (planCum(p, i + 1) - planCum(p, w));
  return `<b>Week ${isoW(s)} · ${dFmt(s)} to ${dFmt(e)}</b><table><tr><th></th><th>This week</th><th>Total</th></tr><tr><td>Planned</td><td>${cyN1(planWk(p))}</td><td>${cyN1(planCum(p, i + 1))}</td></tr><tr><td>Real</td><td>${real == null ? '—' : cyN1(real) + (part < 1 ? ' so far' : '')}</td><td>${cumR == null ? `${cyN1(fcC)} forecast` : cyN1(cumR)}</td></tr></table><small>kg/m²</small>`;
};

// #13: calendario propio para elegir fechas: mismos colores de la app, días inválidos tachados y sin poder picarse
S.dp = null;
const dpDraw = () => {
  const D = S.dp, m = D.m, y = m.getFullYear(), mo = m.getMonth(), first = (new Date(y, mo, 1).getDay() + 6) % 7, n = new Date(y, mo + 1, 0).getDate(), min = D.min ? unIso(D.min) : null, sel = D.v ? unIso(D.v) : null;
  const cells = Array.from({ length: first }, () => '<span></span>').concat(Array.from({ length: n }, (_, i) => { const d = new Date(y, mo, i + 1), off = min && d < min, cls = [off && 'off', sel && dDiff(sel, d) === 0 && 'sel', dDiff(D0, d) === 0 && 'today'].filter(Boolean).join(' '); return `<button type="button"${cls ? ` class="${cls}"` : ''} data-action="dppick" data-v="${iso(d)}"${off ? ' disabled aria-disabled="true"' : ''} aria-label="${d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}">${i + 1}</button>`; }));
  $('#dp').innerHTML = `<div class="dp-h"><button type="button" data-action="dpm" data-s="-1" aria-label="Previous month"${min && new Date(y, mo, 1) <= min ? ' disabled' : ''}>${icon('back')}</button><b>${m.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</b><button type="button" data-action="dpm" data-s="1" aria-label="Next month">${icon('chev')}</button></div><div class="dp-w">${WD.map(w => `<span>${w.slice(0, 2)}</span>`).join('')}</div><div class="dp-g">${cells.join('')}</div>${min ? `<div class="dp-ft">From ${dFmt(min, 1)}</div>` : ''}`;
};
A.dpopen = el => {
  let box = $('#dp'); if (!box) { box = document.createElement('div'); box.id = 'dp'; box.className = 'dp'; document.body.appendChild(box); }
  const v = el.dataset.v, min = el.dataset.min, start = v ? unIso(v) : min ? unIso(min) : D0;
  S.dp = { cf: el.dataset.cf, v, min, m: new Date(start.getFullYear(), start.getMonth(), 1), el };
  // Se mide ya visible (escondido mide 0 y quedaba encima del campo); abre abajo del campo o, si no cabe, arriba
  dpDraw(); box.hidden = false; const r = el.getBoundingClientRect(), hgt = box.offsetHeight, below = innerHeight - r.bottom > hgt + 12; box.style.left = Math.max(8, Math.min(r.left, innerWidth - box.offsetWidth - 8)) + 'px'; box.style.top = Math.max(8, below ? r.bottom + 6 : r.top - 6 - hgt) + 'px';
};
A.dpm = el => { const m = S.dp.m; S.dp.m = new Date(m.getFullYear(), m.getMonth() + +el.dataset.s, 1); dpDraw(); };
A.dppick = el => { const D = S.dp, v = el.dataset.v; D.el.dataset.v = v; D.el.querySelector('span').textContent = dFmt(unIso(v), 1); dpClose(); cyInput({ dataset: { cf: D.cf }, value: v }); D.el.focus(); };
const dpClose = () => { const b = $('#dp'); if (b) b.hidden = true; S.dp = null; };
document.addEventListener('pointerdown', e => { if (S.dp && !e.target.closest('#dp, .dp-f')) dpClose(); }, true);
document.addEventListener('keydown', e => { if (S.dp && e.key === 'Escape') dpClose(); });
addEventListener('hashchange', dpClose);

function cyRefresh() {
  const C = S.cy, p = C.d; if (!$('#cyf')) return;
  if (C.isNew) p.code = cyCode(p.gh, p.sow);
  const bad = C.ro ? {} : cyCheck(p), n = p.sow && p.e ? dDiff(p.sow, p.e) + 1 : 0, day = n ? dDiff(p.sow, D0) + 1 : 0, done = cyDone(p), hd = p.hs && p.e ? dDiff(p.hs, p.e) : 0, ph = cyPhase(p);
  $('#cy-name').textContent = cyNameOf(p);
  $('#cy-d1').innerHTML = donut(n ? day / n : 0, n ? Math.max(0, Math.min(day, n)) : '—', n ? `of ${n} days` : 'days', !n ? 'Set the sowing and close dates.' : day < 1 ? `Starts in ${1 - day} days · ${dFmt(p.sow, 1)}` : day > n ? `Closed on ${dFmt(p.e, 1)}` : `<b>${n - day} days left</b><br>closes ${dFmt(p.e, 1)}`, '#2D5A27');
  $('#cy-d2').innerHTML = donut(p.goal ? done / p.goal : 0, p.goal ? cyN1(done) : '—', p.goal ? `of ${p.goal} kg/m²` : 'kg/m²', !p.goal ? 'Set the yield goal.' : !p.hs || D0 < p.hs ? `Harvest has not started${p.hs ? `<br>starts ${dFmt(p.hs, 1)}` : ''}` : D0 > p.e ? `<b>Closed at ${Math.round(done / p.goal * 100)} % of the goal</b>` : `<b>${cyN1(Math.max(0, p.goal - done))} kg/m² to go</b><br>${Math.round(done / p.goal * 100)} % of the goal`, '#E07B2C');
  const hLeft = !hd ? '—' : D0 < p.hs ? `Starts in ${dDiff(D0, p.hs)} days · lasts ${hd}` : D0 > p.e ? `Done · lasted ${hd} days` : `${dDiff(D0, p.e)} days left of ${hd}`;
  $('#cy-now').innerHTML = `<div class="k">Phase now</div><b><span class="ph-pill" style="--c:${PHC[ph] || '#9AA096'}">${ph || '—'}</span></b><div class="k">Harvest</div><b>${hLeft}</b><div class="k">Cycle length</div><b>${n ? n + ' days' : '—'}</b>`;
  const tl = $('#cy-tl'); tl.innerHTML = cyTimeline(p, tl.clientWidth || 700);
  if ($('#cy-clim')) {
    const cl = cyClimate(p), pc = v => `${Math.round(v * 100)} %`;
    $('#cy-clim').innerHTML = !cl ? '<p class="hint" style="margin:0">Starts counting after the transplant.</p>'
      : kpiRow(cl.all, cl.all >= .9 ? '#2D5A27' : '#C77700', pc(cl.all), `of hours with all three in range · last ${cl.days} days${cl.off ? ' · sensor without signal' : ''}`)
      + `<div class="cy-rows">${barRow(CLC.t, 'Temperature', `${p.tmin} to ${p.tmax} °C`, cl.t)}${barRow(CLC.h, 'Humidity', `${p.hmin} to ${p.hmax} %`, cl.h)}${barRow(CLC.r, 'Radiation', `${cyN0(p.rmin)} to ${cyN0(p.rmax)} J/cm²·day`, cl.r)}</div>`;
  }
  if ($('#cy-comp')) {
    const cp = cyCompletion(p);
    $('#cy-comp').innerHTML = !cp ? '<p class="hint" style="margin:0">Starts counting after the transplant.</p>'
      : kpiRow(cp.avg, cp.avg >= .95 ? '#5B3E8C' : '#C77700', `${Math.round(cp.avg * 100)} %`, 'average of the operational modules · records captured on their scheduled days')
      + `<button class="cy-more" data-action="cycomp" aria-expanded="${!!C.compOpen}"><span>${C.compOpen ? 'Hide each module' : 'See each module'}</span>${icon('chev')}</button>`
      + (C.compOpen ? `<div class="cy-rows">${cp.rows.map(r => barRow(MC[r.k], r.name, '', r.pct, `<small class="ct">${r.got} of ${r.exp}</small>`)).join('')}</div>` : '');
  }
  if ($('#cy-y')) $('#cy-y').innerHTML = cyYield(p, $('#cy-y').clientWidth || 700);
  $$('#cyf [data-cf]').forEach(el => { const k = el.dataset.cf, f = el.closest('.field'), m = f && $('em', f); if (!f) return; f.classList.toggle('bad', !!bad[k] && C.touched[k]); if (m) m.textContent = bad[k] && C.touched[k] ? bad[k] : m.dataset.h || ''; });
  CYD.forEach(([k], i) => { const prev = CYD.slice(0, i).reverse().find(([q]) => p[q]), el = $(`[data-cf="${k}"]`); if (!el) return; const lo = prev ? dAdd(p[prev[0]], 1) : null, min = !C.isNew && (!lo || lo <= D0) ? dAdd(D0, 1) : lo; el.dataset.min = min ? iso(min) : ''; });
  $$('.cy-srow[data-m]').forEach(r => { const m = r.dataset.m, b = bad['s_' + m]; r.classList.toggle('bad', !!b); $('.cy-sm', r).textContent = b || ''; });
  if ($('#cy-hd')) $('#cy-hd').textContent = hd ? `Harvest lasts ${hd} days.` : '';
  if ($('#cy-ghm')) { const ghBad = bad.gh && C.touched.gh; $('#cy-ghm').textContent = ghBad ? bad.gh : ''; $('#cy-ghm').hidden = !ghBad; }
  const miss = Object.values(bad)[0], bar = $('#cy-bar');
  if (bar) { bar.hidden = !C.isNew && !C.dirty; $('#cy-msg').textContent = miss ? (C.isNew ? miss : 'Fix the marked field: ' + miss) : C.isNew ? `Ready: ${cyNameOf(p)}` : 'Unsaved changes'; $('#cy-save').disabled = !!miss; }
}
A.cycomp = () => { S.cy.compOpen = !S.cy.compOpen; cyRefresh(); };
A.cyday = el => { const p = S.cy.d, m = el.dataset.m, d = el.dataset.d, L = p.sched[m]; p.sched[m] = L.includes(d) ? L.filter(x => x !== d) : WD.filter(x => [...L, d].includes(x)); el.setAttribute('aria-pressed', p.sched[m].includes(d)); S.cy.dirty = true; cyRefresh(); };
const CYNUM = ['goal', 'tmin', 'tmax', 'hmin', 'hmax', 'rmin', 'rmax'];
function cyInput(el) {
  const C = S.cy, p = C.d, k = el.dataset.cf, v = el.value;
  p[k] = CYD.some(([q]) => q === k) ? unIso(v) : CYNUM.includes(k) ? (v === '' ? NaN : +v) : k === 'ppr' ? (v === '' ? NaN : Number(v)) : k === 'gh' ? +v || 0 : v;
  C.touched[k] = true; C.dirty = true;
  if (k === 'crop') { const sel = $('[data-cf="variety"]'); p.variety = ''; sel.innerHTML = `<option value="">Choose a variety</option>${(CROPD[v] ? CROPD[v].vars : []).map(x => `<option>${x}</option>`).join('')}`; sel.disabled = !v; }
  if ((k === 'crop' || k === 'variety') && p.crop && p.variety && !C.touched.goal) { const d = CROPD[p.crop]; Object.assign(p, { goal: d.goal[p.variety], tmin: d.t[0], tmax: d.t[1], hmin: d.h[0], hmax: d.h[1], rmin: d.r[0], rmax: d.r[1] }); CYNUM.forEach(q => { const e = $(`[data-cf="${q}"]`); if (e) e.value = p[q]; }); $('#cy-sug').hidden = false; $('#cy-sug').textContent = `Suggested for ${p.crop} ${p.variety}. Change them if your plan is different.`; }
  const fill = $('#cy-fill'); if (fill) fill.hidden = !(p.crop && p.sow);
  cyRefresh();
}
document.addEventListener('input', e => { if (e.target.dataset && e.target.dataset.cf && S.cy) cyInput(e.target); });
document.addEventListener('change', e => { if (e.target.dataset && e.target.dataset.cf && S.cy) cyInput(e.target); });
A.cyfill = () => { const p = S.cy.d, k = CROPD[p.crop]; if (!k || !p.sow) return; p.tr = dAdd(p.sow, k.nurs); p.hs = dAdd(p.tr, k.grow); p.e = dAdd(p.sow, k.len - 1); ['tr', 'hs', 'e'].forEach(f => { const b = $(`[data-cf="${f}"]`); b.dataset.v = iso(p[f]); b.querySelector('span').textContent = dFmt(p[f], 1); S.cy.touched[f] = true; }); S.cy.dirty = true; cyRefresh(); };
A.cysave = () => {
  const C = S.cy, p = C.d; if (Object.keys(cyCheck(p)).length) return;
  if (C.isNew) { const c = { gh: p.gh, crop: `${p.crop} · ${p.variety}`, code: p.code, s: p.sow, e: p.e, p: { ...p, sched: { ...p.sched } } }; CYC.push(c); C.dirty = false; location.hash = `#/cycle/${CYC.length - 1}`; toast(`Cycle started: ${cycName(c)}`, () => { CYC.splice(CYC.indexOf(c), 1); location.hash = '#/cycles'; }); return; }
  const c = C.c, old = { crop: c.crop, s: c.s, e: c.e, p: c.p }; Object.assign(c, { crop: `${p.crop} · ${p.variety}`, s: p.sow, e: p.e, p: { ...p, sched: { ...p.sched } } }); C.dirty = false;
  render(true); toast('Changes saved', () => { Object.assign(c, old); render(true); });
};
A.cydiscard = () => { S.cy.dirty = false; render(true); };
A.newcyc = () => { location.hash = '#/cycle/new'; };
A.cycview = el => { location.hash = `#/cycle/${el.dataset.i}`; };
document.addEventListener('click', e => {
  if (!S.cy || !S.cy.dirty || !location.hash.startsWith('#/cycle/')) return;
  const a = e.target.closest('a[href^="#/"], [data-action="go"]'); if (!a || a.closest('#sheet')) return;
  e.preventDefault(); e.stopPropagation();
  openSheet('Leave without saving?', `<p style="margin:0 0 8px">Your changes to <b>${cyNameOf(S.cy.d)}</b> are not saved.</p>`, `<span class="msg"></span><button class="btn" data-action="close">Keep editing</button><button class="btn primary" data-action="cyleave" data-href="${a.getAttribute('href') || a.dataset.href}">Discard and leave</button>`, '', true);
}, true);
A.cyleave = el => { S.cy.dirty = false; closeSheet(); location.hash = el.dataset.href; };

V.cycle = () => {
  const id = location.hash.split('/')[2], isNew = id === 'new', c = isNew ? null : CYC[+id];
  if (!isNew && !c) return V.cycles();
  if (!S.cy || S.cy.id !== id || !S.cy.dirty) {
    const d = isNew ? { gh: 0, crop: '', variety: '', method: '', plan: D0, sow: null, tr: null, hs: null, e: null, goal: NaN, tmin: NaN, tmax: NaN, hmin: NaN, hmax: NaN, rmin: NaN, rmax: NaN, ppr: 10, code: '—', sched: SCHED0() } : { ...cyPlan(c), sched: { ...SCHED0(), ...cyPlan(c).sched } };
    S.cy = { id, c, isNew, dirty: false, touched: {}, ro: !isNew && cycSt(c) === 'Past', d, past: isNew ? [] : CYD.map(([k]) => k).filter(k => d[k] && d[k] <= D0), compOpen: S.cy && S.cy.id === id ? S.cy.compOpen : false };
    if (isNew) CYD.forEach(([k]) => { if (d[k]) S.cy.touched[k] = true; }); else Object.keys(d).forEach(k => { S.cy.touched[k] = true; });
  }
  const C = S.cy, p = C.d, ro = C.ro ? ' disabled' : '', num = v => Number.isFinite(v) ? v : '';
  const fld = (k, lbl, ctl, help = '') => `<label class="field"><span>${lbl}</span>${ctl}<em data-h="${help}">${help}</em></label>`;
  const opt = (list, cur, ph) => `${ph ? `<option value=""${cur ? '' : ' selected'}>${ph}</option>` : ''}${list.map(([v, t]) => `<option value="${v}"${String(v) === String(cur) ? ' selected' : ''}>${t}</option>`).join('')}`;
  const busy = n => { const o = CYC.filter(x => x !== c && x.gh === n && x.e >= D0).sort((a, b) => a.s - b.s)[0]; return o ? `busy ${o.s <= D0 ? 'until' : 'from'} ${dFmt(o.s <= D0 ? o.e : o.s, 1)}` : 'free'; };
  const info = (lbl, v) => `<div class="cy-info"><span>${lbl}</span><b>${v}</b></div>`;
  const rng = ([k, nm, u]) => `<div class="field cy-rng"><span>${nm}</span><div class="cy-u"><input class="input" inputmode="decimal" data-cf="${k}min" value="${num(p[k + 'min'])}" aria-label="${nm} minimum"${ro}><span>to</span><input class="input" inputmode="decimal" data-cf="${k}max" value="${num(p[k + 'max'])}" aria-label="${nm} maximum"${ro}><span>${u}</span></div><em data-h=""></em></div>`;
  const cropCard = isNew
    ? `<div class="card">${cyH('sprout', 'Crop and greenhouse', '#2D5A27')}
        ${fld('gh', 'Greenhouse', `<select class="select" data-cf="gh">${opt(GH.map(g => [g.n, `Greenhouse ${g.n} · ${busy(g.n)}`]), p.gh, 'Choose a greenhouse')}</select>`, 'Each greenhouse has one cycle at a time.')}
        <p class="cy-err" id="cy-ghm" hidden></p>
        ${fld('crop', 'Crop', `<select class="select" data-cf="crop">${opt(Object.keys(CROPD).map(k => [k, k]), p.crop, 'Choose a crop')}</select>`)}
        ${fld('variety', 'Variety', `<select class="select" data-cf="variety"${!p.crop ? ' disabled' : ''}>${opt((CROPD[p.crop] ? CROPD[p.crop].vars : []).map(v => [v, v]), p.variety, 'Choose a variety')}</select>`)}
        ${fld('method', 'How it is planted', `<select class="select" data-cf="method">${opt(METHODS.map(m => [m, m]), p.method, 'Choose how it is planted')}</select>`)}
      </div>`
    : `<div class="card">${cyH('sprout', 'Crop', '#2D5A27')}${info('Crop', p.crop)}${info('Variety', p.variety)}${info('How it was planted', p.method)}${info('Cycle code', p.code)}</div>`;
  // #13: las fechas editables abren el calendario propio; las que ya pasaron se informan con palomita
  const dateRow = ([k, n]) => C.past.includes(k) ? `<div class="cy-info cy-past"><span>${n}</span><b>${icon('check')}${dFmt(p[k], 1)}</b></div>`
    : fld(k, n, `<button type="button" class="dp-f" data-action="dpopen" data-cf="${k}" data-v="${iso(p[k])}"${ro}><span>${p[k] ? dFmt(p[k], 1) : 'Choose a date'}</span>${icon('calendar')}</button>`, isNew && k === 'plan' ? 'When the plan for this cycle starts.' : '');
  const MS = [['crop', 'Crop'], ['pollination', 'Pollination'], ['pests', 'Pests & Diseases']];
  return {
    back: ['Cycles', '#/cycles'], title: isNew ? 'Start a cycle' : 'Cycle', sub: `<span id="cy-name">${cyNameOf(p)}</span>`,
    actions: isNew ? '' : cycChip(c),
    html: `<div id="cyf">
    ${C.ro ? `<div class="banner">${icon('alert')}<span><b>This cycle is closed.</b> Closed cycles can't be edited; this is its record.</span></div>` : ''}
    <div class="cy-top">
      <div class="card cy-dn">${cyH('clock', 'Cycle progress', '#2D5A27')}<div id="cy-d1" class="dn"></div></div>
      <div class="card cy-dn">${cyH('sprout', 'Yield against the goal', '#E07B2C')}<div id="cy-d2" class="dn"></div></div>
      <div class="card cy-now" id="cy-now"></div>
    </div>
    ${isNew ? '' : `<div class="cy-two2">
      <div class="card">${cyH('cloud', 'Climate in range', '#0072B2')}<div id="cy-clim"></div></div>
      <div class="card">${cyH('check', 'Completion rate', '#5B3E8C')}<div id="cy-comp"></div></div>
    </div>
    <div class="card" style="margin-bottom:14px">${cyH('sprout', 'Yield · planned against real', '#E07B2C')}<div id="cy-y"></div></div>`}
    <div class="card" style="margin-bottom:14px">${cyH('calendar', 'Timeline', '#2D5A27')}<div id="cy-tl"></div></div>
    <div class="cy-grid">
      ${cropCard}
      <div class="card">${cyH('calendar', 'Dates', '#8FA3C2')}${CYD.map(dateRow).join('')}<p class="cy-hd" id="cy-hd"></p>
        ${isNew ? `<button class="lnk" id="cy-fill" data-action="cyfill"${p.crop && p.sow ? '' : ' hidden'}>Fill typical dates from the sowing date</button>` : C.ro ? '' : '<p class="hint" style="margin:0">Dates that already passed can\'t be changed.</p>'}
      </div>
      <div class="card">${cyH('alert', 'Targets', '#C77700')}
        ${fld('goal', 'Yield goal', `<div class="cy-u"><input class="input" inputmode="decimal" data-cf="goal" value="${num(p.goal)}"${ro}><span>kg/m²</span></div>`, 'For the whole cycle.')}
        ${RANGES.map(rng).join('')}
        <p class="hint" id="cy-sug" style="margin:-6px 0 12px" hidden></p>
        ${fld('ppr', 'Plants per Crop record', `<div class="cy-u"><input class="input" inputmode="numeric" data-cf="ppr" value="${num(p.ppr)}"${ro}><span>plants</span></div>`, 'How many plants are measured each time Crop is recorded.')}
      </div>
    </div>
    <div class="card cy-sch" style="margin-bottom:14px">${cyH('check', 'Recording schedule', '#5B3E8C')}<p class="hint" style="margin:0 0 10px">Which days each module is recorded in this greenhouse. The completion rate counts against this.</p>
      <div class="cy-srow"><span class="m"><i class="dot" style="background:${MC.irrigation}"></i>Irrigation</span><span class="cy-fix">Every day</span></div>
      ${MS.map(([m, nm]) => `<div class="cy-srow" data-m="${m}" style="--c:${MC[m]}"><span class="m"><i class="dot" style="background:${MC[m]}"></i>${nm}</span><span class="cy-days">${WD.map(d => `<button type="button" data-action="cyday" data-m="${m}" data-d="${d}" aria-pressed="${p.sched[m].includes(d)}"${ro}>${d}</button>`).join('')}</span><em class="cy-sm"></em></div>`).join('')}
      <div class="cy-srow"><span class="m"><i class="dot" style="background:${MC.applications}"></i>Applications</span><span class="cy-fix">As planned in Applications</span></div>
    </div>
    ${C.ro ? '' : `<div class="cy-bar" id="cy-bar"${isNew ? '' : ' hidden'}><span class="msg" id="cy-msg"></span>${isNew ? `<button class="btn" data-action="go" data-href="#/cycles">Cancel</button><button class="btn primary" id="cy-save" data-action="cysave" disabled>Start cycle</button>` : `<button class="btn" data-action="cydiscard">Discard</button><button class="btn primary" id="cy-save" data-action="cysave">Save changes</button>`}</div>`}
    </div>`,
    after: cyRefresh,
  };
};
addEventListener('resize', () => { if ($('#cy-tl')) cyRefresh(); });
