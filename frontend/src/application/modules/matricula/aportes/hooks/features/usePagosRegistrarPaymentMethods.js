/**
 * Hook: usePagosRegistrarPaymentMethods
 * 
 * Single Responsibility: Orquestar la carga y selección de métodos de pago para el formulario de registro de pago
 * 
 * Clean Architecture:
 * - Application Layer: Hook feature que encapsula la dependencia de métodos de pago
 * - Usa hooks de API del módulo de pagos
 * 
 * Este hook:
 * - Encapsula el uso de usePaymentMethodsApi
 * - Maneja la selección del método de pago (guarda el ID para usar en el formulario)
 * - Agrega lógica específica para el registro de pagos si es necesario
 * - Expone una interfaz específica para el contexto de registro de pagos
 * 
 * Ventajas:
 * - Encapsula la dependencia del módulo de pagos
 * - Permite agregar lógica específica de registro sin modificar el hook genérico
 * - Facilita el testing y mantenimiento
 * - Separa la lógica del Provider (Provider solo orquesta)
 * - Optimizado para evitar renders redundantes
 */

import { useState, useCallback, useMemo } from 'react';
import { usePaymentMethodsApi } from '../api/usePaymentMethodsApi';

/**
 * Hook para cargar y seleccionar métodos de pago en el contexto de registro de pago
 * 
 * @returns {Object} Objeto con metodosPago, loading, error, refetch, selectedMetodoPago, onSelectMetodoPago
 */
export const usePagosRegistrarPaymentMethods = () => {
  // Usar el hook genérico de métodos de pago
  const { metodosPago, loading, error, refetch } = usePaymentMethodsApi();

  // Estado para el método de pago seleccionado (se usará en el formulario)
  const [selectedMetodoPago, setSelectedMetodoPago] = useState(null);

  /**
   * Función para manejar la selección de un método de pago
   * Guarda el ID y datos básicos del método para usar en el formulario
   * 
   * @param {Object} metodoPago - Método de pago seleccionado (con id, nombre, codigo, etc.)
   */
  const onSelectMetodoPago = useCallback((metodoPago) => {
    if (metodoPago && metodoPago.id) {
      // ✅ OPTIMIZACIÓN: Solo actualizar si realmente cambió
      setSelectedMetodoPago(prev => {
        // Si ya está seleccionado el mismo método, mantener referencia
        if (prev?.id === metodoPago.id) {
          return prev;
        }
        
        // Si cambió, crear nuevo objeto
        return {
          id: metodoPago.id,
          nombre: metodoPago.nombre,
          codigo: metodoPago.codigo,
          // Agregar otros campos según sea necesario
        };
      });
    }
  }, []);

  // TODO: Aquí se puede agregar lógica específica de registro de pagos si es necesario
  // Por ejemplo: filtrar métodos según el tipo de pago, validaciones específicas, etc.

  // Referencia estable: useMemo solo recrea el objeto si cambia alguna dependencia
  return useMemo(() => ({
      metodosPago,
      loading,
      error,
      refetch,
      selectedMetodoPago,
      onSelectMetodoPago,
    }), [metodosPago, loading, error, refetch, selectedMetodoPago, onSelectMetodoPago]);
};
