import { useAuthContext } from '@application-auth';

/**
 * Hook que retorna qué acciones tiene el usuario sobre un permiso.
 *
 * Uso:
 *   const acciones = useAcciones('matricula.admision.ver');
 *   acciones.puedeVer        -> true/false
 *   acciones.puedeCrear      -> true/false
 *   acciones.puedeEditar     -> true/false
 *   acciones.puedeEliminar   -> true/false
 *   acciones.puedeAprobar    -> true/false
 *   acciones.puedeExportar   -> true/false
 *   acciones.tiene('CREAR')  -> true/false
 */
export function useAcciones(codigoPermiso) {
  const { hasPermiso } = useAuthContext();

  return {
    puedeVer: hasPermiso(codigoPermiso, 'VER'),
    puedeCrear: hasPermiso(codigoPermiso, 'CREAR'),
    puedeEditar: hasPermiso(codigoPermiso, 'EDITAR'),
    puedeEliminar: hasPermiso(codigoPermiso, 'ELIMINAR'),
    puedeAprobar: hasPermiso(codigoPermiso, 'APROBAR'),
    puedeExportar: hasPermiso(codigoPermiso, 'EXPORTAR'),
    tiene: (accion) => hasPermiso(codigoPermiso, accion),
  };
}
