/**
 * Hook de API: mutaciones de sesiones de reforzamiento (módulo TUT).
 *
 * Programar/actualizar (A6/A7), eliminar soft (A8) y registro batch de
 * asistencia/progreso (A9, dataFieldName `participantes`). Solo HTTP +
 * estado de guardado; el feedback vive en hooks/state.
 */

import { useCallback, useMemo, useState } from 'react';
import sesionReforzamientoRepository from '@implementations/SesionReforzamientoRepository';

/** Clave de datos = dataFieldName del backend (contrato A9). */
export const PARTICIPANTES_DATA_KEY = 'participantes';

export const useSesionReforzamientoMutations = () => {
  const [saving, setSaving] = useState(false);

  const guardarSesion = useCallback(async ({ id, payload }) => {
    setSaving(true);
    try {
      return id != null
        ? await sesionReforzamientoRepository.actualizar(id, payload)
        : await sesionReforzamientoRepository.crear(payload);
    } finally {
      setSaving(false);
    }
  }, []);

  const eliminarSesion = useCallback((id) => sesionReforzamientoRepository.eliminar(id), []);

  const registrarParticipantes = useCallback(async (id, participantes) => {
    setSaving(true);
    try {
      return await sesionReforzamientoRepository.registrarParticipantes(id, participantes);
    } finally {
      setSaving(false);
    }
  }, []);

  return useMemo(
    () => ({ saving, guardarSesion, eliminarSesion, registrarParticipantes }),
    [saving, guardarSesion, eliminarSesion, registrarParticipantes],
  );
};
