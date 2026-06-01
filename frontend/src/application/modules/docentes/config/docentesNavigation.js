/**
 * Estado de navegación compartido para listado y acciones de docentes.
 */

export const docentesListNavigationState = (returnListPath = '/docentes/listar') => ({
  menuSidebarKey: 'DOC-LIST',
  returnListPath,
});
