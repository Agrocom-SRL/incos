/**
 * Códigos de permiso del dominio Titulación (TIT) — espejo del seed 65
 * (`65-seed-permisos-tit.sql`, proyectos de grado + pasantías). Fuente única
 * para rutas, ActionButton, TableActions y PermisoGuard del módulo (misma
 * acción en las 3 capas, ver skill incos-rbac).
 *
 * Rename 2026-07-31 (`tutorias` → `titulacion`): los permisos de
 * acompañamiento (`academico.acompanamiento.*`) se reclasificaron al dominio
 * ACADÉMICO — ver `application/modules/academico/acompanamiento/utils/acompanamientoPermisos.js`.
 *
 * Acciones por permiso (vocabulario v2):
 * - proyecto: LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR, APROBAR, EXPORTAR
 * - bitacora: LISTAR, CREAR, EDITAR
 * - avance:   LISTAR, DETALLE, CREAR
 * - pasantia:            LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR, APROBAR, EXPORTAR
 * - pasantiaEmpresa:     LISTAR, CREAR, EDITAR, ACTIVAR
 * - pasantiaInforme:     LISTAR, CREAR, EDITAR
 * - pasantiaSeguimiento: LISTAR, CREAR, EDITAR
 */
export const TITULACION_PERMISOS = {
  proyecto: 'titulacion.proyecto',
  bitacora: 'titulacion.bitacora',
  avance: 'titulacion.avance',
  pasantia: 'titulacion.pasantia',
  pasantiaEmpresa: 'titulacion.pasantia.empresa',
  pasantiaInforme: 'titulacion.pasantia.informe',
  pasantiaSeguimiento: 'titulacion.pasantia.seguimiento',
};
