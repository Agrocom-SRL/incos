/**
 * Rutas del módulo Libros de registro (ítem Académico · ACA-LIBROS).
 *
 * Flujo de 3 niveles: P1 listado de libros → P2 ficha del libro (folios) →
 * P3 preview del folio (réplica en pantalla del documento físico).
 */

export const LIBROS_LIST_PATH = '/academico/libros';

/** P2 — ficha del libro (cabecera + tabla de folios). */
export const libroDetallePath = (id) => `${LIBROS_LIST_PATH}/${id}`;

/** P3 — preview/impresión del folio elegido. */
export const folioPreviewPath = (id, folioId) => `${LIBROS_LIST_PATH}/${id}/folios/${folioId}`;
