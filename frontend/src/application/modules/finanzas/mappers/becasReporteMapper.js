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

/**
 * Normaliza un NODO del árbol jerárquico (carrera → periodo → paralelo) a un DTO
 * estable de UI, preservando la estructura `children` recursivamente.
 *
 * El backend ya entrega los niveles superiores AGREGADOS (suma de hijos) y el
 * orden resuelto, por lo que aquí solo se sanea cada nodo y se mapea su
 * descendencia con el MISMO criterio. `id` es único y estable → se usa como
 * `rowKey` de la tabla en árbol. La hoja (paralelo) no trae `children`: se omite
 * la clave para que AntD no pinte un caret de expansión vacío.
 */
const mapNodo = (nodo, porcentajes) => {
  if (!nodo) return null;
  const dto = {
    id: nodo.id ?? null,
    nivel: nodo.nivel ?? null,
    label: nodo.label ?? 'Sin nombre',
    carreraId: nodo.carreraId ?? null,
    carreraNombre: nodo.carreraNombre ?? null,
    carreraCodigo: nodo.carreraCodigo ?? null,
    periodoId: nodo.periodoId ?? null,
    periodoNumero: nodo.periodoNumero ?? null,
    periodoNombre: nodo.periodoNombre ?? null,
    paraleloId: nodo.paraleloId ?? null,
    paraleloNombre: nodo.paraleloNombre ?? null,
    paraleloTurno: nodo.paraleloTurno ?? null,
    totalMatriculados: toNumber(nodo.totalMatriculados),
    becasPorPorcentaje: mapBecasPorPorcentaje(porcentajes, nodo.becasPorPorcentaje),
    totalConBeca: toNumber(nodo.totalConBeca),
    porcentajeConBeca: toNumber(nodo.porcentajeConBeca),
    porcentajeCobertura: toNumber(nodo.porcentajeCobertura),
  };
  if (Array.isArray(nodo.children) && nodo.children.length > 0) {
    dto.children = nodo.children.map((hijo) => mapNodo(hijo, porcentajes)).filter(Boolean);
  }
  if (Array.isArray(nodo.estudiantes) && nodo.estudiantes.length > 0) {
    // El backend solo envía aquí estudiantes BECADOS (ver
    // `GetBecasPorCarreraReporteUseCase._addEstudiante`): no hace falta
    // filtrar ni marcar "tiene beca" en el frontend.
    dto.estudiantes = nodo.estudiantes.map((estudiante) => ({
      estudianteId: estudiante?.estudianteId ?? null,
      codigo: estudiante?.codigo ?? null,
      apellidoPaterno: estudiante?.apellidoPaterno ?? null,
      apellidoMaterno: estudiante?.apellidoMaterno ?? null,
      nombres: estudiante?.nombres ?? null,
      ci: estudiante?.ci ?? null,
      becaNombre: estudiante?.becaNombre ?? null,
      becaPorcentaje: toNumber(estudiante?.becaPorcentaje),
      montoDescuento: toNumber(estudiante?.montoDescuento),
      montoBase: toNumber(estudiante?.montoBase),
    }));
  }
  return dto;
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
      ? planilla.filas.map((nodo) => mapNodo(nodo, porcentajes)).filter(Boolean)
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
