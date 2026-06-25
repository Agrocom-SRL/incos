/**
 * Constantes institucionales del documento "Centralizador de calificaciones".
 *
 * Son metadatos de la cabecera del documento oficial que NO viven en el sistema
 * (no hay tabla/endpoint que los provea). Se centralizan aquí en vez de
 * incrustarlos en el JSX para que sean parametrizables el día que el instituto
 * los gestione desde Configuración.
 *
 * LIBRO N° / FOLIO N° del documento oficial NO existen en el sistema: se omiten
 * deliberadamente (no se inventan valores).
 */

export const CENTRALIZADOR_DOC = {
  /** Razón social del instituto (parametrizable a futuro desde Configuración). */
  institucion: 'Instituto Técnico INCOS Santa Cruz',
  /** Nivel de formación (parametrizable). */
  nivel: 'Técnico Superior',
  /** Régimen académico — el grano del sistema es anual. */
  regimen: 'Anual',
  /** Resolución Ministerial de habilitación (parametrizable). */
  resolucionMinisterial: '0426/2016',
};

export default CENTRALIZADOR_DOC;
