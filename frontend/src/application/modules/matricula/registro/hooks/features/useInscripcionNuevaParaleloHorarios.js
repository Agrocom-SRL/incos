/**
 * Hook: useInscripcionNuevaParaleloHorarios
 * 
 * Single Responsibility: Orquestar la carga de horarios de un paralelo para el wizard de inscripción
 * 
 * Clean Architecture:
 * - Application Layer: Hook feature que encapsula la dependencia del módulo de paralelos
 * - Usa hooks de API del módulo académico (cross-module dependency)
 * 
 * Este hook:
 * - Encapsula el uso de useParaleloScheduleApi del módulo académico
 * - Carga los horarios cuando se selecciona un paralelo
 * - Maneja estados de loading y error
 * - Expone una interfaz específica para el contexto de inscripciones
 * 
 * Ventajas:
 * - Encapsula la dependencia entre módulos
 * - Permite agregar lógica específica de inscripciones sin modificar el hook genérico
 * - Facilita el testing y mantenimiento
 * - Separa la lógica del Provider (Provider solo orquesta)
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useParaleloScheduleApi } from '@application-academico/paralelos/hooks/useParaleloScheduleApi';

/**
 * Hook para cargar horarios de un paralelo en el contexto de inscripción nueva
 * 
 * @param {Object} options - Opciones del hook
 * @param {number} [options.parallelId] - ID del paralelo para cargar horarios
 * @returns {Object} Objeto con schedule, loading, error, fetch, refetch
 */
export const useInscripcionNuevaParaleloHorarios = (options = {}) => {
  const { parallelId } = options;

  // Usar el hook genérico de horarios de paralelo
  const { schedule, loading, error, fetch } = useParaleloScheduleApi();

  /**
   * Función para cargar horarios de un paralelo
   * 
   * @param {number} id - ID del paralelo
   */
  const loadHorarios = useCallback((id) => {
    if (id) {
      fetch(id);
    }
  }, [fetch]);

  // Cargar horarios cuando cambie parallelId
  useEffect(() => {
    if (parallelId) {
      loadHorarios(parallelId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parallelId]); // Solo cuando cambie parallelId

  /**
   * Función para recargar horarios
   */
  const refetch = useCallback(() => {
    if (parallelId) {
      loadHorarios(parallelId);
    }
  }, [parallelId, loadHorarios]);

  // TODO: Aquí se puede agregar lógica específica de inscripciones si es necesario
  // Por ejemplo: formatear horarios para el componente de timetable, validaciones específicas, etc.

  // MANTENER REFERENCIA ESTABLE
  // Comparar valores, no solo referencias, para evitar recálculos innecesarios
  const prevResultRef = useRef(null);
  
  return useMemo(() => {
    const current = {
      schedule,
      loading,
      error,
      fetch: loadHorarios,
      refetch,
    };

    const prev = prevResultRef.current;
    
    // Comparar valores, no referencias
    if (prev &&
        prev.loading === current.loading &&
        prev.error === current.error &&
        prev.refetch === current.refetch &&
        prev.fetch === current.fetch &&
        prev.schedule === current.schedule) {
      return prev;
    }

    prevResultRef.current = current;
    return current;
  }, [schedule, loading, error, loadHorarios, refetch]);
};
