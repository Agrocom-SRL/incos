/**
 * estudianteWizardSteps - Configuración de pasos para el wizard de registro de estudiantes
 *
 * Single Responsibility: Definir los pasos, títulos y configuración del wizard de registro.
 * Incluye títulos según modo (nuevo vs completar) en un solo lugar.
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
import { createEstudianteTransitabilidadFields } from './estudianteTransitabilidadFields';
import { createEstudianteTraspasoFields } from './estudianteTraspasoFields';

const BASE_TITLES = {
  step0: {
    title: 'Tipo de Admisión',
    formTitle: 'Seleccione el Tipo de Admisión',
    sectionTitle: 'TIPO DE ADMISIÓN',
  },
  stepTransitabilidad: {
    title: 'Datos de Transitabilidad',
    formTitle: 'Formulario de Transitabilidad',
    sectionTitle: 'DATOS DE TRANSITABILIDAD',
  },
  stepTraspaso: {
    title: 'Datos de Traspaso',
    formTitle: 'Formulario de Traspaso',
    sectionTitle: 'DATOS DE TRASPASO',
  },
  step1: {
    title: 'Datos Generales',
    formTitle: 'Información Personal del Estudiante',
    sectionTitle: 'DATOS PERSONALES',
  },
  step2: {
    title: 'Contacto de Emergencia',
    formTitle: 'Datos de Contacto de Emergencia',
    sectionTitle: 'DATOS DE CONTACTO DE EMERGENCIA',
  },
  step3: {
    title: 'Documentación',
    formTitle: 'Documentación del Estudiante',
    sectionTitle: 'DOCUMENTACIÓN REQUERIDA',
  },
};

/**
 * Construye el objeto de títulos según el modo (nuevo o completar).
 * @param {boolean} completarMode
 * @returns {Object}
 */
const buildTitles = (completarMode) => {
  if (!completarMode) return BASE_TITLES;
  return {
    step0: { title: `Completar ${BASE_TITLES.step0.title}`, formTitle: `Completar ${BASE_TITLES.step0.formTitle}`, sectionTitle: `Completar ${BASE_TITLES.step0.sectionTitle}` },
    stepTransitabilidad: { title: `Completar ${BASE_TITLES.stepTransitabilidad.title}`, formTitle: `Completar ${BASE_TITLES.stepTransitabilidad.formTitle}`, sectionTitle: `Completar ${BASE_TITLES.stepTransitabilidad.sectionTitle}` },
    stepTraspaso: { title: `Completar ${BASE_TITLES.stepTraspaso.title}`, formTitle: `Completar ${BASE_TITLES.stepTraspaso.formTitle}`, sectionTitle: `Completar ${BASE_TITLES.stepTraspaso.sectionTitle}` },
    step1: { title: `Completar ${BASE_TITLES.step1.title}`, formTitle: `Completar ${BASE_TITLES.step1.formTitle}`, sectionTitle: `Completar ${BASE_TITLES.step1.sectionTitle}` },
    step2: { title: `Completar ${BASE_TITLES.step2.title}`, formTitle: `Completar ${BASE_TITLES.step2.formTitle}`, sectionTitle: `Completar ${BASE_TITLES.step2.sectionTitle}` },
    step3: { title: `Completar ${BASE_TITLES.step3.title}`, formTitle: `Completar ${BASE_TITLES.step3.formTitle}`, sectionTitle: `Completar ${BASE_TITLES.step3.sectionTitle}` },
  };
};

/**
 * Crea la configuración de pasos para el wizard de registro de estudiantes.
 * Los títulos se resuelven aquí según completarMode (única fuente de verdad).
 *
 * @param {boolean} [completarMode=false] - Si es true, los títulos usan prefijo "Completar"
 * @returns {Array} Array de configuración de pasos para WizardForm
 */
export const createEstudianteWizardSteps = (completarMode = false) => {
  const titles = buildTitles(completarMode);
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

  const transitabilidadFields = createEstudianteTransitabilidadFields();
  const traspasoFields = createEstudianteTraspasoFields();

  return [
    // STEP 0: Tipo de Admisión + Datos Académicos Iniciales (gestión y carrera se muestran en este mismo paso cuando tipo es ANTIGUO/TRANSITABILIDAD/TRASPASO)
    {
      title: titles.step0.title,
      formTitle: titles.step0.formTitle,
      sections: ['tipoAdmision', 'datosAcademicosIniciales'],
      config: {
        tipoAdmision: {
          title: titles.step0.sectionTitle,
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
    // STEP 1: Datos Personales (Datos Generales)
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
    // STEP 2 (dinámico): Datos de Transitabilidad. Solo visible cuando tipoAdmision === 'TRANSITABILIDAD'. Sin sección Cumplimiento de requisitos.
    {
      title: titles.stepTransitabilidad.title,
      formTitle: titles.stepTransitabilidad.formTitle,
      sections: ['formacionAcademica'],
      config: {
        formacionAcademica: transitabilidadFields.formacionAcademica,
      },
    },
    // STEP 2 (dinámico): Datos de Traspaso. Solo visible cuando tipoAdmision === 'TRASPASO'. Sin sección Cumplimiento de requisitos.
    {
      title: titles.stepTraspaso.title,
      formTitle: titles.stepTraspaso.formTitle,
      sections: ['formacionAcademica'],
      config: {
        formacionAcademica: traspasoFields.formacionAcademica,
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

