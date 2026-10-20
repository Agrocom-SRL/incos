/**
 * Mapper: filas del API de Libros de registro → forma de UI.
 *
 * El backend ya entrega DTOs camelCase (`LibroRegistroPresentationMapper.js`);
 * este mapper solo hace normalización defensiva (arrays/números) y agrega
 * campos derivados de presentación (`libroLabel`, `folioLabel`, `cursoLabel`).
 * No transforma nombres de estudiante (ya llegan en orden APELLIDO_PATERNO
 * APELLIDO_MATERNO NOMBRES desde `buildFullName` del backend).
 *
 * `cursoLabel` replica EXACTAMENTE el criterio de formato del documento
 * oficial ya resuelto en el backend
 * (`backend/src/application/utils/libroFolioExcelDatos.js`): "TERCERO -
 * PARALELO A" (ordinal del periodo + solo la letra del paralelo), NO "PRIMER
 * AÑO - PARALELO PRIMERO A" (defecto detectado contra el libro físico real —
 * `periodoNombre` trae "Primer Año" y `paraleloNombre` ya trae el ordinal
 * repetido, p. ej. "TERCERO A").
 */

/** Ordinal institucional del periodo (1..N → PRIMERO/SEGUNDO/TERCERO/...). */
const ORDINAL_PERIODO = ['', 'PRIMERO', 'SEGUNDO', 'TERCERO', 'CUARTO', 'QUINTO', 'SEXTO'];

/**
 * Ordinal del periodo del CURSO oficial. Con `periodoNumero` fuera del
 * catálogo (o ausente), deriva del nombre quitando el sufijo " Año"/" AÑO"
 * (compatibilidad; no debería ocurrir con datos reales).
 * @param {number|string|null} periodoNumero
 * @param {string|null} [periodoNombre]
 * @returns {string}
 */
export function formatOrdinalPeriodo(periodoNumero, periodoNombre = null) {
  const n = Number(periodoNumero);
  if (Number.isFinite(n) && n >= 1 && n < ORDINAL_PERIODO.length) return ORDINAL_PERIODO[n];
  return String(periodoNombre ?? '')
    .toUpperCase()
    .replace(/\s+A[ÑN]O$/, '')
    .trim();
}

/** Solo la LETRA del paralelo ("TERCERO A" → "A"): último token del nombre. */
export function formatLetraParalelo(paraleloNombre) {
  const partes = String(paraleloNombre ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return partes.length > 0 ? partes[partes.length - 1].toUpperCase() : '';
}

/**
 * CURSO del documento oficial: "TERCERO - PARALELO A".
 * @param {{periodoNumero, periodoNombre, paraleloNombre}} params
 * @returns {string}
 */
export function formatCursoLibro({ periodoNumero, periodoNombre, paraleloNombre }) {
  const ordinal = formatOrdinalPeriodo(periodoNumero, periodoNombre);
  const letra = formatLetraParalelo(paraleloNombre);
  return `${ordinal} - PARALELO ${letra}`.trim();
}

/** @param {Object} libro - DTO de `toLibroDTO` (vista 175). */
export const mapLibro = (libro) => {
  if (!libro) return null;
  return {
    ...libro,
    libroLabel: libro.numeroLibro != null ? `LIBRO N° ${libro.numeroLibro}` : 'Libro de registro',
    folios: Array.isArray(libro.folios) ? libro.folios.map(mapFolio) : undefined,
  };
};

/** @param {Array<Object>} libros */
export const mapLibrosList = (libros) => (Array.isArray(libros) ? libros.map(mapLibro) : []);

/** @param {Object} folio - DTO de `toFolioDTO` (vista 176). */
export function mapFolio(folio) {
  if (!folio) return null;
  const curso = formatCursoLibro({
    periodoNumero: folio.periodoNumero,
    periodoNombre: folio.periodoNombre,
    paraleloNombre: folio.paraleloNombre,
  });
  return {
    ...folio,
    folioLabel: folio.numeroFolio != null ? `FOLIO N° ${folio.numeroFolio}` : 'Folio',
    cursoLabel: curso || '—',
    asignaturas: Array.isArray(folio.asignaturas) ? folio.asignaturas : undefined,
    estudiantes: Array.isArray(folio.estudiantes) ? folio.estudiantes.map(mapFolioEstudiante) : undefined,
  };
}

/** @param {Array<Object>} folios */
export const mapFoliosList = (folios) => (Array.isArray(folios) ? folios.map(mapFolio) : []);

/** @param {Object} paralelo - DTO de `toParaleloLibroDTO`. */
export const mapParaleloLibro = (paralelo) => {
  if (!paralelo) return null;
  const curso = formatCursoLibro({
    periodoNumero: paralelo.periodoNumero,
    periodoNombre: paralelo.periodoNombre,
    paraleloNombre: paralelo.paraleloNombre,
  });
  return { ...paralelo, cursoLabel: curso || '—' };
};

/** @param {Array<Object>} paralelos */
export const mapParalelosLibro = (paralelos) =>
  Array.isArray(paralelos) ? paralelos.map(mapParaleloLibro) : [];

/** @param {Object} fila - DTO de `toFolioEstudianteDTO` (+ `celdas` en el detalle del folio). */
export function mapFolioEstudiante(fila) {
  if (!fila) return null;
  return {
    ...fila,
    celdas: fila.celdas && typeof fila.celdas === 'object' ? fila.celdas : {},
  };
}

/**
 * Rango de apellidos de un folio con pendientes: "AÑEZ – CASTRO" (o solo
 * "AÑEZ" si la página tiene un único pendiente / ambos coinciden).
 * @param {{ apellidoDesde?: string, apellidoHasta?: string }} folio
 * @returns {string}
 */
export function formatRangoApellidosFolio({ apellidoDesde, apellidoHasta } = {}) {
  const desde = String(apellidoDesde ?? '').trim();
  const hasta = String(apellidoHasta ?? '').trim();
  if (!desde && !hasta) return '';
  if (!desde || !hasta || desde === hasta) return desde || hasta;
  return `${desde} – ${hasta}`;
}

/**
 * `details` del 409 CONFLICT al cerrar un libro con notas pendientes
 * (`EditarLibroUseCase._prepararCierre`) → forma de UI del modal
 * `CerrarLibroPendientesModal`: normaliza arrays/números y agrega, por
 * paralelo, `cursoLabel` (mismo criterio del documento oficial) y, por folio,
 * `label` ("Folio 12") y `rangoLabel` ("AÑEZ – CASTRO"). Devuelve null si la
 * respuesta no trae el desglose.
 * @param {Object|null} details - { pendientes: { total, totalParalelos,
 *   paralelos[]: { ..., folios[]: { numeroFolio, totalEstudiantes,
 *   apellidoDesde, apellidoHasta } } }, desactualizadas: { total } }
 */
export function mapCierrePendientes(details) {
  const pendientes = details?.pendientes;
  if (!pendientes || !Array.isArray(pendientes.paralelos)) return null;

  const paralelos = pendientes.paralelos.map((paralelo) => {
    const curso = formatCursoLibro({
      periodoNumero: paralelo.periodoNumero,
      periodoNombre: paralelo.periodoNombre,
      paraleloNombre: paralelo.paraleloNombre,
    });
    const folios = (Array.isArray(paralelo.folios) ? paralelo.folios : []).map((folio) => ({
      ...folio,
      totalEstudiantes: Number(folio.totalEstudiantes ?? 0),
      label: folio.numeroFolio != null ? `Folio ${folio.numeroFolio}` : 'Folio',
      rangoLabel: formatRangoApellidosFolio(folio),
    }));

    return {
      ...paralelo,
      cursoLabel: curso || '—',
      totalEstudiantes: Number(paralelo.totalEstudiantes ?? 0),
      folios,
    };
  });

  return {
    total: Number(pendientes.total ?? 0),
    totalParalelos: Number(pendientes.totalParalelos ?? paralelos.length),
    paralelos,
    desactualizadas: Number(details?.desactualizadas?.total ?? 0),
  };
}

export default {
  formatOrdinalPeriodo,
  formatLetraParalelo,
  formatCursoLibro,
  mapLibro,
  mapLibrosList,
  mapFolio,
  mapFoliosList,
  mapParaleloLibro,
  mapParalelosLibro,
  mapFolioEstudiante,
  formatRangoApellidosFolio,
  mapCierrePendientes,
};
