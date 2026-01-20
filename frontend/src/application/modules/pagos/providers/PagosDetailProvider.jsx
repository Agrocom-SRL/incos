/**
 * Provider: PagosDetailProvider
 * 
 * Single Responsibility: Proporcionar estado compartido para el detalle de un pago
 * 
 * Clean Architecture:
 * - Application Layer: Provider específico para la feature de detalle de pago
 * - Usa useGetPagoById para obtener datos del backend
 * - Maneja el estado del pago completo con todos sus datos relacionados
 * 
 * Ventajas:
 * - Aislamiento: estado independiente para el detalle
 * - Reutilizable: puede usarse en cualquier componente que necesite el detalle
 * - Caché: mantiene el pago cargado mientras el provider esté montado
 * - Carga automática: carga el pago automáticamente cuando se proporciona pagoId
 */

import { useEffect } from 'react';
import { useGetPagoById } from '@application-pagos/hooks';
import { PagosDetailContext } from '@application-pagos/context/PagosDetailContext';

export const PagosDetailProvider = ({ children, pagoId }) => {
  // Hook para obtener el pago por ID
  // El hook retorna { pago: data, ... } donde data contiene:
  // { id, estudiante, gestion, metodoPago, beca, inscripcion, ... }
  const { pago: pagoRaw, loading, error, getPagoById, refetch } = useGetPagoById();

  // Cargar automáticamente el pago cuando se proporciona pagoId
  useEffect(() => {
    if (pagoId) {
      getPagoById(pagoId);
    }
  }, [pagoId, getPagoById]);

  // pagoRaw contiene toda la estructura del pago con relaciones
  // La pasamos directamente al contexto
  const pago = pagoRaw;

  const value = {
    pago, // Contiene: { id, estudiante, gestion, metodoPago, beca, inscripcion, ... }
    loading,
    error,
    getPagoById,
    refetch: () => refetch(pagoId),
  };

  return (
    <PagosDetailContext.Provider value={value}>
      {children}
    </PagosDetailContext.Provider>
  );
};
