// MyTomatoVision: módulo nuevo pedido por Ana a través de Julián (19 nov 2026). Julián eligió la propuesta A (por confirmar con Ana);
// B y C siguen en el selector como referencia. Datos inventados.
// Lo que fijó Julián: solo tomate; color de madurez del 1 al 6; cosecha de lunes a viernes o de lunes a sábado; lo que madura en día sin
// cosecha se suma al siguiente; el fruto ideal ajusta la proyección; la cosecha real se pesa en báscula en empaque y la captura una persona
// de empaque en computadora, en cajas y en kilos, con merma; el módulo lleva además el registro de cosechas (hoy vive en Power BI).
// Reglas: los totales salen de los mismos días que las gráficas; "sin capturar" nunca es 0; un ajuste nunca reescribe días ya cosechados.
P.tomato = '<circle cx="12" cy="13.500" r="7"/><path d="M12 6.500V3.500M12 6.500c-1.500-1.500-3.200-2-5-1.500M12 6.500c1.500-1.500 3.200-2 5-1.500"/>';
P.sliders = '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>';
MODS2.mtv = ['MyTomatoVision', 'tomato'];

const MTV = {
  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], full: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  t: 1, // hoy = martes 17 nov (semana 47), igual que TODAY
  // Semanas 47 y 48: kg proyectados por día, invernadero 11, cosecha de lunes a sábado. null = día sin cosecha
  p: { 46: [1090, 1150, 1120, 1210, 1260, 1050, null], 47: [1180, 1240, 1310, 1290, 1350, 1120, null], 48: [1280, 1340, 1390, 1360, 1420, 1190, null] },
  r46: [1060, 1185, 1090, 1240, 1195, 1075, null], // kg reales de la semana 46
  // Semanas 41 a 45: se arman con un total semanal, un reparto por día y patrones fijos de fallo, merma y peso por caja
  wkP: [5900, 6150, 6400, 6600, 6750], bias: [-.04, .035, -.03, .045, -.025], shape: [.158, .167, .163, .176, .183, .153],
  err: [-.027, .03, -.027, .025, -.052, .024, .041, -.018, .012, -.034, .008, .037, -.011], mm: [.042, .051, .038, .047, .055, .04, .036], kb: [11.2, 11.4, 11.3, 11.1, 11.5, 11.3, 11.2],
  // Clima exterior, 14 días desde el lunes 16: máxima y mínima en °C, radiación en MJ/m² por día
  tmax: [24, 25, 23, 21, 19, 22, 24, 25, 26, 24, 22, 23, 25, 26], tmin: [6, 7, 1, 3, 4, 5, 6, 7, 8, 7, 5, 6, 8, 9],
  rad: [13.8, 14.2, 12.1, 9.5, 8.2, 11.6, 13.9, 14.4, 14.8, 13.2, 10.9, 12.3, 14.1, 14.6],
  colors: ['1', '2', '3', '4', '5', '6'], sched: ['Mon to Fri', 'Mon to Sat'],
  passes: ['1', '1.5', '2', '2.5', '3'], // vueltas por semana que se pueden elegir; supuesto, lo confirma Ana
  lim: { size: [20, 120, 'mm'], weight: [5, 600, 'g'] }, // rangos supuestos; los confirma agronomía
  cProj: '#CFCDC4', cReal: '#6B6B63', // grises de la gráfica de referencia de Julián (24 nov 2026): Projected claro, Real oscuro
};
// passes = vueltas por semana (cuántas veces se cosecha el invernadero completo); share = % del invernadero que se cosecha cada día,
// de lunes a domingo (null = día sin cosecha). Los días suman passes × 100. Pedido de Julián, 24 nov 2026; valores inventados.
// La maqueta guarda y enseña estos dos datos, pero el pronóstico todavía no los usa: falta que Ana diga cómo cambian los kilos.
const mtvEven = (passes, days) => { const n = days === 'Mon to Fri' ? 5 : 6, tot = passes * 100, b = Math.floor(tot / n); return MTV.days.map((_, i) => i < n ? b + (i < tot - b * n ? 1 : 0) : null); };
S.mtv = { prop: 'A', tab: 'Forecast', per: 'This week', colP: '4', colR: '4', days: 'Mon to Sat', passes: '2', share: mtvEven(2, 'Mon to Sat'), size: 62, weight: 140, wx: 'Temperature', edit: null,
  // Cosecha real de la semana 47, inventada (Julián, 24 nov 2026). El 12 trae el lunes capturado, para que la gráfica enseñe las dos
  // barras, y hoy martes vacío, para que la tabla enseñe las casillas por llenar. El 11 no trae el lunes: es el que enseña el aviso
  // "Monday not captured". De miércoles a sábado no hay real porque en la maqueta hoy es martes 17.
  real: { 11: [null, null, null, null, null, null, null], 12: [{ bx: 47, kg: 528, mm: 23 }, null, null, null, null, null, null] } };

const mtvOn = g => /^Tomato/.test(g.crop || '');
const kg = v => Math.round(v).toLocaleString('en-US');
const sg = v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(1);
const mtvDate = (w, i) => new Date(2026, 10, 16 + (w - 47) * 7 + i).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const mtvSc = n => n === 11 ? 1 : .46; // el invernadero 12 es el 11 a escala, para no inventar otra tabla
// Proyección de las semanas 47 y 48. El peso ideal ajusta de hoy en adelante (supuesto: kilos proporcionales al peso del fruto).
// Con cosecha de lunes a viernes, el sábado queda sin cosecha y sus kilos pasan al lunes siguiente.
const mtvP = (n, w = 47) => {
  const r5 = (v, i) => Math.round(v * mtvSc(n) * (w === 47 && i < MTV.t ? 1 : S.mtv.weight / 140) / 5) * 5, a = MTV.p[w].map((v, i) => v == null ? null : r5(v, i));
  if (S.mtv.days === 'Mon to Fri') { if (w === 48) a[0] += r5(MTV.p[47][5], 5); a[5] = null; }
  return a;
};
// Un día: p = kg proyectados; bx, kg, mm = cajas, kilos y merma reales. Sin kg = sin capturar
const mtvDay = (n, w, i) => {
  if (w >= 47) return { p: mtvP(n, w)[i], ...(w === 47 && S.mtv.real[n][i] || {}) };
  const p0 = w === 46 ? MTV.p[46][i] : i < 6 ? MTV.wkP[w - 41] * MTV.shape[i] : null, k = (w - 41) * 6 + i;
  if (p0 == null) return { p: null };
  const p = Math.round(p0 * mtvSc(n) / 5) * 5, kgv = w === 46 ? Math.round(MTV.r46[i] * mtvSc(n) / 5) * 5 : Math.round(p * (1 + MTV.err[k % 13] + MTV.bias[w - 41]));
  return { p, kg: kgv, bx: Math.round(kgv / MTV.kb[k % 7]), mm: Math.round(kgv * MTV.mm[k % 7]) };
};
const mtvWeek = (n, w) => MTV.days.map((_, i) => mtvDay(n, w, i));
// Totales de una lista de días. pd = proyección solo de los días capturados (para comparar parejo); miss = fallo promedio por día
const mtvTot = recs => {
  const d = recs.filter(r => r.kg != null), s = k => sum(d.map(r => r[k]));
  return { p: sum(recs.map(r => r.p)), pd: s('p'), kg: s('kg'), bx: s('bx'), mm: s('mm'), n: d.length, days: recs.filter(r => r.p != null).length, miss: d.length ? avg(d.map(r => Math.abs(r.kg - r.p) / r.p * 100)) : null };
};
const mtvL4 = n => [43, 44, 45, 46].map(w => mtvTot(mtvWeek(n, w))); // últimas 4 semanas cerradas
const mtvKb = n => { const t = mtvL4(n); return sum(t.map(x => x.kg)) / sum(t.map(x => x.bx)); }; // kg por caja de referencia
const mtvBand = n => avg(mtvL4(n).map(x => Math.abs(x.kg - x.p) / x.p * 100)); // fallo semanal promedio, para el rango del pronóstico
const mtvBx = (n, v) => kg(v / mtvKb(n));
const mtvMiss = n => mtvP(n).map((p, i) => i < MTV.t && p != null && !S.mtv.real[n][i] ? i : -1).filter(i => i >= 0); // días de cosecha pasados sin capturar
const mtvRe = () => { const y = main.scrollTop; render(); main.scrollTop = y; $('#view').style.animation = 'none'; };
const mtvKey = (n, i) => `${n}-${i}`;

// ---------- Elegir invernadero: total del rancho y, en cada tarjeta, cuánto se cosecha hoy ----------
V.mtvPicker = () => {
  const on = GH.filter(mtvOn), all = k => sum(on.map(g => k === 't' ? mtvP(g.n)[MTV.t] : sum(mtvP(g.n, k))));
  return { title: 'MyTomatoVision', sub: 'Harvest forecast and harvest record · choose a greenhouse',
    html: `<div class="card mtv-ranch"><div><div class="mtv-lbl">Whole ranch · today</div><b>${kg(all('t'))} kg</b> projected</div><div><div class="mtv-lbl">This week</div><b>${kg(all(47))} kg</b></div><div><div class="mtv-lbl">Next week</div><b>${kg(all(48))} kg</b></div><div class="mtv-note">${on.length} tomato greenhouses with forecast</div></div>
    <div class="grid gh-grid">${GH.map(g => {
    if (!mtvOn(g)) return `<div class="card gh-card" style="opacity:.62"><div class="n">Greenhouse ${g.n}${chip('plain', g.crop ? 'No forecast' : 'No cycle')}</div><div class="c">${g.crop || 'No active cycle'}</div><div class="l">${g.crop ? 'MyTomatoVision works on tomato only, for now.' : 'Start a cycle to get a forecast here.'}</div></div>`;
    const miss = mtvMiss(g.n), p = mtvP(g.n)[MTV.t], today = S.mtv.real[g.n][MTV.t];
    return `<button class="card gh-card" data-action="go" data-href="#/m/mtv/${g.n}"><div class="n">Greenhouse ${g.n}${miss.length ? chip('warn', miss.length > 1 ? `${miss.length} days not captured` : `${MTV.full[miss[0]]} not captured`) : p == null ? chip('plain', 'No harvest today') : today ? chip('ok', 'Up to date') : chip('plain', 'Today pending')}</div><div class="c">${g.crop} · day ${g.day} of ${g.of}</div><div class="mtv-today">${p == null ? 'No harvest today' : `<b>${kg(p)}</b> kg projected today · ≈ ${mtvBx(g.n, p)} boxes`}</div><div class="l">This week ${kg(sum(mtvP(g.n)))} kg · next week ${kg(sum(mtvP(g.n, 48)))} kg</div></button>`;
  }).join('')}</div>` };
};

// ---------- Piezas ----------
// Tarjeta principal: esta semana (panel oscuro, el número más grande de la pantalla) y la siguiente, en kilos y cajas, con rango
const mtvWeeks = (n, withToday) => {
  const T = mtvTot(mtvWeek(n, 47)), b = sum(mtvP(n, 48)), band = mtvBand(n), pt = mtvP(n)[MTV.t], c = S.mtv.real[n][MTV.t], pct = T.kg / T.p * 100;
  const num = v => `<div class="mtv-hero">${kg(v)}<small>kg</small></div><div class="mtv-sub">projected · ≈ ${mtvBx(n, v)} boxes</div><div class="mtv-rng">Likely ${kg(v * (1 - band / 100))} to ${kg(v * (1 + band / 100))} kg</div>`;
  return `<div class="card mtv-weeks${withToday ? ' three' : ''}">${withToday ? `<div><div class="mtv-lbl">Today · ${TODAY}</div>${pt == null ? '<div class="mtv-big">No harvest<small>not a harvest day</small></div>' : `<div class="mtv-big">${kg(pt)}<small>kg projected · ≈ ${mtvBx(n, pt)} boxes</small></div><div class="mtv-note">${c ? `Harvested ${kg(c.kg)} kg in ${kg(c.bx)} boxes` : 'Real harvest not captured yet'}</div>`}</div>` : ''}
    <div class="now"><div class="mtv-lbl">This week · W47 · ${mtvDate(47, 0)} to ${mtvDate(47, 6)}</div>${num(T.p)}<div class="mtv-bar"><i style="width:${Math.min(100, pct)}%"></i></div><div class="mtv-note">${T.n ? `<b>${kg(T.kg)} kg harvested</b> · ${pct.toFixed(0)} % of the week · ` : '<b>Nothing captured yet</b> · '}${T.n} of ${T.days} harvest days captured</div></div>
    <div><div class="mtv-lbl">Next week · W48 · ${mtvDate(48, 0)} to ${mtvDate(48, 6)}</div>${num(b)}<div class="mtv-delta">${b < T.p ? '▼' : '▲'} ${sg((b - T.p) / T.p * 100)} % · ${kg(Math.abs(b - T.p))} kg ${b < T.p ? 'less' : 'more'} than this week</div></div>
    <div class="foot">Forecast for ripeness color ${S.mtv.colP}, frozen on Monday ${mtvDate(47, 0)}. Range: ± ${band.toFixed(1)} %, the average weekly miss of the last 4 weeks.</div></div>`;
};
// Captura de un día: cajas, kilos y merma. El día no se elige ni se teclea: lo da el lugar donde está el formulario.
// mtvCalc: lo que se calcula solo mientras se teclea
const mtvCalc = (n, i, raw) => {
  const b = +raw.bx, k = +raw.kg, m = +raw.mm || 0, p = mtvP(n)[i], ok = b > 0 && k > 0;
  return { ok, kb: ok ? (k / b).toFixed(1) : '', mp: ok ? (m / k * 100).toFixed(1) + ' %' : '', net: ok ? kg(k - m) : '', vs: ok ? sg((k - p) / p * 100) + ' %' : '' };
};
const mtvLive = (n, i, raw) => { const c = mtvCalc(n, i, raw), p = mtvP(n)[i]; return c.ok ? `${c.kb} kg per box · net ${c.net} kg · merma ${c.mp} · ${c.vs} against forecast` : `Forecast ${kg(p)} kg · ≈ ${mtvBx(n, p)} boxes`; };
const mtvIn = (k, lbl, v, bare) => bare ? `<input class="input" name="${k}" inputmode="numeric" value="${v ?? ''}" aria-label="${lbl}">` : `<label class="mtv-f"><span>${lbl}</span><input class="input" name="${k}" inputmode="numeric" value="${v ?? ''}"></label>`;
const mtvForm = (n, i) => {
  const c = S.mtv.real[n][i] || {};
  return `<div class="mtv-cap" data-gh="${n}" data-day="${i}">${mtvIn('bx', 'Boxes', c.bx)}${mtvIn('kg', 'Kilograms', c.kg)}${mtvIn('mm', 'Merma, kg', c.mm)}<button class="btn primary" data-action="mtvSave">Save</button>${S.mtv.edit === mtvKey(n, i) ? '<button class="btn" data-action="mtvCancel">Cancel</button>' : ''}<em>${mtvLive(n, i, c)}</em></div>`;
};
// Propuesta A: tarjeta "Today" con un solo botón, que lleva al renglón del día en el registro
const mtvTodayCard = n => {
  const p = mtvP(n)[MTV.t], c = S.mtv.real[n][MTV.t], btn = (lbl, cls = '') => `<button class="btn ${cls}" data-action="mtvGo" data-gh="${n}" data-day="${MTV.t}">${lbl}</button>`;
  return `<div class="card mtv-side"><div class="mtv-lbl">Today · ${TODAY}</div>${p == null ? '<div class="mtv-big">No harvest<small>not a harvest day</small></div>' : `<div class="mtv-big">${kg(p)}<small>kg projected · ≈ ${mtvBx(n, p)} boxes</small></div>
    ${c ? `<div class="mtv-note"><b>${kg(c.kg)} kg</b> in ${kg(c.bx)} boxes · merma ${kg(c.mm)} kg · ${sg((c.kg - p) / p * 100)} % against forecast</div><div style="margin-top:14px">${btn('Edit')}</div>` : `<div class="mtv-note">Real harvest not captured yet</div><div style="margin-top:14px">${btn('Capture today\'s harvest', 'primary')}</div>`}`}</div>`;
};
// Propuesta B: cuatro fichas con lo que un dueño pregunta primero
const mtvTiles = n => {
  const T = mtvTot(mtvWeek(n, 47)), L = mtvTot([43, 44, 45, 46].flatMap(w => mtvWeek(n, w))), open = mtvP(n).slice(0, MTV.t + 1).filter(v => v != null).length;
  return `<div class="grid mtv-tiles">
    ${kpi('check', 'Pace this week', T.n ? (T.kg / T.pd * 100).toFixed(1) : 'No data', T.n ? '% of plan' : '', T.n ? `${kg(T.kg)} of ${kg(T.pd)} kg · ${T.n} of ${open} days captured` : `0 of ${open} days captured`)}
    ${kpi('alert', 'Forecast miss', L.miss.toFixed(1), '% per day', `Last 4 weeks · this week ${T.n ? T.miss.toFixed(1) + ' %' : 'no data'}`)}
    ${kpi('trash', 'Merma', (L.mm / L.kg * 100).toFixed(1), '%', `Last 4 weeks · this week ${T.n ? (T.mm / T.kg * 100).toFixed(1) + ' %' : 'no data'}`)}
    ${kpi('copy', 'Kg per box', (L.kg / L.bx).toFixed(1), 'kg', `Last 4 weeks · this week ${T.n ? (T.kg / T.bx).toFixed(1) : 'no data'}`)}</div>`;
};
// Propuesta C: barra de captura. Siempre pide el día de cosecha más viejo que falte; no se puede saltar un día.
const mtvDesk = n => {
  const miss = mtvMiss(n), today = mtvP(n)[MTV.t] != null && !S.mtv.real[n][MTV.t] ? [MTV.t] : [], e = S.mtv.edit && S.mtv.edit.startsWith(n + '-') ? +S.mtv.edit.split('-')[1] : null;
  const queue = [...miss, ...today], i = e ?? queue[0];
  if (i == null) { const nx = mtvP(n).findIndex((p, j) => j > MTV.t && p != null); return `<div class="card mtv-desk done">${icon('check')}<span><b>All harvest days are captured.</b>${nx < 0 ? '' : ` Next capture: ${MTV.full[nx]}, ${mtvDate(47, nx)}.`}</span></div>`; }
  return `<div class="card mtv-desk"><div class="mtv-lbl">${e != null ? 'Correcting' : 'Capture harvest'} · ${MTV.full[i]}, ${mtvDate(47, i)}${i === MTV.t ? ' · today' : ''}${e == null && queue.length > 1 ? ` · ${queue.length} days pending, oldest first` : ''}</div>${mtvForm(n, i)}</div>`;
};
const mtvBanner = n => { const m = mtvMiss(n); return m.length ? `<div class="banner">${icon('alert')}<span><b>${m.map(i => MTV.full[i]).join(' and ')} not captured.</b> ${m.length > 1 ? 'Those days are' : 'That day is'} left out of the totals until the harvest is captured.</span><button class="btn" data-action="mtvGo" data-gh="${n}" data-day="${m[0]}">Capture ${MTV.full[m[0]]}</button></div>` : ''; };
const mtvLegend = () => `<span class="mtv-leg"><i class="pj" style="--c:${MTV.cProj}"></i>Projected<i class="re" style="--c:${MTV.cReal}"></i>Real</span>`;
const mtvWeather = () => `<div class="card" style="margin-bottom:14px"><div class="toolbar"><div><h2>Outside weather</h2><div class="sub">Ranch station, outside the greenhouse · this week and next</div></div><span class="grow"></span>${seg('mtvwx', ['Temperature', 'Radiation'], S.mtv.wx)}<button class="btn" data-action="go" data-href="#/weather">Open Weather</button></div>${mtvWxSay()}<div id="mtv-wx"></div>
  ${mtvWxLeg()}</div>`;
// La semana, día por día: una frase que dice cómo va, las barras y, bajo cada día, sus kilos proyectados, reales y la diferencia
const mtvWeekChart = n => {
  const recs = mtvWeek(n, 47), T = mtvTot(recs), left = recs.filter((r, i) => i >= MTV.t && r.p != null && r.kg == null), open = recs.filter((r, i) => i <= MTV.t && r.p != null).length;
  const pk = recs.reduce((b, r, i) => i >= MTV.t && r.p != null && (b < 0 || r.p > recs[b].p) ? i : b, -1);
  return `<div class="card" style="margin-bottom:14px"><div class="toolbar"><div><h2>This week, day by day</h2><div class="sub">Kilograms per harvest day · W47</div></div><span class="grow"></span>${mtvLegend()}</div>
    <p class="mtv-say">${T.n ? `<b>${sg((T.kg - T.pd) / T.pd * 100)} % against forecast so far:</b> ${kg(T.kg)} kg real, ${kg(T.pd)} kg projected, ${T.n} of ${open} harvest days captured.` : '<b>No harvest captured yet this week.</b>'}${left.length ? ` ${kg(sum(left.map(r => r.p)))} kg left to pick in ${left.length} harvest day${left.length > 1 ? 's' : ''}${pk < 0 ? '' : `; the biggest is ${MTV.full[pk]}, ${kg(recs[pk].p)} kg`}.` : ''}</p>
    <div id="mtv-wk" data-gh="${n}"></div></div>`;
};

// ---------- Registro de cosechas: por día (esta semana) o por semana (4 semanas, ciclo) ----------
const mtvPeriod = n => {
  if (S.mtv.per === 'This week') { const recs = mtvWeek(n, 47); return { recs, tot: mtvTot(recs), hi: MTV.t, span: `W47 · ${mtvDate(47, 0)} to ${mtvDate(47, 6)}`, items: recs.map((r, i) => ({ lbl: `${MTV.days[i]} ${16 + i}`, p: r.p, r: i <= MTV.t ? r.kg : null })) }; }
  const ws = S.mtv.per === 'Last 4 weeks' ? [43, 44, 45, 46] : [41, 42, 43, 44, 45, 46, 47], weeks = ws.map(w => ({ w, t: mtvTot(mtvWeek(n, w)) }));
  return { weeks, tot: mtvTot(ws.flatMap(w => mtvWeek(n, w))), hi: -1, span: `W${ws[0]} to W${ws.at(-1)} · ${mtvDate(ws[0], 0)} to ${mtvDate(ws.at(-1), 6)}`, items: weeks.map(x => ({ lbl: x.t.n < x.t.days ? `W${x.w} to date` : `W${x.w}`, p: x.t.n < x.t.days ? x.t.pd : x.t.p, r: x.t.n ? x.t.kg : null })) };
};
// Ocho columnas en cinco grupos: Forecast | Harvest (cajas, kg, kg por caja) | Merma (kg, %) | Net | Against forecast. gs = empieza grupo
const MTV_GS = [1, 1, 0, 0, 1, 0, 1, 1];
const mtvTds = vals => vals.map((v, j) => `<td class="r${MTV_GS[j] ? ' gs' : ''}">${v}</td>`).join('');
const mtvVals = (p, c, pd = p) => [kg(p), kg(c.bx), kg(c.kg), c.bx ? (c.kg / c.bx).toFixed(1) : '—', kg(c.mm), c.kg ? (c.mm / c.kg * 100).toFixed(1) + ' %' : '—', kg(c.kg - c.mm), pd ? sg((c.kg - pd) / pd * 100) + ' %' : '—'];
// mode: 'row' captura en el renglón del día (A y B) · 'desk' manda el día a la barra de captura (C)
const mtvRow = (n, i, r, mode) => {
  const day = `<td><b>${MTV.days[i]}</b> ${16 + i}${i === MTV.t ? ' ' + chip('plain', 'Today') : ''}</td>`, open = i <= MTV.t;
  const btn = lbl => `<button class="btn" data-action="mtvEdit" data-gh="${n}" data-day="${i}">${lbl}</button>`;
  if (r.p == null) return `<tr class="off">${day}<td colspan="9" class="gs">No harvest</td></tr>`;
  if (mode === 'row' && open && (r.kg == null || S.mtv.edit === mtvKey(n, i))) {
    const c = S.mtv.real[n][i] || {}, L = mtvCalc(n, i, c), live = k => `<span data-l="${k}">${L[k]}</span>`;
    return `<tr class="mtv-cap" data-gh="${n}" data-day="${i}">${day}${mtvTds([kg(r.p), mtvIn('bx', 'Boxes', c.bx, 1), mtvIn('kg', 'Kilograms', c.kg, 1), live('kb'), mtvIn('mm', 'Merma, kg', c.mm, 1), live('mp'), live('net'), live('vs')])}<td class="act">${r.kg == null ? '' : '<button class="btn" data-action="mtvCancel">Cancel</button>'}<button class="btn primary" data-action="mtvSave">Save</button></td></tr><tr class="mtv-msg" hidden><td></td><td colspan="9"><em></em></td></tr>`;
  }
  if (r.kg == null) return `<tr>${day}<td class="r gs">${kg(r.p)}</td><td colspan="7" class="gs">${!open ? '<span class="mut">—</span>' : i === MTV.t ? '<span class="mut">Pending today</span>' : '<span class="miss">Not captured</span>'}</td><td class="act">${open && mode !== 'row' ? btn('Capture') : ''}</td></tr>`;
  return `<tr>${day}${mtvTds(mtvVals(r.p, r))}<td class="act">${btn('Edit')}</td></tr>`;
};
// "Against forecast" como dona (gráfica de referencia de Julián, 24 nov 2026): el anillo completo es lo proyectado para los días ya
// capturados; la parte llena es lo cosechado. Al centro, los kilos reales y qué porcentaje son de lo proyectado. A la derecha, los
// datos que antes iban en la nota de la ficha. Si se cosechó más de lo proyectado, el anillo se llena y el porcentaje pasa de 100.
// Sin días capturados: anillo vacío y "No data", nunca 0.
const mtvDonut = T => {
  const R = 58, C = 2 * Math.PI * R, pct = T.n ? T.kg / T.pd * 100 : 0, d = T.kg - T.pd, row = (a, b) => `<div><dt>${a}</dt><dd>${T.n ? b : '—'}</dd></div>`;
  return `<div class="card mtv-af"><div class="mtv-donut" style="--p:${MTV.cProj};--r:${MTV.cReal}"><svg viewBox="0 0 140 140" role="img" aria-label="${T.n ? `Harvested ${kg(T.kg)} kilograms, ${pct.toFixed(0)} percent of the ${kg(T.pd)} projected for the same days` : 'No harvest captured in this period'}"><circle class="trk" cx="70" cy="70" r="${R}"/>${T.n ? `<circle class="arc" cx="70" cy="70" r="${R}" stroke-dasharray="${Math.min(pct, 100) / 100 * C} ${C}" transform="rotate(-90 70 70)"/>` : ''}</svg>
    <div class="c">${T.n ? `<b>${kg(T.kg)}<small>kg</small></b><span>${pct.toFixed(0)} % of ${kg(T.pd)} kg</span>` : '<b>No data</b>'}</div></div>
    <div class="mtv-af-r"><h2>Against forecast</h2><p class="sub">Real harvest against the forecast of the same days</p>
    <dl>${row('Projected, same days', `${kg(T.pd)} kg`)}${row('Difference', `${d > 0 ? '+' : d < 0 ? '−' : ''}${kg(Math.abs(d))} kg · ${T.n ? sg(pct - 100) : ''} %`)}${row('Average miss per day', `${T.n ? T.miss.toFixed(1) : ''} %`)}<div><dt>Harvest days captured</dt><dd>${T.n} of ${T.days}</dd></div></dl></div></div>`;
};
// El registro va en tres bloques separados y numerados: resumen, tabla y gráfica
const mtvRecord = (n, mode) => {
  const P = mtvPeriod(n), T = P.tot, wk = !!P.recs, none = `${T.n} of ${T.days} harvest days captured`;
  const tile = (ic, lbl, v, unit, note) => kpi(ic, lbl, T.n ? v : 'No data', T.n ? unit : '', T.n ? note : none);
  return `<div class="toolbar mtv-recbar"><div><div class="t">Harvest record</div><div class="sub">Packing scale · ${P.span} · ${none}</div></div><span class="grow"></span>${seg('mtvper', ['This week', 'Last 4 weeks', 'Cycle'], S.mtv.per)}<button class="btn" data-action="xlsx">${icon('down')}Export</button></div>
    <div class="mtv-sec"><b>1</b>Summary of the period</div>
    <div class="grid kpis k3">${tile('tomato', 'Harvested', kg(T.kg), 'kg', `${kg(T.bx)} boxes · ${(T.kg / T.bx).toFixed(1)} kg per box`)}${tile('trash', 'Merma', kg(T.mm), 'kg', `${(T.mm / T.kg * 100).toFixed(1)} % of harvested`)}${tile('check', 'Net', kg(T.kg - T.mm), 'kg', 'Harvested minus merma')}</div>
    ${mtvDonut(T)}
    <div class="mtv-sec"><b>2</b>${wk ? `Day by day${mode === 'row' ? ' · type boxes, kilograms and merma in the day\'s row' : ''}` : 'Week by week'}</div>
    <div class="card table-card" style="margin-bottom:0"><table class="mtv-led"><thead>
      <tr><th></th><th class="g gs">Forecast</th><th class="g gs" colspan="3">Harvest</th><th class="g gs" colspan="2">Merma</th><th class="g gs">Net</th><th class="g gs">Against forecast</th><th></th></tr>
      <tr><th>${wk ? 'Day' : 'Week'}</th>${['kg', 'Boxes', 'Kg', 'Kg / box', 'kg', '%', 'kg', '%'].map((h, j) => `<th class="r${MTV_GS[j] ? ' gs' : ''}">${h}</th>`).join('')}<th></th></tr></thead>
      <tbody>${wk ? P.recs.map((r, i) => mtvRow(n, i, r, mode)).join('') : P.weeks.map(x => `<tr><td><b>W${x.w}</b> ${mtvDate(x.w, 0)} to ${mtvDate(x.w, 6)}${x.t.n < x.t.days ? ` · ${x.t.n} of ${x.t.days} days` : ''}</td>${x.t.n ? mtvTds(mtvVals(x.t.p, x.t, x.t.pd)) : `<td class="r gs">${kg(x.t.p)}</td><td colspan="7" class="gs"><span class="mut">No data</span></td>`}<td></td></tr>`).join('')}</tbody>
      ${T.n ? `<tfoot><tr><td><b>Total</b></td>${mtvTds(mtvVals(T.p, T, T.pd))}<td></td></tr></tfoot>` : ''}</table></div>
    <div class="mtv-sec"><b>3</b>Projected against real · ${wk ? 'per day' : 'per week'}</div>
    <div class="card" style="margin-bottom:14px"><div class="toolbar" style="margin:0"><span class="grow"></span>${mtvLegend()}</div><div id="mtv-rec" data-gh="${n}"></div>
    ${hint(`"Against forecast" compares only captured days with the forecast frozen on the Monday of each week. Projection color ${S.mtv.colP}; harvest color ${S.mtv.colR}${S.mtv.colP === S.mtv.colR ? '' : ': they differ, so the comparison mixes the forecast miss with the change of color'}.`)}</div>`;
};

// ---------- Gráficas: se dibujan al ancho real del contenedor para que el texto mida 12 px de verdad ----------
const mtvScale = m => { let st = 10 ** Math.floor(Math.log10(m)) / 2; while (m / st > 6) st *= 2; return [Math.ceil(m / st) * st, st]; };
// Barras agrupadas, como la gráfica de referencia que mandó Julián el 24 nov 2026: dos barras sólidas por día, una junto a la otra,
// con las esquinas de arriba redondeadas. Projected va en tono claro y Real en tono lleno; ya no hay contorno punteado.
// Un día sin cosecha capturada deja vacío el lugar de su barra Real.
const mtvBar = (x, w, yt, y0, fill, op = 1) => { const r = Math.min(6, w / 2, y0 - yt); return `<path d="M${x} ${y0}V${yt + r}Q${x} ${yt} ${x + r} ${yt}H${x + w - r}Q${x + w} ${yt} ${x + w} ${yt + r}V${y0}Z" fill="${fill}" fill-opacity="${op}"/>`; };
const mtvBar2 = (cx, bw, y, p, r) => (p == null ? '' : mtvBar(cx - bw - 2, bw, y(p), y(0), MTV.cProj)) + (r == null ? '' : mtvBar(cx + 2, bw, y(r), y(0), MTV.cReal));
function mtvBars(W, items, hi) {
  const H = 210, L = 64, top = 14, B = 28, cw = (W - L) / items.length, bw = Math.min(46, cw * .36);
  const [max, st] = mtvScale(Math.max(1, ...items.flatMap(x => [x.p, x.r]).filter(v => v != null)) * 1.08), y = v => top + (H - top - B) * (1 - v / max);
  let o = `<svg class="chart px" viewBox="0 0 ${W} ${H}" role="img" aria-label="Projected against real harvest in kilograms. The numbers are in the table.">`;
  if (hi >= 0 && items[hi].p != null) o += `<rect class="fc" x="${L + cw * hi}" y="0" width="${cw}" height="${H}" rx="6"/>`;
  for (let v = 0; v <= max; v += st) o += `<line class="gl${v ? " gd" : ""}" x1="${L}" x2="${W}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 10}" y="${y(v) + 4}" text-anchor="end">${kg(v)}${v === max ? ' kg' : ''}</text>`;
  items.forEach((x, i) => {
    const cx = L + cw * (i + .5);
    o += `<text x="${cx}" y="${H - 8}" text-anchor="middle"${i === hi ? ' style="fill:var(--ink);font-weight:600"' : x.p == null ? ' style="fill:var(--ink-3)"' : ''}>${x.lbl}</text>${mtvBar2(cx, bw, y, x.p, x.r)}`;
  });
  return o + '</svg>';
}
// La semana con sus números: bajo cada día van los kilos proyectados, los reales y la diferencia
function mtvWk(n, W) {
  const recs = mtvWeek(n, 47), t = MTV.t, H = 318, L = 84, top = 26, B = 112, cw = (W - L) / 7, bw = Math.min(46, cw * .36), base = H - B;
  const [max, st] = mtvScale(Math.max(1, ...recs.flatMap(r => [r.p, r.kg]).filter(v => v != null)) * 1.08), y = v => top + (base - top) * (1 - v / max);
  const rows = [['Projected', base + 48], ['Real', base + 72], ['Difference', base + 96]], b = 'style="fill:var(--ink);font-weight:650"', mut = 'style="fill:var(--ink-3)"';
  let o = `<svg class="chart px" viewBox="0 0 ${W} ${H}" role="img" aria-label="This week, projected against real harvest per day, in kilograms, with the numbers under each day">`;
  if (recs[t].p != null) o += `<rect class="fc" x="${L + cw * t}" y="0" width="${cw}" height="${H}" rx="8"/><text x="${L + cw * (t + .5)}" y="16" text-anchor="middle" style="fill:var(--green);font-weight:650">Today</text>`;
  for (let v = 0; v <= max; v += st) o += `<line class="gl${v ? " gd" : ""}" x1="${L}" x2="${W}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 10}" y="${y(v) + 4}" text-anchor="end">${kg(v)}${v === max ? ' kg' : ''}</text>`;
  rows.forEach(([lbl, yy]) => { o += `<line class="gl" x1="0" x2="${W}" y1="${yy - 16}" y2="${yy - 16}"/><text x="0" y="${yy}">${lbl}</text>`; });
  recs.forEach((r, i) => {
    const cx = L + cw * (i + .5), tx = (yy, s, at = '') => `<text x="${cx}" y="${yy}" text-anchor="middle" ${at}>${s}</text>`, got = r.kg != null && i <= t;
    o += tx(base + 22, `${MTV.days[i]} ${16 + i}`, r.p == null ? mut : b);
    if (r.p == null) { o += tx(rows[0][1], cw < 84 ? 'None' : 'No harvest', mut); return; }
    o += mtvBar2(cx, bw, y, r.p, got ? r.kg : null) + tx(rows[0][1], kg(r.p));
    o += got ? tx(rows[1][1], kg(r.kg), b) + tx(rows[2][1], sg((r.kg - r.p) / r.p * 100) + ' %', b)
      : tx(rows[1][1], i > t ? '—' : i === t ? 'Pending' : cw < 90 ? 'Missing' : 'Not captured', i < t ? 'style="fill:var(--warn);font-weight:650"' : mut) + tx(rows[2][1], '—', mut);
  });
  return o + '</svg>';
}
// Clima exterior. Lo que Julián necesita saber en las dos vistas es el promedio de 24 horas (24 nov 2026), así que esa es la línea
// principal, la frase de arriba y el primer renglón de números. Las dos vistas llevan además la máxima y la mínima del día, como
// franja en la gráfica y como renglones (Julián: "i still want to see max min on radiation").
// Mismo lenguaje que "This week, day by day": grises, cuadrícula punteada, la columna de hoy marcada y los números bajo cada día.
// Observado en línea continua, pronóstico en línea punteada.
// Temperatura: mínima de 4 °C o menos en color de aviso (regla de alerta por frío que ya usa Weather).
// Radiación: curva, no barras. La mínima es 0 W/m² todos los días, porque de noche no hay radiación; se enseña tal cual.
// Ecuación: promedio de 24 h (W/m²) = suma del día (MJ/m²) × 1,000,000 ÷ 86,400 s. La suma del día va en el último renglón.
MTV.tavg = [13.9, 14.8, 10.9, 11.2, 10.4, 12.6, 14.1, 15.0, 15.8, 14.3, 12.4, 13.6, 15.4, 16.6]; // promedio de 24 h en °C, inventado
MTV.rmax = [575, 590, 520, 430, 380, 495, 580, 600, 615, 555, 470, 515, 585, 605]; // radiación máxima del día en W/m², inventada
const mtvRadAvg = () => MTV.rad.map(v => v * 1e6 / 86400);
function mtvWxSay() {
  const rad = S.mtv.wx === 'Radiation', a = rad ? mtvRadAvg() : MTV.tavg, t = MTV.t, f = v => rad ? `${Math.round(v)} W/m²` : `${v.toFixed(1)} °C`;
  return `<p class="mtv-say"><b>24 h average today: ${f(a[t])}</b>, forecast until the day closes.${t ? ` Yesterday ${f(a[t - 1])}.` : ''} This week ${f(avg(a.slice(0, 7)))}, observed and forecast days together.${rad ? ` Today's maximum: ${MTV.rmax[t]} W/m² · sum: ${MTV.rad[t].toFixed(1)} MJ/m².` : ''}</p>`;
}
function mtvWxLeg() {
  const rad = S.mtv.wx === 'Radiation';
  return `<div class="mtv-leg wx"><i class="re" style="--c:${MTV.cReal}"></i>24 h average<i class="pj" style="--c:${MTV.cProj}"></i>From the daily minimum to the daily maximum<i class="ds"></i>Dashed line: forecast${rad ? '<span>24 h average = daily sum × 1,000,000 ÷ 86,400 s · the minimum is 0 at night</span>' : ''}</div>`;
}
function mtvWx(W) {
  const rad = S.mtv.wx === 'Radiation', n = 14, t = MTV.t, L = 84, top = 30, base = 170, cw = (W - L) / n, x = i => L + cw * (i + .5);
  const main = rad ? mtvRadAvg() : MTV.tavg, hiA = rad ? MTV.rmax : MTV.tmax, loA = rad ? MTV.rad.map(() => 0) : MTV.tmin;
  const [mx, st, unit] = rad ? [800, 200, 'W/m²'] : [30, 10, '°C'], y = v => top + (base - top) * (1 - v / mx);
  const rows = (rad ? ['24 h avg W/m²', 'Max W/m²', 'Min W/m²', 'Sum MJ/m²'] : ['24 h avg °C', 'Max °C', 'Min °C']).map((l, k) => [l, base + 48 + 24 * k]), H = rows.at(-1)[1] + 36;
  const b = 'style="fill:var(--ink);font-weight:650"', dk = MTV.cReal, lt = '#A3A198';
  let o = `<svg class="chart px" viewBox="0 0 ${W} ${H}" role="img" aria-label="Outside ${rad ? 'radiation in watts per square metre' : 'temperature in degrees Celsius'}: 24 hour average with the daily minimum and maximum, this week and next week, with the numbers under each day">`;
  o += `<rect class="fc" x="${L + cw * t}" y="0" width="${cw}" height="${H - 28}" rx="8"/><text x="${x(t)}" y="16" text-anchor="middle" style="fill:var(--green);font-weight:650">Today</text>`;
  for (let v = 0; v <= mx; v += st) o += `<line class="gl${v ? ' gd' : ''}" x1="${L}" x2="${W}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 10}" y="${y(v) + 4}" text-anchor="end">${v}${v === mx ? ' ' + unit : ''}</text>`;
  rows.forEach(([lbl, yy], k) => { o += `<line class="gl" x1="0" x2="${W}" y1="${yy - 16}" y2="${yy - 16}"/><text x="0" y="${yy}"${k ? '' : ' ' + b}>${lbl}</text>`; });
  o += `<line class="gl day" x1="${L + cw * 7}" x2="${L + cw * 7}" y1="${top - 8}" y2="${H - 4}"/>`;
  o += `<text x="${L + cw * 3.5}" y="${H - 8}" text-anchor="middle">This week · W47</text><text x="${L + cw * 10.5}" y="${H - 8}" text-anchor="middle">Next week · W48</text>`;
  const tx = (i, yy, s, at = '') => `<text x="${x(i)}" y="${yy}" text-anchor="middle" ${at}>${s}</text>`;
  // Curva suave que pasa por cada punto sin rebasarlo: los puntos de control van a media distancia, a la altura de cada extremo
  const seg = (a, i0, i1) => { let d = `M${x(i0)} ${y(a[i0])}`; for (let i = i0; i < i1; i++) { const m = (x(i) + x(i + 1)) / 2; d += `C${m} ${y(a[i])} ${m} ${y(a[i + 1])} ${x(i + 1)} ${y(a[i + 1])}`; } return d; };
  const back = a => { let d = ''; for (let i = n - 1; i > 0; i--) { const m = (x(i) + x(i - 1)) / 2; d += `C${m} ${y(a[i])} ${m} ${y(a[i - 1])} ${x(i - 1)} ${y(a[i - 1])}`; } return d; };
  const line = (a, c, w) => { const ln = (d, dash) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${dash ? ' stroke-dasharray="5 5"' : ''}/>`; return (t ? ln(seg(a, 0, t)) : '') + ln(seg(a, t, n - 1), true); };
  // Franja de la mínima a la máxima del día, con sus dos orillas; en radiación la mínima es el eje (0) y no se dibuja su línea
  o += `<path d="${seg(hiA, 0, n - 1)}L${x(n - 1)} ${y(loA[n - 1])}${back(loA)}Z" fill="${MTV.cProj}" fill-opacity=".3"/>${line(hiA, lt, 1.5)}${rad ? '' : line(loA, lt, 1.5)}`;
  o += line(main, dk, 2.5);
  for (let i = 0; i < n; i++) {
    const at = i === t ? b : 'style="fill:var(--ink);font-weight:600"', lo = loA[i];
    o += `<circle cx="${x(i)}" cy="${y(main[i])}" r="3.5" fill="${dk}" stroke="#fff" stroke-width="1.5"/>`;
    o += tx(i, rows[0][1], rad ? Math.round(main[i]) : `${main[i].toFixed(1)}°`, at) + tx(i, rows[1][1], rad ? hiA[i] : `${hiA[i]}°`) + tx(i, rows[2][1], rad ? lo : `${lo}°`, !rad && lo <= 4 ? 'style="fill:var(--warn);font-weight:650"' : '');
    if (rad) o += tx(i, rows[3][1], MTV.rad[i].toFixed(1));
  }
  return o + '</svg>';
}
const mtvDraw = () => {
  const r = $('#mtv-rec'), k = $('#mtv-wk'), w = $('#mtv-wx');
  if (r) { const P = mtvPeriod(+r.dataset.gh); r.innerHTML = mtvBars(r.clientWidth, P.items, P.hi); }
  if (k) k.innerHTML = mtvWk(+k.dataset.gh, k.clientWidth);
  if (w) w.innerHTML = mtvWx(w.clientWidth);
};
addEventListener('resize', mtvDraw);

// ---------- La vista. Queda solo la propuesta A: Julián pidió el 24 nov 2026 quitar el selector A / B / C y su nota.
// B y C ya no se pueden abrir; sus piezas (mtvTiles, mtvDesk) siguen en este archivo y la versión completa está en _respaldo. ----------
// Al cambiar de pestaña solo cambia lo de abajo: la franja de ajustes y las pestañas no vuelven a entrar con animación
SEG.mtvtab = v => { S.mtv.tab = v; S.mtv.edit = null; mtvRe(); };
SEG.mtvper = v => { S.mtv.per = v; S.mtv.edit = null; mtvRe(); };
SEG.mtvwx = v => { S.mtv.wx = v; mtvRe(); };
V.mtv = g => {
  const n = g.n, top = { back: ['MyTomatoVision', '#/m/mtv'], title: `Harvest · Greenhouse ${n}` };
  if (!mtvOn(g)) return { ...top, sub: g.crop, html: `<div class="card" style="text-align:center;padding:48px 20px"><h2>No forecast for this crop</h2><p class="hint">MyTomatoVision works on tomato only, for now.</p></div>` };
  // Los ajustes en uso iban en un renglón gris bajo el título y no se leían (Julián, 24 nov 2026). Ahora van en una franja propia:
  // cada dato con su etiqueta arriba y su valor en negro. Si el color de proyección y el de cosecha no coinciden, se avisa ahí mismo.
  const sh = S.mtv.share.filter(v => v != null), lo = Math.min(...sh), hi = Math.max(...sh), same = S.mtv.colP === S.mtv.colR;
  const it = (a, b, cls = '') => `<div${cls}><dt>${a}</dt><dd>${b}</dd></div>`;
  const strip = `<dl class="mtv-set" aria-label="Settings in use">${it('Harvest days', S.mtv.days)}${it('Passes per week', S.mtv.passes)}${it('Harvested each day', `${lo === hi ? lo : `${lo} to ${hi}`} % of the greenhouse`)}${it('Ripeness color', same ? S.mtv.colR : `Projection ${S.mtv.colP} · Harvest ${S.mtv.colR}`, same ? '' : ' class="warn"')}${it('Ideal fruit', `${S.mtv.size} mm · ${S.mtv.weight} g`)}</dl>`;
  return { ...top, sub: g.crop,
    actions: `<button class="btn" data-action="mtvSettings" data-gh="${n}">${icon('sliders')}Settings</button>`,
    html: `${strip}<div class="toolbar">${seg('mtvtab', ['Forecast', 'Record'], S.mtv.tab)}</div>${mtvBanner(n)}${S.mtv.tab === 'Forecast' ? `<div class="grid mtv-top">${mtvWeeks(n)}${mtvTodayCard(n)}</div>${mtvWeekChart(n)}${mtvWeather()}` : mtvRecord(n, 'row')}`, after: mtvDraw };
};

// ---------- Capturar la cosecha real ----------
// Candados (no dejan guardar): números enteros; cajas y kilos juntos; kilos por caja entre la mitad y el doble de lo normal; merma no mayor que los kilos.
// Avisos (piden un segundo clic): cosecha en cero; kilos fuera de 0.5 a 2 veces el pronóstico; kilos por caja a más de 20 % de lo normal.
const mtvVal = (n, i, raw) => {
  const e = {}, v = {}, names = { bx: 'Boxes', kg: 'Kilograms', mm: 'Merma' }, p = mtvP(n)[i], ref = mtvKb(n);
  for (const k in names) { const s = String(raw[k] ?? '').trim().replace(/,/g, ''); if (/^\d+$/.test(s)) v[k] = +s; else e[k] = `${names[k]}: ${s ? 'whole numbers only' : 'required'}`; }
  if (Object.keys(e).length) return { e, v };
  const kb = v.kg / v.bx;
  if (!v.bx !== !v.kg) e[v.bx ? 'kg' : 'bx'] = 'Boxes and kilograms must both be zero or both be above zero';
  else if (v.bx && (kb > ref * 2 || kb < ref / 2)) e.kg = e.bx = `${kb.toFixed(1)} kg per box is not possible: a box here weighs about ${ref.toFixed(1)} kg. Check boxes and kilograms.`;
  else if (v.mm > v.kg) e.mm = 'Merma cannot be more than the kilograms harvested';
  const odd = Object.keys(e).length ? '' : !v.kg ? 'Zero harvest on a harvest day. Save only if nothing was picked.'
    : v.kg > p * 2 || v.kg < p / 2 ? `${kg(v.kg)} kg is ${(v.kg / p).toFixed(1)}× the forecast (${kg(p)} kg). Check the number.`
    : Math.abs(kb / ref - 1) > .2 ? `${kb.toFixed(1)} kg per box is far from the usual ${ref.toFixed(1)}. Check boxes and kilograms.` : '';
  return { e, odd, v };
};
const mtvRaw = box => Object.fromEntries($$('input', box).map(i => [i.name, i.value]));
// El mensaje va dentro del formulario o, si la captura es un renglón de la tabla, en el renglón de abajo
const mtvMsg = (box, txt, bad) => { const row = box.tagName === 'TR', em = $('em', row ? box.nextElementSibling : box); em.textContent = txt; em.className = bad ? 'bad' : ''; if (row) box.nextElementSibling.hidden = !txt; };
A.mtvSave = el => {
  const box = el.closest('.mtv-cap'), n = +box.dataset.gh, i = +box.dataset.day, btn = $('[data-action="mtvSave"]', box), r = mtvVal(n, i, mtvRaw(box));
  $$('input', box).forEach(inp => inp.classList.toggle('bad', !!r.e[inp.name]));
  const first = Object.values(r.e)[0], key = JSON.stringify(r.v);
  if (first) { mtvMsg(box, first, true); return ($('input.bad', box) || {}).focus?.(); }
  if (r.odd && box.dataset.sure !== key) { box.dataset.sure = key; mtvMsg(box, r.odd, true); btn.textContent = 'Save anyway'; return; }
  const R = S.mtv.real[n], old = R[i];
  R[i] = r.v; S.mtv.edit = null; mtvRe();
  toast(`${MTV.full[i]}: ${kg(r.v.kg)} kg in ${kg(r.v.bx)} boxes saved`, () => { R[i] = old; mtvRe(); });
};
const mtvFocus = (gh, day) => { const inp = $(`.mtv-cap[data-gh="${gh}"][data-day="${day}"] input`); if (inp) { inp.closest('.mtv-cap').scrollIntoView({ block: 'center' }); inp.select(); } };
A.mtvEdit = el => { const { gh, day } = el.dataset; S.mtv.edit = mtvKey(gh, day); mtvRe(); mtvFocus(gh, day); };
A.mtvCancel = () => { S.mtv.edit = null; mtvRe(); };
// Desde la tarjeta "Today" o el aviso: abre el registro de esta semana y deja el cursor en el renglón de ese día
A.mtvGo = el => { const { gh, day } = el.dataset; S.mtv.tab = 'Record'; S.mtv.per = 'This week'; S.mtv.edit = S.mtv.real[gh][day] ? mtvKey(gh, day) : null; render(); mtvFocus(gh, day); };
document.addEventListener('input', e => {
  const box = e.target.closest('.mtv-cap'); if (!box) return;
  const n = +box.dataset.gh, i = +box.dataset.day, raw = mtvRaw(box);
  e.target.classList.remove('bad'); $('[data-action="mtvSave"]', box).textContent = 'Save'; delete box.dataset.sure;
  if (box.tagName === 'TR') { const c = mtvCalc(n, i, raw); $$('[data-l]', box).forEach(s => { s.textContent = c[s.dataset.l]; }); mtvMsg(box, '', false); } else mtvMsg(box, mtvLive(n, i, raw), false);
});
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.closest('.mtv-cap')) A.mtvSave(e.target); });

// ---------- Settings (pop-up) ----------
// Todo es del invernadero y compartido. "Color" es el color de madurez del tomate (escala del 1 al 6), no el color de la gráfica.
let MD = null; // borrador: nada se aplica hasta Save
const MTV_KEYS = ['colP', 'colR', 'days', 'passes', 'share', 'size', 'weight'];
// Casillas del % por día: solo los días con cosecha. Errores de la persona: al cambiar las vueltas o los días de cosecha el reparto
// se rehace parejo solo; si alguien cambia un día y la suma ya no da vueltas × 100, se dice cuánto falta o sobra y no deja guardar.
const mtvShareDraw = () => { $('#mtv-sh .mtv-days').innerHTML = MD.share.map((v, i) => v == null ? '' : `<label><span>${MTV.days[i]}</span><input class="input" name="sh${i}" inputmode="numeric" value="${v}" aria-label="${MTV.full[i]}, percent of the greenhouse"></label>`).join(''); };
const mtvResplit = () => { MD.share = mtvEven(+MD.passes, MD.days).map(v => v == null ? null : String(v)); mtvShareDraw(); mtvSetCheck(); };
A.mtvSplit = mtvResplit;
const mtvSetBody = () => `<p class="hint" style="color:var(--ink-2);font-size:13px">Greenhouse ${MD.gh} · shared with everyone. These settings apply from today forward: days already harvested keep the ones they had.</p>
  <div class="field"><span>Projection · ripeness color</span>${seg('mtvcp', MTV.colors, MD.colP)}<em>Color of the 6-step ripeness chart the forecast is calculated for.</em></div>
  <div class="field" id="mtv-cr"><span>Harvest · ripeness color</span>${seg('mtvcr', MTV.colors, MD.colR)}<em></em></div>
  <div class="field"><span>Harvest days</span>${seg('mtvdays', MTV.sched, MD.days)}<em id="mtv-dn"></em></div>
  <div class="field"><span>Passes per week</span>${seg('mtvpass', MTV.passes, MD.passes)}<em>How many times the whole greenhouse is harvested in one week.</em></div>
  <div class="field" id="mtv-sh"><span>Greenhouse harvested each day (%)</span><div class="mtv-days"></div><em></em><button class="btn" type="button" data-action="mtvSplit">Split evenly</button></div>
  <p class="hint" style="color:var(--ink-2);font-size:13px">Mockup: passes and the daily share are saved and shown under the title. The forecast does not use them yet.</p>
  <div class="mtv-two">${['size', 'weight'].map(k => `<label class="field"><span>Ideal fruit ${k} (${MTV.lim[k][2]})</span><input class="input" name="${k}" inputmode="decimal" value="${MD[k]}"><em></em></label>`).join('')}</div>
  <p class="hint" style="color:var(--ink-2);font-size:13px;margin:0">The ideal fruit adjusts the forecast from today forward.</p>`;
function mtvSetCheck() {
  let ok = true;
  ['size', 'weight'].forEach(k => {
    const inp = $(`[name=${k}]`, sheet), f = inp.closest('.field'), [lo, hi, u] = MTV.lim[k], v = inp.value.trim(), good = /^\d+(\.\d)?$/.test(v) && +v >= lo && +v <= hi;
    MD[k] = inp.value; f.classList.toggle('bad', !good); $('em', f).textContent = good ? `Between ${lo} and ${hi} ${u}` : `Type a number between ${lo} and ${hi} ${u}`; ok = ok && good;
  });
  const need = +MD.passes * 100, sh = $('#mtv-sh'); let tot = 0, shOk = true;
  MD.share.forEach((_, i) => {
    const inp = $(`[name=sh${i}]`, sh); if (!inp) return;
    const v = inp.value.trim(), good = /^\d+$/.test(v) && +v >= 1 && +v <= 100;
    MD.share[i] = v; inp.classList.toggle('bad', !good); shOk = shOk && good; tot += good ? +v : 0;
  });
  const dif = need - tot;
  sh.classList.toggle('bad', !shOk || dif !== 0); ok = ok && shOk && !dif;
  $('em', sh).textContent = !shOk ? 'Each day takes a whole number between 1 and 100.' : dif ? `The days add up to ${tot} %. With ${MD.passes} pass${MD.passes === '1' ? '' : 'es'} they must add up to ${need} %: ${dif > 0 ? `${dif} % missing` : `${-dif} % too much`}.` : `Total ${tot} % = ${MD.passes} pass${MD.passes === '1' ? '' : 'es'} × 100 %.`;
  const same = MD.colP === MD.colR, cr = $('#mtv-cr');
  cr.classList.toggle('warn', !same); $('em', cr).textContent = same ? 'Same color as the projection: projected and real can be compared.' : `Different from the projection (color ${MD.colP}): projected and real will not be comparable.`;
  $('#mtv-dn').textContent = MD.days === 'Mon to Fri' ? 'Saturday becomes a day without harvest; its kilograms move to the next Monday.' : 'Sunday is the only day without harvest; its kilograms are already in Monday.';
  $('[data-action="mtvApply"]', sheet).disabled = !ok; $('footer .msg', sheet).textContent = ok ? '' : 'Fix the marked field to save.';
}
SEG.mtvcp = v => { MD.colP = v; mtvSetCheck(); };
SEG.mtvcr = v => { MD.colR = v; mtvSetCheck(); };
SEG.mtvdays = v => { MD.days = v; mtvResplit(); };
SEG.mtvpass = v => { MD.passes = v; mtvResplit(); };
A.mtvSettings = el => {
  MD = { gh: +el.dataset.gh, colP: S.mtv.colP, colR: S.mtv.colR, days: S.mtv.days, passes: S.mtv.passes, share: S.mtv.share.map(v => v == null ? null : String(v)), size: String(S.mtv.size), weight: String(S.mtv.weight) };
  openSheet('Settings', mtvSetBody(), `<span class="msg"></span><button class="btn" data-action="close">Cancel</button><button class="btn primary" data-action="mtvApply">Save</button>`, '', true);
  mtvShareDraw(); FORM = mtvSetCheck; mtvSetCheck(); thumbs();
};
A.mtvApply = () => {
  const old = MTV_KEYS.map(k => S.mtv[k]);
  Object.assign(S.mtv, { colP: MD.colP, colR: MD.colR, days: MD.days, passes: MD.passes, share: MD.share.map(v => v == null ? null : +v), size: +MD.size, weight: +MD.weight }); closeSheet(); mtvRe();
  toast('Settings saved', () => { MTV_KEYS.forEach((k, i) => { S.mtv[k] = old[i]; }); mtvRe(); });
};
