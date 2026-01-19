/**
 * Provider: BecasListProvider
 * 
 * Single Responsibility: Proporcionar estado compartido SOLO para la feature de lista de becas
 * 
 * Clean Architecture:
 * - Application Layer: Provider específico para la feature de listado
 * - Usa datos compartidos de BecasProvider (estado en memoria)
 * - Solo maneja lógica de UI (búsqueda, filtrado, formateo)
 * 
 * Ventajas:
 * - Aislamiento de errores: errores en registro no afectan la lista
 * - Performance: usa estado compartido en memoria (no recarga desde BD)
 * - Separación de responsabilidades: datos compartidos, UI específica
 */

import { useMemo } from 'react';
import { useBecasContext } from '@application-estudiantes/hooks';
import { useTableData } from '@molecules';
import { BecasListContext } from '@application-estudiantes/context/BecasListContext';

export const BecasListProvider = ({ children }) => {
    // Obtener datos compartidos del estado en memoria
    const { becas: becasData, loading, error, refetch } = useBecasContext();

    // Función para obtener los campos de búsqueda de una beca asignada
    const getSearchFields = useMemo(
        () => (beca) => [
            beca.student?.nombreCompleto || '',
            beca.student?.ci || '',
            beca.student?.codigoEstudiante || '',
            beca.scholarship?.nombre || '',
            beca.scholarship?.codigo || '',
            beca.management?.codigo || '',
            beca.management?.nombre || '',
            beca.state || '',
        ],
        []
    );

    // Hook genérico para manejo de búsqueda y filtrado (solo lógica de UI)
    const { searchText, setSearchText, filteredData } = useTableData(
        becasData,
        getSearchFields
    );

    const value = {
        becas: filteredData,
        loading,
        error,
        refetch,
        searchText,
        setSearchText,
    };

    return (
        <BecasListContext.Provider value={value}>
            {children}
        </BecasListContext.Provider>
    );
};
