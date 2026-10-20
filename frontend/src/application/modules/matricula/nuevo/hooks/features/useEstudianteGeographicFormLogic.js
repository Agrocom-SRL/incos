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
 * - Establece departamentoResidenciaId = Santa Cruz por defecto (instituto está en Santa Cruz)
 * - Carga provincias de Santa Cruz automáticamente al inicializar
 * - Carga municipios cuando cambia provinciaResidenciaId (residencia)
 * - Limpia campos dependientes cuando cambian campos padre
 * 
 * Usado por: EstudiantesRegister (página específica)
 */

import { Form } from 'antd';
import { useTipoOrigenLogic } from './useEstudianteGeographicFormLogic/useTipoOrigenLogic';
import { usePrimeraNacionalidadLogic } from './useEstudianteGeographicFormLogic/usePrimeraNacionalidadLogic';
import { useDepartamentoLogic } from './useEstudianteGeographicFormLogic/useDepartamentoLogic';
import { useProvinciaLogic } from './useEstudianteGeographicFormLogic/useProvinciaLogic';
import { useResidenciaLogic } from './useEstudianteGeographicFormLogic/useResidenciaLogic';

/**
 * Hook para gestionar la lógica del formulario geográfico de estudiantes
 * 
 * @param {Object} form - Instancia del formulario de Ant Design
 * @param {Object} loaders - Objeto con funciones de carga
 * @param {Array} paises - Array de países para buscar Bolivia
 * @param {Array} departamentos - Array de departamentos para buscar Santa Cruz (residencia)
 * @param {Array} provinciasResidencia - Array de provincias de residencia cargadas (para seleccionar la primera en residencia)
 * @param {boolean} isEditMode - Si true, no seleccionar primera provincia en residencia (respetar valores del API)
 * @returns {void}
 */
export const useEstudianteGeographicFormLogic = (form, loaders, paises = [], departamentos = [], provinciasResidencia = [], isEditMode = false) => {
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

  // Hook para manejar departamentos de primera nacionalidad (nacionalidad boliviana simple)
  // Contexto 'origen' (default) para separar provincias de origen de las de residencia
  useDepartamentoLogic({
    form,
    departamentoField: 'departamentoId',
    prefix: '',
    loadProvincias,
    loadMunicipios,
    contexto: 'origen',
    allFormValues,
  });

  // Hook para manejar departamentos de segunda nacionalidad (doble nacionalidad)
  // Contexto 'segunda' para separar provincias de segunda nacionalidad
  useDepartamentoLogic({
    form,
    departamentoField: 'segundaDepartamentoId',
    prefix: 'segunda',
    loadProvincias,
    loadMunicipios,
    contexto: 'segunda',
    allFormValues,
  });

  // Hook para manejar provincias de primera nacionalidad (nacionalidad boliviana simple)
  // Limpia el municipio cuando cambia la provincia
  // Contexto 'origen' (default) para separar municipios de origen de los de residencia
  useProvinciaLogic({
    form,
    provinciaField: 'provinciaId',
    municipioField: 'municipioId',
    loadMunicipios,
    contexto: 'origen',
    clearMunicipioOnChange: true,
    allFormValues,
  });

  // Hook para manejar provincias de segunda nacionalidad (doble nacionalidad)
  // Limpia el municipio cuando cambia la provincia
  // Contexto 'segunda' para separar municipios de segunda nacionalidad
  useProvinciaLogic({
    form,
    provinciaField: 'segundaProvinciaId',
    municipioField: 'segundaMunicipioId',
    loadMunicipios,
    contexto: 'segunda',
    clearMunicipioOnChange: true,
    allFormValues,
  });

  // Hook para manejar residencia (departamento fijo: Santa Cruz)
  // El instituto está en Santa Cruz, por lo que todos los estudiantes residen en Santa Cruz
  // No se muestra selector de departamento, solo provincia y municipio
  // En creación: selecciona la primera provincia. En edición: no sobrescribir, solo cargar municipios de la provincia del estudiante.
  useResidenciaLogic({
    form,
    departamentos,
    provinciasResidencia,
    loadDepartamentos,
    loadProvincias,
    loadMunicipios,
    allFormValues,
    isEditMode,
  });
};
