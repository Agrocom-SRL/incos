/**
 * Hook de API: mutaciones de fichas de seguimiento en clase (módulo DOC ·
 * Supervisión docente).
 *
 * Registrar (S3) / actualizar (S4). Sin eliminar: la ficha realizada no se
 * borra (vocabulario de acciones sin ELIMINAR). Solo HTTP + estado de
 * guardado; el feedback vive en hooks/state.
 */

import { useCallback, useMemo, useState } from 'react';
import fichaSeguimientoRepository from '@implementations/FichaSeguimientoRepository';

export const useFichaSeguimientoMutations = () => {
  const [saving, setSaving] = useState(false);

  const guardarFicha = useCallback(async ({ id, payload }) => {
    setSaving(true);
    try {
      return id != null
        ? await fichaSeguimientoRepository.actualizar(id, payload)
        : await fichaSeguimientoRepository.crear(payload);
    } finally {
      setSaving(false);
    }
  }, []);

  return useMemo(() => ({ saving, guardarFicha }), [saving, guardarFicha]);
};
