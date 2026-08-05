/**
 * Etiquetas y clase de pill (`cfg-materia-pill--*`, tokens del design system) por
 * estado de libro/folio/fila. Mismo enfoque que `licenciaPills.js`: StatusPill +
 * clase CSS ya existente (sin inventar colores nuevos).
 *
 * Espejo de `backend/src/domain/constants/libros.constants.js`
 * (ESTADOS_LIBRO, ESTADOS_FOLIO, ESTADOS_ACADEMICOS_FOLIO).
 */

const LIBRO_ESTADO_LABELS = {
  ABIERTO: 'Abierto',
  CERRADO: 'Cerrado',
};

const LIBRO_ESTADO_PILL = {
  ABIERTO: 'cfg-materia-pill cfg-materia-pill--success',
  CERRADO: 'cfg-materia-pill cfg-materia-pill--default',
};

const FOLIO_ESTADO_LABELS = {
  BORRADOR: 'Borrador',
  ANULADO: 'Anulado',
};

const FOLIO_ESTADO_PILL = {
  BORRADOR: 'cfg-materia-pill cfg-materia-pill--default',
  ANULADO: 'cfg-materia-pill cfg-materia-pill--danger',
};

const ACADEMICO_ESTADO_LABELS = {
  APROBADO: 'Aprobado',
  REPROBADO: 'Reprobado',
  ABANDONO: 'Abandono',
};

const ACADEMICO_ESTADO_PILL = {
  APROBADO: 'cfg-materia-pill cfg-materia-pill--success',
  REPROBADO: 'cfg-materia-pill cfg-materia-pill--danger',
  ABANDONO: 'cfg-materia-pill cfg-materia-pill--warning',
};

/** Etiqueta legible del estado del libro (ABIERTO/CERRADO). */
export const formatLibroEstado = (estado) => LIBRO_ESTADO_LABELS[estado] ?? estado ?? '—';
/** Clase de pill del estado del libro. */
export const getLibroEstadoPillClass = (estado) =>
  LIBRO_ESTADO_PILL[estado] ?? 'cfg-materia-pill cfg-materia-pill--default';

/** Etiqueta legible del estado del folio (BORRADOR/ANULADO). */
export const formatFolioEstado = (estado) => FOLIO_ESTADO_LABELS[estado] ?? estado ?? '—';
/** Clase de pill del estado del folio. */
export const getFolioEstadoPillClass = (estado) =>
  FOLIO_ESTADO_PILL[estado] ?? 'cfg-materia-pill cfg-materia-pill--default';

/** Etiqueta legible del estado académico de la fila (APROBADO/REPROBADO/ABANDONO). */
export const formatEstadoAcademico = (estado) => ACADEMICO_ESTADO_LABELS[estado] ?? estado ?? '—';
/** Clase de pill del estado académico de la fila. */
export const getEstadoAcademicoPillClass = (estado) =>
  ACADEMICO_ESTADO_PILL[estado] ?? 'cfg-materia-pill cfg-materia-pill--default';
