/**
 * Hook: useSearchStudentsForInscripcion
 *
 * Búsqueda de estudiantes para el wizard de Inscripción nueva
 * (GET /v1/estudiantes/buscar-para-inscripcion). Gemelo de useSearchStudent,
 * pero NO excluye a los ya matriculados en la gestión vigente: cada resultado
 * trae yaMatriculadoGestionActual para que la UI avise y bloquee la selección.
 */

import { createApiHook } from '@application/utils';
import { mapEstudiantesBusquedaInscripcion } from '@application-matricula/admision/mappers';

export const useSearchStudentsForInscripcion = createApiHook({
  name: 'useSearchStudentsForInscripcion',
  useCase: 'buscarEstudiantesParaInscripcion',
  dataType: 'array',
  mapper: mapEstudiantesBusquedaInscripcion,
  initialLoading: false,
  autoFetch: false,
  dataKey: 'students',
  fetchName: 'searchStudent',
  errorMessage: 'Error al buscar estudiantes',
});
