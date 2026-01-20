/**
 * Provider: InscripcionesListProvider
 * 
 * Single Responsibility: Proporcionar estado compartido SOLO para la feature de lista de inscripciones
 * 
 * Clean Architecture:
 * - Application Layer: Provider específico para la feature de listado
 * - Usa datos compartidos de InscripcionesProvider (estado en memoria)
 * - Solo maneja lógica de UI (búsqueda, filtrado, formateo)
 * 
 * Ventajas:
 * - Aislamiento de errores: errores en registro no afectan la lista
 * - Performance: usa estado compartido en memoria (no recarga desde BD)
 * - Separación de responsabilidades: datos compartidos, UI específica
 */

import { useMemo } from 'react';
import { useInscripcionesContext } from '@application-inscripciones/hooks';
import { useTableData } from '@molecules';
import { InscripcionesListContext } from '@application-inscripciones/context/InscripcionesListContext';

export const InscripcionesListProvider = ({ children }) => {
    // Obtener datos compartidos del estado en memoria
    const { inscripciones: inscripcionesData, loading, error, refetch } = useInscripcionesContext();

    // Función para obtener los campos de búsqueda de una inscripción
    const getSearchFields = useMemo(
        () => (inscripcion) => {
            // Priorizar campos enriquecidos del backend (estudiante, carrera)
            const student = inscripcion.estudiante || inscripcion.student || inscripcion.enrollment?.student;
            const carrera = inscripcion.carrera || inscripcion.enrollment?.carrera;
            const gestion = inscripcion.gestion || inscripcion.enrollment?.gestion;
            return [
                student?.nombreCompleto || student?.nombre || '',
                student?.codigoEstudiante || '',
                student?.ci || '',
                inscripcion.codigo || inscripcion.enrollment?.codigo || '',
                carrera?.nombre || carrera?.codigo || '',
                gestion?.nombre || gestion?.anio || '',
                inscripcion.anioCarrera || inscripcion.enrollment?.anioCarrera || '',
                inscripcion.paralelo?.nombre || inscripcion.enrollment?.paralelo?.nombre || '',
            ];
        },
        []
    );

    // Hook genérico para manejo de búsqueda y filtrado (solo lógica de UI)
    const { searchText, setSearchText, filteredData } = useTableData(
        inscripcionesData,
        getSearchFields
    );

    const value = {
        inscripciones: filteredData,
        loading,
        error,
        refetch,
        searchText,
        setSearchText,
    };

    return (
        <InscripcionesListContext.Provider value={value}>
            {children}
        </InscripcionesListContext.Provider>
    );
};
