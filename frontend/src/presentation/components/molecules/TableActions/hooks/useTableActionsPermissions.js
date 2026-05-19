import { useMemo } from 'react';
import { useAuthContext } from '@application-auth';
import { cumplePermisoRef } from '../utils/cumplePermisoRef';

/**
 * Permisos por acción y filtrado de acciones extra según permiso.
 */
export function useTableActionsPermissions({ permisos, extraActions = [] }) {
  const { hasPermiso } = useAuthContext();

  const puedeVer = cumplePermisoRef(permisos?.ver, hasPermiso);
  const puedeEditar = cumplePermisoRef(permisos?.editar, hasPermiso);
  const puedeEliminar = cumplePermisoRef(permisos?.eliminar, hasPermiso);

  const extraActionsPermitidas = useMemo(
    () =>
      extraActions.filter((action) => {
        if (!action?.permiso) return true;
        return hasPermiso(action.permiso, action.accion || 'LISTAR');
      }),
    [extraActions, hasPermiso],
  );

  return {
    puedeVer,
    puedeEditar,
    puedeEliminar,
    extraActionsPermitidas,
  };
}
