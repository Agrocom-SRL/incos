/**
 * Hook de API: mutaciones de horarios de capacitación (módulo CAP).
 *
 * UPSERT del formulario (sin `id` → POST find-or-create; con `id` → PUT) y
 * DELETE (409 si lo usa algún curso: el motivo viaja en `error`). Solo HTTP +
 * estado de guardado; el feedback vive en hooks/state.
 */

import { useCallback, useMemo, useState } from 'react';
import horarioCapacitacionRepository from '@implementations/HorarioCapacitacionRepository';

export const useHorarioMutations = () => {
  const [saving, setSaving] = useState(false);

  const guardarHorario = useCallback(async ({ id, payload }) => {
    setSaving(true);
    try {
      return id != null
        ? await horarioCapacitacionRepository.actualizar(id, payload)
        : await horarioCapacitacionRepository.crear(payload);
    } finally {
      setSaving(false);
    }
  }, []);

  const eliminarHorario = useCallback((id) => horarioCapacitacionRepository.eliminar(id), []);

  return useMemo(
    () => ({ saving, guardarHorario, eliminarHorario }),
    [saving, guardarHorario, eliminarHorario],
  );
};
