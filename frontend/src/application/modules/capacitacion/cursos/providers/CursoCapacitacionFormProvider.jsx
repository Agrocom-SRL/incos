/**
 * Provider: alta/edición de un curso de capacitación (CAP).
 *
 * Provider DELGADO: ensambla la ficha (solo en modo edición, para precargar
 * horarioIds), las mutaciones, el catálogo de aulas (picker opcional, con
 * degradación si el rol no tiene el permiso institucional del catálogo) y la
 * disponibilidad de bloques de horario por aula. La orquestación del
 * formulario (cuándo disparar la consulta de disponibilidad) vive en
 * `useCursoCapacitacionFormPage`.
 */

import { useEffect, useMemo } from 'react';
import { useGetCursoCapacitacion } from '@application-capacitacion/cursos/hooks/api/useGetCursoCapacitacion';
import { useCursoCapacitacionMutations } from '@application-capacitacion/cursos/hooks/api/useCursoCapacitacionMutations';
import { useAulasCatalogoCapApi } from '@application-capacitacion/cursos/hooks/api/useAulasCatalogoCapApi';
import { useHorariosDisponiblesCapApi } from '@application-capacitacion/cursos/hooks/api/useHorariosDisponiblesCapApi';
import { CursoCapacitacionFormContext } from '@application-capacitacion/cursos/context/CursoCapacitacionFormContext';

export const CursoCapacitacionFormProvider = ({ children, cursoId = null }) => {
  const { curso, loading: loadingCurso, error: errorCurso, cargar } = useGetCursoCapacitacion();
  const { saving, guardarCurso } = useCursoCapacitacionMutations();
  const aulasCatalogo = useAulasCatalogoCapApi();
  const {
    horarios: horariosDisponibles,
    loading: loadingHorarios,
    error: errorHorarios,
    cargarHorariosDisponibles,
  } = useHorariosDisponiblesCapApi();

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
      // Disponibilidad de bloques de horario por aula (Bloques de horario)
      horariosDisponibles,
      loadingHorarios,
      errorHorarios,
      cargarHorariosDisponibles,
    }),
    [
      idValido,
      id,
      curso,
      loadingCurso,
      errorCurso,
      saving,
      guardarCurso,
      aulasCatalogo,
      horariosDisponibles,
      loadingHorarios,
      errorHorarios,
      cargarHorariosDisponibles,
    ],
  );

  return (
    <CursoCapacitacionFormContext.Provider value={value}>
      {children}
    </CursoCapacitacionFormContext.Provider>
  );
};
