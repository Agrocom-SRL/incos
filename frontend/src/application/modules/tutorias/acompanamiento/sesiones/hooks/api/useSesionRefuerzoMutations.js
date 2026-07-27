/**
 * Hook de API: mutaciones de sesiones de refuerzo (módulo TUT).
 *
 * Programar/actualizar (A6/A7), eliminar soft (A8) y registro batch de
 * asistencia/progreso (A9, dataFieldName `estudiantes`). Solo HTTP +
 * estado de guardado; el feedback vive en hooks/state.
 */

import { useCallback, useMemo, useState } from 'react';
import sesionRefuerzoRepository from '@implementations/SesionRefuerzoRepository';

/** Clave de datos = dataFieldName del backend (contrato A9). */
export const ESTUDIANTES_DATA_KEY = 'estudiantes';

export const useSesionRefuerzoMutations = () => {
  const [saving, setSaving] = useState(false);

  const guardarSesion = useCallback(async ({ id, payload }) => {
    setSaving(true);
    try {
      return id != null
        ? await sesionRefuerzoRepository.actualizar(id, payload)
        : await sesionRefuerzoRepository.crear(payload);
    } finally {
      setSaving(false);
    }
  }, []);

  const eliminarSesion = useCallback((id) => sesionRefuerzoRepository.eliminar(id), []);

  const registrarEstudiantes = useCallback(async (id, estudiantes) => {
    setSaving(true);
    try {
      return await sesionRefuerzoRepository.registrarEstudiantes(id, estudiantes);
    } finally {
      setSaving(false);
    }
  }, []);

  return useMemo(
    () => ({ saving, guardarSesion, eliminarSesion, registrarEstudiantes }),
    [saving, guardarSesion, eliminarSesion, registrarEstudiantes],
  );
};
