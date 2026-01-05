/**
 * Hook: usePrimeraNacionalidadLogic
 * 
 * Single Responsibility: Manejar la lógica cuando cambia primeraNacionalidad en doble nacionalidad
 * 
 * Clean Architecture:
 * - Application Layer: Hook específico para lógica de primeraNacionalidad
 * - Co-localizado: Está junto al hook principal que lo usa
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo maneja lógica de primeraNacionalidad
 */

import { useEffect, useRef } from 'react';
import { Form } from 'antd';
import { clearBolivianaFields, clearExtranjeraFields } from '@application-estudiantes/hooks/helpers/geographicFieldHelpers';

/**
 * Hook para manejar la lógica cuando cambia primeraNacionalidad en doble nacionalidad
 * 
 * @param {Object} options - Opciones de configuración
 * @param {FormInstance} options.form - Instancia del formulario
 * @param {Function} options.loadDepartamentos - Función para cargar departamentos
 * @param {Object} options.allFormValues - Todos los valores del formulario (trigger)
 */
export const usePrimeraNacionalidadLogic = ({
  form,
  loadDepartamentos,
  allFormValues,
}) => {
  const prevPrimeraNacionalidadRef = useRef(undefined);
  const initializedRef = useRef(false);
  
  useEffect(() => {
    if (!form) return;
    
    // Inicializar con valor actual del formulario
    if (!initializedRef.current) {
      const currentValues = form.getFieldsValue();
      prevPrimeraNacionalidadRef.current = currentValues.primeraNacionalidad;
      initializedRef.current = true;
      return;
    }
    
    const currentTipoOrigen = form.getFieldsValue(['tipoOrigen']).tipoOrigen;
    const currentPrimeraNacionalidad = form.getFieldsValue(['primeraNacionalidad']).primeraNacionalidad;
    
    // Solo procesar si es doble nacionalidad
    if (currentTipoOrigen !== 'DOBLE_NACIONALIDAD') {
      return;
    }
    
    const primeraNacionalidadCambio = prevPrimeraNacionalidadRef.current !== currentPrimeraNacionalidad;
    
    if (!primeraNacionalidadCambio) {
      return;
    }
    
    prevPrimeraNacionalidadRef.current = currentPrimeraNacionalidad;
    
    if (currentPrimeraNacionalidad === 'BOLIVIANA') {
      clearExtranjeraFields(form);
      if (loadDepartamentos && typeof loadDepartamentos === 'function') {
        loadDepartamentos();
      }
    } else if (currentPrimeraNacionalidad === 'EXTRANJERA') {
      clearBolivianaFields(form);
      // La segunda nacionalidad será boliviana, cargar departamentos
      if (loadDepartamentos && typeof loadDepartamentos === 'function') {
        loadDepartamentos();
      }
    }
  }, [allFormValues, form, loadDepartamentos]);
};

