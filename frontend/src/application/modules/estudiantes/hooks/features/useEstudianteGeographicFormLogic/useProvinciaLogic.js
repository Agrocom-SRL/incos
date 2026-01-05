/**
 * Hook: useProvinciaLogic
 * 
 * Single Responsibility: Manejar la lógica de carga de municipios cuando cambia una provincia
 * 
 * Clean Architecture:
 * - Application Layer: Hook específico para lógica de provincias
 * - Co-localizado: Está junto al hook principal que lo usa
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo maneja lógica de provincias
 * - DRY: Reutilizable para primera y segunda nacionalidad
 */

import { useEffect, useRef } from 'react';
import { Form } from 'antd';

/**
 * Hook para manejar la lógica de provincias (carga de municipios)
 * 
 * @param {Object} options - Opciones de configuración
 * @param {FormInstance} options.form - Instancia del formulario
 * @param {string} options.provinciaField - Nombre del campo de provincia
 * @param {Function} options.loadMunicipios - Función para cargar municipios
 * @param {Object} options.allFormValues - Todos los valores del formulario (trigger)
 */
export const useProvinciaLogic = ({
  form,
  provinciaField,
  loadMunicipios,
  allFormValues,
}) => {
  const prevProvinciaIdRef = useRef(undefined);
  const initializedRef = useRef(false);
  
  useEffect(() => {
    if (!form) return;
    
    // Inicializar con valor actual del formulario
    if (!initializedRef.current) {
      const currentValues = form.getFieldsValue();
      prevProvinciaIdRef.current = currentValues[provinciaField];
      initializedRef.current = true;
      return;
    }
    
    const currentProvinciaId = form.getFieldsValue([provinciaField])[provinciaField];
    const provinciaCambio = prevProvinciaIdRef.current !== currentProvinciaId;
    
    if (!provinciaCambio) {
      return;
    }
    
    prevProvinciaIdRef.current = currentProvinciaId;
    
    if (!currentProvinciaId) {
      return;
    }
    
    // Cargar municipios cuando cambia la provincia
    if (loadMunicipios && typeof loadMunicipios === 'function') {
      loadMunicipios(currentProvinciaId);
    }
  }, [allFormValues, form, provinciaField, loadMunicipios]);
};

