// modules/estudiantes/config/wizardSteps.js
/**
 * Configuración de pasos para el wizard de registro de estudiantes
 * 
 * Responsabilidad: Generar configuración de pasos del wizard
 */

import { studentFormFields } from './formFields.js';
import { generateDocumentFields } from '../helpers';

// Paso 1: Datos Personales, Geográficos y Contacto
export const wizardStep1 = {
  title: 'Datos Personales',
  description: 'Información básica, origen y contacto',
  formTitle: 'Datos Personales, Geográficos y Contacto',
  config: {
    personalData: studentFormFields.personalData,
    geographicData: studentFormFields.geographicData,
    contactData: studentFormFields.contactData,
    disabilityData: studentFormFields.disabilityData, // Sección condicional
  },
  sections: ['personalData', 'disabilityData', 'geographicData', 'contactData'],
};

// Paso 2: Documentos (generado dinámicamente)
export const createWizardStep2 = (documentacionInscripcion = [], documentosExistentes = {}) => ({
  title: 'Documentos',
  description: 'Documentación requerida',
  formTitle: 'Documentos Requeridos',
  config: {
    documents: {
      title: 'Documentos Requeridos',
      fields: generateDocumentFields(documentacionInscripcion, documentosExistentes),
    },
  },
  sections: ['documents'],
});

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

/**
 * Genera la configuración completa del wizard con campos de documentos dinámicos
 * @param {Array} documentacionInscripcion - Lista de documentos requeridos
 * @param {Object} documentosExistentes - Documentos ya subidos
 * @returns {Array} Configuración completa de pasos del wizard
 */
export const generateStudentWizardSteps = (
  documentacionInscripcion = [],
  documentosExistentes = {}
) => [
  wizardStep1,
  createWizardStep2(documentacionInscripcion, documentosExistentes),
  wizardStep3,
];

// Configuración por defecto (sin documentos dinámicos)
export const studentWizardSteps = [
  wizardStep1,
  {
    title: 'Documentos',
    description: 'Documentación requerida',
    formTitle: 'Documentos Requeridos',
    config: {
      documents: studentFormFields.documents || { title: 'Documentos Requeridos', fields: [] },
    },
    sections: ['documents'],
  },
  wizardStep3,
];

