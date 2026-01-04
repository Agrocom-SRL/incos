/**
 * estudianteWizardSteps - Configuración de pasos para el wizard de registro de estudiantes
 * 
 * Single Responsibility: Definir los pasos y su configuración para el wizard de registro
 * 
 * Este archivo separa la configuración de los pasos de la lógica del componente,
 * permitiendo reutilizar y modificar fácilmente los pasos sin tocar el componente.
 * 
 * Estructura de cada step:
 * - title: Título del paso (se muestra en el indicador de Steps)
 * - formTitle: Título del formulario del paso (opcional)
 * - sections: Array de secciones a mostrar en este paso
 * - config: Configuración completa del formulario (secciones con campos)
 */

/**
 * Crea la configuración de pasos para el wizard de registro de estudiantes
 * 
 * @param {boolean} completarMode - Si es true, cambia los títulos para modo "completar"
 * @returns {Array} Array de configuración de pasos para WizardForm
 */
export const createEstudianteWizardSteps = (completarMode = false) => {
  // Títulos según el modo
  const step1Title = completarMode ? 'Completar Datos Generales' : 'Datos Generales';
  const step1FormTitle = completarMode 
    ? 'Completar Información Personal del Estudiante'
    : 'Información Personal del Estudiante';
  const step1SectionTitle = completarMode ? 'Completar Datos Personales' : 'Datos Personales';
  
  const step2Title = completarMode ? 'Completar Documentación' : 'Documentación';
  const step2FormTitle = completarMode
    ? 'Completar Documentación del Estudiante'
    : 'Documentación del Estudiante';
  const step2SectionTitle = completarMode ? 'Completar Documentos Requeridos' : 'Documentos Requeridos';

  return [
    {
      title: step1Title,
      formTitle: step1FormTitle,
      sections: ['datosPersonales'],
      config: {
        datosPersonales: {
          title: step1SectionTitle,
          fields: [
            // Por ahora sin campos, se agregarán en la siguiente iteración
            // Ejemplo de estructura futura:
            // {
            //   name: 'nombres',
            //   label: 'Nombres',
            //   type: 'text',
            //   required: true,
            // }
          ],
        },
      },
    },
    {
      title: step2Title,
      formTitle: step2FormTitle,
      sections: ['documentacion'],
      config: {
        documentacion: {
          title: step2SectionTitle,
          fields: [
            // Por ahora sin campos, se agregarán en la siguiente iteración
          ],
        },
      },
    },
  ];
};

