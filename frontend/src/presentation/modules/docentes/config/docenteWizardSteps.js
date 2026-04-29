/**
 * Pasos del wizard de alta/edición de docente (misma forma que estudianteWizardSteps).
 */

import {
  createDocenteDatosPersonalesFields,
  DOCENTE_DATOS_PERSONALES_FIELD_NAMES,
} from './docenteDatosPersonalesFields';
import {
  createDocenteFormacionLaboralFields,
  DOCENTE_FORMACION_LABORAL_FIELD_NAMES,
} from './docenteFormacionLaboralFields';

/** Todos los `name` del formulario — validación al enviar (último paso). */
export const DOCENTE_WIZARD_ALL_FIELD_NAMES = [
  ...DOCENTE_DATOS_PERSONALES_FIELD_NAMES,
  ...DOCENTE_FORMACION_LABORAL_FIELD_NAMES,
];

/**
 * @returns {Array} Configuración de pasos para WizardForm (FormSection vía config).
 */
export function createDocenteWizardSteps() {
  const datosPersonales = createDocenteDatosPersonalesFields();
  const formacionLaboral = createDocenteFormacionLaboralFields();

  return [
    {
      title: 'Datos personales',
      formTitle: 'Identificación y contacto',
      sections: ['identidad', 'contactoDomicilio'],
      config: {
        identidad: datosPersonales.identidad,
        contactoDomicilio: datosPersonales.contactoDomicilio,
      },
    },
    {
      title: 'Formación y laboral',
      formTitle: 'Formación académica y condición laboral',
      sections: ['formacionAcademica', 'condicionLaboral'],
      config: {
        formacionAcademica: formacionLaboral.formacionAcademica,
        condicionLaboral: formacionLaboral.condicionLaboral,
      },
    },
  ];
}
