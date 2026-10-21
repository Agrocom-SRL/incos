/**
 * Hook: useInscripcionNuevaStudentSearch
 *
 * Single Responsibility: Orquestar la búsqueda y selección de estudiantes para
 * el wizard de inscripción.
 *
 * Clean Architecture:
 * - Application Layer: hook feature que encapsula la dependencia del módulo de
 *   estudiantes (useSearchStudentsForInscripcion / useGetStudentById).
 *
 * Comportamiento del paso Buscar (plan matricula-wizard-rediseno §B1):
 * - Estado inicial (solo entrada desde la lista, sin studentId): se cargan
 *   sugerencias `solo_nuevos=1&limit=10` — estudiantes sin ninguna matrícula —
 *   y se muestran en la misma lista de resultados (isShowingSuggestions).
 * - Con un término de ≥2 caracteres se pasa a la búsqueda normal; al limpiar
 *   el input vuelven las sugerencias.
 * - Seleccionar a alguien ya matriculado en la gestión vigente se bloquea con
 *   un message.error (sin Alerts fijos).
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { App } from 'antd';
import { useSearchStudentsForInscripcion, useGetStudentById } from '@application-matricula/admision/hooks/api';
import { buildPersonDisplayData } from '@application/utils/formatters';

/** Cantidad de sugerencias iniciales (estudiantes nuevos sin matrícula). */
const SUGERENCIAS_LIMIT = 10;

/** Longitud mínima del término para pasar de sugerencias a búsqueda normal. */
const MIN_SEARCH_LENGTH = 2;

/**
 * Prioridad de la lista visible (misma regla que el ORDER BY del backend, aplicada
 * también en cliente para que el orden no dependa del origen de los datos):
 * 1) quien puede matricularse antes que quien ya tiene matrícula en la gestión,
 * 2) dentro de cada bloque, los nuevos en el sistema (sin ninguna inscripción) primero.
 */
const ordenarPorPrioridadMatricula = (students) => {
  if (!Array.isArray(students) || students.length < 2) return students || [];
  return [...students].sort((a, b) => {
    const matriculado = Number(!!a.yaMatriculadoGestionActual) - Number(!!b.yaMatriculadoGestionActual);
    if (matriculado !== 0) return matriculado;
    return Number(b.esNuevoSistema === true) - Number(a.esNuevoSistema === true);
  });
};

/** Mensaje de bloqueo cuando se intenta seleccionar un estudiante ya matriculado en la gestión vigente. */
const buildYaMatriculadoMessage = (student) => {
  const gestion = student?.gestionActualNombre || (student?.gestionActualAnio ? `gestión ${student.gestionActualAnio}` : 'la gestión vigente');
  return `${student?.nombreCompleto || 'Este estudiante'} ya está matriculado en ${gestion}. No puede volver a matricularlo.`;
};

/**
 * Hook para buscar y seleccionar estudiantes en el contexto de inscripción nueva
 *
 * @param {Object} options - Opciones del hook
 * @param {string|number|null} options.studentId - ID del estudiante para cargar automáticamente (opcional)
 * @returns {Object} students, loading, error, searchStudent, refetch, retry, searchTerm,
 *   selectedStudent, onSelectStudent, isShowingSuggestions, suggestionsEnabled
 */
export const useInscripcionNuevaStudentSearch = (options = {}) => {
  const { studentId = null } = options;
  const { message } = App.useApp();

  // Búsqueda de estudiantes para el wizard de inscripción: no excluye a los ya
  // matriculados en la gestión vigente, los anota con yaMatriculadoGestionActual.
  const { students, loading, error, searchStudent: apiSearchStudent, refetch } =
    useSearchStudentsForInscripcion();

  // Instancia independiente para las sugerencias iniciales (solo_nuevos=1).
  const {
    students: suggestions,
    loading: suggestionsLoading,
    error: suggestionsError,
    searchStudent: fetchSuggestions,
  } = useSearchStudentsForInscripcion();

  // Hook para obtener estudiante por ID (si se proporciona studentId)
  const { student: studentById, loading: loadingById, getStudentById } = useGetStudentById();

  // Estado para el estudiante seleccionado (se usará en step2 para cargar datos académicos)
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Término de la última búsqueda ejecutada: gobierna sugerencias vs. resultados.
  const [searchTerm, setSearchTerm] = useState('');

  // Sugerencias solo cuando la entrada es desde la lista (sin studentId del connector).
  const suggestionsEnabled = !studentId;
  const isShowingSuggestions = suggestionsEnabled && searchTerm.trim().length < MIN_SEARCH_LENGTH;

  // Carga inicial de sugerencias (una sola vez al montar, si aplica).
  const suggestionsLoadedRef = useRef(false);
  useEffect(() => {
    if (!suggestionsEnabled || suggestionsLoadedRef.current) return;
    suggestionsLoadedRef.current = true;
    fetchSuggestions('', { soloNuevos: true, limit: SUGERENCIAS_LIMIT });
  }, [suggestionsEnabled, fetchSuggestions]);

  /**
   * Ejecuta la búsqueda del paso Buscar. Con término < 2 caracteres (incluye
   * limpiar el input) no llama a la API y vuelve a mostrar las sugerencias.
   */
  const searchStudent = useCallback(
    (value) => {
      const term = String(value ?? '').trim();
      setSearchTerm(term);
      if (term.length >= MIN_SEARCH_LENGTH) {
        apiSearchStudent(term);
      }
    },
    [apiSearchStudent],
  );

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
          // El detalle del estudiante no informa inscripciones previas; el dato
          // llega después con el contexto de matrícula (esNuevoSistema=null = desconocido).
          esNuevoSistema: null,
          totalInscripciones: null,
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- selectedStudent se lee solo para evitar re-hidratar; incluirlo provocaría bucle
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
      // Ya matriculado en la gestión vigente: bloquear la selección (no avanzar el
      // wizard con este estudiante) y avisar sin convertirlo en un Alert fijo.
      if (student.yaMatriculadoGestionActual) {
        message.error(buildYaMatriculadoMessage(student));
        return;
      }
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
          // Flags de la vista 153 ampliada (null = dato aún no disponible).
          esNuevoSistema: student.esNuevoSistema ?? null,
          totalInscripciones: student.totalInscripciones ?? null,
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
  }, [getStudentById, message]);

  /**
   * Reintento del estado de error de la lista: repite la última carga real
   * (sugerencias iniciales o búsqueda por término), sin tocar el input.
   */
  const retry = useCallback(() => {
    if (isShowingSuggestions) {
      fetchSuggestions('', { soloNuevos: true, limit: SUGERENCIAS_LIMIT });
      return;
    }
    const term = searchTerm.trim();
    if (term.length >= MIN_SEARCH_LENGTH) {
      apiSearchStudent(term);
    }
  }, [isShowingSuggestions, fetchSuggestions, searchTerm, apiSearchStudent]);

  // Lista visible del paso: sugerencias iniciales o resultados de la búsqueda,
  // siempre con los matriculables (y dentro de ellos, los nuevos) al principio.
  const visibleStudents = useMemo(
    () => ordenarPorPrioridadMatricula(isShowingSuggestions ? suggestions : students),
    [isShowingSuggestions, suggestions, students],
  );
  const visibleError = isShowingSuggestions ? suggestionsError : error;

  // Combinar estados de loading (búsqueda, sugerencias o carga por ID)
  const combinedLoading = (isShowingSuggestions ? suggestionsLoading : loading) || loadingById;

  // Referencia estable: useMemo basta — setSelectedStudent ya conserva la
  // identidad del objeto cuando el id no cambia (guard interno en el setter).
  return useMemo(
    () => ({
      students: visibleStudents,
      loading: combinedLoading,
      error: visibleError,
      searchStudent,
      refetch,
      retry,
      searchTerm,
      selectedStudent,
      onSelectStudent,
      isShowingSuggestions,
      suggestionsEnabled,
    }),
    [
      visibleStudents,
      combinedLoading,
      visibleError,
      searchStudent,
      refetch,
      retry,
      searchTerm,
      selectedStudent,
      onSelectStudent,
      isShowingSuggestions,
      suggestionsEnabled,
    ],
  );
};
