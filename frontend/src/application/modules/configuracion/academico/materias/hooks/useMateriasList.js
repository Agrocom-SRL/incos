/**
 * Hook: useMateriasList
 * 
 * Single Responsibility: Gestionar la lógica de UI para la lista de materias
 * 
 * Este hook:
 * - Usa useMateriasApi para obtener los datos de la API
 * - Usa useTableData para manejar la búsqueda y filtrado
 * 
 * Nota: Este hook es específico para la feature de LISTADO de materias.
 * Para otras features, crear hooks separados.
 * 
 * Ubicación: application/modules/configuracion/academico/materias/hooks
 */

import { useMemo } from 'react';
import { useMateriasApi } from './useMateriasApi';
import { useTableData } from '@molecules';

export const useMateriasList = () => {
    // Obtener datos de materias desde la API
    const { materias, loading, error, refetch } = useMateriasApi();

    // Función para obtener los campos de búsqueda de una materia
    const getSearchFields = useMemo(
        () => (materia) => [
            materia.nombre,
            materia.codigo,
            materia.nombreCorto,
            materia.tipo,
        ],
        []
    );

  // Hook genérico para manejo de búsqueda y filtrado
  const { searchText, setSearchText, filteredData } = useTableData(
    materias,
    getSearchFields
  );

  return {
    materias: filteredData,
    loading,
    error,
    refetch,
    searchText,
    setSearchText,
  };
};

