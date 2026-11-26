// Comparación de color: capturas de la app real contra la propuesta. Es una hoja de apoyo para Julián, no una pantalla del producto.
// Las capturas son de la app real (17 y 20 nov 2026); lo de la derecha usa las piezas de la maqueta, con datos inventados.
// El recuadro rojo va en % de la imagen: [izquierda, arriba, ancho, alto].
const cmpShot = (src, cap, [l, t, w, h]) => `<figure class="cmp-shot"><span><img src="img/${src}" alt="${cap}" onerror="this.closest('figure').hidden=true"><i style="left:${l}%;top:${t}%;width:${w}%;height:${h}%"></i></span><figcaption>${cap}</figcaption></figure>`;
const cmpCard = (n, title, why, real, prop, note) => `<div class="card cmp"><h2>${n}. ${title}</h2><p class="hint">${why}</p><div class="cmp-2"><div><h3>Hoy, app real</h3>${real}</div><div><h3>Propuesta</h3>${prop}<p class="cmp-n">${note}</p></div></div></div>`;

V.colors = () => ({
  title: 'Colores: app real contra propuesta',
  sub: 'Tres casos donde sí cambia. Primero la captura real; después la propuesta, con datos inventados.',
  back: ['Home', '#/home'],
  html: `<div class="grid">${[
    cmpCard(1, 'Gráficas', 'Regla: una gráfica no usa el verde de la marca; cada variable tiene su color y hay leyenda.',
      cmpShot('real-weather-grafica.jpg', 'Weather, 17 nov 2026. La gráfica sale en el verde de la marca y no hay leyenda que diga qué es cada línea.', [43, 46, 55.5, 54]),
      `<div class="cmp-box"><div class="legend">${WX.map(s => `<span><i style="background:${s.color}"></i>${s.name} · ${s.unit}</span>`).join('')}</div>${chart(WX, 190)}</div>`,
      'Temperatura en naranja, humedad en azul y radiación en ocre, con la leyenda siempre a la vista. Es el fix 1.5.'),
    cmpCard(2, 'Estados', 'Regla: lo normal va en gris; el color se guarda para lo que pide atención, con icono y palabra.',
      cmpShot('real20-pollination-reporte.png', 'Reporte de Pollination, 20 nov 2026. Cada nivel trae un emoji y una etiqueta de color; "Normal" va en verde, igual que la marca.', [2.5, 65, 94.5, 19.5]),
      `<div class="cmp-box cmp-row">${chip('ok', 'Normal')}${chip('warn', 'Watch')}${chip('crit', 'Anomaly')}</div>`,
      '"Normal" en gris no llama la atención. "Watch" y "Anomaly" son lo único con color y llevan un icono, así se distinguen aunque no se vea el color.'),
    cmpCard(3, 'El verde para una sola cosa', 'Regla: el verde es la marca y el botón principal. No es texto de ayuda ni botón apagado.',
      cmpShot('real20-pests-reporte.png', 'Crop health report, 20 nov 2026. El verde sirve a la vez de botón principal ("Apply filters"), de botón apagado ("Compare maps") y de texto de ayuda.', [2.5, 73.5, 94, 14]),
      `<div class="cmp-box cmp-row"><button class="btn primary">${icon('check')}Apply filters</button><button class="btn" disabled>Compare maps</button></div><p class="cmp-help">Choose two existing inspection reports to compare the same locations.</p>`,
      'Un solo verde: el del botón que sí se puede oprimir. El apagado va en gris y la ayuda en el gris del texto secundario.'),
  ].join('')}<div class="card cmp"><h2>4. Dorado</h2><p class="hint" style="margin:0">No encontré en las capturas un caso de texto dorado sobre blanco en la app real. La regla queda como prevención: el dorado solo se lee sobre el verde oscuro.</p></div></div>`,
});
