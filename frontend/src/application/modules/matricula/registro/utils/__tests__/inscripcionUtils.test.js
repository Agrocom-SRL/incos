import { describe, it, expect, vi } from 'vitest';
import { buildInscripcionPayload } from '../buildInscripcionPayload';
import { resolveSelectionByPeriod, validateInscripcionSubmit } from '../inscripcionSubmitValidation';
import {
  canEditEnrollmentType,
  getEnrollmentTypeColor,
  getEnrollmentTypeLabel,
  getEnrollmentTypePillClass,
  getSubjectStatusColor,
  getSubjectStatusLabel,
  initialsFromName,
  normalizeAulaLabel,
} from '../inscripcionDetailHelpers';
import { isMatriculaMateriasInfrastructureError, resolveInscripcionApiUserMessage } from '../inscripcionApiErrors';
import { isPaymentRequiredError } from '../inscripcionPaymentErrors';
import { createMatriculaWizardStepMeta, resolveMatriculaWizardStepMeta } from '../matriculaWizardStepConfig';

describe('buildInscripcionPayload', () => {
  it('payload mínimo con tipo por defecto y plan', () => {
    expect(buildInscripcionPayload({ studentId: 1, planEstudioId: '4', formValues: { periodo: 3 } })).toEqual({
      student_id: 1,
      periodo_id: 3,
      enrollment_type: 'NUEVO',
      observations: null,
      plan_estudio_id: 4,
    });
  });

  it('prioriza el periodo elegido, el tipo del formulario y el historial previo', () => {
    const p = buildInscripcionPayload({
      studentId: 1,
      tipoAdmision: 'ANTIGUO',
      selectedPeriod: { id: 9 },
      formValues: { enrollment_type: 'TRASPASO', observations: 'obs' },
      buildPriorHistory: () => [{ materia_id: 1 }],
      parallelId: 5,
    });
    expect(p).toMatchObject({ periodo_id: 9, enrollment_type: 'TRASPASO', observations: 'obs', prior_history: [{ materia_id: 1 }], parallel_id: 5 });
    expect(buildInscripcionPayload({ studentId: 1, buildPriorHistory: () => [] }).prior_history).toBeUndefined();
  });

  it('selección por periodo envía paralelos y materias; omite periodos incompletos', () => {
    const p = buildInscripcionPayload({
      studentId: 1,
      hasSelectionByPeriod: true,
      selectedPeriodIds: [1, 2, 3],
      selectedMateriaIdsByPeriod: { 1: ['10', '11'], 2: [], 3: [30] },
      selectedParalelosByPeriod: { 1: { id: 7 }, 2: 8 },
      parallelId: 99,
    });
    expect(p.parallel_ids_by_period).toEqual({ 1: 7 });
    expect(p.materia_ids_by_period).toEqual({ 1: [10, 11] });
    expect(p.parallel_id).toBeUndefined();
    const sinIds = buildInscripcionPayload({ studentId: 1, hasSelectionByPeriod: true, selectedMateriaIdsByPeriod: { 4: [1] }, selectedParalelosByPeriod: { 4: 2 } });
    expect(sinIds.parallel_ids_by_period).toEqual({ 4: 2 });
    const vacio = buildInscripcionPayload({ studentId: 1, hasSelectionByPeriod: true, parallelId: 3 });
    expect(vacio.parallel_id).toBe(3);
  });

  it('solo historial sin paralelo no envía datos de paralelo', () => {
    const p = buildInscripcionPayload({ studentId: 1, soloHistorial: true });
    expect(p.parallel_id).toBeUndefined();
    expect(p.materia_ids_by_period).toBeUndefined();
  });
});

describe('inscripcionSubmitValidation', () => {
  it('resolveSelectionByPeriod detecta periodos sin paralelo', () => {
    const r = resolveSelectionByPeriod({
      tipoAdmision: 'ANTIGUO',
      selectedMateriaIdsByPeriod: { 1: [1], 2: [2], 3: [] },
      selectedParalelosByPeriod: { 1: { id: 5 }, 2: '' },
    });
    expect(r).toMatchObject({ isAntiguo: true, periodIdsWithMaterias: ['1', '2'], periodsMissingParallel: ['2'], hasSelectionByPeriod: false });
    const ok = resolveSelectionByPeriod({ tipoAdmision: 'ANTIGUO', selectedPeriodIds: [1], selectedMateriaIdsByPeriod: { 1: [1] }, selectedParalelosByPeriod: { 1: 3 } });
    expect(ok.hasSelectionByPeriod).toBe(true);
    expect(resolveSelectionByPeriod({ tipoAdmision: 'NUEVO' }).hasSelectionByPeriod).toBe(false);
    expect(resolveSelectionByPeriod({ tipoAdmision: 'ANTIGUO', selectedPeriodIds: [1], selectedMateriaIdsByPeriod: { 1: [1] }, selectedParalelosByPeriod: { 1: 0 } }).periodsMissingParallel).toEqual([1]);
  });

  const sel = (o = {}) => ({ isAntiguo: true, periodIdsWithMaterias: [], periodsMissingParallel: [], hasSelectionByPeriod: false, ...o });

  it('valida estudiante, paralelos y selección', () => {
    expect(validateInscripcionSubmit({ selection: sel() })).toEqual({ valid: false, errorMessage: 'Debe seleccionar un estudiante' });
    expect(validateInscripcionSubmit({ studentId: 1, selection: sel({ periodIdsWithMaterias: [1], periodsMissingParallel: [1] }) }).errorMessage).toMatch(/para el periodo con materias/);
    expect(validateInscripcionSubmit({ studentId: 1, selection: sel({ periodIdsWithMaterias: [1, 2], periodsMissingParallel: [1, 2] }) }).errorMessage).toMatch(/Faltan paralelos en 2 periodo/);
    expect(validateInscripcionSubmit({ studentId: 1, selection: sel() }).errorMessage).toMatch(/paralelo o completar periodo/);
    expect(validateInscripcionSubmit({ studentId: 1, parallelId: 2, selection: sel() })).toEqual({ valid: true, soloHistorial: false, hasSelectionByPeriod: false });
  });

  it('modo solo historial exige el bypass explícito', () => {
    const base = { studentId: 1, selection: sel(), isEditMode: true, completarSoloHistorialPrevio: true, historialPrevioHasRows: true, validatePriorHistory: () => ({ valid: true }) };
    expect(validateInscripcionSubmit(base).valid).toBe(false);
    expect(validateInscripcionSubmit({ ...base, allowSoloHistorialBypass: true })).toMatchObject({ valid: true, soloHistorial: true });
  });

  it('valida las notas del historial previo', () => {
    const base = { studentId: 1, parallelId: 1, selection: sel(), historialPrevioHasRows: true };
    expect(validateInscripcionSubmit({ ...base, validatePriorHistory: () => ({ valid: false, missing: 2, invalid: [] }) }).errorMessage).toMatch(/las 2 materia/);
    expect(validateInscripcionSubmit({ ...base, validatePriorHistory: () => ({ valid: false, missing: 0, invalid: [{ reason: 'mala' }] }) }).errorMessage).toBe('mala');
    expect(validateInscripcionSubmit({ ...base, validatePriorHistory: () => ({ valid: false, missing: 0, invalid: [] }) }).errorMessage).toMatch(/Revise las notas/);
  });
});

describe('inscripcionDetailHelpers', () => {
  it('iniciales y aula', () => {
    expect(initialsFromName('')).toBe('IN');
    expect(initialsFromName('ana')).toBe('AN');
    expect(initialsFromName(' ana  lópez perez')).toBe('AL');
    expect(normalizeAulaLabel(null)).toBeNull();
    expect(normalizeAulaLabel('A1')).toBe('A1');
    expect(normalizeAulaLabel({ codigo: 'C1' })).toBe('C1');
    expect(normalizeAulaLabel({})).toBeNull();
    expect(normalizeAulaLabel(5)).toBeNull();
  });
  it('colores y etiquetas', () => {
    expect(getSubjectStatusColor('APROBADO')).toBe('success');
    expect(getSubjectStatusColor('x')).toBe('default');
    expect(getSubjectStatusLabel('en_curso')).toBe('En curso');
    expect(getSubjectStatusLabel('raro')).toBe('raro');
    expect(getSubjectStatusLabel(null)).toBe('—');
    expect(getEnrollmentTypeColor('NUEVO')).toBe('green');
    expect(getEnrollmentTypeColor()).toBe('default');
    expect(getEnrollmentTypeLabel('traspaso')).toBe('Traspaso');
    expect(getEnrollmentTypeLabel('x')).toBeNull();
    expect(getEnrollmentTypePillClass('NUEVO')).toBe('cfg-materia-pill cfg-materia-pill--success');
    expect(getEnrollmentTypePillClass()).toBe('cfg-materia-pill cfg-materia-pill--default');
    expect(canEditEnrollmentType('ANTIGUO')).toBe(true);
    expect(canEditEnrollmentType('X')).toBe(false);
    expect(canEditEnrollmentType(null)).toBe(false);
  });
});

describe('errores de inscripción', () => {
  it('oculta detalles SQL de materias', () => {
    expect(isMatriculaMateriasInfrastructureError('Cannot add: foreign key constraint fails')).toBe(true);
    expect(isMatriculaMateriasInfrastructureError('x', { errorCode: 'MATRICULA_MATERIAS_INVALID' })).toBe(true);
    expect(isMatriculaMateriasInfrastructureError('otro')).toBe(false);
    expect(resolveInscripcionApiUserMessage('asignacion_docente_id null').field).toBe('materiasPorPeriodo');
    expect(resolveInscripcionApiUserMessage('Falla simple')).toEqual({ message: 'Falla simple', field: null });
    expect(resolveInscripcionApiUserMessage(null).message).toBe('Error al guardar la inscripción');
  });
  it('detecta el error de pago requerido', () => {
    expect(isPaymentRequiredError({ success: true })).toBe(false);
    expect(isPaymentRequiredError({ success: false, error: 'Falta el Pago del aporte académico' })).toBe(true);
    expect(isPaymentRequiredError({ success: false, error: { message: 'Pendiente de pago' } })).toBe(true);
    expect(isPaymentRequiredError({ success: false, error: 'otro' })).toBe(false);
    expect(isPaymentRequiredError(null)).toBe(false);
  });
});

describe('matriculaWizardStepConfig', () => {
  it('deriva índices del orden de pasos', () => {
    const m = createMatriculaWizardStepMeta({ includeHistorial: true });
    expect(m.order).toEqual(['buscar', 'carrera', 'periodo', 'historial', 'paralelo']);
    expect(m.indices.paralelo).toBe(4);
    expect(m.stepNumbers.historial).toBe(4);
    expect(createMatriculaWizardStepMeta({ includeCarrera: false }).indices.carrera).toBeNull();
    expect(createMatriculaWizardStepMeta({ includeCarrera: false }).stepNumbers.carrera).toBeNull();
    expect(createMatriculaWizardStepMeta().includeHistorialPrevio).toBe(false);
  });
  it('resuelve la meta por perfil', () => {
    expect(resolveMatriculaWizardStepMeta('ANTIGUO').order).toContain('historial');
    const conHistorial = resolveMatriculaWizardStepMeta('ANTIGUO', { esNuevoSistema: false });
    expect(conHistorial.order).toEqual(['buscar', 'periodo', 'paralelo']);
    expect(resolveMatriculaWizardStepMeta('NUEVO', { esNuevoSistema: true }).order).toContain('carrera');
    expect(vi.isMockFunction(resolveMatriculaWizardStepMeta)).toBe(false);
  });
});
