/**
 * Hook de API: mutación del aporte de la gestión vigente — módulo Finanzas.
 *
 * UPSERT: si NO existe configuración para la gestión vigente → POST; si
 * existe → PUT por id. La decisión la toma `guardarConfiguracionAporte`
 * según el `id` recibido (lo resuelve `useAportePage`). Sin ELIMINAR: el
 * permiso `finanzas.aporte` solo tiene LISTAR/CREAR/EDITAR.
 */

import { useCallback, useMemo, useState } from 'react';
import contributionConfigurationRepository from '@implementations/ContributionConfigurationRepository';

export const useAporteMutations = () => {
  const [saving, setSaving] = useState(false);

  const guardarConfiguracionAporte = useCallback(async ({ id, payload }) => {
    setSaving(true);
    try {
      return id != null
        ? await contributionConfigurationRepository.actualizar(id, payload)
        : await contributionConfigurationRepository.crear(payload);
    } finally {
      setSaving(false);
    }
  }, []);

  return useMemo(
    () => ({ saving, guardarConfiguracionAporte }),
    [saving, guardarConfiguracionAporte],
  );
};

export default useAporteMutations;
