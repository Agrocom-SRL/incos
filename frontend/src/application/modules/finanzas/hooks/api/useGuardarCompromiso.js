/**
 * Hook de API: registrar/actualizar el compromiso de pago de una cabecera (Finanzas).
 *
 * Consume la INFRAESTRUCTURA compartida — `PagoAporteRepository`:
 *   - Sin `compromisoId` → POST /pagos-aportes/:pagoAporteId/compromiso (UPSERT:
 *     el backend soft-anula el vigente previo y crea uno nuevo).
 *   - Con `compromisoId`  → PUT  /pagos-aportes/compromiso/:id (edición directa).
 *
 * Recibe valores ya en claves de dominio (fechaCompromiso, observacion) y los
 * traduce al contrato del backend vía `mapCompromisoToApi`. Devuelve el compromiso
 * resultante normalizado.
 */

import { useCallback, useState } from 'react';
import pagoAporteRepository from '@implementations/PagoAporteRepository';
import {
  mapCompromisoFromApi,
  mapCompromisoToApi,
} from '@application-finanzas/mappers/compromisoMapper';
import { COMPROMISO_DATA_KEY } from '@application-finanzas/hooks/api/useCompromisoPago';

export const useGuardarCompromiso = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * @param {Object} params
   * @param {number} params.pagoAporteId - Cabecera de aporte (requerida en alta).
   * @param {number|null} [params.compromisoId] - Si viene, se edita ese compromiso (PUT).
   * @param {Object} params.values - { fechaCompromiso, observacion? }
   */
  const guardar = useCallback(async ({ pagoAporteId, compromisoId = null, values }) => {
    setLoading(true);
    setError(null);

    const payload = mapCompromisoToApi(values);

    const result = compromisoId
      ? await pagoAporteRepository.actualizarCompromiso(compromisoId, payload)
      : await pagoAporteRepository.guardarCompromiso(pagoAporteId, payload);

    if (!result?.success) {
      const msg = extraerMensajeError(result?.error);
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }

    const mapped = mapCompromisoFromApi(result.data?.[COMPROMISO_DATA_KEY] ?? null);
    setLoading(false);
    return { success: true, [COMPROMISO_DATA_KEY]: mapped, data: mapped };
  }, []);

  return { guardar, loading, error };
};

/** Normaliza el error del backend (string u objeto { message }) a texto plano. */
function extraerMensajeError(rawError) {
  if (!rawError) return 'No se pudo guardar el compromiso de pago';
  if (typeof rawError === 'string') return rawError;
  if (typeof rawError === 'object' && typeof rawError.message === 'string') {
    return rawError.message;
  }
  return 'No se pudo guardar el compromiso de pago';
}
