/**
 * Hook: useCarrerasList
 * 
 * Single Responsibility: Gestionar la lógica de UI para la lista de carreras
 * 
 * Este hook:
 * - Usa useCarrerasApi para obtener los datos de la API
 * - Usa useTableData para manejar la búsqueda y filtrado
 * 
 * Nota: Este hook es específico para la feature de LISTADO de carreras.
 * Para otras features, crear hooks separados.
 * 
 * Ubicación: application/modules/configuracion/academico/carreras/hooks
 */

import { useMemo } from 'react';
import { useCarrerasApi } from './useCarrerasApi';
import { useTableData } from '@molecules';

export const useCarrerasList = () => {
    // Obtener datos de carreras desde la API
    const { carreras, loading, error, refetch } = useCarrerasApi();

    // Función para obtener los campos de búsqueda de una carrera
    const getSearchFields = useMemo(
        () => (carrera) => [
            carrera.nombre,
            carrera.codigo,
            carrera.tituloOtorgado,
        ],
        []
    );

  // Hook genérico para manejo de búsqueda y filtrado
  const { searchText, setSearchText, filteredData } = useTableData(
    carreras,
    getSearchFields
  );

  return {
    carreras: filteredData,
    loading,
    error,
    refetch,
    searchText,
    setSearchText,
  };
};

