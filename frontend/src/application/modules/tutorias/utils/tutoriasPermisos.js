/**
 * Códigos de permiso del dominio Tutorías (TUT) — espejo del seed TUT
 * (`seed-permisos-tut.sql`, titulación + pasantías). Fuente única para rutas,
 * ActionButton, TableActions y PermisoGuard del módulo (misma acción en las
 * 3 capas, ver skill incos-rbac).
 *
 * Acciones por permiso (vocabulario v2):
 * - proyecto: LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR, APROBAR, EXPORTAR
 * - bitacora: LISTAR, CREAR, EDITAR
 * - avance:   LISTAR, DETALLE, CREAR
 * - alerta:   LISTAR, DETALLE
 * - sesion:   LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR
 * - panel:    LISTAR, EXPORTAR
 * - pasantia:            LISTAR, DETALLE, CREAR, EDITAR, ELIMINAR, APROBAR, EXPORTAR
 * - pasantiaEmpresa:     LISTAR, CREAR, EDITAR, ACTIVAR
 * - pasantiaInforme:     LISTAR, CREAR, EDITAR
 * - pasantiaSeguimiento: LISTAR, CREAR, EDITAR
 */
export const TUTORIAS_PERMISOS = {
  proyecto: 'tutorias.titulacion.proyecto',
  bitacora: 'tutorias.titulacion.bitacora',
  avance: 'tutorias.titulacion.avance',
  alerta: 'tutorias.acompanamiento.alerta',
  sesion: 'tutorias.acompanamiento.sesion',
  panel: 'tutorias.acompanamiento.panel',
  pasantia: 'tutorias.pasantia',
  pasantiaEmpresa: 'tutorias.pasantia.empresa',
  pasantiaInforme: 'tutorias.pasantia.informe',
  pasantiaSeguimiento: 'tutorias.pasantia.seguimiento',
};
