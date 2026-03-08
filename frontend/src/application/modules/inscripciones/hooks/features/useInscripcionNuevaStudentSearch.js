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
  
  // Cuando se carga el estudiante por ID, seleccionarlo con datos académicos (tipoAdmision, carrera)
  useEffect(() => {
    if (studentById && studentId) {
      // useGetStudentById retorna { student: result.data }; result.data = { student, guardians, academicData, ... }
      let studentData = null;
      const payload = studentById;
      if (payload?.student?.id) studentData = payload.student;
      else if (payload?.id) studentData = payload;
      else if (payload?.data?.student) studentData = payload.data.student;
      const academicData = payload?.academicData ?? null;
      const transfer = payload?.transfer ?? null;
      const traspasoAnioCursado = transfer?.anioCursado ?? null;

      if (studentData?.id && (!selectedStudent || selectedStudent.id !== studentData.id)) {
        const { ciCompleto, nombreCompleto } = buildPersonDisplayData({
          ci: studentData.ci,
          expedicion: studentData.expedition || studentData.expedicion,
          nombres: studentData.firstName || studentData.nombres,
          apellidoPaterno: studentData.lastName || studentData.apellidoPaterno,
          apellidoMaterno: studentData.motherLastName || studentData.apellidoMaterno,
        });
        const careerId =
          academicData?.careerId ??
          academicData?.carreraId ??
          academicData?.carrera_id ??
          studentData.careerId ??
          studentData.carreraId ??
          studentData.carrera_id;
        const tipoAdmision = academicData?.tipoAdmision ?? academicData?.admissionType ?? (careerId ? 'ANTIGUO' : 'NUEVO');
        setSelectedStudent({
          id: studentData.id,
          codigoEstudiante: studentData.codigoEstudiante || studentData.studentCode,
          nombreCompleto: studentData.nombreCompleto || nombreCompleto,
          ciCompleto: studentData.ciCompleto || ciCompleto,
          careerId: careerId || null,
          carreraId: careerId || null,
          tipoAdmision,
          carreraNombre: academicData?.careerName ?? academicData?.carreraNombre ?? null,
          traspasoAnioCursado,
        });
      }
    }
  }, [studentById, studentId]);

  // Cuando se cargó estudiante por ID tras selección en búsqueda (sin studentId), enriquecer selectedStudent con datos académicos
  useEffect(() => {
    if (!studentById || studentId) return;
    const payload = studentById;
    let studentData = payload?.student?.id ? payload.student : payload?.id ? payload : payload?.data?.student ? payload.data : null;
    if (!studentData?.id) studentData = payload?.student ?? payload;
    const academicData = payload?.academicData ?? null;
    const transfer = payload?.transfer ?? null;
    const careerId =
      academicData?.careerId ??
      academicData?.carreraId ??
      academicData?.carrera_id ??
      studentData?.careerId ??
      studentData?.carreraId ??
      studentData?.carrera_id ??
      null;
    setSelectedStudent(prev => {
      if (!prev || prev.id !== studentData.id) return prev;
      if (prev.careerId != null || prev.carreraId != null) return prev;
      return {
        ...prev,
        careerId: careerId ?? null,
        carreraId: careerId ?? null,
        tipoAdmision:
          academicData?.tipoAdmision ??
          academicData?.admissionType ??
          (careerId ? 'ANTIGUO' : 'NUEVO'),
        carreraNombre: academicData?.careerName ?? academicData?.carreraNombre ?? null,
        traspasoAnioCursado: transfer?.anioCursado ?? prev.traspasoAnioCursado ?? null,
      };
    });
  }, [studentById, studentId]);

  /**
   * Función para manejar la selección de un estudiante
   * Guarda el ID y datos básicos del estudiante para usarlos en step2
   * 
   * @param {Object} student - Estudiante seleccionado (con id, codigoEstudiante, nombreCompleto, ciCompleto)
   */
  const onSelectStudent = useCallback((student) => {
    if (student && student.id) {
      setSelectedStudent(prev => {
        if (prev?.id === student.id) {
          return prev;
        }
        const careerId =
          student.careerId ??
          student.carreraId ??
          student.career_id ??
          student.carrera_id ??
          null;
        const tipoAdmision =
          student.tipoAdmision ??
          student.admissionType ??
          (careerId ? 'ANTIGUO' : 'NUEVO');
        return {
          id: student.id,
          codigoEstudiante: student.codigoEstudiante ?? student.studentCode,
          nombreCompleto: student.nombreCompleto,
          ciCompleto: student.ciCompleto,
          careerId: careerId ?? null,
          carreraId: careerId ?? null,
          tipoAdmision,
          carreraNombre: student.carreraNombre ?? student.careerName ?? null,
        };
      });
      // Cargar datos completos (académicos) si el estudiante no trae carrera/tipoAdmision
      const hasCareer =
        student.careerId ??
        student.carreraId ??
        student.career_id ??
        student.carrera_id;
      if (!hasCareer) {
        getStudentById(student.id);
      }
    }
  }, [getStudentById]);

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
