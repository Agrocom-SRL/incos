// modules/estudiantes/config/wizardSteps.js
/**
 * Configuración de pasos para el wizard de registro de estudiantes
 * 
 * Responsabilidad: Generar configuración de pasos del wizard
 */

import { studentFormFields } from './formFields.js';
import { generateDocumentFields, generateUploadDocumentFields } from '../helpers';

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
      title: 'Documentos Entregados',
      fields: generateDocumentFields(documentacionInscripcion, documentosExistentes),
    },
    // Sección de Subir Documentos temporalmente oculta
    // uploadDocuments: {
    //   title: 'Subir Documentos',
    //   fields: generateUploadDocumentFields(documentacionInscripcion),
    // },
  },
  sections: ['documents'], // Removido 'uploadDocuments' temporalmente
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
    createWizardStep2(documentacionInscripcion, documentosExistentes), // Documentos primero
    wizardStep1,
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

