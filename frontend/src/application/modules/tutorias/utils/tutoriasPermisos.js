/**
 * Códigos de permiso del dominio Tutorías (TUT) — espejo del seed 66
 * (`66-seed-permisos-tut.sql`). Fuente única para rutas, ActionButton,
 * TableActions y PermisoGuard del módulo (misma acción en las 3 capas,
 * ver skill incos-rbac).
 *
 * Acciones por permiso (vocabulario v2):
 * - proyecto: LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR, APROBAR, EXPORTAR
 * - bitacora: LISTAR, CREAR, EDITAR
 * - avance:   LISTAR, DETALLE, CREAR
 * - alerta:   LISTAR, DETALLE
 * - sesion:   LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR
 * - panel:    LISTAR, EXPORTAR
 */
export const TUTORIAS_PERMISOS = {
  proyecto: 'tutorias.titulacion.proyecto',
  bitacora: 'tutorias.titulacion.bitacora',
  avance: 'tutorias.titulacion.avance',
  alerta: 'tutorias.acompanamiento.alerta',
  sesion: 'tutorias.acompanamiento.sesion',
  panel: 'tutorias.acompanamiento.panel',
};
