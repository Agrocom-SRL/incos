/**
 * Hook: usePagosDetailContext
 * 
 * Single Responsibility: Consumir el contexto de detalle de pago
 * 
 * Clean Architecture:
 * - Application Layer: Hook para acceder al contexto de detalle de pago
 * 
 * Este hook:
 * - Proporciona acceso al contexto PagosDetailContext
 * - Lanza error si se usa fuera del provider
 */

import { useContext } from 'react';
import { PagosDetailContext } from '@application-pagos/context/PagosDetailContext';

export const usePagosDetailContext = () => {
  const context = useContext(PagosDetailContext);

  if (!context) {
    throw new Error('usePagosDetailContext debe usarse dentro de PagosDetailProvider');
  }

  return context;
};
