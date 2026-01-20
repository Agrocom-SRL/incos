/**
 * Context: PagosDetailContext
 * 
 * Single Responsibility: Proporcionar contexto para el detalle de un pago
 * 
 * Clean Architecture:
 * - Application Layer: Context para compartir estado del detalle de pago
 * 
 * Este contexto expone:
 * - pago: Datos completos del pago con relaciones
 * - loading: Estado de carga
 * - error: Error si existe
 * - getPagoById: Función para obtener el pago
 * - refetch: Función para recargar los datos
 */

import { createContext } from 'react';

export const PagosDetailContext = createContext({
  pago: null,
  loading: false,
  error: null,
  getPagoById: () => {},
  refetch: () => {},
});
