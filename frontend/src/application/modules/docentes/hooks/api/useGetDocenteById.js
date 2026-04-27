/**
 * GET detalle docente por ID (caso de uso + API).
 */

import { createApiHook } from '@application/utils';
import { mapDocenteDetailFromApi } from '@application-docentes/mappers';

export const useGetDocenteById = createApiHook({
  name: 'useGetDocenteById',
  useCase: 'obtenerDocentePorId',
  dataType: 'object',
  initialLoading: false,
  validate: (docenteId) => {
    if (docenteId == null || docenteId === '') {
      return 'ID del docente es requerido';
    }
    return null;
  },
  errorMessage: 'Error al cargar el docente',
  dataKey: 'docente',
  fetchName: 'getDocenteById',
  mapper: mapDocenteDetailFromApi,
});
