/**
 * Hook: useDepartamentoLogic
 * 
 * Single Responsibility: Manejar la lógica de carga de provincias cuando cambia un departamento
 * 
 * Clean Architecture:
 * - Application Layer: Hook específico para lógica de departamentos
 * - Co-localizado: Está junto al hook principal que lo usa
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo maneja lógica de departamentos
 * - DRY: Reutilizable para primera y segunda nacionalidad
 */

import { useEffect, useRef } from 'react';
import { Form } from 'antd';
import { clearDependentFields, loadProvinciasForDepartamento } from '@application-estudiantes/hooks/helpers/geographicFieldHelpers';

/**
 * Hook para manejar la lógica de departamentos (carga de provincias)
 * 
 * @param {Object} options - Opciones de configuración
 * @param {FormInstance} options.form - Instancia del formulario
 * @param {string} options.departamentoField - Nombre del campo de departamento
 * @param {string} options.prefix - Prefijo para los campos ('segunda' o '')
 * @param {Function} options.loadProvincias - Función para cargar provincias
 * @param {Function} options.loadMunicipios - Función para limpiar municipios
 * @param {Object} options.allFormValues - Todos los valores del formulario (trigger)
 */
export const useDepartamentoLogic = ({
  form,
  departamentoField,
  prefix = '',
  loadProvincias,
  loadMunicipios,
  allFormValues,
}) => {
  const prevDepartamentoIdRef = useRef(undefined);
  const initializedRef = useRef(false);
  
  useEffect(() => {
    if (!form) return;
    
    // Inicializar con valor actual del formulario
    if (!initializedRef.current) {
      const currentValues = form.getFieldsValue();
      prevDepartamentoIdRef.current = currentValues[departamentoField];
      initializedRef.current = true;
      return;
    }
    
    const currentDepartamentoId = form.getFieldsValue([departamentoField])[departamentoField];
    const prevDepartamentoId = prevDepartamentoIdRef.current;
    const departamentoCambio = prevDepartamentoId !== currentDepartamentoId;
    
    if (!departamentoCambio) {
      return;
    }
    
    if (!currentDepartamentoId) {
      // Solo limpiar si antes había un departamento seleccionado
      if (prevDepartamentoId !== undefined && prevDepartamentoId !== null) {
        clearDependentFields(form, prefix, loadProvincias, loadMunicipios);
      }
      prevDepartamentoIdRef.current = currentDepartamentoId;
      return;
    }
    
    // Cargar provincias cuando cambia el departamento
    loadProvinciasForDepartamento(
      form,
      currentDepartamentoId,
      prefix,
      loadProvincias,
      loadMunicipios
    );
    
    prevDepartamentoIdRef.current = currentDepartamentoId;
  }, [allFormValues, form, departamentoField, prefix, loadProvincias, loadMunicipios]);
};

