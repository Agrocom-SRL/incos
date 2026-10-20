import { useMatriculaDetailFetch } from './useMatriculaDetailFetch';
import { useMatriculaDetailNavigation } from './useMatriculaDetailNavigation';
import { useMatriculaDetailBoleta } from './useMatriculaDetailBoleta';
import { useMatriculaDetailEntity } from './useMatriculaDetailEntity';
import { useMatriculaDetailSchedules } from './useMatriculaDetailSchedules';
import { useMatriculaDetailActivation } from './useMatriculaDetailActivation';

/**
 * Orquestador: ficha de matrícula por ID.
 */
export const useMatriculaDetail = (matriculaIdRaw) => {
  const fetch = useMatriculaDetailFetch(matriculaIdRaw);
  const navigation = useMatriculaDetailNavigation(fetch.inscripcionId, fetch.inscripcion);
  const boleta = useMatriculaDetailBoleta(fetch.inscripcion);
  const entity = useMatriculaDetailEntity(fetch.inscripcion);
  const schedules = useMatriculaDetailSchedules(entity.subjectEnrollments, entity.career);
  const activation = useMatriculaDetailActivation({
    inscripcionId: fetch.inscripcionId,
    subjectEnrollments: entity.subjectEnrollments,
    refetch: fetch.refetch,
  });

  return {
    ...fetch,
    ...navigation,
    ...boleta,
    ...entity,
    ...schedules,
    ...activation,
  };
};

/** Alias de consistencia para el Provider de detalle. */
export const useMatriculaDetailPage = (matriculaIdRaw) => useMatriculaDetail(matriculaIdRaw);
