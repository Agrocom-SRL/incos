/**
 * Mapper: filas del API de Libros de registro → forma de UI.
 *
 * El backend ya entrega DTOs camelCase (`LibroRegistroPresentationMapper.js`);
 * este mapper solo hace normalización defensiva (arrays/números) y agrega
 * campos derivados de presentación (`libroLabel`, `folioLabel`, `cursoLabel`).
 * No transforma nombres de estudiante (ya llegan en orden APELLIDO_PATERNO
 * APELLIDO_MATERNO NOMBRES desde `buildFullName` del backend).
 */

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
  const curso = [folio.periodoNombre, folio.paraleloNombre ? `PARALELO ${folio.paraleloNombre}` : null]
    .filter(Boolean)
    .join(' - ');
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
  const curso = [paralelo.periodoNombre, paralelo.paraleloNombre ? `Paralelo ${paralelo.paraleloNombre}` : null]
    .filter(Boolean)
    .join(' - ');
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

export default {
  mapLibro,
  mapLibrosList,
  mapFolio,
  mapFoliosList,
  mapParaleloLibro,
  mapParalelosLibro,
  mapFolioEstudiante,
};
