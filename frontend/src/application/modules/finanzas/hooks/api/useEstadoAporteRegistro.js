/**
 * Hook de API: estado del aporte de un estudiante para el formulario de registro (Finanzas).
 *
 * Módulo independiente del legacy `@pagos`: consume directamente la INFRAESTRUCTURA
 * compartida — `PagoAporteRepository.obtenerEstadoRegistro` (GET /pagos-aportes/estado-registro).
 *
 * Devuelve el estado normalizado (monto obligatorio, total pagado, saldo pendiente,
 * cabecera, gestión, cuotas, descuento por beca). El backend usa la gestión vigente
 * cuando no se envía `gestionId`.
 */

import { useCallback, useState } from 'react';
import pagoAporteRepository from '@implementations/PagoAporteRepository';
import { mapEstadoAporte } from '@application-finanzas/mappers/pagosRegistrarMapper';

export const useEstadoAporteRegistro = () => {
  const [estado, setEstado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarEstado = useCallback(async (estudianteId, gestionId = null) => {
    const id = Number(estudianteId);
    if (!Number.isFinite(id) || id < 1) {
      setEstado(null);
      setError('El estudiante es requerido');
      return { success: false, error: 'El estudiante es requerido' };
    }

    setLoading(true);
    setError(null);

    const result = await pagoAporteRepository.obtenerEstadoRegistro(id, gestionId);

    if (!result?.success) {
      const msg = result?.error || 'No se pudo obtener el estado del aporte';
      setEstado(null);
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }

    const mapped = mapEstadoAporte(result.data);
    setEstado(mapped);
    setLoading(false);
    return { success: true, data: mapped };
  }, []);

  const limpiar = useCallback(() => {
    setEstado(null);
    setError(null);
  }, []);

  return { estado, loading, error, cargarEstado, limpiar };
};
