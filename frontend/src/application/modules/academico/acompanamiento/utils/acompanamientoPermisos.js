/**
 * Códigos de permiso · Acompañamiento pedagógico (ítem de Académico, grupo_ui
 * `aca_acompanamiento`). Seed 59.
 *
 * Reclasificación 2026-07-31 (`tutorias.acompanamiento.*` → `academico.acompanamiento.*`):
 * alertas de riesgo, sesiones de refuerzo y panel se derivan de
 * `asignaciones_docentes`/centralizador — no tienen relación con proyectos de
 * grado, por lo que dejan de vivir bajo Titulación (TIT) y pasan al dominio
 * ACADÉMICO (ACA), igual que `academico/libros` o `academico/avance`.
 *
 * Acciones por permiso (vocabulario v2):
 * - alerta: LISTAR, DETALLE
 * - sesion: LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR
 * - panel:  LISTAR, EXPORTAR
 */
export const ACOMPANAMIENTO_PERMISOS = {
  alerta: 'academico.acompanamiento.alerta',
  sesion: 'academico.acompanamiento.sesion',
  panel: 'academico.acompanamiento.panel',
};

export default ACOMPANAMIENTO_PERMISOS;
