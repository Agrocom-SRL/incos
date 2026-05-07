import { useMemo } from 'react';
import { useAuthContext } from '@application-auth';

/**
 * Permisos para la oferta de cursos del paralelo:
 * - Rol con `institucional.gestion.horarios` (65): CRUD de oferta desde Armado (tab gestión).
 * - Rol con `institucional.horario.plantilla` (97): misma capacidad si el catálogo incluye CREAR/EDITAR/ELIMINAR (seed F).
 */
export const useHorariosOfertaPermisos = () => {
    const { hasPermiso } = useAuthContext();

    return useMemo(
        () => ({
            canCrear:
                hasPermiso('institucional.gestion.horarios', 'CREAR') ||
                hasPermiso('institucional.horario.plantilla', 'CREAR'),
            canEditar:
                hasPermiso('institucional.gestion.horarios', 'EDITAR') ||
                hasPermiso('institucional.horario.plantilla', 'EDITAR'),
            canEliminar:
                hasPermiso('institucional.gestion.horarios', 'ELIMINAR') ||
                hasPermiso('institucional.horario.plantilla', 'ELIMINAR'),
            canListarGestionParalelo: hasPermiso('institucional.gestion.horarios', 'LISTAR'),
        }),
        [hasPermiso],
    );
};
