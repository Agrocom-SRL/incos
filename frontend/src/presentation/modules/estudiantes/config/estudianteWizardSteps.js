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

import { createEstudianteDatosAcademicosInicialesFields } from './estudianteDatosAcademicosInicialesFields';
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
  const datosAcademicosInicialesFields = createEstudianteDatosAcademicosInicialesFields();
  const datosAcademicosInicialesSection = datosAcademicosInicialesFields.datosAcademicosIniciales;

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
    // STEP 0: Tipo de Admisión + Datos Académicos Iniciales (gestión y carrera se muestran en este mismo paso cuando tipo es ANTIGUO/TRANSITABILIDAD/TRASPASO)
    {
      title: titles.step0.title,
      formTitle: titles.step0.formTitle,
      sections: ['tipoAdmision', 'datosAcademicosIniciales'],
      config: {
        tipoAdmision: {
          title: 'TIPO DE ADMISIÓN',
          fields: [], // Los campos se renderizan mediante TipoAdmisionSelectionSection (componente visual)
        },
        datosAcademicosIniciales: {
          title: datosAcademicosInicialesSection.title,
          fields: datosAcademicosInicialesSection.fields,
          conditional: true,
          dependsOn: 'tipoAdmision',
          visibleWhenValue: ['ANTIGUO', 'TRANSITABILIDAD', 'TRASPASO'],
        },
      },
    },
    // STEP 1: Datos Personales
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
    // STEP 2: Contacto de Emergencia
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
    // STEP 3: Documentación
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

