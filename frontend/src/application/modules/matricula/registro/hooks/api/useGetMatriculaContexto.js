/**
 * Hook: useGetMatriculaContexto
 *
 * Contexto de matrícula del wizard de inscripción
 * (GET /v1/inscripciones/contexto-matricula). Sustituye la fricción histórica
 * del wizard (GET /materias + derivación de periodos desde paralelos): un solo
 * fetch entrega estudiante, gestión vigente, planes habilitados, plan resuelto
 * y periodos con asignaturas (prerrequisito + estadoHistorial incluidos).
 *
 * dataKey 'contexto' == dataFieldName 'contexto' del backend (contrato §3-A3
 * de docs/plan/matricula-wizard-rediseno.md).
 */

import { createApiHook } from '@application/utils';

export const useGetMatriculaContexto = createApiHook({
  name: 'useGetMatriculaContexto',
  useCase: 'obtenerContextoMatricula',
  dataType: 'object',
  initialLoading: false,
  validate: (params) => {
    if (!params?.estudianteId) {
      return 'ID del estudiante es requerido';
    }
    return null;
  },
  errorMessage: 'Error al cargar el contexto de matrícula',
  dataKey: 'contexto',
  fetchName: 'getMatriculaContexto',
});
