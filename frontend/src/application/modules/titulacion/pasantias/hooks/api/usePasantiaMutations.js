/**
 * Hook de API: mutaciones de trámites de pasantía (módulo TUT).
 *
 * Crear/actualizar (P3/P4), eliminar soft (P5) y transición de estado por
 * camino (P6, APROBAR). Solo HTTP + estado de guardado; el feedback vive en
 * hooks/state (patrón `useProyectoGradoMutations`).
 */

import { useCallback, useMemo, useState } from 'react';
import pasantiaRepository from '@implementations/PasantiaRepository';

export const usePasantiaMutations = () => {
  const [saving, setSaving] = useState(false);

  const guardarPasantia = useCallback(async ({ id, payload }) => {
    setSaving(true);
    try {
      return id != null
        ? await pasantiaRepository.actualizar(id, payload)
        : await pasantiaRepository.crear(payload);
    } finally {
      setSaving(false);
    }
  }, []);

  const eliminarPasantia = useCallback((id) => pasantiaRepository.eliminar(id), []);

  const transicionarEstado = useCallback(
    (id, payload) => pasantiaRepository.transicionar(id, payload),
    [],
  );

  return useMemo(
    () => ({ saving, guardarPasantia, eliminarPasantia, transicionarEstado }),
    [saving, guardarPasantia, eliminarPasantia, transicionarEstado],
  );
};
