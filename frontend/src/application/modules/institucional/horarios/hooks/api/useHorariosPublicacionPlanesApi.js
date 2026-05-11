import { createApiHook } from '@application/utils';

export const useHorariosPublicacionPlanesApi = createApiHook({
    name: 'useHorariosPublicacionPlanesApi',
    useCase: 'obtenerHorariosPublicacionPlanes',
    dataType: 'object',
    initialLoading: false,
    autoFetch: false,
    dataKey: 'data',
    errorMessage: 'Error al cargar planes de publicación',
});
