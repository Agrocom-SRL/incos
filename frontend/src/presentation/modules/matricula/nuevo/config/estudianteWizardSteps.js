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
    title: 'Tipo de admisión',
    formTitle: 'Seleccione el tipo de admisión',
    sectionTitle: 'Tipo de admisión',
    description:
      'Seleccione cómo ingresa el estudiante al instituto; según el tipo elegido se habilitan datos y pasos adicionales.',
  },
  stepTransitabilidad: {
    title: 'Datos de transitabilidad',
    formTitle: 'Formulario de transitabilidad',
    sectionTitle: 'Datos de transitabilidad',
    description:
      'Registre los datos académicos de la institución de origen que respaldan la transitabilidad.',
  },
  stepTraspaso: {
    title: 'Datos de traspaso',
    formTitle: 'Formulario de traspaso',
    sectionTitle: 'Datos de traspaso',
    description:
      'Registre los datos del instituto de origen desde el cual se traslada el estudiante.',
  },
  step1: {
    title: 'Datos generales',
    formTitle: 'Información personal del estudiante',
    sectionTitle: 'Datos personales',
    description:
      'Registre la información personal, geográfica y de contacto del estudiante.',
  },
  step2: {
    title: 'Contacto de emergencia',
    formTitle: 'Datos de contacto de emergencia',
    sectionTitle: 'Datos de contacto de emergencia',
    description:
      'Registre al menos un contacto al cual acudir en caso de emergencia.',
  },
  step3: {
    title: 'Documentación',
    formTitle: 'Documentación del estudiante',
    sectionTitle: 'Documentación requerida',
    description:
      'Marque los documentos entregados por el estudiante; los pendientes pueden quedar registrados en trámite.',
  },
};

/**
 * Títulos de los pasos. El modo "completar" ya no prefija los títulos (producía
 * literales inválidos como «Completar Seleccione el tipo de admisión»); el matiz
 * lo comunica el título de la página («Completar registro de admisión»).
 * @param {boolean} _completarMode - Conservado por compatibilidad de firma.
 * @returns {Object}
 */
const buildTitles = (_completarMode) => BASE_TITLES;

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
    // STEP 0: Tipo de admisión + Datos Académicos Iniciales (gestión y carrera se muestran en este mismo paso cuando tipo es ANTIGUO/TRANSITABILIDAD/TRASPASO)
    {
      title: titles.step0.title,
      formTitle: titles.step0.formTitle,
      description: titles.step0.description,
      sections: ['tipoAdmision', 'datosAcademicosIniciales'],
      config: {
        tipoAdmision: {
          title: titles.step0.sectionTitle,
          description: 'Elija la opción que corresponda a la situación del estudiante.',
          fields: [], // Los campos se renderizan mediante TipoAdmisionSelectionSection (componente visual)
        },
        datosAcademicosIniciales: {
          title: datosAcademicosInicialesSection.title,
          description:
            'Seleccione la gestión de ingreso y la carrera en la que se inscribe el estudiante.',
          fields: datosAcademicosInicialesSection.fields,
          conditional: true,
          dependsOn: 'tipoAdmision',
          visibleWhenValue: ['ANTIGUO', 'TRANSITABILIDAD', 'TRASPASO'],
        },
      },
    },
    // STEP 1: Datos Personales (Datos generales)
    {
      title: titles.step1.title,
      formTitle: titles.step1.formTitle,
      description: titles.step1.description,
      sections: ['datosPersonales', 'discapacidad', 'geograficos', 'contacto'],
      config: {
        datosPersonales: {
          title: titles.step1.sectionTitle,
          description: 'Datos de identidad del estudiante tal como figuran en su documento.',
          fields: datosPersonalesFields.fields,
        },
        discapacidad: {
          title: discapacidadFields.title,
          description: 'Detalle el tipo y grado de discapacidad declarados por el estudiante.',
          fields: discapacidadFields.fields,
          conditional: true, // Sección condicional
          dependsOn: 'tieneDiscapacidad', // Depende del campo tieneDiscapacidad
        },
        geograficos: {
          title: geograficosFields.title,
          description: 'Idiomas, nacionalidad y lugar de origen del estudiante.',
          fields: geograficosFields.fields,
        },
        contacto: {
          title: contactoFields.title,
          description: 'Datos de contacto, residencia y situación laboral del estudiante.',
          fields: contactoFields.fields,
        },
      },
    },
    // STEP 2 (dinámico): Datos de transitabilidad. Solo visible cuando tipoAdmision === 'TRANSITABILIDAD'. Sin sección Cumplimiento de requisitos.
    {
      title: titles.stepTransitabilidad.title,
      formTitle: titles.stepTransitabilidad.formTitle,
      description: titles.stepTransitabilidad.description,
      sections: ['formacionAcademica'],
      config: {
        formacionAcademica: {
          ...transitabilidadFields.formacionAcademica,
          description: 'Información académica de la institución de origen.',
        },
      },
    },
    // STEP 2 (dinámico): Datos de traspaso. Solo visible cuando tipoAdmision === 'TRASPASO'. Sin sección Cumplimiento de requisitos.
    {
      title: titles.stepTraspaso.title,
      formTitle: titles.stepTraspaso.formTitle,
      description: titles.stepTraspaso.description,
      sections: ['formacionAcademica'],
      config: {
        formacionAcademica: {
          ...traspasoFields.formacionAcademica,
          description: 'Información académica de la institución de origen.',
        },
      },
    },
    // STEP 2: Contacto de emergencia
    {
      title: titles.step2.title,
      formTitle: titles.step2.formTitle,
      description: titles.step2.description,
      sections: ['contactoEmergencia'],
      config: {
        contactoEmergencia: {
          title: titles.step2.sectionTitle,
          description:
            'Puede registrar más de un contacto e indicar si vive con el estudiante.',
          fields: contactoEmergenciaFields.fields,
        },
      },
    },
    // STEP 3: Documentación
    {
      title: titles.step3.title,
      formTitle: titles.step3.formTitle,
      description: titles.step3.description,
      sections: ['documentacion'],
      config: {
        documentacion: {
          title: titles.step3.sectionTitle,
          description:
            'Los documentos obligatorios están marcados con asterisco; puede indicar la entrega o el motivo de no entrega de cada uno.',
          fields: [
            // Por ahora sin campos, se agregarán en la siguiente iteración
          ],
        },
      },
    },
  ];
};

