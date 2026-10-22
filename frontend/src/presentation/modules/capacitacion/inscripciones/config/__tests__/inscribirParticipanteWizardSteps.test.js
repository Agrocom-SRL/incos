import { describe, it, expect } from 'vitest';
import { createInscribirParticipanteWizardSteps } from '../inscribirParticipanteWizardSteps';

describe('createInscribirParticipanteWizardSteps', () => {
  it('curso gratuito: 4 pasos, con formTitle propio y el resumen como paso 4', () => {
    const steps = createInscribirParticipanteWizardSteps({
      modoParticipante: 'existente',
      ofrecePago: false,
    });

    expect(steps.map((s) => s.title)).toEqual(['Participante', 'Curso', 'Grupo y requisitos', 'Resumen']);
    expect(steps.map((s) => s.formTitle)).toEqual([
      'Datos del participante',
      'Curso de capacitación',
      'Grupo y requisitos',
      'Resumen de la inscripción',
    ]);
    expect(steps[2].sections).toEqual(['grupo', 'requisitos']);
    expect(steps[3].sections).toEqual(['resumen']);
    // El resumen solo aparece en el último paso.
    expect(steps[0].sections).not.toContain('resumen');
    expect(steps[1].sections).not.toContain('resumen');
  });

  it('curso con costo: agrega «Pago inicial» y el resumen es el paso 5', () => {
    const steps = createInscribirParticipanteWizardSteps({
      modoParticipante: 'existente',
      ofrecePago: true,
    });

    expect(steps.map((s) => s.title)).toEqual([
      'Participante',
      'Curso',
      'Grupo y requisitos',
      'Pago inicial',
      'Resumen',
    ]);
    expect(steps[3].formTitle).toBe('Pago inicial');
    expect(steps[3].sections).toEqual(['pago']);
    expect(steps[4].sections).toEqual(['resumen']);
    expect(steps[2].sections).toEqual(['grupo', 'requisitos']);
  });

  it('cada sección declarada tiene {title, description} en config', () => {
    const steps = createInscribirParticipanteWizardSteps({
      modoParticipante: 'existente',
      ofrecePago: true,
    });
    steps.forEach((step) => {
      step.sections.forEach((key) => {
        expect(step.config[key]?.title, `${step.title}/${key}`).toBeTruthy();
        expect(step.config[key]?.description, `${step.title}/${key}`).toBeTruthy();
      });
    });
  });

  it('paso 1: modo existente trae los campos search+list; modo nuevo no trae campos declarativos', () => {
    const existente = createInscribirParticipanteWizardSteps({
      modoParticipante: 'existente',
      ofrecePago: false,
    })[0];
    const nuevo = createInscribirParticipanteWizardSteps({
      modoParticipante: 'nuevo',
      ofrecePago: false,
    })[0];

    expect(existente.config.participante.fields.map((f) => f.type)).toEqual(['search', 'list']);
    expect(nuevo.config.participante.fields).toEqual([]);
    expect(nuevo.description).not.toBe(existente.description);
    expect(nuevo.config.participante.title).not.toBe(existente.config.participante.title);
  });
});
