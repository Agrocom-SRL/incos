/**
 * Hook: useAsignarBecaData
 * 
 * Single Responsibility: Gestionar el estado del contexto de asignar beca
 * 
 * Clean Architecture:
 * - Application Layer: Hook que gestiona el estado del contexto orquestando hooks de feature
 * - Similar a useInscripcionNuevaData pero específico para la feature "asignar beca"
 * 
 * Este hook:
 * - Orquesta todos los hooks de feature (becasDescuentosData)
 * - Crea callbacks memoizados para las acciones
 * - Compone el objeto de contexto
 * - Retorna el valor completo del contexto para el Provider
 * 
 * Ventajas:
 * - Separación de responsabilidades: Provider solo expone, hook gestiona estado
 * - Testeable: Se puede testear el hook independientemente
 * - Reutilizable: Se puede usar el hook sin el Provider si es necesario
 * - Mantenible: Toda la lógica está centralizada en un solo lugar
 * 
 * Nota: Este hook GESTIONA el estado del contexto (para el Provider).
 * Para CONSUMIR el contexto, usa useAsignarBecaContext en context/.
 */

import { useMemo, useCallback } from 'react';
import { useAsignarBecaBecasDescuentos } from '@application-estudiantes/hooks';

/**
 * Hook que gestiona el estado del contexto de asignar beca
 * 
 * @param {string|number} studentId - ID del estudiante al que se le asignará la beca
 * @returns {Object} Objeto con todo el contexto de asignar beca
 */
export const useAsignarBecaData = (studentId) => {
  // 1. Hooks de feature
  const becasDescuentosData = useAsignarBecaBecasDescuentos();

  // 2. Callbacks memoizados para las acciones
  const handleSelectBecaDescuento = useCallback((becaDescuento) => {
    if (becaDescuento && becasDescuentosData.onSelectBecaDescuento) {
      becasDescuentosData.onSelectBecaDescuento(becaDescuento);
    }
  }, [becasDescuentosData.onSelectBecaDescuento]);

  // 3. Componer value final del contexto
  return useMemo(() => ({
    // ID del estudiante
    studentId,

    // Becas y descuentos
    becasDescuentosData: {
      becasDescuentos: becasDescuentosData.becasDescuentos,
      loading: becasDescuentosData.loading,
      error: becasDescuentosData.error,
      refetch: becasDescuentosData.refetch,
      selectedBecaDescuento: becasDescuentosData.selectedBecaDescuento,
    },

    // Handlers
    onSelectBecaDescuento: handleSelectBecaDescuento,
  }), [
    studentId,
    becasDescuentosData.becasDescuentos,
    becasDescuentosData.loading,
    becasDescuentosData.error,
    becasDescuentosData.refetch,
    becasDescuentosData.selectedBecaDescuento,
    handleSelectBecaDescuento,
  ]);
};
