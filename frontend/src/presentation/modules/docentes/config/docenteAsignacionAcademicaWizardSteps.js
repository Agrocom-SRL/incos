/**
 * Pasos del wizard de asignación académica (docente ↔ curso), mismo patrón que inscripciones / WizardForm.
 * Cada paso usa `renderSectionContent` en la página; `panel` es un marcador mínimo para la config del wizard.
 */

const panel = (title) => ({
  title,
  fields: [],
});

/** @returns {Array<Object>} pasos para WizardForm */
export function createDocenteAsignacionAcademicaWizardSteps() {
  return [
    {
      title: 'Plan habilitado',
      formTitle: 'Plan habilitado en la gestión',
      sections: ['panel'],
      config: {
        panel: panel('Plan'),
      },
    },
    {
      title: 'Periodo',
      formTitle: 'Periodo del plan de estudios',
      sections: ['panel'],
      config: {
        panel: panel('Periodo'),
      },
    },
    {
      title: 'Paralelo',
      formTitle: 'Paralelo (oferta)',
      sections: ['panel'],
      config: {
        panel: panel('Paralelo'),
      },
    },
    {
      title: 'Curso',
      formTitle: 'Curso / materia',
      sections: ['panel'],
      config: {
        panel: panel('Curso'),
      },
    },
    {
      title: 'Confirmar',
      formTitle: 'Resumen y asignaciones',
      sections: ['panel'],
      config: {
        panel: panel('Confirmar'),
      },
    },
  ];
}
