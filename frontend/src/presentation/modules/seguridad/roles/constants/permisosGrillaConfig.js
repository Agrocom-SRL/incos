/**
 * Catálogo de columnas/capas de la grilla de permisos (filas = `grupos_ui`, columnas =
 * capas Acceso/Operaciones/Flujos). Compartido por `PermisosDominioPicker` (grilla de un
 * ROL, en `roles/`) y `AccesosUsuarioDominioPicker` (grilla de accesos de un USUARIO, en
 * `usuarios/`, con celda de 3 vías) — única fuente, sin duplicar el catálogo.
 *
 * Vive en un archivo aparte (no en el componente) porque exportar constantes junto a un
 * componente rompe el fast refresh de Vite (`react-refresh/only-export-components`).
 */

/** Orden de columnas: capa Acceso (1) + Operaciones (5) + Flujos (3) */
export const ACCIONES_GRILLA = [
  { key: 'LISTAR', header: 'LISTAR', capa: 'acceso' },
  { key: 'DETALLE', header: 'DETALLE', capa: 'ops' },
  { key: 'CREAR', header: 'CREAR', capa: 'ops' },
  { key: 'EDITAR', header: 'EDITAR', capa: 'ops' },
  { key: 'ELIMINAR', header: 'ELIMINAR', capa: 'ops' },
  { key: 'ACTIVAR', header: 'ACTIVAR', capa: 'ops' },
  { key: 'APROBAR', header: 'APROBAR', capa: 'flujos' },
  { key: 'EXPORTAR', header: 'EXPORTAR', capa: 'flujos' },
  { key: 'GENERAR_PDF', header: 'PDF', capa: 'flujos' },
];

export const ACCION_AYUDA = {
  LISTAR: 'Ver listados y buscar; no implica abrir ficha ni modificar datos.',
  DETALLE: 'Abrir ficha o detalle de un registro concreto.',
  CREAR: 'Crear registros nuevos (alta). No cubre modificar algo que ya existe.',
  EDITAR:
    'Guardar cambios sobre registros ya existentes (incluye el “Guardar” del formulario de edición). No es lo mismo que CREAR.',
  ELIMINAR: 'Borrar o anular registros según las reglas del módulo.',
  ACTIVAR: 'Activar o rehabilitar registros cuando el flujo lo permita.',
  APROBAR: 'Aprobar o rechazar solicitudes en flujos con validación.',
  EXPORTAR: 'Descargar reportes o exportaciones (p. ej. Excel) según el módulo.',
  GENERAR_PDF: 'Generar documentos PDF según el módulo.',
};

/** Cabecera de cada capa: tinte semántico desde tokens del tema (sin CSS propio). */
export const CAPA_HEADER_STYLE = {
  acceso: { background: 'var(--color-info-bg)', color: 'var(--color-info-text)' },
  ops: { background: 'var(--color-success-bg)', color: 'var(--color-success-text)' },
  flujos: { background: 'var(--color-warning-bg)', color: 'var(--color-warning-text)' },
};

/**
 * Nombre amigable del grupo: viene del backend (`grupo.grupoNombre`), tabla `grupos_ui`
 * (fuente única; sembrada por módulo). Fallback al código `grupoUi` si faltara la fila.
 */
export function labelGrupoUi(grupo) {
  return grupo?.grupoNombre || String(grupo?.grupoUi || '');
}
