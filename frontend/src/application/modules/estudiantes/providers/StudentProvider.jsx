/**
 * Provider: StudentProvider
 * 
 * Single Responsibility: Exponer el estado global de estudiantes vía Context
 * 
 * Clean Architecture:
 * - Application Layer: Provider que expone estado global usando un hook dedicado
 * - NO contiene lógica, solo expone el estado vía Context
 * 
 * Ventajas:
 * - Separación de responsabilidades: la lógica está en useStudentData
 * - Estado global: todos los componentes pueden acceder a los mismos datos
 * - Actualización optimista: agregar/editar sin recargar desde BD
 * 
 * Estrategia:
 * - Usa useStudentData para gestionar el estado global
 * - Expone el estado vía StudentContext
 */

import { useStudentData } from '@application-estudiantes/hooks';
import { StudentContext } from '@application-estudiantes/context/StudentContext';

export const StudentProvider = ({ children }) => {
    // Hook dedicado para gestionar el estado global de datos
    const studentData = useStudentData();

    return (
        <StudentContext.Provider value={studentData}>
            {children}
        </StudentContext.Provider>
    );
};

