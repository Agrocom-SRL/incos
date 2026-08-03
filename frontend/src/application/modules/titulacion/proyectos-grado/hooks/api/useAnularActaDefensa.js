/**
 * Hook de API: anular un acta de defensa EMITIDA (módulo TIT, extensión
 * 2026-08-02 · proyecto·APROBAR — mismo permiso que registrar el acta).
 *
 * PATCH /:id/acta-defensa/:actaId/anular — el backend antepone el motivo a
 * `observaciones` (`"ANULADA: {motivo}"`) y NO revierte la transición del
 * proyecto (P8). Solo HTTP + estado de guardado (patrón `useRegistrarActaDefensa`);
 * el refresco de la lista de actas y el feedback al usuario viven en
 * `useProyectoGradoDetailPage`.
 */

import { useCallback, useMemo, useState } from 'react';
import proyectoGradoRepository from '@implementations/ProyectoGradoRepository';

export const useAnularActaDefensa = () => {
  const [anulando, setAnulando] = useState(false);

  const anular = useCallback(async (proyectoId, actaId, motivo) => {
    setAnulando(true);
    try {
      return await proyectoGradoRepository.anularActaDefensa(proyectoId, actaId, motivo);
    } finally {
      setAnulando(false);
    }
  }, []);

  return useMemo(() => ({ anulando, anular }), [anulando, anular]);
};

export default useAnularActaDefensa;
