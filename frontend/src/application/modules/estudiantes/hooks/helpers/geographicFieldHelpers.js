/**
 * geographicFieldHelpers - Funciones helper para manejar lógica de campos geográficos
 * 
 * Single Responsibility: Proporcionar funciones reutilizables para manejar departamentos, provincias y municipios
 * 
 * Clean Architecture:
 * - Application Layer: Utilidades específicas para lógica geográfica de hooks
 * - Ubicado en hooks/utils/ para ser compartido entre hooks del módulo
 * 
 * SOLID Principles:
 * - Single Responsibility: Cada función tiene una responsabilidad única
 * - DRY: Elimina duplicación entre primera y segunda nacionalidad
 * 
 * Uso: Hooks del módulo de estudiantes que necesiten lógica geográfica
 */

/**
 * Obtiene los nombres de campos de provincia y municipio según el prefijo
 * 
 * @param {string} prefix - Prefijo para los campos ('segunda', 'residencia' o '')
 * @returns {Object} Objeto con provinciaField y municipioField
 */
const getProvinciaMunicipioFields = (prefix = '') => {
  if (prefix === 'residencia') {
    return {
      provinciaField: 'provinciaResidenciaId',
      municipioField: 'municipioResidenciaId',
    };
  }
  
  return {
    provinciaField: prefix ? `${prefix}ProvinciaId` : 'provinciaId',
    municipioField: prefix ? `${prefix}MunicipioId` : 'municipioId',
  };
};

/**
 * Limpia campos dependientes cuando se remueve un departamento
 * 
 * @param {Object} form - Instancia del formulario
 * @param {string} prefix - Prefijo para los campos ('segunda', 'residencia' o '')
 * @param {Function} loadProvincias - Función para limpiar provincias
 * @param {Function} loadMunicipios - Función para limpiar municipios
 * @param {string} contexto - Contexto: 'origen' (default), 'residencia', 'segunda'
 */
export const clearDependentFields = (form, prefix = '', loadProvincias, loadMunicipios, contexto = 'origen') => {
  const { provinciaField, municipioField } = getProvinciaMunicipioFields(prefix);
  
  form.setFieldsValue({
    [provinciaField]: undefined,
    [municipioField]: undefined,
  });
  
  if (loadProvincias && typeof loadProvincias === 'function') {
    loadProvincias(null, contexto);
  }
  if (loadMunicipios && typeof loadMunicipios === 'function') {
    loadMunicipios(null, contexto);
  }
};

/**
 * Carga provincias cuando cambia un departamento
 * 
 * @param {Object} form - Instancia del formulario
 * @param {number} departamentoId - ID del departamento seleccionado
 * @param {string} prefix - Prefijo para los campos ('segunda', 'residencia' o '')
 * @param {Function} loadProvincias - Función para cargar provincias
 * @param {Function} loadMunicipios - Función para limpiar municipios
 * @param {string} contexto - Contexto: 'origen' (default), 'residencia', 'segunda'
 */
export const loadProvinciasForDepartamento = (
  form,
  departamentoId,
  prefix = '',
  loadProvincias,
  loadMunicipios,
  contexto = 'origen'
) => {
  if (!loadProvincias || typeof loadProvincias !== 'function') {
    return;
  }
  
  // Cargar provincias con el contexto correcto
  loadProvincias(departamentoId, contexto);
  
  const { provinciaField, municipioField } = getProvinciaMunicipioFields(prefix);
  
  form.setFieldsValue({
    [provinciaField]: undefined,
    [municipioField]: undefined,
  });
  
  if (loadMunicipios && typeof loadMunicipios === 'function') {
    loadMunicipios(null, contexto);
  }
};

/**
 * Limpia campos de nacionalidad boliviana
 * 
 * @param {Object} form - Instancia del formulario
 * @param {string} prefix - Prefijo para los campos ('segunda' o '')
 */
export const clearBolivianaFields = (form, prefix = '') => {
  if (!prefix) {
    form.setFieldsValue({
      departamentoId: undefined,
      provinciaId: undefined,
      municipioId: undefined,
      localidadComunidad: undefined,
    });
  } else {
    form.setFieldsValue({
      [`${prefix}DepartamentoId`]: undefined,
      [`${prefix}ProvinciaId`]: undefined,
      [`${prefix}MunicipioId`]: undefined,
      [`${prefix}LocalidadComunidad`]: undefined,
    });
  }
};

/**
 * Limpia campos de nacionalidad extranjera
 * 
 * @param {Object} form - Instancia del formulario
 * @param {string} prefix - Prefijo para los campos ('segunda' o '')
 */
export const clearExtranjeraFields = (form, prefix = '') => {
  const paisField = prefix ? `${prefix}PaisId` : 'paisId';
  const ciudadField = prefix ? `${prefix}CiudadNacimiento` : 'ciudadNacimiento';
  
  form.setFieldsValue({
    [paisField]: undefined,
    [ciudadField]: undefined,
  });
};

