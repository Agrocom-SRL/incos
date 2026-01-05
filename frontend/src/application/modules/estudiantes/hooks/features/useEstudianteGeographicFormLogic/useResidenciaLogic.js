/**
 * Hook: useResidenciaLogic
 * 
 * Single Responsibility: Inicializar residencia con departamento fijo (Santa Cruz) y primera provincia
 * 
 * Clean Architecture:
 * - Application Layer: Hook específico para inicialización de residencia
 * - Co-localizado: Está junto al hook principal que lo usa
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo maneja inicialización de residencia
 * - DRY: Reutiliza useProvinciaLogic para manejar cambios de provincia
 * 
 * Nota: El instituto está en Santa Cruz, por lo que todos los estudiantes residen en Santa Cruz
 * No se muestra selector de departamento, solo provincia y municipio
 * Selecciona automáticamente la primera provincia para agilizar el proceso
 */

import { useEffect, useMemo, useRef } from 'react';
import { Form } from 'antd';
import { useProvinciaLogic } from './useProvinciaLogic';

/**
 * Hook para manejar la inicialización de residencia
 * 
 * @param {Object} options - Opciones de configuración
 * @param {FormInstance} options.form - Instancia del formulario
 * @param {Array} options.departamentos - Array de departamentos para buscar Santa Cruz
 * @param {Array} options.provinciasResidencia - Array de provincias de residencia cargadas (para seleccionar la primera)
 * @param {Function} options.loadDepartamentos - Función para cargar departamentos si no están disponibles
 * @param {Function} options.loadProvincias - Función para cargar provincias
 * @param {Function} options.loadMunicipios - Función para cargar municipios
 * @param {Object} options.allFormValues - Todos los valores del formulario (trigger)
 */
export const useResidenciaLogic = ({
  form,
  departamentos = [],
  provinciasResidencia = [],
  loadDepartamentos,
  loadProvincias,
  loadMunicipios,
  allFormValues,
}) => {
  const initializedRef = useRef(false);
  const santaCruzIdRef = useRef(null);
  const primeraProvinciaSeleccionadaRef = useRef(false);
  
  // Encontrar el ID de Santa Cruz
  const santaCruzId = useMemo(() => {
    if (santaCruzIdRef.current) {
      return santaCruzIdRef.current;
    }
    
    if (!departamentos || departamentos.length === 0) {
      return null;
    }
    
    const santaCruz = departamentos.find(depto => {
      const nombre = depto.nombre || '';
      return nombre.toUpperCase().includes('SANTA CRUZ') || nombre.toUpperCase() === 'SANTA CRUZ';
    });
    
    const id = santaCruz?.id || null;
    if (id) {
      santaCruzIdRef.current = id;
    }
    
    return id;
  }, [departamentos]);

  // Cargar departamentos si no están disponibles
  useEffect(() => {
    if (departamentos.length === 0 && loadDepartamentos && typeof loadDepartamentos === 'function') {
      loadDepartamentos();
    }
  }, [departamentos.length, loadDepartamentos]);

  // Inicializar departamento de residencia con Santa Cruz y cargar provincias
  useEffect(() => {
    if (!form || !santaCruzId || initializedRef.current) return;
    
    // Establecer departamento de residencia por defecto
    form.setFieldsValue({
      departamentoResidenciaId: santaCruzId,
    });
    
    // Cargar provincias de Santa Cruz automáticamente (con contexto 'residencia')
    if (loadProvincias && typeof loadProvincias === 'function') {
      loadProvincias(santaCruzId, 'residencia');
    }
    
    initializedRef.current = true;
  }, [form, santaCruzId, loadProvincias]);

  // Seleccionar automáticamente la primera provincia cuando se cargan las provincias de residencia
  useEffect(() => {
    if (!form || !initializedRef.current || primeraProvinciaSeleccionadaRef.current) return;
    
    // Solo seleccionar la primera provincia si hay provincias de residencia y no hay una provincia ya seleccionada
    if (provinciasResidencia.length > 0) {
      const currentProvinciaId = form.getFieldsValue(['provinciaResidenciaId']).provinciaResidenciaId;
      
      // Solo seleccionar automáticamente si no hay provincia seleccionada
      if (!currentProvinciaId) {
        const primeraProvincia = provinciasResidencia[0];
        if (primeraProvincia?.id) {
          form.setFieldsValue({
            provinciaResidenciaId: primeraProvincia.id,
          });
          
          // Cargar municipios de la primera provincia automáticamente (con contexto 'residencia')
          if (loadMunicipios && typeof loadMunicipios === 'function') {
            loadMunicipios(primeraProvincia.id, 'residencia');
          }
          
          primeraProvinciaSeleccionadaRef.current = true;
        }
      } else {
        // Si ya hay una provincia seleccionada, marcar como inicializado
        primeraProvinciaSeleccionadaRef.current = true;
      }
    }
  }, [form, provinciasResidencia, loadMunicipios]);

  // Reutilizar useProvinciaLogic para manejar cambios de provincia de residencia
  // Con limpieza automática de municipio cuando cambia la provincia
  // Contexto 'residencia' para separar municipios de residencia de los de origen
  useProvinciaLogic({
    form,
    provinciaField: 'provinciaResidenciaId',
    municipioField: 'municipioResidenciaId',
    loadMunicipios,
    contexto: 'residencia',
    clearMunicipioOnChange: true,
    allFormValues,
  });
};

