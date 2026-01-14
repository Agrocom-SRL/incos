/**
 * Hook: useInscripcionNuevaMaterias
 * 
 * Single Responsibility: Orquestar la carga y selección de materias para el wizard de inscripción
 * 
 * Clean Architecture:
 * - Application Layer: Hook feature que encapsula la dependencia del módulo de materias
 * - Usa hooks de API del módulo de configuración (cross-module dependency)
 * 
 * Este hook:
 * - Encapsula el uso de useMateriasApi del módulo de configuración
 * - Maneja la selección de la materia (guarda el ID para usar en el formulario de inscripción)
 * - Filtra materias por periodo_id
 * - Agrega lógica específica para el wizard de inscripciones si es necesario
 * - Expone una interfaz específica para el contexto de inscripciones
 * 
 * Ventajas:
 * - Encapsula la dependencia entre módulos
 * - Permite agregar lógica específica de inscripciones sin modificar el hook genérico
 * - Facilita el testing y mantenimiento
 * - Separa la lógica del Provider (Provider solo orquesta)
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useMateriasApi } from '@application-configuracion/academico/materias/hooks/useMateriasApi';

/**
 * Hook para cargar y seleccionar materias en el contexto de inscripción nueva
 * 
 * @param {Object} options - Opciones del hook
 * @param {number} [options.periodoId] - ID del periodo para filtrar materias
 * @returns {Object} Objeto con materias, loading, error, refetch, selectedMateria, onSelectMateria
 */
export const useInscripcionNuevaMaterias = (options = {}) => {
  const { periodoId } = options;

  // Usar el hook genérico de materias
  const { materias, loading, error, fetch } = useMateriasApi();

  // Estado para la materia seleccionada
  const [selectedMateria, setSelectedMateria] = useState(null);

  /**
   * Función para cargar materias con periodo_id
   * El backend espera periodo_id (snake_case) según el validador
   */
  const loadMaterias = useCallback(() => {
    const params = {};
    if (periodoId) {
      params.periodo_id = periodoId; // Backend espera periodo_id (snake_case)
    }
    fetch({ params });
  }, [periodoId, fetch]);

  // Cargar materias cuando cambie periodoId
  // Limpiar materia seleccionada cuando cambie el periodo
  useEffect(() => {
    // Limpiar selección cuando cambia el periodo
    setSelectedMateria(null);
    
    // Cargar materias solo si hay periodo seleccionado
    if (periodoId) {
      loadMaterias();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodoId]); // Solo cuando cambie periodoId

  /**
   * Función para recargar materias
   */
  const refetch = useCallback(() => {
    loadMaterias();
  }, [loadMaterias]);

  /**
   * Función para manejar la selección de una materia
   * Guarda el ID y datos básicos de la materia para usar en el formulario
   * 
   * @param {Object} materia - Materia seleccionada (con id, nombre, codigo, etc.)
   */
  const onSelectMateria = useCallback((materia) => {
    if (materia && materia.id) {
      // ✅ OPTIMIZACIÓN: Solo actualizar si realmente cambió
      setSelectedMateria(prev => {
        // Si ya está seleccionada la misma materia, mantener referencia
        if (prev?.id === materia.id) {
          return prev;
        }
        
        // Si cambió, crear nuevo objeto
        return {
          id: materia.id,
          nombre: materia.nombre,
          codigo: materia.codigo,
          sigla: materia.sigla,
        };
      });
    }
  }, []);

  // TODO: Aquí se puede agregar lógica específica de inscripciones si es necesario
  // Por ejemplo: filtrar materias según prerrequisitos, validaciones específicas, etc.

  // MANTENER REFERENCIA ESTABLE
  // Comparar valores, no solo referencias, para evitar recálculos innecesarios
  const prevResultRef = useRef(null);
  
  return useMemo(() => {
    const current = {
      materias,
      loading,
      error,
      refetch,
      selectedMateria,
      onSelectMateria,
    };

    const prev = prevResultRef.current;
    
    // Comparar valores, no referencias
    if (prev &&
        prev.loading === current.loading &&
        prev.error === current.error &&
        prev.refetch === current.refetch &&
        prev.materias === current.materias &&
        prev.selectedMateria?.id === current.selectedMateria?.id &&
        prev.onSelectMateria === current.onSelectMateria) {
      return prev;
    }

    prevResultRef.current = current;
    return current;
  }, [materias, loading, error, refetch, selectedMateria, onSelectMateria]);
};
