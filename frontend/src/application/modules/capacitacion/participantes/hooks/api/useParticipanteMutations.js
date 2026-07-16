/**
 * Hook de API: mutaciones de participantes de capacitación (módulo CAP).
 *
 * UPSERT del modal de alta/edición: sin `id` → POST; con `id` → PUT. El recurso
 * no expone ELIMINAR (seed 65). Solo HTTP + estado de guardado.
 */

import { useCallback, useMemo, useState } from 'react';
import participanteCapacitacionRepository from '@implementations/ParticipanteCapacitacionRepository';

export const useParticipanteMutations = () => {
  const [saving, setSaving] = useState(false);

  const guardarParticipante = useCallback(async ({ id, payload }) => {
    setSaving(true);
    try {
      return id != null
        ? await participanteCapacitacionRepository.actualizar(id, payload)
        : await participanteCapacitacionRepository.crear(payload);
    } finally {
      setSaving(false);
    }
  }, []);

  return useMemo(() => ({ saving, guardarParticipante }), [saving, guardarParticipante]);
};
