/**
 * Hook: useEstudianteGeographicFormLogic
 * 
 * Single Responsibility: Componer toda la lógica del formulario geográfico de estudiantes
 * 
 * Clean Architecture:
 * - Application Layer: Hook compositor que orquesta hooks especializados
 * - Maneja limpieza de campos y carga de datos geográficos basados en cambios de campos
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo compone hooks especializados
 * - Dependency Inversion: Depende de hooks especializados (abstracciones)
 * - Composition over Inheritance: Compone hooks en lugar de crear uno monolítico
 * - DRY: Reutiliza hooks genéricos para primera y segunda nacionalidad
 * 
 * Este hook:
 * - Limpia campos cuando cambia tipoOrigen (BOLIVIANA/EXTRANJERA/DOBLE_NACIONALIDAD)
 * - Carga departamentos cuando se selecciona BOLIVIANA o primeraNacionalidad en doble nacionalidad
 * - Carga provincias cuando cambia departamentoId (primera o segunda nacionalidad)
 * - Carga municipios cuando cambia provinciaId (primera o segunda nacionalidad)
 * - Limpia campos dependientes cuando cambian campos padre
 * 
 * Usado por: EstudiantesRegister (página específica)
 */

import { Form } from 'antd';
import { useTipoOrigenLogic } from './useEstudianteGeographicFormLogic/useTipoOrigenLogic';
import { usePrimeraNacionalidadLogic } from './useEstudianteGeographicFormLogic/usePrimeraNacionalidadLogic';
import { useDepartamentoLogic } from './useEstudianteGeographicFormLogic/useDepartamentoLogic';
import { useProvinciaLogic } from './useEstudianteGeographicFormLogic/useProvinciaLogic';

/**
 * Hook para gestionar la lógica del formulario geográfico de estudiantes
 * 
 * @param {Object} form - Instancia del formulario de Ant Design
 * @param {Object} loaders - Objeto con funciones de carga
 * @param {Array} paises - Array de países para buscar Bolivia
 * @returns {void}
 */
export const useEstudianteGeographicFormLogic = (form, loaders, paises = []) => {
  const { loadDepartamentos, loadProvincias, loadMunicipios } = loaders || {};
  
  // Observar TODOS los campos del formulario para detectar cambios
  // Usamos esto solo como trigger, pero obtenemos valores reales con getFieldsValue()
  const allFormValues = Form.useWatch([], form);

  // Hook para manejar cambios de tipoOrigen
  useTipoOrigenLogic({
    form,
    loadDepartamentos,
    allFormValues,
  });

  // Hook para manejar cambios de primeraNacionalidad (doble nacionalidad)
  usePrimeraNacionalidadLogic({
    form,
    loadDepartamentos,
    allFormValues,
  });

  // Hook para manejar departamentos de primera nacionalidad
  useDepartamentoLogic({
    form,
    departamentoField: 'departamentoId',
    prefix: '',
    loadProvincias,
    loadMunicipios,
    allFormValues,
  });

  // Hook para manejar departamentos de segunda nacionalidad
  useDepartamentoLogic({
    form,
    departamentoField: 'segundaDepartamentoId',
    prefix: 'segunda',
    loadProvincias,
    loadMunicipios,
    allFormValues,
  });

  // Hook para manejar provincias de primera nacionalidad
  useProvinciaLogic({
    form,
    provinciaField: 'provinciaId',
    loadMunicipios,
    allFormValues,
  });

  // Hook para manejar provincias de segunda nacionalidad
  useProvinciaLogic({
    form,
    provinciaField: 'segundaProvinciaId',
    loadMunicipios,
    allFormValues,
  });
};
