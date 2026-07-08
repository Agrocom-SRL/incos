import { createApiHook } from '@application/utils';
import { mapTiposEvaluacionList } from '@application-configuracion/recursos/mappers';

/**
 * dataKey='tiposEvaluacion' — debe coincidir con el `dataFieldName` fijado por
 * `ListTiposEvaluacionController` en el backend (contrato front↔back).
 *
 * `incluirInactivos=true` SOLO en este listado de configuración (administra el
 * catálogo completo, con toggle de estado). El combo del cuaderno consume el
 * endpoint de calificaciones sin ese parámetro y sigue viendo solo activos.
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
  autoFetchArgs: { params: { incluirInactivos: true } },
  dataKey: 'tiposEvaluacion',
  errorMessage: 'Error al cargar los tipos de evaluación',
});
