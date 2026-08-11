/**
 * Hook de API: mutaciones del catálogo de empresas de pasantía (módulo TIT).
 *
 * Alta/edición (P8/P9, `pasantiaEmpresa`), toggle de estado (P10, ACTIVAR —
 * PATCH /empresas/:empresaId/estado, patrón EstadoTogglePill de los catálogos
 * de Configuración) y eliminación (P21, soft-delete). Solo HTTP + estado de
 * guardado; el feedback vive en hooks/state.
 */

import { useCallback, useMemo, useState } from 'react';
import pasantiaRepository from '@implementations/PasantiaRepository';

export const usePasantiaEmpresaMutations = () => {
  const [saving, setSaving] = useState(false);

  const guardarEmpresa = useCallback(async ({ empresaId, payload }) => {
    setSaving(true);
    try {
      return empresaId != null
        ? await pasantiaRepository.actualizarEmpresa(empresaId, payload)
        : await pasantiaRepository.crearEmpresa(payload);
    } finally {
      setSaving(false);
    }
  }, []);

  const cambiarEstadoEmpresa = useCallback(
    (empresaId, activo) => pasantiaRepository.cambiarEstadoEmpresa(empresaId, activo),
    [],
  );

  const eliminarEmpresa = useCallback(
    (empresaId) => pasantiaRepository.eliminarEmpresa(empresaId),
    [],
  );

  return useMemo(
    () => ({ saving, guardarEmpresa, cambiarEstadoEmpresa, eliminarEmpresa }),
    [saving, guardarEmpresa, cambiarEstadoEmpresa, eliminarEmpresa],
  );
};
