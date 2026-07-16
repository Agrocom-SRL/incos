/**
 * estudianteGeograficosFields - Configuración de campos geográficos de origen para el formulario de registro de estudiantes
 * 
 * Single Responsibility: Definir la configuración de campos geográficos (país, idioma, etc.)
 * 
 * Este archivo separa la configuración de campos geográficos de la lógica del componente,
 * permitiendo reutilizar y modificar fácilmente los campos sin tocar el componente.
 * 
 * Estructura de cada campo:
 * - name: Nombre del campo (debe coincidir con el nombre en el backend)
 * - label: Etiqueta visible para el usuario
 * - type: Tipo de campo (input, select, date, etc.)
 * - required: Si el campo es obligatorio
 * - span: Ancho del campo en columnas (12 = 50%, 24 = 100%)
 * - options: Opciones para campos select (string para resolver con resolveOptions, o array)
 * - placeholder: Texto de ayuda en el campo
 */

/**
 * Crea los campos de nacionalidad boliviana
 * @param {string} prefix - Prefijo para los nombres de campos ('' para primera, 'segunda' para segunda)
 * @returns {Array} Array de campos de nacionalidad boliviana
 */
const createCamposBoliviana = (prefix = '') => {
  return [
    {
      name: prefix ? `${prefix}DepartamentoId` : 'departamentoId',
      label: 'Departamento',
      type: 'select',
      required: true,
      span: 12,
      options: 'departamentos',
      placeholder: 'Seleccione departamento',
    },
    {
      name: prefix ? `${prefix}ProvinciaId` : 'provinciaId',
      label: 'Provincia',
      type: 'select',
      required: true,
      span: 12,
      options: prefix === 'segunda' ? 'segundaProvincias' : 'provincias',
      placeholder: 'Seleccione provincia',
    },
    {
      name: prefix ? `${prefix}MunicipioId` : 'municipioId',
      label: 'Municipio',
      type: 'select',
      required: true,
      span: 12,
      options: prefix === 'segunda' ? 'segundaMunicipios' : 'municipios',
      placeholder: 'Seleccione municipio',
    },
    {
      name: prefix ? `${prefix}LocalidadComunidad` : 'localidadComunidad',
      label: 'Localidad / Comunidad',
      type: 'input',
      required: false,
      span: 12,
      placeholder: 'Ingrese localidad o comunidad de nacimiento',
    },
  ];
};

/**
 * Crea los campos de nacionalidad extranjera
 * @param {string} prefix - Prefijo para los nombres de campos ('' para primera, 'segunda' para segunda)
 * @returns {Array} Array de campos de nacionalidad extranjera
 */
const createCamposExtranjera = (prefix = '') => {
  return [
    {
      name: prefix ? `${prefix}PaisId` : 'paisId',
      label: 'País de nacimiento',
      type: 'select',
      required: true,
      span: 12,
      options: 'paisesExtranjeros', // Países sin Bolivia
      placeholder: 'Seleccione país de nacimiento',
    },
    {
      name: prefix ? `${prefix}CiudadNacimiento` : 'ciudadNacimiento',
      label: 'Ciudad de nacimiento',
      type: 'input',
      required: true,
      span: 12,
      placeholder: 'Ingrese ciudad de nacimiento',
      description: 'Ciudad donde nació el estudiante',
    },
  ];
};

/**
 * Crea la configuración de campos geográficos de origen para el registro de estudiantes
 * 
 * Los campos geográficos incluyen:
 * - Idioma más hablado (select) - idioma que más habla
 * - Idioma secundario (select) - segundo idioma que más habla
 * - Tipo de origen/Nacionalidad (radio) - BOLIVIANA, EXTRANJERA, DOBLE_NACIONALIDAD
 * - Doble nacionalidad (switch) - indica si tiene doble nacionalidad
 * - Primera nacionalidad (radio) - BOLIVIANA o EXTRANJERA (solo si es doble nacionalidad)
 * 
 * Nota: Los idiomas tienen exclusión mutua (el seleccionado en uno no aparece en el otro)
 * 
 * @returns {Object} Configuración de campos organizados por sección
 */
export const createEstudianteGeograficosFields = () => {
  return {
    geograficos: {
      title: 'DATOS GEOGRÁFICOS DE ORIGEN',
      fields: [
        // Idioma más hablado (idioma que más habla)
        {
          name: 'idiomaMaternoId',
          label: 'Idioma más hablado',
          type: 'select',
          required: false,
          span: 12,
          options: 'idiomas',
          placeholder: 'Seleccione idioma más hablado',
          excludeFrom: 'idiomaSecundarioId', // Excluir el valor seleccionado de este campo en idiomaSecundarioId
        },
        // Idioma secundario (segundo idioma más hablado)
        {
          name: 'idiomaSecundarioId',
          label: 'Idioma secundario',
          type: 'select',
          required: false,
          span: 12,
          options: 'idiomas',
          placeholder: 'Seleccione idioma secundario',
          excludeFrom: 'idiomaMaternoId', // Excluir el valor seleccionado de este campo en idiomaMaternoId
        },
        // Tipo de origen/Nacionalidad
        {
          name: 'tipoOrigen',
          label: 'Nacionalidad',
          type: 'radio',
          required: true,
          span: 12,
          options: 'tiposOrigen', // Debe incluir: BOLIVIANA, EXTRANJERA, DOBLE_NACIONALIDAD
        },
        // Primera nacionalidad (solo visible si tipoOrigen es DOBLE_NACIONALIDAD)
        {
          name: 'primeraNacionalidad',
          label: 'Primera nacionalidad',
          type: 'radio',
          required: true,
          span: 12,
          options: 'tiposOrigenPrimera', // Debe incluir solo: BOLIVIANA, EXTRANJERA
          conditional: true,
          dependsOn: 'tipoOrigen',
          showIf: (tipoOrigen) => tipoOrigen === 'DOBLE_NACIONALIDAD',
        },
        // Sub-sección condicional para Nacionalidad Boliviana (caso simple, no doble)
        {
          type: 'subsection',
          subsectionTitle: 'Datos de nacionalidad boliviana',
          conditional: true,
          dependsOn: 'tipoOrigen',
          showIf: (tipoOrigen) => tipoOrigen === 'BOLIVIANA',
          fields: createCamposBoliviana(),
        },
        // Sub-sección condicional para Nacionalidad Extranjera (caso simple, no doble)
        {
          type: 'subsection',
          subsectionTitle: 'Datos de nacionalidad extranjera',
          conditional: true,
          dependsOn: 'tipoOrigen',
          showIf: (tipoOrigen) => tipoOrigen === 'EXTRANJERA',
          fields: createCamposExtranjera(),
        },
        // Sub-sección para Primera nacionalidad - Boliviana (doble nacionalidad)
        // Si primeraNacionalidad = BOLIVIANA, mostrar campos bolivianos como primera
        {
          type: 'subsection',
          subsectionTitle: 'Datos de la primera nacionalidad',
          conditional: true,
          dependsOn: ['tipoOrigen', 'primeraNacionalidad'],
          showIf: (allFormValues) => {
            return allFormValues?.tipoOrigen === 'DOBLE_NACIONALIDAD' && 
                   allFormValues?.primeraNacionalidad === 'BOLIVIANA';
          },
          fields: createCamposBoliviana(),
        },
        // Sub-sección para Primera nacionalidad - Extranjera (doble nacionalidad)
        // Si primeraNacionalidad = EXTRANJERA, mostrar campos extranjeros como primera
        {
          type: 'subsection',
          subsectionTitle: 'Datos de la primera nacionalidad',
          conditional: true,
          dependsOn: ['tipoOrigen', 'primeraNacionalidad'],
          showIf: (allFormValues) => {
            return allFormValues?.tipoOrigen === 'DOBLE_NACIONALIDAD' && 
                   allFormValues?.primeraNacionalidad === 'EXTRANJERA';
          },
          fields: createCamposExtranjera(),
        },
        // Sub-sección para Segunda Nacionalidad - Extranjera (doble nacionalidad)
        // Si primeraNacionalidad = BOLIVIANA, la segunda es EXTRANJERA (automáticamente)
        {
          type: 'subsection',
          subsectionTitle: 'Datos de segunda nacionalidad',
          conditional: true,
          dependsOn: ['tipoOrigen', 'primeraNacionalidad'],
          showIf: (allFormValues) => {
            return allFormValues?.tipoOrigen === 'DOBLE_NACIONALIDAD' && 
                   allFormValues?.primeraNacionalidad === 'BOLIVIANA';
          },
          fields: createCamposExtranjera('segunda'),
        },
        // Sub-sección para Segunda Nacionalidad - Boliviana (doble nacionalidad)
        // Si primeraNacionalidad = EXTRANJERA, la segunda es BOLIVIANA (automáticamente)
        {
          type: 'subsection',
          subsectionTitle: 'Datos de segunda nacionalidad',
          conditional: true,
          dependsOn: ['tipoOrigen', 'primeraNacionalidad'],
          showIf: (allFormValues) => {
            return allFormValues?.tipoOrigen === 'DOBLE_NACIONALIDAD' && 
                   allFormValues?.primeraNacionalidad === 'EXTRANJERA';
          },
          fields: createCamposBoliviana('segunda'),
        },
      ],
    },
  };
};

