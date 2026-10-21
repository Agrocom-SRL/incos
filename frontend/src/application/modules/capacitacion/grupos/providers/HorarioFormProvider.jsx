/**
 * Provider: alta/edición de un horario de capacitación (CAP).
 *
 * Provider DELGADO: ensambla la ficha (solo en modo edición, GET fresco por id
 * para soportar recarga en `/horarios/:id/editar`) y las mutaciones. Gemelo de
 * `ParticipanteFormProvider`. La orquestación vive en `useHorarioFormPage`.
 */

import { useEffect, useMemo } from 'react';
import { useGetHorarioCapacitacion } from '@application-capacitacion/grupos/hooks/api/useGetHorarioCapacitacion';
import { useHorarioMutations } from '@application-capacitacion/grupos/hooks/api/useHorarioMutations';
import { HorarioFormContext } from '@application-capacitacion/grupos/context/HorarioFormContext';

export const HorarioFormProvider = ({ children, horarioId = null }) => {
  const { horario, loading: loadingHorario, error: errorHorario, cargar } =
    useGetHorarioCapacitacion();
  const { saving, guardarHorario } = useHorarioMutations();

  const id = horarioId != null ? Number(horarioId) : null;
  const idValido = id != null && Number.isFinite(id) && id > 0;

  useEffect(() => {
    if (idValido) cargar(id);
  }, [idValido, id, cargar]);

  const value = useMemo(
    () => ({
      horarioId: idValido ? id : null,
      horario,
      loadingHorario: idValido ? loadingHorario : false,
      errorHorario,
      saving,
      guardarHorario,
    }),
    [idValido, id, horario, loadingHorario, errorHorario, saving, guardarHorario],
  );

  return <HorarioFormContext.Provider value={value}>{children}</HorarioFormContext.Provider>;
};
