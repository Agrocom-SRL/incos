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

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useSearchStudent, useGetStudentById } from '@application-estudiantes/hooks/api';
import { buildPersonDisplayData } from '@application/utils/formatters';

/**
 * Hook para buscar y seleccionar estudiantes en el contexto de inscripción nueva
 * 
 * @param {Object} options - Opciones del hook
 * @param {string|number|null} options.studentId - ID del estudiante para cargar automáticamente (opcional)
 * @returns {Object} Objeto con students, loading, error, searchStudent, refetch, selectedStudent, onSelectStudent
 */
export const useInscripcionNuevaStudentSearch = (options = {}) => {
  const { studentId = null } = options;
  
  // Usar el hook genérico de búsqueda de estudiantes
  const { students, loading, error, searchStudent, refetch } = useSearchStudent();
  
  // Hook para obtener estudiante por ID (si se proporciona studentId)
  const { student: studentById, loading: loadingById, getStudentById } = useGetStudentById();

  // Estado para el estudiante seleccionado (se usará en step2 para cargar datos académicos)
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Cargar estudiante automáticamente si se proporciona studentId
  useEffect(() => {
    if (studentId) {
      // Solo cargar si no hay estudiante seleccionado o si el ID es diferente
      if (!selectedStudent || selectedStudent.id !== Number(studentId)) {
        getStudentById(studentId);
      }
    }
  }, [studentId, getStudentById, selectedStudent]);
  
  // Cuando se carga el estudiante por ID, seleccionarlo automáticamente
  useEffect(() => {
    if (studentById && studentId) {
      // El hook useGetStudentById retorna { student: data } donde data es el objeto del estudiante
      // studentById ya es el objeto del estudiante extraído por createApiHook usando dataKey: 'student'
      // Pero puede venir con estructura anidada del backend, así que verificamos diferentes posibilidades
      let studentData = null;
      
      // Intentar diferentes estructuras posibles del objeto retornado
      if (studentById.id) {
        // Si tiene id directamente, es el objeto del estudiante
        studentData = studentById;
      } else if (studentById.student && studentById.student.id) {
        // Si tiene una propiedad student con id, usar esa
        studentData = studentById.student;
      } else if (studentById.data?.student) {
        // Si tiene data.student, usar esa
        studentData = studentById.data.student;
      }
      
      if (studentData && studentData.id && (!selectedStudent || selectedStudent.id !== studentData.id)) {
        // Construir CI completo y nombre completo usando formatters
        // El backend puede retornar datos en inglés (firstName, lastName) o español
        const { ciCompleto, nombreCompleto } = buildPersonDisplayData({
          ci: studentData.ci,
          expedicion: studentData.expedition || studentData.expedicion,
          nombres: studentData.firstName || studentData.nombres,
          apellidoPaterno: studentData.lastName || studentData.apellidoPaterno,
          apellidoMaterno: studentData.motherLastName || studentData.apellidoMaterno,
        });
        
        setSelectedStudent({
          id: studentData.id,
          codigoEstudiante: studentData.codigoEstudiante || studentData.studentCode,
          nombreCompleto: studentData.nombreCompleto || nombreCompleto,
          ciCompleto: studentData.ciCompleto || ciCompleto,
          careerId: studentData.careerId || studentData.carreraId,
          carreraId: studentData.carreraId || studentData.careerId,
        });
      }
    }
  }, [studentById, studentId]); // Remover selectedStudent de dependencias para permitir actualizaciones

  /**
   * Función para manejar la selección de un estudiante
   * Guarda el ID y datos básicos del estudiante para usarlos en step2
   * 
   * @param {Object} student - Estudiante seleccionado (con id, codigoEstudiante, nombreCompleto, ciCompleto)
   */
  const onSelectStudent = useCallback((student) => {
    if (student && student.id) {
      // ✅ OPTIMIZACIÓN: Solo actualizar si realmente cambió
      setSelectedStudent(prev => {
        // Si ya está seleccionado el mismo estudiante, mantener referencia
        if (prev?.id === student.id) {
          return prev;
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
  
  // Combinar estados de loading (búsqueda o carga por ID)
  const combinedLoading = loading || loadingById;
  
  return useMemo(() => {
    const current = {
      students,
      loading: combinedLoading,
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
      return prev;
    }

    prevResultRef.current = current;
    return current;
  }, [students, combinedLoading, error, searchStudent, refetch, selectedStudent, onSelectStudent]);
};
