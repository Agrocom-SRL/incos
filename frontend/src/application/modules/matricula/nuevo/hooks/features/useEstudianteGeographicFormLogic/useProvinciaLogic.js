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
 * - DRY: Reutilizable para primera y segunda nacionalidad, y residencia
 */

import { useEffect, useRef } from 'react';
import { Form } from 'antd';

/**
 * Hook para manejar la lógica de provincias (carga de municipios)
 * 
 * @param {Object} options - Opciones de configuración
 * @param {FormInstance} options.form - Instancia del formulario
 * @param {string} options.provinciaField - Nombre del campo de provincia
 * @param {string} options.municipioField - Nombre del campo de municipio (opcional, por defecto se infiere del prefix)
 * @param {Function} options.loadMunicipios - Función para cargar municipios
 * @param {string} options.contexto - Contexto del municipio: 'origen' (default), 'residencia', 'segunda'
 * @param {boolean} options.clearMunicipioOnChange - Si debe limpiar el municipio cuando cambia la provincia (default: false)
 * @param {Object} options.allFormValues - Todos los valores del formulario (trigger)
 */
export const useProvinciaLogic = ({
  form,
  provinciaField,
  municipioField,
  loadMunicipios,
  contexto = 'origen',
  clearMunicipioOnChange = false,
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
    
    const prevProvinciaId = prevProvinciaIdRef.current;
    prevProvinciaIdRef.current = currentProvinciaId;
    
    // Limpiar municipio solo cuando el usuario cambia de una provincia a otra (no en carga inicial)
    // Si prevProvinciaId era undefined, es carga/edición: no borrar municipio para que se muestre el valor guardado
    if (clearMunicipioOnChange && municipioField && prevProvinciaId != null) {
      form.setFieldsValue({
        [municipioField]: undefined,
      });
    }
    
    if (!currentProvinciaId) {
      // Si se removió la provincia, limpiar también la lista de municipios
      if (loadMunicipios && typeof loadMunicipios === 'function') {
        loadMunicipios(null, contexto);
      }
      return;
    }
    
    // Cargar municipios cuando cambia la provincia (con contexto para separar estados)
    if (loadMunicipios && typeof loadMunicipios === 'function') {
      loadMunicipios(currentProvinciaId, contexto);
    }
  }, [allFormValues, form, provinciaField, municipioField, loadMunicipios, clearMunicipioOnChange, contexto]);
};

