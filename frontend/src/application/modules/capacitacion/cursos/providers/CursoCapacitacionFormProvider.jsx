/**
 * Provider: alta/edición de un curso de capacitación (CAP).
 *
 * Provider DELGADO: ensambla la ficha (solo en modo edición, para precargar
 * horarioIds), las mutaciones y el catálogo de aulas (picker opcional, con
 * degradación si el rol no tiene el permiso institucional del catálogo).
 * La orquestación del formulario vive en `useCursoCapacitacionFormPage`.
 */

import { useEffect, useMemo } from 'react';
import { useGetCursoCapacitacion } from '@application-capacitacion/cursos/hooks/api/useGetCursoCapacitacion';
import { useCursoCapacitacionMutations } from '@application-capacitacion/cursos/hooks/api/useCursoCapacitacionMutations';
import { useAulasCatalogoCapApi } from '@application-capacitacion/cursos/hooks/api/useAulasCatalogoCapApi';
import { CursoCapacitacionFormContext } from '@application-capacitacion/cursos/context/CursoCapacitacionFormContext';

export const CursoCapacitacionFormProvider = ({ children, cursoId = null }) => {
  const { curso, loading: loadingCurso, error: errorCurso, cargar } = useGetCursoCapacitacion();
  const { saving, guardarCurso } = useCursoCapacitacionMutations();
  const aulasCatalogo = useAulasCatalogoCapApi();

  const id = cursoId != null ? Number(cursoId) : null;
  const idValido = id != null && Number.isFinite(id) && id > 0;

  // Solo el modo edición precarga la ficha (horarioIds incluidos).
  useEffect(() => {
    if (idValido) {
      cargar(id);
    }
  }, [idValido, id, cargar]);

  const value = useMemo(
    () => ({
      cursoId: idValido ? id : null,
      curso,
      loadingCurso: idValido ? loadingCurso : false,
      errorCurso,
      saving,
      guardarCurso,
      // Catálogo de aulas (picker opcional)
      aulas: aulasCatalogo.aulas,
      loadingAulas: aulasCatalogo.loading,
      aulasDisponible: aulasCatalogo.disponible,
    }),
    [idValido, id, curso, loadingCurso, errorCurso, saving, guardarCurso, aulasCatalogo],
  );

  return (
    <CursoCapacitacionFormContext.Provider value={value}>
      {children}
    </CursoCapacitacionFormContext.Provider>
  );
};
