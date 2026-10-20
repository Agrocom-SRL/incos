/**
 * Hook: usePagosRegistrarAuthorizedBanks
 * 
 * Single Responsibility: Orquestar la carga y selección de bancos autorizados para el formulario de registro de pago
 * 
 * Clean Architecture:
 * - Application Layer: Hook feature que encapsula la dependencia de bancos autorizados
 * - Usa hooks de API del módulo de pagos
 * 
 * Este hook:
 * - Encapsula el uso de useAuthorizedBanksApi
 * - Maneja la selección del banco autorizado (guarda el ID para usar en el formulario)
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
import { useAuthorizedBanksApi } from '../api/useAuthorizedBanksApi';

/**
 * Hook para cargar y seleccionar bancos autorizados en el contexto de registro de pago
 * 
 * @returns {Object} Objeto con bancosAutorizados, loading, error, refetch, selectedBanco, onSelectBanco
 */
export const usePagosRegistrarAuthorizedBanks = () => {
  // Usar el hook genérico de bancos autorizados
  const { bancosAutorizados, loading, error, refetch } = useAuthorizedBanksApi();

  // Estado para el banco autorizado seleccionado (se usará en el formulario)
  const [selectedBanco, setSelectedBanco] = useState(null);

  /**
   * Función para manejar la selección de un banco autorizado
   * Guarda el ID y datos básicos del banco para usar en el formulario
   * 
   * @param {Object} banco - Banco autorizado seleccionado (con id, nombre, codigo, etc.)
   */
  const onSelectBanco = useCallback((banco) => {
    if (banco && banco.id) {
      // ✅ OPTIMIZACIÓN: Solo actualizar si realmente cambió
      setSelectedBanco(prev => {
        // Si ya está seleccionado el mismo banco, mantener referencia
        if (prev?.id === banco.id) {
          return prev;
        }
        
        // Si cambió, crear nuevo objeto
        return {
          id: banco.id,
          nombre: banco.nombre,
          codigo: banco.codigo,
          // Agregar otros campos según sea necesario
        };
      });
    }
  }, []);

  // TODO: Aquí se puede agregar lógica específica de registro de pagos si es necesario
  // Por ejemplo: filtrar bancos según el estudiante seleccionado, validaciones específicas, etc.

  // Referencia estable: useMemo solo recrea el objeto si cambia alguna dependencia
  return useMemo(() => ({
      bancosAutorizados,
      loading,
      error,
      refetch,
      selectedBanco,
      onSelectBanco,
    }), [bancosAutorizados, loading, error, refetch, selectedBanco, onSelectBanco]);
};
