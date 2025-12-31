/**
 * Hook: useDiscapacidadesList
 * 
 * Single Responsibility: Gestionar la lógica de UI para la lista de discapacidades
 * 
 * Este hook:
 * - Usa useDiscapacidadesApi para obtener los datos de la API
 * - Usa useTableData para manejar la búsqueda y filtrado
 * 
 * Nota: Este hook es específico para la feature de LISTADO de discapacidades.
 * Para otras features, crear hooks separados.
 * 
 * Ubicación: application/modules/configuracion/complementario/discapacidad/hooks
 */

import { useMemo } from 'react';
import { useDiscapacidadesApi } from './useDiscapacidadesApi';
import { useTableData } from '@molecules';

export const useDiscapacidadesList = () => {
    // Obtener datos de discapacidades desde la API
    const { discapacidades, loading, error, refetch } = useDiscapacidadesApi();

    // Función para obtener los campos de búsqueda de una discapacidad
    const getSearchFields = useMemo(
        () => (discapacidad) => [
            discapacidad.nombre,
            discapacidad.descripcion,
        ],
        []
    );

  // Hook genérico para manejo de búsqueda y filtrado
  const { searchText, setSearchText, filteredData } = useTableData(
    discapacidades,
    getSearchFields
  );

  return {
    discapacidades: filteredData,
    loading,
    error,
    refetch,
    searchText,
    setSearchText,
  };
};

