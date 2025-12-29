// hooks/useGeographicFilter.js
/**
 * Hook personalizado para manejar el filtrado geográfico de provincias y municipios
 * 
 * Single Responsibility: Filtrar opciones geográficas basándose en dependencias
 */

import { useMemo } from 'react';
import { Form } from 'antd';

/**
 * Hook para filtrar opciones geográficas (provincias, municipios) basándose en dependencias
 * @param {Object} params
 * @param {Object} params.field - Configuración del campo
 * @param {Object} params.form - Instancia del formulario de Ant Design
 * @param {Array} params.selectOptions - Opciones disponibles sin filtrar
 * @param {Function} params.resolveOptions - Función para resolver opciones
 * @returns {Object} { filteredOptions, dependencyValue }
 */
export const useGeographicFilter = ({ field, form, selectOptions, resolveOptions }) => {
  // Determinar si es un campo geográfico
  const isGeographicField = useMemo(() => {
    return field.type === 'select' && 
      field.dependencies && 
      field.dependencies.length > 0 &&
      (field.name.includes('departamento') || 
       field.name.includes('provincia') || 
       field.name.includes('municipio') ||
       field.name.includes('pais'));
  }, [field.type, field.dependencies, field.name]);

  // Observar valores de dependencias
  const dependencyValues = isGeographicField && form && field.dependencies && field.dependencies.length > 0
    ? Form.useWatch(field.dependencies, form)
    : null;

  // Obtener el valor de la dependencia
  const dependencyValue = useMemo(() => {
    if (!isGeographicField || !field.dependencies || field.dependencies.length === 0) {
      return null;
    }

    const watchedValue = dependencyValues?.[field.dependencies[0]];
    const formValue = form ? form.getFieldValue(field.dependencies[0]) : null;
    const rawValue = formValue !== undefined && formValue !== null ? formValue : watchedValue;
    return rawValue !== null && rawValue !== undefined ? Number(rawValue) : null;
  }, [isGeographicField, field.dependencies, dependencyValues, form]);

  // Filtrar opciones basándose en la dependencia
  const filteredOptions = useMemo(() => {
    if (!isGeographicField || !field.dependencies || field.dependencies.length === 0) {
      return selectOptions;
    }

    // Para provincias y municipios, aplicar filtrado
    const isProvinciasField = field.options === 'provincias' || (typeof field.options === 'string' && field.options === 'provincias');
    const isMunicipiosField = field.options === 'municipios' || (typeof field.options === 'string' && field.options === 'municipios');
    
    if (!isProvinciasField && !isMunicipiosField) {
      return selectOptions;
    }

    if (dependencyValue === null) {
      // Si no hay valor de dependencia, intentar obtenerlo del formulario una vez más
      const latestDependencyValue = form ? form.getFieldValue(field.dependencies[0]) : null;
      const normalizedLatestValue = latestDependencyValue !== null && latestDependencyValue !== undefined 
        ? Number(latestDependencyValue) 
        : null;
      
      if (normalizedLatestValue === null) {
        // Si no hay valor de dependencia, verificar si hay un valor seleccionado
        const currentFieldValue = form ? form.getFieldValue(field.name) : null;
        if (!currentFieldValue) {
          // Si no hay valor seleccionado ni dependencia, no mostrar opciones
          return [];
        }
        // Si hay valor seleccionado pero no hay dependencia, mantener todas las opciones
        // para que el valor seleccionado se mantenga visible
        return selectOptions;
      }
      
      return filterOptionsByDependency(selectOptions, field, normalizedLatestValue);
    }

    return filterOptionsByDependency(selectOptions, field, dependencyValue);
  }, [isGeographicField, field, selectOptions, dependencyValue, form]);

  return {
    filteredOptions,
    dependencyValue,
    isGeographicField,
  };
};

/**
 * Función auxiliar para filtrar opciones según la dependencia
 */
const filterOptionsByDependency = (options, field, dependencyValue) => {
  const dependencyFieldName = field.dependencies[0];
  const isProvinciasField = field.options === 'provincias' || (typeof field.options === 'string' && field.options === 'provincias');
  const isMunicipiosField = field.options === 'municipios' || (typeof field.options === 'string' && field.options === 'municipios');
  const isDependenciaDepartamento = dependencyFieldName && dependencyFieldName.toLowerCase().includes('departamento');
  const isDependenciaProvincia = dependencyFieldName && dependencyFieldName.toLowerCase().includes('provincia');

  if (isProvinciasField && isDependenciaDepartamento) {
    return options.filter(opt => {
      const optDepartamentoId = typeof opt === 'object' && opt.departamentoId !== undefined ? Number(opt.departamentoId) : null;
      return optDepartamentoId === dependencyValue;
    });
  }

  if (isMunicipiosField && isDependenciaProvincia) {
    return options.filter(opt => {
      const optProvinciaId = typeof opt === 'object' && opt.provinciaId !== undefined ? Number(opt.provinciaId) : null;
      return optProvinciaId === dependencyValue;
    });
  }

  return options;
};

