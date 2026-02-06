/**
 * Hook: useInscripcionNuevaParalelos
 * 
 * Single Responsibility: Orquestar la carga y selección de paralelos para el wizard de inscripción
 * 
 * Clean Architecture:
 * - Application Layer: Hook feature que encapsula la dependencia del módulo de paralelos
 * - Usa hooks de API del módulo académico (cross-module dependency)
 * 
 * Este hook:
 * - Encapsula el uso de useParalelosApi del módulo académico
 * - Maneja la selección del paralelo (guarda el ID para usar en el formulario de inscripción)
 * - Filtra paralelos por periodo (periodo: 1 por defecto)
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
import { useParalelosApi } from '@application-academico/paralelos/hooks/useParalelosApi';

/**
 * Hook para cargar y seleccionar paralelos en el contexto de inscripción nueva
 * 
 * @param {Object} options - Opciones del hook
 * @param {number} [options.carreraId] - ID de la carrera para filtrar paralelos
 * @param {number} [options.periodoId] - ID del periodo seleccionado (obligatorio para cargar; antes se usaba periodo 1 fijo)
 * @param {number} [options.initialParaleloId] - ID del paralelo para pre-seleccionar (opcional)
 * @returns {Object} Objeto con paralelos, loading, error, refetch, selectedParalelo, onSelectParalelo
 */
export const useInscripcionNuevaParalelos = (options = {}) => {
  const { carreraId, periodoId, initialParaleloId = null } = options;

  // Usar el hook genérico de paralelos
  const { paralelos, loading, error, fetch } = useParalelosApi();

  // Estado para el paralelo seleccionado
  const [selectedParalelo, setSelectedParalelo] = useState(null);

  /**
   * Función para cargar paralelos con periodo_id (seleccionado por el usuario) y carrera_id (si existe)
   * El backend acepta periodo_id o periodo (número). Priorizamos periodo_id.
   */
  const loadParalelos = useCallback(() => {
    const params = {};
    if (periodoId) params.periodo_id = periodoId;
    if (carreraId) params.carrera_id = carreraId;
    fetch({ params });
  }, [carreraId, periodoId, fetch]);

  // Cargar paralelos cuando cambie carreraId o periodoId; limpiar selección al cambiar
  useEffect(() => {
    setSelectedParalelo(null);
    if (carreraId && periodoId) {
      loadParalelos();
    }
  }, [carreraId, periodoId, loadParalelos]);

  /**
   * Función para recargar paralelos
   */
  const refetch = useCallback(() => {
    loadParalelos();
  }, [loadParalelos]);

  /**
   * Función para manejar la selección de un paralelo
   * Guarda el ID y datos básicos del paralelo para usar en el formulario
   * 
   * @param {Object} paralelo - Paralelo seleccionado (con id, nombre, codigo, etc.)
   */
  const onSelectParalelo = useCallback((paralelo) => {
    if (paralelo && paralelo.id) {
      // ✅ OPTIMIZACIÓN: Solo actualizar si realmente cambió
      setSelectedParalelo(prev => {
        // Si ya está seleccionado el mismo paralelo, mantener referencia
        if (prev?.id === paralelo.id) {
          return prev;
        }
        
        // Si cambió, crear nuevo objeto
        return {
          id: paralelo.id,
          nombre: paralelo.nombre,
          codigo: paralelo.codigo,
          carreraId: paralelo.carreraId,
          periodoId: paralelo.periodoId,
          materiaId: paralelo.materiaId,
        };
      });
    }
  }, []);
  
  // Pre-seleccionar paralelo si se proporciona initialParaleloId
  useEffect(() => {
    if (initialParaleloId && paralelos && paralelos.length > 0) {
      // Solo pre-seleccionar si no hay un paralelo seleccionado o si el ID es diferente
      if (!selectedParalelo || selectedParalelo.id !== Number(initialParaleloId)) {
        const paralelo = paralelos.find(p => p.id === Number(initialParaleloId));
        if (paralelo) {
          onSelectParalelo(paralelo);
        }
      }
    }
  }, [initialParaleloId, paralelos, selectedParalelo, onSelectParalelo]);

  // TODO: Aquí se puede agregar lógica específica de inscripciones si es necesario
  // Por ejemplo: filtrar paralelos según la carrera seleccionada, validaciones específicas, etc.

  // MANTENER REFERENCIA ESTABLE
  // Comparar valores, no solo referencias, para evitar recálculos innecesarios
  const prevResultRef = useRef(null);
  
  return useMemo(() => {
    const current = {
      paralelos,
      loading,
      error,
      refetch,
      selectedParalelo,
      onSelectParalelo,
    };

    const prev = prevResultRef.current;
    
    // Comparar valores, no referencias
    if (prev &&
        prev.loading === current.loading &&
        prev.error === current.error &&
        prev.refetch === current.refetch &&
        prev.paralelos === current.paralelos &&
        prev.selectedParalelo?.id === current.selectedParalelo?.id &&
        prev.onSelectParalelo === current.onSelectParalelo) {
      return prev;
    }

    prevResultRef.current = current;
    return current;
  }, [paralelos, loading, error, refetch, selectedParalelo, onSelectParalelo]);
};
