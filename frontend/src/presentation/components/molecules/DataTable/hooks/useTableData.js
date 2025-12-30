/**
 * useTableData - Hook para manejo de datos de tabla
 * 
 * Single Responsibility: Gestionar el estado y lógica de búsqueda/filtrado para tablas
 * 
 * Clean Architecture:
 * - Presentation Layer: Hook de React para manejar estado de UI de tablas
 * - Pertenece al componente DataTable
 * 
 * Este hook encapsula:
 * - Estado de búsqueda local
 * - Lógica de filtrado
 * - Funciones auxiliares para formateo
 * 
 * Nota: Este hook es genérico y reutilizable para cualquier tabla de datos
 */

import { useState, useMemo } from 'react';

/**
 * Hook genérico para manejo de datos de tabla con búsqueda
 * 
 * @param {Array} data - Datos a filtrar
 * @param {Function} searchFields - Función que retorna los campos a buscar de cada item
 * @returns {Object} - { searchText, setSearchText, filteredData }
 */
export const useTableData = (data = [], searchFields = (item) => []) => {
  const [searchText, setSearchText] = useState('');

  const filteredData = useMemo(() => {
    if (!searchText) return data;
    
    const searchLower = searchText.toLowerCase();
    return data.filter(item => {
      const fields = searchFields(item);
      return fields.some(field => 
        String(field || '').toLowerCase().includes(searchLower)
      );
    });
  }, [data, searchText, searchFields]);

  return {
    searchText,
    setSearchText,
    filteredData,
  };
};

