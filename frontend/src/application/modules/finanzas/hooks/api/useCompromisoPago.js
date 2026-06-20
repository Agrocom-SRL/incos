/**
 * Hook de API: compromiso de pago VIGENTE de una cabecera de aporte (Finanzas).
 *
 * Módulo independiente del legacy `@pagos`: consume directamente la INFRAESTRUCTURA
 * compartida — `PagoAporteRepository.obtenerCompromiso` (GET /pagos-aportes/:id/compromiso).
 *
 * `dataKey` ('compromiso') coincide con el `dataFieldName` del backend. Devuelve el
 * compromiso vigente normalizado o `null` cuando la cabecera no tiene compromiso.
 */

import { useCallback, useState } from 'react';
import pagoAporteRepository from '@implementations/PagoAporteRepository';
import { mapCompromisoFromApi } from '@application-finanzas/mappers/compromisoMapper';

/** Clave de datos = dataFieldName del backend. */
export const COMPROMISO_DATA_KEY = 'compromiso';

export const useCompromisoPago = () => {
  const [compromiso, setCompromiso] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarCompromiso = useCallback(async (pagoAporteId) => {
    const id = Number(pagoAporteId);
    if (!Number.isFinite(id) || id < 1) {
      setCompromiso(null);
      setError('La cabecera de aporte es requerida');
      return { success: false, error: 'La cabecera de aporte es requerida' };
    }

    setLoading(true);
    setError(null);

    const result = await pagoAporteRepository.obtenerCompromiso(id);

    if (!result?.success) {
      const msg = result?.error || 'No se pudo obtener el compromiso de pago';
      setCompromiso(null);
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }

    const raw = result.data?.[COMPROMISO_DATA_KEY] ?? null;
    const mapped = mapCompromisoFromApi(raw);
    setCompromiso(mapped);
    setLoading(false);
    return { success: true, [COMPROMISO_DATA_KEY]: mapped, data: mapped };
  }, []);

  const limpiar = useCallback(() => {
    setCompromiso(null);
    setError(null);
  }, []);

  return { compromiso, loading, error, cargarCompromiso, limpiar };
};
