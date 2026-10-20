/**
 * Hook: usePagosRegistrarPaymentAccounts
 * 
 * Single Responsibility: Orquestar la carga y selección de cuentas de pago para el formulario de registro de pago
 * 
 * Clean Architecture:
 * - Application Layer: Hook feature que encapsula la dependencia de cuentas de pago
 * - Usa hooks de API del módulo de pagos
 * 
 * Este hook:
 * - Encapsula el uso de usePaymentAccountsApi
 * - Maneja la selección de la cuenta de pago (guarda el ID para usar en el formulario)
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

import { useState, useCallback, useMemo, useRef } from 'react';
import { usePaymentAccountsApi } from '../api/usePaymentAccountsApi';

/**
 * Hook para cargar y seleccionar cuentas de pago en el contexto de registro de pago
 * 
 * @returns {Object} Objeto con cuentasPago, loading, error, refetch, selectedCuentaPago, onSelectCuentaPago
 */
export const usePagosRegistrarPaymentAccounts = () => {
  // Usar el hook genérico de cuentas de pago
  const { cuentasPago, loading, error, refetch } = usePaymentAccountsApi();

  // Estado para la cuenta de pago seleccionada (se usará en el formulario)
  const [selectedCuentaPago, setSelectedCuentaPago] = useState(null);

  /**
   * Función para manejar la selección de una cuenta de pago
   * Guarda el ID y datos básicos de la cuenta para usar en el formulario
   * 
   * @param {Object} cuentaPago - Cuenta de pago seleccionada (con id, nombre, numero, etc.)
   */
  const onSelectCuentaPago = useCallback((cuentaPago) => {
    if (cuentaPago && cuentaPago.id) {
      // ✅ OPTIMIZACIÓN: Solo actualizar si realmente cambió
      setSelectedCuentaPago(prev => {
        // Si ya está seleccionada la misma cuenta, mantener referencia
        if (prev?.id === cuentaPago.id) {
          return prev;
        }
        
        // Si cambió, crear nuevo objeto
        return {
          id: cuentaPago.id,
          nombre: cuentaPago.nombre,
          numero: cuentaPago.numero,
          // Agregar otros campos según sea necesario
        };
      });
    }
  }, []);

  // TODO: Aquí se puede agregar lógica específica de registro de pagos si es necesario
  // Por ejemplo: filtrar cuentas según el estudiante seleccionado, validaciones específicas, etc.

  // MANTENER REFERENCIA ESTABLE
  // Comparar valores, no solo referencias, para evitar recálculos innecesarios
  const prevResultRef = useRef(null);
  
  return useMemo(() => {
    const current = {
      cuentasPago,
      loading,
      error,
      refetch,
      selectedCuentaPago,
      onSelectCuentaPago,
    };

    const prev = prevResultRef.current;
    
    // Comparar valores, no referencias
    if (prev &&
        prev.loading === current.loading &&
        prev.error === current.error &&
        prev.refetch === current.refetch &&
        prev.cuentasPago === current.cuentasPago &&
        prev.selectedCuentaPago?.id === current.selectedCuentaPago?.id &&
        prev.onSelectCuentaPago === current.onSelectCuentaPago) {
      return prev;
    }

    prevResultRef.current = current;
    return current;
  }, [cuentasPago, loading, error, refetch, selectedCuentaPago, onSelectCuentaPago]);
};
