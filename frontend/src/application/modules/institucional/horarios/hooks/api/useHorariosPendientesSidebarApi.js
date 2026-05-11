import { createApiHook } from '@application/utils';

export const useHorariosPendientesSidebarApi = createApiHook({
    name: 'useHorariosPendientesSidebarApi',
    useCase: 'obtenerHorariosPendientesSidebar',
    dataType: 'object',
    initialLoading: true,
    autoFetch: true,
    autoFetchArgs: {},
    dataKey: 'data',
    errorMessage: 'Error al cargar pendientes de horarios',
});
