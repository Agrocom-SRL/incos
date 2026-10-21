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
 * @param {boolean} options.isEditMode - Si true, no seleccionar primera provincia (respetar valores del API)
 */
export const useResidenciaLogic = ({
  form,
  departamentos = [],
  provinciasResidencia = [],
  loadDepartamentos,
  loadProvincias,
  loadMunicipios,
  allFormValues,
  isEditMode = false,
}) => {
  const initializedRef = useRef(false);
  const primeraProvinciaSeleccionadaRef = useRef(false);
  
  // Encontrar el ID de Santa Cruz
  const santaCruzId = useMemo(() => {
    if (!departamentos || departamentos.length === 0) {
      return null;
    }
    
    const santaCruz = departamentos.find(depto => {
      const nombre = depto.nombre || '';
      return nombre.toUpperCase().includes('SANTA CRUZ') || nombre.toUpperCase() === 'SANTA CRUZ';
    });
    
    return santaCruz?.id || null;
  }, [departamentos]);

  // Cargar departamentos si no están disponibles
  useEffect(() => {
    if (departamentos.length === 0 && loadDepartamentos && typeof loadDepartamentos === 'function') {
      loadDepartamentos();
    }
  }, [departamentos.length, loadDepartamentos]);

  // Inicializar departamento de residencia con Santa Cruz y cargar provincias
  // Solo si no hay valores ya establecidos (modo edición puede tener valores del estudiante)
  useEffect(() => {
    if (!form || !santaCruzId || initializedRef.current) return;
    
    // Verificar si ya hay valores de residencia establecidos (modo edición)
    const currentValues = form.getFieldsValue(['departamentoResidenciaId', 'provinciaResidenciaId', 'municipioResidenciaId']);
    const tieneValoresEstablecidos = currentValues.departamentoResidenciaId != null || 
                                      currentValues.provinciaResidenciaId != null || 
                                      currentValues.municipioResidenciaId != null;
    
    if (tieneValoresEstablecidos) {
      // Ya hay valores (modo edición): usar el departamento que ya está establecido o Santa Cruz
      const deptoId = currentValues.departamentoResidenciaId || santaCruzId;
      if (loadProvincias && typeof loadProvincias === 'function') {
        loadProvincias(deptoId, 'residencia');
      }
      initializedRef.current = true;
      return;
    }
    
    // Modo creación: establecer departamento de residencia por defecto (Santa Cruz)
    form.setFieldsValue({
      departamentoResidenciaId: santaCruzId,
    });
    
    // Cargar provincias de Santa Cruz automáticamente (con contexto 'residencia')
    if (loadProvincias && typeof loadProvincias === 'function') {
      loadProvincias(santaCruzId, 'residencia');
    }
    
    initializedRef.current = true;
  }, [form, santaCruzId, loadProvincias]);

  // Si hay provincia ya seleccionada (ej. modo edición), cargar sus municipios. Si no y NO es edición, seleccionar la primera provincia.
  // Incluir allFormValues en deps para que cuando el padre establezca provinciaResidenciaId (al cargar estudiante), carguemos sus municipios.
  useEffect(() => {
    if (!form || !initializedRef.current) return;
    
    if (provinciasResidencia.length > 0) {
      const currentProvinciaId = form.getFieldsValue(['provinciaResidenciaId']).provinciaResidenciaId;
      
      if (currentProvinciaId) {
        // Ya hay provincia (cargada en edición o por usuario): cargar municipios de esa provincia
        if (loadMunicipios && typeof loadMunicipios === 'function') {
          loadMunicipios(currentProvinciaId, 'residencia');
        }
        primeraProvinciaSeleccionadaRef.current = true;
      } else if (!isEditMode && !primeraProvinciaSeleccionadaRef.current) {
        // Solo en creación: seleccionar la primera provincia y cargar sus municipios (en edición no sobrescribir)
        const primeraProvincia = provinciasResidencia[0];
        if (primeraProvincia?.id) {
          form.setFieldsValue({
            provinciaResidenciaId: primeraProvincia.id,
          });
          if (loadMunicipios && typeof loadMunicipios === 'function') {
            loadMunicipios(primeraProvincia.id, 'residencia');
          }
          primeraProvinciaSeleccionadaRef.current = true;
        }
      }
    }
  }, [form, provinciasResidencia, loadMunicipios, isEditMode, allFormValues]);

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

