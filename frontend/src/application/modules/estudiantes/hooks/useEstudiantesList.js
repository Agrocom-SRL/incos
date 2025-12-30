/**
 * Hook: useEstudiantesList
 * 
 * Single Responsibility: Gestionar la lógica de UI para la lista de estudiantes
 * 
 * Este hook:
 * - Usa useEstudiantesApi para obtener los datos de la API
 * - Usa useTableData para manejar la búsqueda y filtrado
 * - Proporciona funciones auxiliares para formateo (getFullName)
 * 
 * Nota: Este hook es específico para la feature de LISTADO de estudiantes.
 * Para otras features (becas, licencias, documentos), crear hooks separados:
 * - useEstudiantesBecas
 * - useEstudiantesLicencias
 * - useEstudiantesDocumentos
 */

import { useMemo } from 'react';
import { useEstudiantesApi } from './useEstudiantesApi';
import { useTableData } from '@molecules';

export const useEstudiantesList = () => {
  // Obtener datos de estudiantes desde la API
  const { estudiantes, loading, error, refetch } = useEstudiantesApi();

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

  // Hook genérico para manejo de búsqueda y filtrado
  const { searchText, setSearchText, filteredData } = useTableData(
    estudiantes,
    getSearchFields
  );

  // Función auxiliar para formateo
  const getFullName = useMemo(
    () => (estudiante) => estudiante.nombreCompleto || 'Sin nombre',
    []
  );

  return {
    estudiantes: filteredData,
    loading,
    error,
    refetch,
    searchText,
    setSearchText,
    getFullName,
  };
};

