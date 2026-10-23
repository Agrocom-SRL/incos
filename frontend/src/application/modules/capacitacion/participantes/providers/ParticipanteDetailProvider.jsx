/**
 * Provider: ficha de un participante de capacitación (CAP).
 *
 * Espejo de `CursoCapacitacionDetailProvider`: provider DELGADO que ensambla el
 * hook de API (auto-fetch por id) y publica el contrato de la ficha. La
 * orquestación de pantalla vive en `useParticipanteDetailPage`.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useGetParticipanteCapacitacion } from '@application-capacitacion/participantes/hooks/api/useGetParticipanteCapacitacion';
import { ParticipanteDetailContext } from '@application-capacitacion/participantes/context/ParticipanteDetailContext';

export const ParticipanteDetailProvider = ({ children, participanteId }) => {
  const { participante, loading, error, cargar } = useGetParticipanteCapacitacion();

  const id = Number(participanteId);
  const idValido = Number.isFinite(id) && id > 0;

  useEffect(() => {
    if (idValido) cargar(id);
  }, [idValido, id, cargar]);

  const refetch = useCallback(() => {
    if (idValido) return cargar(id);
    return Promise.resolve({ success: false });
  }, [idValido, id, cargar]);

  const value = useMemo(
    () => ({
      participanteId: idValido ? id : null,
      participante,
      loading,
      error: idValido ? error : 'Identificador de participante inválido',
      refetch,
    }),
    [idValido, id, participante, loading, error, refetch],
  );

  return (
    <ParticipanteDetailContext.Provider value={value}>{children}</ParticipanteDetailContext.Provider>
  );
};
