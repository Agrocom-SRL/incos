/**
 * estudianteTransitabilidadFields - Configuración de campos del paso Transitabilidad (tabla instituciones + transitabilidades)
 *
 * Single Responsibility: Definir la configuración de campos de transitabilidad para FormSection/FormField.
 *
 * Solo se muestra cuando tipo de admisión es TRANSITABILIDAD.
 * La carrera en INCOS ya se eligió en el paso "Tipo de Admisión"; no se repite aquí.
 *
 * Secciones según 15-transitabilidades.sql:
 * - Formación académica: datos de institución de origen (tabla instituciones) + carrera_origen, anio_conclusion (tabla transitabilidades).
 * La sección "Cumplimiento de los requisitos" (estado/motivo_no_procedente) ya no se usa en el formulario; el backend acepta valores por defecto.
 */

/**
 * Crea la configuración de secciones del paso Transitabilidad
 *
 * @returns {Object} Configuración de secciones para el step Transitabilidad
 */
export const createEstudianteTransitabilidadFields = () => {
  return {
    formacionAcademica: {
      title: 'Formación académica',
      fields: [
        // Datos de la institución de origen (tabla instituciones) - Sección 2 del formulario
        {
          name: 'transitabilidad_institucion_nombre',
          label: 'Unidad Educativa Técnica Humanística Plena / Centro de Educación Alternativa',
          type: 'input',
          inputType: 'text',
          required: true,
          span: 24,
          placeholder: 'Nombre completo de la institución de origen',
        },
        {
          name: 'transitabilidad_codigo_sie',
          label: 'Código SIE-UE',
          type: 'input',
          inputType: 'text',
          required: false,
          span: 12,
          placeholder: 'Código del sistema de información educativa',
        },
        // Datos específicos de transitabilidades (carrera y año en origen)
        {
          name: 'transitabilidad_carrera_origen',
          label: 'Carrera',
          type: 'input',
          inputType: 'text',
          required: true,
          span: 12,
          placeholder: 'Ej: Técnico Medio en Contabilidad',
        },
        {
          name: 'transitabilidad_anio_conclusion',
          label: 'Año de conclusión de estudio',
          type: 'input',
          inputType: 'number',
          required: false,
          span: 12,
          placeholder: 'Ej: 2023',
        },
        {
          name: 'transitabilidad_dependencia',
          label: 'Dependencia',
          type: 'select',
          required: false,
          span: 12,
          options: [
            { label: 'Fiscal', value: 'FISCAL' },
            { label: 'Convenio', value: 'CONVENIO' },
            { label: 'Privado', value: 'PRIVADO' },
          ],
          placeholder: 'Seleccione dependencia',
        },
        {
          name: 'transitabilidad_tipo',
          label: 'Nivel académico alcanzado',
          type: 'radio',
          required: true,
          span: 12,
          options: [
            { label: 'Técnico Medio UETHP', value: 'UETHP' },
            { label: 'Técnico Medio CEA', value: 'CEA' },
          ],
        },
        {
          name: 'transitabilidad_regimen_estudios',
          label: 'Régimen de estudios',
          type: 'radio',
          required: true,
          span: 12,
          options: [
            { label: 'Semestral', value: 'SEMESTRAL' },
            { label: 'Anual', value: 'ANUAL' },
          ],
        },
        {
          name: 'transitabilidad_departamento_id',
          label: 'Departamento',
          type: 'select',
          required: false,
          span: 12,
          options: 'departamentos',
          placeholder: 'Seleccione departamento',
        },
        {
          name: 'transitabilidad_distrito_educativo',
          label: 'Distrito educativo',
          type: 'input',
          inputType: 'text',
          required: false,
          span: 12,
          placeholder: 'Distrito educativo al que pertenece',
        },
      ],
    },
  };
};
