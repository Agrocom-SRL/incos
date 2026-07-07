import { createApiHook } from '@application/utils';
import { mapTiposEvaluacionList } from '@application-configuracion/recursos/mappers';

/**
 * dataKey='tiposEvaluacion' — debe coincidir con el `dataFieldName` fijado por
 * `ListTiposEvaluacionController` en el backend (contrato front↔back).
 *
 * NOTA: nombre del hook con sufijo `Admin` para distinguirlo de
 * `useTiposEvaluacion` (combo de solo lectura del cuaderno de calificaciones,
 * `academico/calificaciones/hooks/useTiposEvaluacion.js`, no se toca).
 */
export const useTiposEvaluacionAdminApi = createApiHook({
  name: 'useTiposEvaluacionAdminApi',
  useCase: 'obtenerTodosTiposEvaluacion',
  dataType: 'array',
  mapper: mapTiposEvaluacionList,
  initialLoading: false,
  autoFetch: true,
  autoFetchArgs: {},
  dataKey: 'tiposEvaluacion',
  errorMessage: 'Error al cargar los tipos de evaluación',
});
