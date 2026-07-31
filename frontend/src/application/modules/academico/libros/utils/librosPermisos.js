/**
 * Código de permiso del módulo Libros de registro (seed 59, `academico.libro`).
 *
 * Una sola acción por permiso (LISTAR/DETALLE/CREAR/EDITAR/APROBAR/EXPORTAR):
 * RECTOR y DIR_ACADEMICO tienen las 6; SEC_ACADEMICA prepara el libro pero no
 * firma (sin APROBAR); DOCENTE/ESTUDIANTE no tienen acceso.
 */

export const LIBROS_PERMISOS = {
  libro: 'academico.libro',
};

export default LIBROS_PERMISOS;
