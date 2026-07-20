/**
 * Provider: alta/edición de un participante de capacitación (CAP).
 *
 * Provider DELGADO: ensambla la ficha (solo en modo edición, GET fresco por id
 * para soportar recarga de página en `/participantes/:id/editar`) y las
 * mutaciones. Gemelo de `CursoCapacitacionFormProvider`. La orquestación del
 * formulario vive en `useParticipanteFormPage`.
 */

import { useEffect, useMemo } from 'react';
import { useGetParticipanteCapacitacion } from '@application-capacitacion/participantes/hooks/api/useGetParticipanteCapacitacion';
import { useParticipanteMutations } from '@application-capacitacion/participantes/hooks/api/useParticipanteMutations';
import { ParticipanteFormContext } from '@application-capacitacion/participantes/context/ParticipanteFormContext';

export const ParticipanteFormProvider = ({ children, participanteId = null }) => {
  const {
    participante,
    loading: loadingParticipante,
    error: errorParticipante,
    cargar,
  } = useGetParticipanteCapacitacion();
  const { saving, guardarParticipante } = useParticipanteMutations();

  const id = participanteId != null ? Number(participanteId) : null;
  const idValido = id != null && Number.isFinite(id) && id > 0;

  useEffect(() => {
    if (idValido) {
      cargar(id);
    }
  }, [idValido, id, cargar]);

  const value = useMemo(
    () => ({
      participanteId: idValido ? id : null,
      participante,
      loadingParticipante: idValido ? loadingParticipante : false,
      errorParticipante,
      saving,
      guardarParticipante,
    }),
    [idValido, id, participante, loadingParticipante, errorParticipante, saving, guardarParticipante],
  );

  return (
    <ParticipanteFormContext.Provider value={value}>{children}</ParticipanteFormContext.Provider>
  );
};
