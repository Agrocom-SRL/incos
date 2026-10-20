/**
 * Hook: usePagosRegistrarContributionConfigurations
 * 
 * Single Responsibility: Orquestar la carga y selección de configuraciones de aportes para el formulario de registro de pago
 * 
 * Clean Architecture:
 * - Application Layer: Hook feature que encapsula la dependencia de configuraciones de aportes
 * - Usa hooks de API del módulo de pagos
 * 
 * Este hook:
 * - Encapsula el uso de useContributionConfigurationsApi
 * - Maneja la selección de la configuración de aportes (guarda el ID para usar en el formulario)
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
import { useContributionConfigurationsApi } from '../api/useContributionConfigurationsApi';

/**
 * Hook para cargar y seleccionar configuraciones de aportes en el contexto de registro de pago
 * 
 * @returns {Object} Objeto con configuracionAportes, loading, error, refetch, selectedConfiguracion, onSelectConfiguracion
 */
export const usePagosRegistrarContributionConfigurations = () => {
  // Usar el hook genérico de configuraciones de aportes
  const { configuracionAportes, loading, error, refetch } = useContributionConfigurationsApi();

  // Estado para la configuración de aportes seleccionada (se usará en el formulario)
  const [selectedConfiguracion, setSelectedConfiguracion] = useState(null);

  /**
   * Función para manejar la selección de una configuración de aportes
   * Guarda el ID y datos básicos de la configuración para usar en el formulario
   * 
   * @param {Object} configuracion - Configuración de aportes seleccionada (con id, nombre, monto, etc.)
   */
  const onSelectConfiguracion = useCallback((configuracion) => {
    if (configuracion && configuracion.id) {
      // ✅ OPTIMIZACIÓN: Solo actualizar si realmente cambió
      setSelectedConfiguracion(prev => {
        // Si ya está seleccionada la misma configuración, mantener referencia
        if (prev?.id === configuracion.id) {
          return prev;
        }
        
        // Si cambió, crear nuevo objeto
        return {
          id: configuracion.id,
          nombre: configuracion.nombre,
          monto: configuracion.monto,
          // Agregar otros campos según sea necesario
        };
      });
    }
  }, []);

  // TODO: Aquí se puede agregar lógica específica de registro de pagos si es necesario
  // Por ejemplo: filtrar configuraciones según el estudiante o gestión, validaciones específicas, etc.

  // Referencia estable: useMemo solo recrea el objeto si cambia alguna dependencia
  return useMemo(() => ({
      configuracionAportes,
      loading,
      error,
      refetch,
      selectedConfiguracion,
      onSelectConfiguracion,
    }), [configuracionAportes, loading, error, refetch, selectedConfiguracion, onSelectConfiguracion]);
};
