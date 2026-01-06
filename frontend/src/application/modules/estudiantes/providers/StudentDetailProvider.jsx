/**
 * Provider: StudentDetailProvider
 * 
 * Single Responsibility: Proporcionar estado compartido para el detalle de un estudiante
 * 
 * Clean Architecture:
 * - Application Layer: Provider específico para la feature de detalle de estudiante
 * - Usa useGetStudentById para obtener datos del backend
 * - Maneja el estado del estudiante completo con todos sus datos relacionados
 * 
 * Ventajas:
 * - Aislamiento: estado independiente para el detalle
 * - Reutilizable: puede usarse en cualquier componente que necesite el detalle
 * - Caché: mantiene el estudiante cargado mientras el provider esté montado
 * - Carga automática: carga el estudiante automáticamente cuando se proporciona studentId
 */

import { useEffect } from 'react';
import { useGetStudentById } from '@application-estudiantes/hooks/api';
import { StudentDetailContext } from '@application-estudiantes/context/StudentDetailContext';
import { mapEstudianteDetail } from '@application-estudiantes/mappers';

export const StudentDetailProvider = ({ children, studentId }) => {
  // Hook para obtener el estudiante por ID
  const { student: studentRaw, loading, error, getStudentById, refetch } = useGetStudentById();

  // Cargar automáticamente el estudiante cuando se proporciona studentId
  useEffect(() => {
    if (studentId) {
      getStudentById(studentId);
    }
  }, [studentId, getStudentById]);

  // Mapear los datos del estudiante usando el mapper
  const student = studentRaw ? mapEstudianteDetail(studentRaw) : null;

  const value = {
    student,
    loading,
    error,
    getStudentById,
    refetch: () => refetch(studentId),
  };

  return (
    <StudentDetailContext.Provider value={value}>
      {children}
    </StudentDetailContext.Provider>
  );
};

