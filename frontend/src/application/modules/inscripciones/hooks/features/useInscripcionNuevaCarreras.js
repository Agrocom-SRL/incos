/**
 * Hook: useInscripcionNuevaCarreras
 * 
 * Single Responsibility: Orquestar la carga y selección de carreras para el wizard de inscripción
 * 
 * Clean Architecture:
 * - Application Layer: Hook feature que encapsula la dependencia del módulo de carreras
 * - Usa hooks de API del módulo de configuración académica (cross-module dependency)
 * 
 * Este hook:
 * - Encapsula el uso de useCarrerasApi del módulo de carreras
 * - Maneja la selección de la carrera (guarda el ID para usar en step2 y crear estudiantes_datos_academicos)
 * - Agrega lógica específica para el wizard de inscripciones si es necesario
 * - Expone una interfaz específica para el contexto de inscripciones
 * 
 * Ventajas:
 * - Encapsula la dependencia entre módulos
 * - Permite agregar lógica específica de inscripciones sin modificar el hook genérico
 * - Facilita el testing y mantenimiento
 * - Separa la lógica del Provider (Provider solo orquesta)
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import { useCarrerasApi } from '@application-configuracion/academico/carreras/hooks/useCarrerasApi';

/**
 * Hook para cargar y seleccionar carreras en el contexto de inscripción nueva
 * 
 * @returns {Object} Objeto con carreras, loading, error, refetch, selectedCarrera, onSelectCarrera
 */
export const useInscripcionNuevaCarreras = () => {
  // Usar el hook genérico de carreras
  const { carreras, loading, error, refetch } = useCarrerasApi();

  // Estado para la carrera seleccionada (se usará para crear estudiantes_datos_academicos)
  const [selectedCarrera, setSelectedCarrera] = useState(null);

  /**
   * Función para manejar la selección de una carrera
   * Guarda el ID y datos básicos de la carrera para crear estudiantes_datos_academicos
   * 
   * @param {Object} carrera - Carrera seleccionada (con id, nombre, codigo, etc.)
   */
  const onSelectCarrera = useCallback((carrera) => {
    if (carrera && carrera.id) {
      // ✅ OPTIMIZACIÓN: Solo actualizar si realmente cambió
      setSelectedCarrera(prev => {
        // Si ya está seleccionada la misma carrera, mantener referencia
        if (prev?.id === carrera.id) {
          return prev;
        }
        
        // Si cambió, crear nuevo objeto
        return {
          id: carrera.id,
          nombre: carrera.nombre,
          codigo: carrera.codigo,
        };
      });
    }
  }, []);

  // TODO: Aquí se puede agregar lógica específica de inscripciones si es necesario
  // Por ejemplo: filtrar carreras según el estudiante seleccionado, validaciones específicas, etc.

  // MANTENER REFERENCIA ESTABLE
  // Comparar valores, no solo referencias, para evitar recálculos innecesarios
  const prevResultRef = useRef(null);
  
  return useMemo(() => {
    const current = {
      carreras,
      loading,
      error,
      refetch,
      selectedCarrera,
      onSelectCarrera,
    };

    const prev = prevResultRef.current;
    
    // Comparar valores, no referencias
    if (prev &&
        prev.loading === current.loading &&
        prev.error === current.error &&
        prev.refetch === current.refetch &&
        prev.carreras === current.carreras &&
        prev.selectedCarrera?.id === current.selectedCarrera?.id &&
        prev.onSelectCarrera === current.onSelectCarrera) {
      return prev;
    }

    prevResultRef.current = current;
    return current;
  }, [carreras, loading, error, refetch, selectedCarrera, onSelectCarrera]);
};
