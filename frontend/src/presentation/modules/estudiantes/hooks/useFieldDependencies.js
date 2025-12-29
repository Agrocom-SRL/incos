// hooks/useFieldDependencies.js
/**
 * Hook personalizado para manejar dependencias entre campos
 * 
 * Single Responsibility: Gestionar la limpieza de campos dependientes cuando cambian sus dependencias
 */

import { useEffect, useRef, useState } from 'react';
import { Form } from 'antd';

/**
 * Hook para manejar dependencias entre campos geográficos
 * @param {Object} params
 * @param {Object} params.field - Configuración del campo
 * @param {Object} params.form - Instancia del formulario de Ant Design
 * @param {boolean} params.isGeographicField - Si el campo es geográfico
 * @param {*} params.dependencyValue - Valor actual de la dependencia
 * @param {Function} params.resolveOptions - Función para resolver opciones
 */
export const useFieldDependencies = ({ 
  field, 
  form, 
  isGeographicField, 
  dependencyValue,
  resolveOptions 
}) => {
  const prevDependencyValuesRef = useRef(null);
  const [currentDependencyValue, setCurrentDependencyValue] = useState(null);

  // Leer el valor inicial del formulario cuando el componente se monta
  useEffect(() => {
    if (isGeographicField && form && field.dependencies && field.dependencies.length > 0) {
      const depValue = form.getFieldValue(field.dependencies[0]);
      setCurrentDependencyValue(depValue);
    }
  }, [isGeographicField, form, field.dependencies]);

  // Manejar limpieza de campos cuando cambian las dependencias
  useEffect(() => {
    if (isGeographicField && form && field.dependencies && field.dependencies.length > 0) {
      const normalizedDepValue = dependencyValue !== null && dependencyValue !== undefined 
        ? Number(dependencyValue) 
        : null;
      
      const dependencyValueKey = JSON.stringify(normalizedDepValue);
      
      if (prevDependencyValuesRef.current !== dependencyValueKey) {
        const prevDepValue = prevDependencyValuesRef.current 
          ? JSON.parse(prevDependencyValuesRef.current) 
          : null;
        prevDependencyValuesRef.current = dependencyValueKey;
        
        if (normalizedDepValue !== currentDependencyValue) {
          setCurrentDependencyValue(normalizedDepValue);
        }
        
        // Si la dependencia cambió a un valor diferente, verificar si el valor actual es válido
        if (prevDepValue !== null && normalizedDepValue !== null && normalizedDepValue !== prevDepValue) {
          const currentValue = form.getFieldValue(field.name);
          
          if (currentValue !== undefined && currentValue !== null && currentValue !== '') {
            const allOptions = typeof field.options === 'string' && resolveOptions
              ? resolveOptions(field.options)
              : field.options || [];
            
            const isProvinciasField = field.options === 'provincias' || 
              (typeof field.options === 'string' && field.options === 'provincias');
            const isMunicipiosField = field.options === 'municipios' || 
              (typeof field.options === 'string' && field.options === 'municipios');
            const dependencyFieldName = field.dependencies[0];
            const isDependenciaDepartamento = dependencyFieldName && 
              dependencyFieldName.toLowerCase().includes('departamento');
            const isDependenciaProvincia = dependencyFieldName && 
              dependencyFieldName.toLowerCase().includes('provincia');
            
            let isValid = false;
            if (isProvinciasField && isDependenciaDepartamento) {
              const currentOption = allOptions.find(opt => {
                const optValue = typeof opt === 'string' ? opt : opt.value;
                return Number(optValue) === Number(currentValue);
              });
              isValid = currentOption && Number(currentOption.departamentoId) === normalizedDepValue;
            } else if (isMunicipiosField && isDependenciaProvincia) {
              const currentOption = allOptions.find(opt => {
                const optValue = typeof opt === 'string' ? opt : opt.value;
                return Number(optValue) === Number(currentValue);
              });
              isValid = currentOption && Number(currentOption.provinciaId) === normalizedDepValue;
            }
            
            if (!isValid) {
              form.setFieldValue(field.name, undefined);
            }
          }
        }
      }
    }
  }, [isGeographicField, field, form, dependencyValue, currentDependencyValue, resolveOptions]);
};

