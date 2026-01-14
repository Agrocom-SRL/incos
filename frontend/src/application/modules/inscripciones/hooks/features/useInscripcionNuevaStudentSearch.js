/**
 * Hook: useInscripcionNuevaStudentSearch
 * 
 * Single Responsibility: Orquestar la búsqueda y selección de estudiantes para el wizard de inscripción
 * 
 * Clean Architecture:
 * - Application Layer: Hook feature que encapsula la dependencia del módulo de estudiantes
 * - Usa hooks de API del módulo de estudiantes (cross-module dependency)
 * 
 * Este hook:
 * - Encapsula el uso de useSearchStudent del módulo de estudiantes
 * - Maneja la selección del estudiante (guarda el ID para usar en step2)
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
import { useSearchStudent } from '@application-estudiantes/hooks/api';

// Flag para activar/desactivar logs de renderizado (solo desarrollo)
const ENABLE_RENDER_LOGS = import.meta.env.DEV && true; // Cambiar a true para activar logs

/**
 * Hook para buscar y seleccionar estudiantes en el contexto de inscripción nueva
 * 
 * @returns {Object} Objeto con students, loading, error, searchStudent, refetch, selectedStudent, onSelectStudent
 */
export const useInscripcionNuevaStudentSearch = () => {
  // Usar el hook genérico de búsqueda de estudiantes
  const { students, loading, error, searchStudent, refetch } = useSearchStudent();

  // Estado para el estudiante seleccionado (se usará en step2 para cargar datos académicos)
  const [selectedStudent, setSelectedStudent] = useState(null);

  /**
   * Función para manejar la selección de un estudiante
   * Guarda el ID y datos básicos del estudiante para usarlos en step2
   * 
   * @param {Object} student - Estudiante seleccionado (con id, codigoEstudiante, nombreCompleto, ciCompleto)
   */
  const onSelectStudent = useCallback((student) => {
    if (ENABLE_RENDER_LOGS) {
      console.log('🔵 [Hook] onSelectStudent - CALLBACK EJECUTADO', {
        studentId: student?.id,
        timestamp: new Date().toISOString(),
        stackTrace: new Error().stack?.split('\n').slice(1, 4).join('\n'),
      });
    }
    
    if (student && student.id) {
      // ✅ OPTIMIZACIÓN: Solo actualizar si realmente cambió
      setSelectedStudent(prev => {
        // Si ya está seleccionado el mismo estudiante, mantener referencia
        if (prev?.id === student.id) {
          if (ENABLE_RENDER_LOGS) {
            console.log('✅ [Hook] onSelectStudent - MANTENIENDO referencia (mismo estudiante seleccionado)', {
              studentId: student.id,
              prevStudentId: prev?.id,
            });
          }
          return prev;
        }
        
        if (ENABLE_RENDER_LOGS) {
          console.log('✅ [Hook] onSelectStudent - CAMBIANDO estudiante seleccionado', {
            prevStudentId: prev?.id,
            newStudentId: student.id,
          });
        }
        
        // Si cambió, crear nuevo objeto
        return {
          id: student.id,
          codigoEstudiante: student.codigoEstudiante,
          nombreCompleto: student.nombreCompleto,
          ciCompleto: student.ciCompleto,
        };
      });
    }
  }, []);

  // TODO: Aquí se puede agregar lógica específica de inscripciones si es necesario
  // Por ejemplo: filtrar estudiantes que ya están inscritos, validaciones específicas, etc.

  // MANTENER REFERENCIA ESTABLE
  // Comparar valores, no solo referencias, para evitar recálculos innecesarios
  const prevResultRef = useRef(null);
  
  return useMemo(() => {
    const current = {
      students,
      loading,
      error,
      searchStudent,
      refetch,
      selectedStudent,
      onSelectStudent,
    };

    const prev = prevResultRef.current;
    
    // Comparar valores, no referencias
    if (prev &&
        prev.loading === current.loading &&
        prev.error === current.error &&
        prev.searchStudent === current.searchStudent &&
        prev.refetch === current.refetch &&
        prev.students === current.students &&
        prev.selectedStudent?.id === current.selectedStudent?.id &&
        prev.onSelectStudent === current.onSelectStudent) {
      
      if (ENABLE_RENDER_LOGS) {
        console.log('✅ [Hook] useInscripcionNuevaStudentSearch - MANTENIENDO referencia');
      }
      return prev;
    }

    if (ENABLE_RENDER_LOGS) {
      console.log('✅ [Hook] useInscripcionNuevaStudentSearch - RECREANDO objeto retornado', {
        studentsCount: students?.length || 0,
        loading,
        hasSelectedStudent: !!selectedStudent,
        studentsRef: students ? 'exists' : 'null',
        searchStudentRef: searchStudent ? 'exists' : 'null',
        refetchRef: refetch ? 'exists' : 'null',
      });
    }
    prevResultRef.current = current;
    return current;
  }, [students, loading, error, searchStudent, refetch, selectedStudent, onSelectStudent]);
};
