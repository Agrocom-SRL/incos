/**
 * Provider: StudentProvider
 * 
 * Single Responsibility: Componer hooks y proporcionar estado compartido del módulo
 * Open/Closed: Abierto para extensión agregando hooks, cerrado para modificación
 * 
 * Estrategia de Diseño:
 * - Este Provider NO contiene lógica, solo COMPONE hooks
 * - Cada hook maneja su propia feature (useStudentsList, useStudentBecas, etc.)
 * - Agregar nuevos hooks cuando se implementen nuevas features
 * 
 * Features actuales:
 * - Listado de estudiantes (useStudentsList)
 * 
 * Features futuras (agregar cuando se implementen):
 * - Becas: useStudentBecas
 * - Licencias: useStudentLicencias
 * - Documentos: useStudentDocumentos
 */

import { useStudentsList } from '@application-estudiantes/hooks';
import { StudentContext } from '@application-estudiantes/context/StudentContext';

export const StudentProvider = ({ children }) => {
  // Hook para obtener lista de estudiantes
  const listData = useStudentsList();

  // Componer el valor del contexto: spread de todos los hooks
  const value = {
    ...listData,
  };

  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  );
};

