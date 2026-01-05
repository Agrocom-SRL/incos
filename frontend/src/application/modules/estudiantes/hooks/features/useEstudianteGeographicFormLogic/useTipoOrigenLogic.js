/**
 * Hook: useTipoOrigenLogic
 * 
 * Single Responsibility: Manejar la lógica cuando cambia tipoOrigen
 * 
 * Clean Architecture:
 * - Application Layer: Hook específico para lógica de tipoOrigen
 * - Co-localizado: Está junto al hook principal que lo usa
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo maneja lógica de tipoOrigen
 */

import { useEffect, useRef } from 'react';
import { Form } from 'antd';
import { clearBolivianaFields, clearExtranjeraFields } from '@application-estudiantes/hooks/helpers/geographicFieldHelpers';

/**
 * Hook para manejar la lógica cuando cambia tipoOrigen
 * 
 * @param {Object} options - Opciones de configuración
 * @param {FormInstance} options.form - Instancia del formulario
 * @param {Function} options.loadDepartamentos - Función para cargar departamentos
 * @param {Object} options.allFormValues - Todos los valores del formulario (trigger)
 */
export const useTipoOrigenLogic = ({
  form,
  loadDepartamentos,
  allFormValues,
}) => {
  const prevTipoOrigenRef = useRef(undefined);
  const initializedRef = useRef(false);
  
  useEffect(() => {
    if (!form) return;
    
    // Inicializar con valor actual del formulario
    if (!initializedRef.current) {
      const currentValues = form.getFieldsValue();
      prevTipoOrigenRef.current = currentValues.tipoOrigen;
      initializedRef.current = true;
      return;
    }
    
    const currentTipoOrigen = form.getFieldsValue(['tipoOrigen']).tipoOrigen;
    const tipoOrigenCambio = prevTipoOrigenRef.current !== currentTipoOrigen;
    
    if (!tipoOrigenCambio) {
      return;
    }
    
    prevTipoOrigenRef.current = currentTipoOrigen;
    
    if (currentTipoOrigen === 'BOLIVIANA') {
      clearExtranjeraFields(form);
      if (loadDepartamentos && typeof loadDepartamentos === 'function') {
        loadDepartamentos();
      }
    } else if (currentTipoOrigen === 'EXTRANJERA') {
      clearBolivianaFields(form);
    } else if (currentTipoOrigen === 'DOBLE_NACIONALIDAD') {
      // Limpiar todos los campos de nacionalidad simple y doble
      clearBolivianaFields(form);
      clearExtranjeraFields(form);
      clearBolivianaFields(form, 'segunda');
      clearExtranjeraFields(form, 'segunda');
    }
  }, [allFormValues, form, loadDepartamentos]);
};

