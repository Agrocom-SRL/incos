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
 * Crea la configuración de campos geográficos de origen para el registro de estudiantes
 * 
 * Los campos geográficos incluyen:
 * - Idioma Más Hablado (select) - idioma que más habla
 * - Idioma Secundario (select) - segundo idioma que más habla
 * - Tipo de Origen/Nacionalidad (radio)
 * 
 * Nota: Los idiomas tienen exclusión mutua (el seleccionado en uno no aparece en el otro)
 * 
 * @returns {Object} Configuración de campos organizados por sección
 */
export const createEstudianteGeograficosFields = () => {
  return {
    geograficos: {
      title: 'Datos Geográficos de Origen',
      fields: [
        // Idioma Más Hablado (idioma que más habla)
        {
          name: 'idiomaMaternoId',
          label: 'Idioma Más Hablado',
          type: 'select',
          required: false,
          span: 12,
          options: 'idiomas',
          placeholder: 'Seleccione idioma más hablado',
          excludeFrom: 'idiomaSecundarioId', // Excluir el valor seleccionado de este campo en idiomaSecundarioId
        },
        // Idioma Secundario (segundo idioma más hablado)
        {
          name: 'idiomaSecundarioId',
          label: 'Idioma Secundario',
          type: 'select',
          required: false,
          span: 12,
          options: 'idiomas',
          placeholder: 'Seleccione idioma secundario',
          excludeFrom: 'idiomaMaternoId', // Excluir el valor seleccionado de este campo en idiomaMaternoId
        },
        // Tipo de Origen/Nacionalidad
        {
          name: 'tipoOrigen',
          label: 'Nacionalidad',
          type: 'radio',
          required: true,
          span: 12,
          options: 'tiposOrigen',
        },
      ],
    },
  };
};

