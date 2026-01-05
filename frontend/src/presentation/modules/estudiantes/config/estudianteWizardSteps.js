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

import { createEstudianteDatosPersonalesFields } from './estudianteDatosPersonalesFields';
import { createEstudianteContactoFields } from './estudianteContactoFields';
import { createEstudianteGeograficosFields } from './estudianteGeograficosFields';
import { createEstudianteDiscapacidadFields } from './estudianteDiscapacidadFields';
import { createEstudianteContactoEmergenciaFields } from './estudianteContactoEmergenciaFields';

/**
 * Crea la configuración de pasos para el wizard de registro de estudiantes
 * 
 * NOTA: Los títulos dinámicos se manejan en el hook useEstudianteWizardTitles
 * Esta función solo retorna la estructura base de los pasos con títulos estáticos
 * 
 * @param {Object} titles - Objeto con títulos dinámicos (viene del hook useEstudianteWizardTitles)
 * @returns {Array} Array de configuración de pasos para WizardForm
 */
export const createEstudianteWizardSteps = (titles) => {
  // Obtener configuración de campos
  const estudianteDatosPersonalesFields = createEstudianteDatosPersonalesFields();
  const datosPersonalesFields = estudianteDatosPersonalesFields.datosPersonales;

  const estudianteContactoFields = createEstudianteContactoFields();
  const contactoFields = estudianteContactoFields.contacto;

  const estudianteGeograficosFields = createEstudianteGeograficosFields();
  const geograficosFields = estudianteGeograficosFields.geograficos;

  const estudianteDiscapacidadFields = createEstudianteDiscapacidadFields();
  const discapacidadFields = estudianteDiscapacidadFields.discapacidad;

  const estudianteContactoEmergenciaFields = createEstudianteContactoEmergenciaFields();
  const contactoEmergenciaFields = estudianteContactoEmergenciaFields.contactoEmergencia;

  return [
    {
      title: titles.step1.title,
      formTitle: titles.step1.formTitle,
      sections: ['datosPersonales', 'discapacidad', 'geograficos', 'contacto'],
      config: {
        datosPersonales: {
          title: titles.step1.sectionTitle,
          fields: datosPersonalesFields.fields,
        },
        discapacidad: {
          title: discapacidadFields.title,
          fields: discapacidadFields.fields,
          conditional: true, // Sección condicional
          dependsOn: 'tieneDiscapacidad', // Depende del campo tieneDiscapacidad
        },
        geograficos: {
          title: geograficosFields.title,
          fields: geograficosFields.fields,
        },
        contacto: {
          title: contactoFields.title,
          fields: contactoFields.fields,
        },
      },
    },
    {
      title: titles.step2.title,
      formTitle: titles.step2.formTitle,
      sections: ['contactoEmergencia'],
      config: {
        contactoEmergencia: {
          title: titles.step2.sectionTitle,
          fields: contactoEmergenciaFields.fields,
        },
      },
    },
    {
      title: titles.step3.title,
      formTitle: titles.step3.formTitle,
      sections: ['documentacion'],
      config: {
        documentacion: {
          title: titles.step3.sectionTitle,
          fields: [
            // Por ahora sin campos, se agregarán en la siguiente iteración
          ],
        },
      },
    },
  ];
};

