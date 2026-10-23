/**
 * Hook de API: mutaciones de participantes de capacitación (módulo CAP).
 *
 * UPSERT de alta/edición: sin `id` → POST; con `id` → PUT; `eliminarParticipante` →
 * DELETE (soft delete; 409 si tiene inscripciones). Solo HTTP + estado de guardado.
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

  const eliminarParticipante = useCallback(
    (id) => participanteCapacitacionRepository.eliminar(id),
    [],
  );

  return useMemo(
    () => ({ saving, guardarParticipante, eliminarParticipante }),
    [saving, guardarParticipante, eliminarParticipante],
  );
};
