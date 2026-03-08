/**
 * Provider: StudentDetailProvider
 *
 * Single Responsibility: Proporcionar estado compartido para el detalle de un estudiante
 *
 * Clean Architecture:
 * - Application Layer: Provider específico para la feature de detalle de estudiante
 * - Usa useStudentDetail (Global State) para obtener, mapear y exponer el detalle
 * - No duplica lógica de API/mapeo; el hook global se encarga de eso
 *
 * Ventajas:
 * - Aislamiento: estado independiente para el detalle
 * - Reutilizable: puede usarse en cualquier componente que necesite el detalle
 * - Caché: mantiene el estudiante cargado mientras el provider esté montado
 * - Carga automática: carga el estudiante automáticamente cuando se proporciona studentId
 */

import { useStudentDetail } from '@application-estudiantes/hooks';
import { StudentDetailContext } from '@application-estudiantes/context/StudentDetailContext';

export const StudentDetailProvider = ({ children, studentId }) => {
  const value = useStudentDetail(studentId);

  return <StudentDetailContext.Provider value={value}>{children}</StudentDetailContext.Provider>;
};

