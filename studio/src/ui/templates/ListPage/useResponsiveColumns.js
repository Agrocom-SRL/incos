/**
 * useResponsiveColumns — decide qué columnas caben en un ancho de contenedor dado.
 *
 * NO es un hook (no usa React): es una función PURA y determinista. Vive en el
 * template para que CUALQUIER listado que use `ListPage` herede el comportamiento
 * responsive-por-contenedor sin reimplementarlo. SRP: solo DECIDE columnas y
 * densidad; medir es de `useElementWidth`, renderizar es de `ListDataView`.
 *
 * Contrato:
 *   (columns, containerWidth, prev?) => { visibleColumns, hiddenColumns, density }
 *
 * Reglas:
 *  - Columnas FIJAS (nunca se ocultan): la 1.ª columna de datos (index 0) y la
 *    columna con `key === 'actions'`.
 *  - Caída derecha→izquierda: mientras la suma de `minWidth` de las columnas
 *    supere el ancho disponible, se oculta la columna ocultable de MÁS A LA
 *    DERECHA y pasa a `hiddenColumns` (en orden de aparición original).
 *  - `density` se deriva del ancho del CONTENEDOR usando los umbrales canónicos
 *    de `breakpoints.js` (no se inventan números): >= lg → 'full',
 *    >= md → 'medium', < md → 'compact'.
 *  - Antes de medir (containerWidth 0/undefined) devuelve TODO visible, sin
 *    ocultas y density 'full', para no parpadear ocultando todo en el 1.er render.
 *
 * HISTÉRESIS (anti-parpadeo en el borde):
 *  Al ARRASTRAR/colapsar el sidebar el ancho cruza un umbral varias veces por
 *  valores intermedios. Sin estado, ocultar y RE-mostrar una columna ocurriría en
 *  el MISMO ancho exacto → toggle encendido/apagado (parpadeo). Para estabilizar,
 *  la decisión depende del resultado ANTERIOR (`prev`), manteniéndose PURA
 *  (función de sus 3 argumentos):
 *   - Ocultar: con el ancho disponible tal cual (umbral "duro").
 *   - RE-mostrar una columna que estaba oculta: exige `HYST_W` px de holgura
 *     EXTRA sobre su minWidth, así no reaparece en el mismo punto donde se ocultó.
 *   - Densidad: banda de `HYST_DENSITY_W` px alrededor de los umbrales md/lg; si
 *     el ancho está dentro de la banda respecto al estado previo, NO cambia.
 *  Si `prev` no se pasa, el comportamiento es el original (sin histéresis): un
 *  caller que no recuerde el resultado anterior obtiene exactamente lo de antes.
 *
 * Reservas de ancho de layout (px) — anchos de chrome de la tabla, no breakpoints,
 * por eso son números literales con comentario:
 *  - SELECT_W (~48): columna del checkbox de selección (`rowSelection`).
 *  - EXPAND_W (~48): columna de toggle de expand, SOLO si habrá columnas ocultas.
 *  - ACTIONS_W por density: la columna de acciones se compacta con la densidad
 *    (full ~140 / medium ~96 / compact ~56) — espejo de `RowActions`.
 *  - HYST_W / HYST_DENSITY_W: holgura de histéresis (banda muerta), px de layout.
 *
 * @param {Array<object>} columns         Columnas AntD enriquecidas con `minWidth`.
 * @param {number} containerWidth         Ancho del contenedor de la tabla (px).
 * @param {{ density?: string, hiddenKeys?: Set<string>|string[] }} [prev]
 *        Resultado anterior (para la banda de histéresis). Opcional.
 * @returns {{ visibleColumns: object[], hiddenColumns: object[], density: 'full'|'medium'|'compact' }}
 */
import { breakpoints } from '@ds/tokens/breakpoints';

/** Reservas de ancho de layout (px) — chrome de la tabla, no breakpoints. */
const SELECT_W = 48; // ancho de la columna de checkbox de selección
const EXPAND_W = 48; // ancho de la columna de toggle de expand
const ACTIONS_W = { full: 140, medium: 96, compact: 56 }; // espejo de RowActions

/**
 * Histéresis (px de layout, NO breakpoints): banda muerta para que ocultar y
 * re-mostrar NO ocurran en el mismo ancho. ~20px da una holgura perceptible sin
 * "pegar" la columna demasiado lejos de su umbral natural.
 */
const HYST_W = 20; // holgura extra exigida para RE-mostrar una columna oculta
const HYST_DENSITY_W = 16; // banda alrededor de los umbrales md/lg de densidad

/**
 * Densidad por ancho de contenedor reusando los umbrales de breakpoints.js, con
 * banda de histéresis respecto a la densidad previa: dentro de ±HYST_DENSITY_W de
 * un umbral, se conserva la densidad anterior para no saltar full↔medium↔compact.
 */
function densityFor(containerWidth, prevDensity) {
  const { md, lg } = breakpoints; // 768 / 1024
  // Sin estado previo: umbrales duros (comportamiento original).
  if (!prevDensity) {
    if (containerWidth >= lg) return 'full';
    if (containerWidth >= md) return 'medium';
    return 'compact';
  }
  // Con estado previo: si caemos dentro de la banda de un umbral, mantenemos la
  // densidad anterior (zona muerta), evitando el toggle en el borde.
  const inLgBand = containerWidth > lg - HYST_DENSITY_W && containerWidth < lg + HYST_DENSITY_W;
  const inMdBand = containerWidth > md - HYST_DENSITY_W && containerWidth < md + HYST_DENSITY_W;
  if (inLgBand || inMdBand) return prevDensity;
  if (containerWidth >= lg) return 'full';
  if (containerWidth >= md) return 'medium';
  return 'compact';
}

/** Normaliza `prev.hiddenKeys` a un Set de keys (acepta Set o array). */
function toKeySet(hiddenKeys) {
  if (!hiddenKeys) return null;
  return hiddenKeys instanceof Set ? hiddenKeys : new Set(hiddenKeys);
}

export function useResponsiveColumns(columns, containerWidth, prev) {
  // Primer render (sin medir): todo visible, density 'full' (evita parpadeo).
  if (!containerWidth) {
    return { visibleColumns: columns, hiddenColumns: [], density: 'full' };
  }

  const prevDensity = prev?.density;
  const prevHiddenKeys = toKeySet(prev?.hiddenKeys);

  const density = densityFor(containerWidth, prevDensity);
  const actionsW = ACTIONS_W[density];

  // Índices fijos: 1.ª columna de datos (0) y la de actions.
  const actionsIdx = columns.findIndex((c) => c.key === 'actions');
  const fixedIdx = new Set([0]);
  if (actionsIdx >= 0) fixedIdx.add(actionsIdx);

  // minWidth efectivo de una columna de datos.
  const widthOf = (col) => col.minWidth || 0;

  // Candidatas a ocultar: ocultables, de derecha a izquierda.
  const hideableRightToLeft = [];
  for (let i = columns.length - 1; i >= 0; i -= 1) {
    if (!fixedIdx.has(i)) hideableRightToLeft.push(i);
  }

  const hidden = new Set();

  // Ancho disponible para columnas de DATOS (descontando chrome fijo).
  // El expand solo reserva ancho si efectivamente habrá columnas ocultas; por
  // eso recalculamos disponible/uso en cada paso del bucle.
  const dataIndexes = columns
    .map((_, i) => i)
    .filter((i) => i !== actionsIdx);

  // Costo de ancho de una columna VISIBLE para el chequeo de cabida. A una
  // columna que estaba OCULTA en el resultado previo le cargamos `HYST_W` extra:
  // así, para volver a mostrarla, debe caber con esa holgura adicional (no
  // reaparece en el mismo ancho exacto en que se ocultó → sin parpadeo en el
  // borde). Una columna que ya era visible cuesta su minWidth real (umbral duro).
  const costOf = (i) => {
    const base = widthOf(columns[i]);
    const wasHidden = prevHiddenKeys?.has(columns[i].key);
    return wasHidden ? base + HYST_W : base;
  };

  const usedDataWidth = () =>
    dataIndexes.reduce((sum, i) => (hidden.has(i) ? sum : sum + costOf(i)), 0);

  const availableFor = (hasHidden) =>
    containerWidth - SELECT_W - actionsW - (hasHidden ? EXPAND_W : 0);

  // Oculta de derecha a izquierda mientras no quepa.
  for (const idx of hideableRightToLeft) {
    if (usedDataWidth() <= availableFor(hidden.size > 0)) break;
    hidden.add(idx);
  }
  // Re-chequeo: al aparecer la 1.ª oculta se reserva EXPAND_W, lo que puede
  // forzar una oculta más. Iterar hasta estabilizar.
  if (hidden.size > 0) {
    for (const idx of hideableRightToLeft) {
      if (usedDataWidth() <= availableFor(true)) break;
      hidden.add(idx);
    }
  }

  const visibleColumns = [];
  const hiddenColumns = [];
  columns.forEach((col, i) => {
    if (hidden.has(i)) hiddenColumns.push(col);
    else visibleColumns.push(col);
  });

  return { visibleColumns, hiddenColumns, density };
}

export default useResponsiveColumns;
