import { createApiHook } from '@application/utils';
import { mapDocumentacionList } from '@application-configuracion/documentacion/mappers';

/**
 * dataKey='documentacion' — debe coincidir con el `dataFieldName` fijado por
 * `ListDocumentacionUseCase` en el backend (contrato front↔back).
 *
 * `autoFetch` deshabilitado a propósito: el `tipoDocumento` es dinámico según
 * la pantalla (inscripción/becas/pasantías/traslado), así que el fetch inicial
 * lo dispara `useDocumentacionList(tipoDocumento)` con el filtro correcto.
 */
export const useDocumentacionApi = createApiHook({
  name: 'useDocumentacionApi',
  useCase: 'obtenerTodaDocumentacion',
  dataType: 'array',
  mapper: mapDocumentacionList,
  initialLoading: true,
  autoFetch: false,
  dataKey: 'documentacion',
  errorMessage: 'Error al cargar la documentación',
});
