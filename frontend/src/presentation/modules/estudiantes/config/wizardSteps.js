// modules/estudiantes/config/wizardSteps.js
/**
 * Configuración de pasos para el wizard de registro de estudiantes
 */

import { studentFormFields } from './formFields.js';

// Paso 1: Datos Personales, Geográficos y Contacto
export const wizardStep1 = {
  title: 'Datos Personales',
  description: 'Información básica, origen y contacto',
  formTitle: 'Datos Personales, Geográficos y Contacto',
  config: {
    personalData: studentFormFields.personalData,
    geographicData: studentFormFields.geographicData,
    contactData: studentFormFields.contactData,
  },
  sections: ['personalData', 'geographicData', 'contactData'],
};

// Paso 2: Documentos
export const wizardStep2 = {
  title: 'Documentos',
  description: 'Documentación requerida',
  formTitle: 'Documentos Requeridos',
  config: {
    documents: studentFormFields.documents,
  },
  sections: ['documents'],
};

// Paso 3: Datos Académicos
export const wizardStep3 = {
  title: 'Datos Académicos',
  description: 'Carrera y gestión de ingreso',
  formTitle: 'Datos Académicos',
  config: {
    academicData: studentFormFields.academicData,
    observations: studentFormFields.observations,
  },
  sections: ['academicData', 'observations'],
};

// Configuración completa del wizard
export const studentWizardSteps = [
  wizardStep1,
  wizardStep2,
  wizardStep3,
];

