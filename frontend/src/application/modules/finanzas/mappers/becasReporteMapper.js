/**
 * Mapper: respuesta del reporte de becas por carrera → DTO de UI estable
 * (módulo Finanzas · reporte read-only).
 *
 * El backend entrega el objeto bajo `data.planillaBecas` (dataFieldName ==
 * dataKey 'planillaBecas'). Este mapper normaliza esa estructura a una forma
 * estable para la pantalla, SIN hardcodear los tipos de beca: las columnas y
 * la distribución se derivan SIEMPRE de `porcentajes` (p. ej. [25,50,75,100]),
 * de modo que si el instituto cambia los tramos, la UI los sigue.
 */

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

/** Clave de columna dinámica por porcentaje de beca (estable para la tabla). */
export const becaPorcentajeKey = (porcentaje) => `beca_${toNumber(porcentaje)}`;

/** Etiqueta visible de un tramo de beca (p. ej. "Beca 25%"). */
export const becaPorcentajeLabel = (porcentaje) => `Beca ${toNumber(porcentaje)}%`;

/**
 * Normaliza el mapa `{ '25': n, '50': n, ... }` a una clave estable por
 * porcentaje (`beca_25`, `beca_50`, ...) tolerando claves numéricas o string.
 */
const mapBecasPorPorcentaje = (porcentajes, becasPorPorcentaje = {}) => {
  const out = {};
  porcentajes.forEach((porcentaje) => {
    const raw =
      becasPorPorcentaje?.[String(porcentaje)] ?? becasPorPorcentaje?.[porcentaje] ?? 0;
    out[becaPorcentajeKey(porcentaje)] = toNumber(raw);
  });
  return out;
};

const mapFila = (fila, porcentajes) => {
  if (!fila) return null;
  return {
    carreraId: fila.carreraId ?? null,
    carreraNombre: fila.carreraNombre ?? 'Sin nombre',
    carreraCodigo: fila.carreraCodigo ?? null,
    modalidad: fila.modalidad ?? null,
    totalMatriculados: toNumber(fila.totalMatriculados),
    becasPorPorcentaje: mapBecasPorPorcentaje(porcentajes, fila.becasPorPorcentaje),
    totalConBeca: toNumber(fila.totalConBeca),
    porcentajeConBeca: toNumber(fila.porcentajeConBeca),
    porcentajeCobertura: toNumber(fila.porcentajeCobertura),
  };
};

const mapDistribucion = (distribucion) => {
  if (!Array.isArray(distribucion)) return [];
  return distribucion.map((item) => ({
    porcentaje: toNumber(item?.porcentaje),
    etiqueta: item?.etiqueta ?? becaPorcentajeLabel(item?.porcentaje),
    beneficiados: toNumber(item?.beneficiados),
    porcentajeDelTotalConBeca: toNumber(item?.porcentajeDelTotalConBeca),
  }));
};

/** Cobertura del catálogo: TODOS los tramos (usados o no) con sus tipos. */
const mapCatalogo = (catalogo) => {
  if (!Array.isArray(catalogo)) return [];
  return catalogo.map((item) => ({
    porcentaje: toNumber(item?.porcentaje),
    etiqueta: item?.etiqueta ?? becaPorcentajeLabel(item?.porcentaje),
    tipos: toNumber(item?.tipos),
    beneficiados: toNumber(item?.beneficiados),
    usado: Boolean(item?.usado),
    porcentajeDelTotalConBeca: toNumber(item?.porcentajeDelTotalConBeca),
  }));
};

/**
 * @param {Object|null} planilla - `data.planillaBecas` crudo del backend.
 * @returns {Object|null} DTO de UI o null si no hay datos.
 */
export const mapBecasReporte = (planilla) => {
  if (!planilla) return null;

  const porcentajes = Array.isArray(planilla.porcentajes)
    ? planilla.porcentajes.map(toNumber)
    : [];

  const gestionRaw = planilla.gestion || {};
  const totalesRaw = planilla.totales || {};
  const resumenRaw = planilla.resumen || {};

  return {
    gestion: {
      id: gestionRaw.id ?? null,
      nombre: gestionRaw.nombre ?? null,
      anio: gestionRaw.anio ?? null,
    },
    porcentajes,
    filas: Array.isArray(planilla.filas)
      ? planilla.filas.map((fila) => mapFila(fila, porcentajes)).filter(Boolean)
      : [],
    totales: {
      totalMatriculados: toNumber(totalesRaw.totalMatriculados),
      becasPorPorcentaje: mapBecasPorPorcentaje(porcentajes, totalesRaw.becasPorPorcentaje),
      totalConBeca: toNumber(totalesRaw.totalConBeca),
      porcentajeConBeca: toNumber(totalesRaw.porcentajeConBeca),
    },
    distribucion: mapDistribucion(planilla.distribucion),
    resumen: {
      totalMatriculados: toNumber(resumenRaw.totalMatriculados),
      totalConBeca: toNumber(resumenRaw.totalConBeca),
      porcentajeConBeca: toNumber(resumenRaw.porcentajeConBeca),
      porcentajeSinBeca: toNumber(resumenRaw.porcentajeSinBeca),
    },
    catalogo: mapCatalogo(planilla.catalogo),
    catalogoResumen: {
      totalTipos: toNumber(planilla.catalogoResumen?.totalTipos),
      tramosTotales: toNumber(planilla.catalogoResumen?.tramosTotales),
      tramosUsados: toNumber(planilla.catalogoResumen?.tramosUsados),
    },
  };
};

export default mapBecasReporte;
