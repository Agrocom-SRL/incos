/**
 * Provider: StudentProvider
 * 
 * Single Responsibility: Solo maneja el estado compartido del módulo de estudiantes
 * Open/Closed: Abierto para extensión, cerrado para modificación
 * 
 * Por ahora solo maneja el listado de estudiantes.
 * Cuando se implementen otras funcionalidades (registro, actualización), se pueden agregar hooks aquí.
 */

import { useStudentsList } from '../hooks';
import { StudentContext } from '../context/StudentContext';

export const StudentProvider = ({ children }) => {
  // Hook para obtener lista de estudiantes (GET)
  const {
    estudiantes: estudiantesList,
    loading: loadingList,
    error: listError,
    refetch: refetchList,
  } = useStudentsList();

  const value = {
    // Datos de listado
    estudiantesList,
    
    // Acciones
    refetchList,
    
    // Estados de carga
    loading: loadingList,
    loadingList,
    
    // Errores
    error: listError,
    listError,
  };

  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  );
};

