// Módulos operativos. Un registro por módulo, todos en el invernadero 11. Datos inventados.
// Los KPIs, la tabla y el reporte de cada módulo salen del mismo registro: un número no puede decir dos cosas.
const hint = t => `<p class="hint" style="color:var(--ink-2);font-size:13px">${t}</p>`;
const sum = a => a.reduce((s, v) => s + v, 0), avg = a => sum(a) / a.length, n1 = v => (+v).toFixed(1);
const G11 = GH.find(g => g.n === 11);
const right = h => h[0] === '>' ? ' class="r"' : '';
const meta = pairs => `<dl class="dl">${pairs.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
const rep = (head, rows, foot) => {
  const tr = r => `<tr>${r.map((c, j) => `<td${right(head[j])}>${c}</td>`).join('')}</tr>`;
  return `<table class="rep"><thead><tr>${head.map(h => `<th${right(h)}>${h.replace('>', '')}</th>`).join('')}</tr></thead><tbody>${rows.map(tr).join('')}</tbody>${foot ? `<tfoot>${tr(foot)}</tfoot>` : ''}</table>`;
};
const done = msg => `<span class="msg">${msg}</span><button class="btn" data-action="close">Done</button>`;

V.picker = mod => ({
  title: MODS[mod][0], sub: 'Choose a greenhouse',
  html: `<div class="grid gh-grid">${GH.map(g => g.crop
    ? `<button class="card gh-card" data-action="go" data-href="#/m/${mod}/${g.n}"><div class="n">Greenhouse ${g.n}${g.n === 11 ? chip('ok', 'Up to date') : chip('plain', 'No reports')}</div><div class="c">${g.crop} · day ${g.day} of ${g.of}</div><div class="l">${g.n === 11 ? `Last report: ${REC[mod].when} · ${REC[mod].by}` : 'No reports in this mockup'}</div></button>`
    : `<div class="card gh-card" style="opacity:.62"><div class="n">Greenhouse ${g.n}${chip('plain', 'No cycle')}</div><div class="c">No active cycle</div><div class="l">Start a cycle to capture reports here.</div></div>`).join('')}</div>`,
});
const modTop = (mod, g, noun, action = 'newrep', label = 'New report') => ({
  back: [MODS[mod][0], `#/m/${mod}`], title: `${noun} · Greenhouse ${g.n}`, sub: `${g.crop} · day ${g.day} of ${g.of}`,
  actions: `<button class="btn primary" data-action="${action}">${icon('plus')}${label}</button>`,
});
// La vista de un módulo: con registros solo en el invernadero 11
const view = (mod, noun, body, action, label) => g => ({
  ...modTop(mod, g, noun, action, label),
  ...(g.n === 11 ? body() : { html: `<div class="card" style="text-align:center;padding:48px 20px"><h2>No reports yet</h2><p class="hint">In this mockup only Greenhouse 11 has records, one per module.</p><button class="btn" data-action="go" data-href="#/m/${mod}/11">Open Greenhouse 11</button></div>` }),
});
const listCard = (title, filterOpts, tbl, note = '') => `<div class="card table-card"><div class="toolbar"><h2 style="margin:0;padding:0">${title}</h2><span class="grow"></span><select class="select" data-filter aria-label="Filter">${filterOpts.map(o => `<option>${o}</option>`).join('')}</select></div>${tbl}${note ? `<div style="padding:10px 12px 6px">${hint(note)}</div>` : ''}</div>`;
A.newrep = () => toast('In this mockup the capture form is built out in Irrigation and Applications');

// ---------- Crop ----------
const CROP = {
  when: 'Today 07:40', by: 'Rubén S.',
  // [row, stem growth cm/week, leaf length cm, stem diameter mm, flowering truss]
  plants: [[2, 18.5, 36.0, 11.0, 12], [2, 19.0, 37.2, 11.4, 12], [9, 17.8, 35.5, 10.6, 11], [9, 18.2, 36.8, 10.9, 12], [16, 19.4, 38.0, 11.5, 12], [16, 18.9, 36.4, 11.2, 12], [23, 17.5, 35.1, 10.5, 11], [23, 18.6, 37.0, 11.1, 12], [30, 19.1, 36.6, 11.3, 12], [30, 18.0, 36.4, 10.5, 11]],
  // [measure, column, unit, target low, target high, scale min, scale max]
  targets: [['Stem growth', 1, 'cm/week', 16, 22, 8, 30], ['Leaf length', 2, 'cm', 34, 40, 20, 50], ['Stem diameter', 3, 'mm', 10, 12, 6, 16]],
};
const cropAvg = j => avg(CROP.plants.map(p => p[j]));
CROP.sheet = () => ['Crop report · Greenhouse 11',
  `${chip('ok', 'In range')}
  ${meta([['Date', `${TODAY} · 07:40`], ['Week', `W47 · day ${G11.day} of ${G11.of}`], ['Captured by', CROP.by], ['Sample', `${CROP.plants.length} plants · rows ${[...new Set(CROP.plants.map(p => p[0]))].join(', ')}`]])}
  <h3>Averages against target</h3>
  ${rep(['Measure', '>Average', 'Target', 'Status'], CROP.targets.map(([m, j, u, lo, hi]) => [m, `${n1(cropAvg(j))} ${u}`, `${lo} to ${hi} ${u}`, chip('ok', 'In range')]))}
  <h3>Plants measured</h3>
  ${rep(['Plant', 'Row', '>Growth cm', '>Leaf cm', '>Stem mm', '>Truss'], CROP.plants.map((p, i) => [i + 1, p[0], n1(p[1]), n1(p[2]), n1(p[3]), p[4]]), ['Average', '', n1(cropAvg(1)), n1(cropAvg(2)), n1(cropAvg(3)), n1(cropAvg(4))])}
  <h3>Note</h3><p style="margin:0;font-size:14px">Even growth across the house. No change to the climate recipe.</p>`,
  done(`Captured ${CROP.when} by ${CROP.by}, with no edits since.`)];
V.crop = view('crop', 'Crop reports', () => ({
  html: `<div class="grid kpis">
    ${kpi('clock', 'Last report', 'Today', '07:40', `${CROP.by} · week 47`)}
    ${CROP.targets.map(([m, j, u, lo, hi, mn, mx]) => kpi('sprout', m, n1(cropAvg(j)), u, `Inside target ${lo} to ${hi}`, range(lo, hi, cropAvg(j), mn, mx))).join('')}
  </div>
  ${listCard('Reports', ['All statuses', 'In range'], table('crop', ['Date', 'Week', 'Captured by', '>Plants', '>Growth cm', '>Leaf cm', '>Stem mm', 'Status'],
    [[CROP.when, 'W47', CROP.by, CROP.plants.length, n1(cropAvg(1)), n1(cropAvg(2)), n1(cropAvg(3)), chip('ok', 'In range')]]),
    'One report in this greenhouse. The weekly trend appears from the second report on.')}`,
}));

// ---------- Pollination ----------
const POLR = { when: 'Today 08:20', by: 'Rubén S.', North: [1, 2, 8, 17, 12], South: [1, 4, 10, 15, 10] }; // flores por nivel 0 a 4
POLR.Both = POLR.North.map((v, i) => v + POLR.South[i]);
const PC = NEWPAL ? ['#E4E7EA', '#BBD3E4', '#86B4D6', '#4A90C2', '#0072B2'] : ['#D8D2C2', '#E3C877', '#A9C48A', '#6FA35B', '#2D5A27'];
const polOk = d => (d[2] + d[3] + d[4]) / sum(d) * 100, polLvl = d => sum(d.map((v, i) => v * i)) / sum(d);
const polDist = side => {
  const d = POLR[side], p = d.map(v => +n1(v / sum(d) * 100));
  return `<div class="stack" role="img" aria-label="Distribution by pollination level">${p.map((v, i) => `<i style="width:${v}%;background:${PC[i]}" title="Level ${i}: ${v} %"></i>`).join('')}</div>
  <div class="legend">${p.map((v, i) => `<span><i class="sq" style="background:${PC[i]}"></i>Level ${i} · <b class="num" style="color:var(--ink)">${v} %</b></span>`).join('')}</div>
  <p class="hint" style="margin:12px 0 0;color:var(--ink-2);font-size:13px">Pollinated = levels 2, 3 and 4 = <b>${+n1(polOk(d))} %</b> of ${sum(d)} flowers. Target: at least 85 %.</p>`;
};
SEG.pol = side => { $('#pol').innerHTML = polDist(side); };
POLR.sheet = () => ['Pollination sampling · Greenhouse 11',
  `${chip('ok', 'On target')}
  ${meta([['Date', `${TODAY} · 08:20`], ['Sampled by', POLR.by], ['Sample', `${sum(POLR.Both)} flowers · ${sum(POLR.North)} per side`], ['Pollinated', `${+n1(polOk(POLR.Both))} % · target at least 85 %`], ['Average level', `${n1(polLvl(POLR.Both))} of 4`]])}
  <h3>Distribution by level, both sides</h3>
  ${polDist('Both')}
  <h3>Flowers by level and side</h3>
  ${rep(['Level', '>North', '>South', '>Both'], POLR.Both.map((b, i) => [`<i class="sq" style="display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:8px;background:${PC[i]}"></i>Level ${i}`, POLR.North[i], POLR.South[i], b]), ['Flowers', sum(POLR.North), sum(POLR.South), sum(POLR.Both)])}
  <h3>Result by side</h3>
  ${rep(['Side', '>Pollinated %', '>Avg level', 'Status'], ['North', 'South'].map(s => [s, +n1(polOk(POLR[s])), n1(polLvl(POLR[s])), chip('ok', 'On target')]))}`,
  done(`Captured ${POLR.when} by ${POLR.by}, with no edits since.`)];
V.pollination = view('pollination', 'Pollination', () => ({
  html: `<div class="grid kpis">
    ${kpi('flower', 'Pollinated', +n1(polOk(POLR.Both)), '%', 'Levels 2 to 4. Target at least 85 %', range(85, 100, polOk(POLR.Both), 50, 100))}
    ${kpi('check', 'Average level', n1(polLvl(POLR.Both)), 'of 4', `North ${n1(polLvl(POLR.North))} · South ${n1(polLvl(POLR.South))}`)}
    ${kpi('user', 'Flowers sampled', sum(POLR.Both), '', `${sum(POLR.North)} per side`)}
    ${kpi('clock', 'Last sampling', 'Today', '08:20', POLR.by)}
  </div>
  <div class="card" style="margin-bottom:14px"><div class="toolbar"><h2 style="margin:0">Distribution by level</h2><span class="grow"></span>${seg('pol', ['Both', 'North', 'South'], 'Both')}</div><div id="pol"></div></div>
  ${listCard('Samplings', ['All statuses', 'On target'], table('pollination', ['Date', 'Sides', '>Flowers', '>Pollinated %', '>Avg level', 'Status'],
    [[POLR.when, 'North + South', sum(POLR.Both), +n1(polOk(POLR.Both)), n1(polLvl(POLR.Both)), chip('ok', 'On target')]]),
    'One sampling holds both sides. The split by side is inside the report.')}`,
  after: () => SEG.pol('Both'),
}));

// ---------- Irrigation ----------
const IRR = {
  when: 'Today 07:10', by: 'Rubén S.', drippers: 4, ecIn: 2.8, phIn: 5.9,
  // [irrigation ml per dripper, drain ml per tray, drain EC mS/cm, drain pH]
  valves: [[400, 400, 3.6, 6.2], [400, 416, 3.8, 6.3], [410, 394, 3.5, 6.1], [400, 384, 3.6, 6.2], [400, 432, 3.9, 6.3], [410, 410, 3.7, 6.2]],
};
const irrCol = j => IRR.valves.map(v => v[j]), drainPct = v => v[1] / (v[0] * IRR.drippers) * 100;
const irrDrain = sum(irrCol(1)) / (sum(irrCol(0)) * IRR.drippers) * 100, ecOut = avg(irrCol(2)), phOut = avg(irrCol(3));
IRR.sheet = () => ['Irrigation report · Greenhouse 11',
  `${chip('ok', 'In range')}
  ${meta([['Date', `${TODAY} · 07:10`], ['Captured by', IRR.by], ['Valves', `${IRR.valves.length} of 6 with readings`], ['Irrigation solution', `EC ${n1(IRR.ecIn)} mS/cm · pH ${n1(IRR.phIn)}`], ['Drippers per tray', IRR.drippers]])}
  <h3>Readings by valve</h3>
  ${rep(['Valve', '>Irrigation ml', '>Drain ml', '>Drain %', '>EC', '>pH'], IRR.valves.map((v, i) => [`<b>V${i + 1}</b>`, v[0], v[1], n1(drainPct(v)), n1(v[2]), n1(v[3])]), ['Average', Math.round(avg(irrCol(0))), Math.round(avg(irrCol(1))), n1(irrDrain), n1(ecOut), n1(phOut)])}
  ${hint(`Drain % = drain ml ÷ (irrigation ml × ${IRR.drippers} drippers on the tray). Target 20 to 30 %. EC and pH are measured in the drain: reference EC up to 4.0 mS/cm, pH 5.5 to 6.5.`)}`,
  done(`Captured ${IRR.when} by ${IRR.by}, with no edits since.`)];
const LIM = [['Irrigation ml', 0, 2000], ['Drain ml', 0, 2000], ['EC', 0.5, 6], ['pH', 4, 8]];
A.newirr = () => {
  const pre = [[400, 96, 2.8, 5.9], [400, 104, 2.9, 5.8], [410, 48, 3.1, 6.0], [400, 52, 3.0, 5.9], [], []];
  openSheet('New irrigation report',
    `${hint('Today, 07:10. Each valve needs its four readings or the mark "No reading". An empty cell is never saved as 0.')}
    <table class="valves"><thead><tr><th>Valve</th>${LIM.map(l => `<th>${l[0]}</th>`).join('')}<th>No reading</th></tr></thead><tbody>${pre.map((r, i) => `<tr><td><b>V${i + 1}</b></td>${LIM.map((l, j) => `<td><input class="input" inputmode="decimal" data-j="${j}" value="${r[j] === undefined ? '' : r[j]}" aria-label="Valve ${i + 1}, ${l[0]}"></td>`).join('')}<td style="text-align:center"><input type="checkbox" style="width:20px;height:20px" aria-label="Valve ${i + 1}, no reading"></td></tr>`).join('')}</tbody></table>
    ${hint('Allowed: EC 0.5 to 6 mS/cm · pH 4 to 8 · up to 2000 ml. Limits are set once, in Set reference.')}`,
    `<span class="msg" id="ir-msg"></span><button class="btn" data-action="close">Cancel</button><button class="btn primary" id="ir-save" data-action="irsave" disabled>Save</button>`);
  FORM = () => {
    let ready = 0, skipped = 0, err = '';
    $$('.valves tbody tr').forEach((tr, i) => {
      const skip = $('[type=checkbox]', tr).checked; let full = true;
      $$('.input', tr).forEach(inp => {
        inp.disabled = skip; if (skip) { inp.classList.remove('bad'); return; }
        const l = LIM[inp.dataset.j], v = inp.value.trim(), bad = v !== '' && (isNaN(v) || +v < l[1] || +v > l[2]);
        inp.classList.toggle('bad', bad); if (bad && !err) err = `Valve ${i + 1}: ${l[0]} must be ${l[1]} to ${l[2]}.`;
        if (v === '' || bad) full = false;
      });
      if (skip) skipped++; if (skip || full) ready++;
    });
    $('#ir-save').disabled = ready < 6; $('#ir-save').dataset.s = skipped;
    $('#ir-msg').textContent = err || (ready < 6 ? `${ready} of 6 valves ready. Fill the rest or mark "No reading".` : 'All 6 valves ready.');
    $('#ir-msg').style.color = err ? 'var(--crit)' : '';
  };
  FORM();
};
A.irsave = el => { const s = +el.dataset.s; closeSheet(); toast(`Report saved (demo) · ${6 - s} valves with readings${s ? `, ${s} without reading` : ''}`); };
V.irrigation = view('irrigation', 'Irrigation', () => ({
  html: `<div class="grid kpis">
    ${kpi('check', "Today's capture", IRR.valves.length, 'of 6 valves', `07:10 · ${IRR.by}`)}
    ${kpi('drop', 'Drain', n1(irrDrain), '%', 'Inside target 20 to 30 %', range(20, 30, irrDrain, 0, 50))}
    ${kpi('flask', 'EC, irrigation → drain', `${n1(IRR.ecIn)} → ${n1(ecOut)}`, 'mS/cm', 'Drain under the 4.0 reference', range(2.5, 4, ecOut, 1, 6))}
    ${kpi('drop', 'pH, irrigation → drain', `${n1(IRR.phIn)} → ${n1(phOut)}`, '', 'Drain inside 5.5 to 6.5', range(5.5, 6.5, phOut, 4, 8))}
  </div>
  <div class="card" style="margin-bottom:14px"><h2>Drain % by valve, today</h2><p class="hint">Target 20 to 30 %. Drain % = drain ml ÷ (irrigation ml × ${IRR.drippers} drippers on the tray).</p>
    <div class="grid" style="grid-template-columns:repeat(6,minmax(0,1fr))">${IRR.valves.map((v, i) => `<div><div style="font-size:13px;color:var(--ink-2)">Valve ${i + 1}</div><b class="num">${n1(drainPct(v))} %</b>${range(20, 30, drainPct(v), 0, 50)}</div>`).join('')}</div></div>
  ${listCard('Daily reports', ['All statuses', 'In range'], table('irrigation', ['Date', 'Valves', '>Irrigation ml', '>Drain %', 'EC in → out', 'pH in → out', 'Status'],
    [[IRR.when, `${IRR.valves.length} of 6`, Math.round(avg(irrCol(0))), n1(irrDrain), `${n1(IRR.ecIn)} → ${n1(ecOut)}`, `${n1(IRR.phIn)} → ${n1(phOut)}`, chip('ok', 'In range')]]),
    'One row per day. Averages use only the valves that have a reading; a missing reading is shown as missing, never as 0.')}`,
}), 'newirr');

// ---------- Pests & Diseases ----------
const PEST = {
  when: 'Nov 16 08:05', by: 'Lucía P.', name: 'Spider mite', type: 'Pest', chapel: 'A', follow: 'Fri, Nov 20',
  rows: [[2, 20, 1], [3, 20, 1]], // [row, plants sampled, plants affected]
};
const pestN = sum(PEST.rows.map(r => r[1])), pestA = sum(PEST.rows.map(r => r[2])), pestInc = pestA / pestN * 100;
const pestWhere = `Chapel ${PEST.chapel} · rows ${PEST.rows[0][0]}–${PEST.rows[PEST.rows.length - 1][0]}`;
const LV = ['None', 'Low', 'Medium', 'High'], lv = p => p === 0 ? 0 : p < 10 ? 1 : p <= 30 ? 2 : 3;
const heat = (ch, r) => { const x = ch === PEST.chapel && PEST.rows.find(q => q[0] === r); return x ? lv(x[2] / x[1] * 100) : 0; };
const HEATCOLS = 'grid-template-columns:64px repeat(20,minmax(0,1fr))';
PEST.sheet = () => [`Finding · ${PEST.name}`,
  `${chip('info', `Follow-up ${PEST.follow}`)}
  ${meta([['Finding', `${PEST.name} · ${PEST.type}`], ['Date', 'Mon, Nov 16 · 08:05'], ['Scouted by', PEST.by], ['Location', pestWhere], ['Incidence', `${+n1(pestInc)} % · ${pestA} of ${pestN} plants`], ['Severity', `${LV[lv(pestInc)]} · under 10 %`], ['Stage seen', 'Adults and eggs, underside of lower leaves']])}
  <h3>Plants by row</h3>
  ${rep(['Row', '>Sampled', '>Affected', '>Incidence %'], PEST.rows.map(r => [`Row ${r[0]}`, r[1], r[2], +n1(r[2] / r[1] * 100)]), ['Total', pestN, pestA, +n1(pestInc)])}
  ${hint('Incidence = affected plants ÷ sampled plants.')}
  <h3>What happens next</h3>
  ${meta([['Treatment', `Spot spray in plan ${PLAN.week.split(' · ')[0]}, set for Wed, Nov 18`], ['Follow-up', `Re-scout the same rows on ${PEST.follow} · ${PEST.by}`]])}`,
  done(`Captured ${PEST.when} by ${PEST.by}, with no edits since.`)];
V.pests = view('pests', 'Pests & Diseases', () => ({
  html: `<div class="grid kpis">
    ${kpi('clock', 'Follow-ups due', '0', 'today', `Next: ${PEST.name}, ${PEST.follow}`)}
    ${kpi('bug', 'Findings', '1', 'this week', '1 pest · 0 diseases')}
    ${kpi('alert', 'Rows affected', PEST.rows.length, 'of 120', `${n1(PEST.rows.length / 120 * 100)} % of the rows`)}
    ${kpi('bug', 'Highest pressure', PEST.name, '', `Chapel ${PEST.chapel} · ${pestA} of ${pestN} plants affected (${+n1(pestInc)} %)`)}
  </div>
  <div class="grid cols-2">
    <div class="card"><h2>Where it is</h2><p class="hint">Scouting of Mon, Nov 16. Share of sampled plants affected in each row.</p>
      <div class="heat" style="${HEATCOLS}">${'ABCDEF'.split('').map(ch => `<span style="font-size:11px;color:var(--ink-2);align-self:center">Chapel ${ch}</span>` + [...Array(20).keys()].map(r => `<i class="l${heat(ch, r + 1)}" title="Chapel ${ch} · row ${r + 1} · ${LV[heat(ch, r + 1)]}"></i>`).join('')).join('')}</div>
      <div class="heat-x" style="${HEATCOLS}"><span></span>${[...Array(20).keys()].map(r => `<span>${r % 5 === 4 || !r ? r + 1 : ''}</span>`).join('')}</div>
      <div class="legend" style="margin-top:10px"><span><i class="sq" style="background:var(--sunken)"></i>None</span><span><i class="sq" style="background:#F3D58A"></i>Low, under 10 %</span><span><i class="sq" style="background:#E79A3C"></i>Medium, 10 to 30 %</span><span><i class="sq" style="background:#C6392E"></i>High, over 30 %</span></div>
    </div>
    <div class="card"><h2>Top threats</h2><p class="hint">Incidence = affected plants ÷ sampled plants.</p>
      <ul class="list"><li style="cursor:default"><span class="ic">${icon('bug')}</span><span class="t"><b>${PEST.name}</b><span>${PEST.type} · chapel ${PEST.chapel}</span></span><span class="bar" style="width:70px"><i style="width:${pestInc * 2}%"></i></span><b class="num">${+n1(pestInc)} %</b></li></ul>
    </div>
  </div>
  ${listCard('Findings', ['All types', 'Pest', 'Disease', 'Disorder'], table('pests', ['Date', 'Finding', 'Type', 'Location', '>Incidence', 'Follow-up'],
    [[PEST.when, PEST.name, PEST.type, pestWhere, `${+n1(pestInc)} %`, chip('info', PEST.follow)]]),
    'A finding is one pest, disease or disorder in one place. Its report opens that finding, not the whole day.')}`,
}), 'newrep', 'New scouting');

// ---------- Applications ----------
const STG = ['Plan', 'Review', 'Authorized', 'Executed', 'Evaluated'];
const steps = n => `<span class="steps" role="img" aria-label="Step ${n} of 5">${STG.map((_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</span>${STG[n - 1]}`;
const PROD = { 'Verdisan 40 SC': [0.5, 1.5, 'mL'], 'Mitrex Oil': [2, 5, 'mL'], 'Bacilux WP': [1, 2.5, 'g'] };
const PLAN = {
  when: 'Nov 16 09:10', by: 'Lucía P.', week: 'Week 47 · Nov 16', product: 'Mitrex Oil', dose: 3, water: 200, stage: 3,
  // [paso, cuándo, quién]
  path: [['Mon, Nov 16 · 09:10', 'Lucía P.'], ['Mon, Nov 16 · 15:30', 'Rubén S.'], ['Today · 06:50', 'Marta R.'], ['Set for Wed, Nov 18 · 06:00', ''], [`After the re-scout of ${PEST.follow}`, '']],
};
const planNeed = `${PLAN.dose * PLAN.water} ${PROD[PLAN.product][2]}`;
PLAN.sheet = () => [`Treatment plan · ${PLAN.week.split(' · ')[0]}`,
  `<div style="font-weight:600;font-size:14px">${steps(PLAN.stage)} · step ${PLAN.stage} of 5</div>
  ${meta([['Week', PLAN.week], ['Cycle', `${G11.crop} · day ${G11.day} of ${G11.of}`], ['Target', `${PEST.name} · ${pestWhere} · ${+n1(pestInc)} %`], ['Area', `Chapel ${PEST.chapel} · rows 1–4`], ['Product', PLAN.product], ['Dose', `${PLAN.dose} ${PROD[PLAN.product][2]}/L · label range ${PROD[PLAN.product][0]} to ${PROD[PLAN.product][1]}`], ['Water', `${PLAN.water} L`], ['Product needed', `${planNeed} = ${PLAN.dose} ${PROD[PLAN.product][2]}/L × ${PLAN.water} L`], ['Re-entry', 'Closed 12 h after the spray']])}
  <h3>Path</h3>
  ${rep(['Step', 'When', 'By', ''], STG.map((s, i) => [`<b>${s}</b>`, PLAN.path[i][0], PLAN.path[i][1], i < PLAN.stage ? chip('ok', 'Done') : chip('plain', 'Pending')]))}
  ${hint('Next: execute on Wed, Nov 18. A plan cannot be evaluated before it is executed.')}`,
  done(`Created ${PLAN.when} by ${PLAN.by}, every step signed.`)];
A.newplan = () => {
  openSheet('New treatment plan',
    `${field('Week', select(['Week 48 · Nov 23', 'Week 49 · Nov 30', 'Week 47 · Nov 16 (plan exists)'], 'id="pl-w"'), 'One plan per greenhouse and week.')}
     ${field('Cycle', '<input class="input" value="Taken from the greenhouse and the week" disabled>')}
     ${field('Target', select(['Whitefly', 'Powdery mildew', 'Spider mite']))}
     ${field('Product', select(Object.keys(PROD), 'id="pl-p"'))}
     <label class="field" id="pl-df"><span id="pl-dl"></span><input class="input" id="pl-d" inputmode="decimal" value="1"><em id="pl-dh"></em></label>
     <label class="field" id="pl-qf"><span>Water (L)</span><input class="input" id="pl-q" inputmode="numeric" value="1500"><em>Required, 100 to 5000 L. Cost is calculated from it.</em></label>
     <div class="card" style="background:var(--sunken);box-shadow:none"><div style="font-size:12px;color:var(--ink-2);font-weight:600">Product needed = dose × water</div><div id="pl-t" class="num" style="font-weight:650;font-size:18px;margin-top:2px"></div></div>`,
    `<span class="msg" id="pl-msg"></span><button class="btn" data-action="close">Cancel</button><button class="btn primary" id="pl-save" data-action="plsave">Save draft</button>`);
  FORM = () => {
    const [lo, hi, u] = PROD[$('#pl-p').value], d = +$('#pl-d').value, q = +$('#pl-q').value, taken = $('#pl-w').value.includes('exists');
    const dOk = d >= lo && d <= hi, qOk = q >= 100 && q <= 5000;
    $('#pl-dl').textContent = `Dose (${u} per liter of water)`; $('#pl-dh').textContent = `Label range: ${lo} to ${hi} ${u}/L.`;
    $('#pl-df').classList.toggle('bad', !dOk); $('#pl-qf').classList.toggle('bad', !qOk);
    const tot = d * q, big = tot >= 1000;
    $('#pl-t').textContent = dOk && qOk ? `${(big ? tot / 1000 : tot).toLocaleString('en-US', { maximumFractionDigits: 2 })} ${big ? (u === 'mL' ? 'L' : 'kg') : u}` : 'Fix the fields in red';
    $('#pl-save').disabled = taken || !dOk || !qOk;
    $('#pl-msg').textContent = taken ? 'That week already has a plan for this greenhouse. Open it instead of creating another.' : '';
  };
  FORM();
};
A.plsave = () => { closeSheet(); toast('Plan saved as draft (demo: nothing is saved)'); };
V.applications = view('applications', 'Applications', () => ({
  html: `<div class="grid kpis">
    ${kpi('flask', "This week's plan", STG[PLAN.stage - 1], '', `${PLAN.week.split(' · ')[0]} · step ${PLAN.stage} of 5 · spray Wed, Nov 18`)}
    ${kpi('clock', 'Re-entry', 'Open', '', 'No application in the last 12 h')}
    ${kpi('user', 'Waiting for you', '0', 'plans', 'Nothing to review or authorize')}
    ${kpi('check', 'Product needed', PLAN.dose * PLAN.water, PROD[PLAN.product][2], `${PLAN.product} · ${PLAN.dose} ${PROD[PLAN.product][2]}/L × ${PLAN.water} L`)}
  </div>
  ${listCard('Treatment plans', ['All stages', ...STG], table('applications', ['Week', 'Stage', 'Target', 'Products', '>Water L', 'Owner'],
    [[PLAN.week, steps(PLAN.stage), PEST.name, `${PLAN.product} · ${PLAN.dose} ${PROD[PLAN.product][2]}/L`, PLAN.water, PLAN.by]]),
    'One plan per greenhouse and week, with one path: Plan, Review, Authorized, Executed, Evaluated. A plan cannot be authorized without applications, or evaluated before it is executed.')}`,
}), 'newplan', 'New plan');

// Abrir una fila de módulo abre su registro completo; las demás tablas siguen con la ficha simple
const REC = { crop: CROP, pollination: POLR, irrigation: IRR, pests: PEST, applications: PLAN };
const plainReport = A.report;
A.report = el => {
  if (!REC[el.dataset.mod]) return plainReport(el);
  const [t, b, f = ''] = REC[el.dataset.mod].sheet();
  repRow = el.closest('tr'); openSheet(t, b, f, REP_TOOLS);
};
