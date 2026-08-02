/**
 * Hook de API: registrar el/los acta(s) de defensa de un proyecto de grado
 * (módulo TIT, extensión 2026-08-01 · proyecto·APROBAR).
 *
 * POST /:id/acta-defensa — crea el/los acta(s) (N si PSP grupal, una por
 * integrante ACTIVO) y el backend delega la transición
 * DEFENSA→APROBADO|REPROBADO (T11). Solo HTTP + estado de guardado (patrón
 * `useProyectoGradoMutations`); el refresco de la ficha + actas y el
 * feedback al usuario viven en `useProyectoGradoDetailPage`.
 */

import { useCallback, useMemo, useState } from 'react';
import proyectoGradoRepository from '@implementations/ProyectoGradoRepository';

export const useRegistrarActaDefensa = () => {
  const [saving, setSaving] = useState(false);

  const registrar = useCallback(async (proyectoId, payload) => {
    setSaving(true);
    try {
      return await proyectoGradoRepository.registrarActaDefensa(proyectoId, payload);
    } finally {
      setSaving(false);
    }
  }, []);

  return useMemo(() => ({ saving, registrar }), [saving, registrar]);
};

export default useRegistrarActaDefensa;
