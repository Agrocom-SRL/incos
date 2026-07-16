/**
 * Hook: useEstadoAporteRegistro
 *
 * Single Responsibility: Obtener el estado actual del aporte de un estudiante para el formulario de registro de pago.
 *
 * Retorna: saldo_pendiente, total_pagado, cantidad_pagos, cuotas, tiene_descuento_aplicado, gestion, etc.
 * Usado por usePagosRegistrarData y PagosRegistrar para mostrar saldo real, cuotas ya pagadas y ocultar "Asignar beca" si ya hay descuento aplicado.
 */

import { useState, useEffect, useCallback } from 'react';
import PagoAporteRepository from '@infrastructure/repositories/PagoAporteRepository';

/**
 * @param {number|string|null} studentId - ID del estudiante (requerido para fetch)
 * @param {number|string|null} [managementId] - ID de la gestión (opcional; si no se envía, se usa la vigente)
 * @returns {Object} { estadoAporte, loading, error, refetch }
 */
export const useEstadoAporteRegistro = (studentId = null, managementId = null) => {
  const [estadoAporte, setEstadoAporte] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEstado = useCallback(async (sid, mid) => {
    if (!sid || Number(sid) < 1) {
      setEstadoAporte(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await PagoAporteRepository.obtenerEstadoRegistro(Number(sid), mid != null && mid !== '' ? Number(mid) : null);
      if (result.success && result.data) {
        setEstadoAporte(result.data);
      } else {
        setEstadoAporte(null);
        setError(result.error || 'Error al obtener el estado del aporte');
      }
    } catch (err) {
      setEstadoAporte(null);
      setError(err.message || 'Error al obtener el estado del aporte');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (studentId && Number(studentId) >= 1) {
      fetchEstado(studentId, managementId);
    } else {
      setEstadoAporte(null);
      setError(null);
    }
  }, [studentId, managementId, fetchEstado]);

  const refetch = useCallback(() => {
    if (studentId && Number(studentId) >= 1) {
      fetchEstado(studentId, managementId);
    }
  }, [studentId, managementId, fetchEstado]);

  return {
    estadoAporte,
    loading,
    error,
    refetch,
  };
};
