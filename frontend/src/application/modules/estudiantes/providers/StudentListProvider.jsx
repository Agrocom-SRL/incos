/**
 * Provider: StudentListProvider
 * 
 * Single Responsibility: Proporcionar estado compartido SOLO para la feature de lista de estudiantes
 * 
 * Clean Architecture:
 * - Application Layer: Provider específico para la feature de listado
 * - Usa datos compartidos de StudentDataProvider (estado en memoria)
 * - Solo maneja lógica de UI (búsqueda, filtrado, formateo)
 * 
 * Ventajas:
 * - Aislamiento de errores: errores en registro no afectan la lista
 * - Performance: usa estado compartido en memoria (no recarga desde BD)
 * - Separación de responsabilidades: datos compartidos, UI específica
 */

import { useMemo } from 'react';
import { useStudentContext } from '@application-estudiantes/hooks';
import { useTableData } from '@molecules';
import { StudentListContext } from '@application-estudiantes/context/StudentListContext';

export const StudentListProvider = ({ children }) => {
    // Obtener datos compartidos del estado en memoria
    const { estudiantes: estudiantesData, loading, error, refetch } = useStudentContext();

    // Función para obtener los campos de búsqueda de un estudiante
    const getSearchFields = useMemo(
        () => (estudiante) => [
            estudiante.nombreCompleto,
            estudiante.codigoEstudiante,
            estudiante.ciCompleto,
            estudiante.emailPersonal,
            estudiante.celular,
        ],
        []
    );

    // Hook genérico para manejo de búsqueda y filtrado (solo lógica de UI)
    const { searchText, setSearchText, filteredData } = useTableData(
        estudiantesData,
        getSearchFields
    );

    const value = {
        estudiantes: filteredData,
        loading,
        error,
        refetch,
        searchText,
        setSearchText,
    };

    return (
        <StudentListContext.Provider value={value}>
            {children}
        </StudentListContext.Provider>
    );
};

