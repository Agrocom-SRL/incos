import { describe, it, expect } from '@jest/globals';
import * as v from '../../../../src/presentation/validators/inscripciones/index.js';
import { camposInvalidos } from '../_helpers/controllerHarness.js';
import { MALICIOSOS } from './_tabla.js';

const materiaAprobada = { materia_id: 1, period_id: 2, final_grade: 75 };

describe('createEnrollmentValidator', () => {
  const valido = { student_id: 10, parallel_id: 3 };
  const crear = (body) => camposInvalidos(v.createEnrollmentValidator, { body });

  it('acepta estudiante con paralelo', async () => {
    expect(await crear(valido)).toEqual([]);
    expect(await crear({ student_id: '10', parallel_id: '3' })).toEqual([]);
  });

  it('acepta estudiante con materias por asignación docente', async () => {
    expect(await crear({ student_id: 1, teacher_assignment_ids: [4, '5'] })).toEqual([]);
    expect(await crear({ student_id: 1, teacherAssignmentIds: [4] })).toEqual([]);
  });

  it('acepta selección por periodo (paralelo y materias)', async () => {
    expect(await crear({ student_id: 1, parallel_ids_by_period: { 1: 3 }, materia_ids_by_period: { 1: [7, 8] } })).toEqual([]);
    expect(await crear({ student_id: 1, parallelIdsByPeriod: { 1: 3 }, materiaIdsByPeriod: { 1: [7] } })).toEqual([]);
  });

  it('acepta tipos de inscripción, plan, observaciones e historial previo', async () => {
    for (const enrollment_type of ['NUEVO', 'ANTIGUO', 'TRASPASO', 'TRANSITABILIDAD']) {
      expect(await crear({ ...valido, enrollment_type })).toEqual([]);
    }
    expect(await crear({ ...valido, plan_estudio_id: 4, observations: '  nota  ' })).toEqual([]);
    expect(await crear({ ...valido, observations: '' })).toEqual([]);
    expect(await crear({ ...valido, observations: null })).toEqual([]);
    expect(await crear({ ...valido, observations: 'x'.repeat(1000) })).toEqual([]);
    expect(await crear({ ...valido, prior_history: [materiaAprobada, { materiaId: 2, periodId: 2, status: 'convalidado' }] })).toEqual([]);
    expect(await crear({ ...valido, prior_history: [] })).toEqual([]);
    expect(await crear({ ...valido, prior_history: null })).toEqual([]);
  });

  it('exige student_id válido', async () => {
    expect(await crear({ parallel_id: 3 })).toContain('student_id');
    for (const malo of [0, -1, 'abc', '', ...MALICIOSOS]) {
      expect(await crear({ ...valido, student_id: malo })).toContain('student_id');
    }
  });

  it('rechaza paralelo y plan inválidos', async () => {
    for (const malo of [0, 'x', ...MALICIOSOS]) {
      expect(await crear({ ...valido, parallel_id: malo })).toContain('parallel_id');
      expect(await crear({ ...valido, plan_estudio_id: malo })).toContain('plan_estudio_id');
    }
  });

  it('exige alguna forma de selección de materias', async () => {
    expect((await crear({ student_id: 1 })).length).toBeGreaterThan(0);
    expect((await crear({ student_id: 1, parallel_id: null })).length).toBeGreaterThan(0);
    expect((await crear({ student_id: 1, parallel_ids_by_period: { 1: 3 }, materia_ids_by_period: { 1: [] } })).length).toBeGreaterThan(0);
  });

  it.each([
    ['teacher_assignment_ids', []],
    ['teacher_assignment_ids', 'x'],
    ['teacher_assignment_ids', [0]],
    ['teacher_assignment_ids', ['a']],
    ['parallel_ids_by_period', 'x'],
    ['parallel_ids_by_period', [1]],
    ['materia_ids_by_period', 'x'],
    ['enrollment_type', 'EXTRAORDINARIO'],
    ['enrollment_type', "' OR 1=1"],
    ['observations', 123],
    ['observations', 'x'.repeat(1001)],
    ['prior_history', 'x'],
    ['prior_history', [null]],
    ['prior_history', [{ ...materiaAprobada, final_grade: 101 }]],
    ['prior_history', [{ ...materiaAprobada, final_grade: -1 }]],
    ['prior_history', [{ ...materiaAprobada, final_grade: 'alta' }]],
    ['prior_history', [{ ...materiaAprobada, status: 'REPROBADO' }]],
    ['prior_history', [{ ...materiaAprobada, materia_id: 0 }]],
    ['prior_history', [{ ...materiaAprobada, period_id: 'x' }]],
  ])('rechaza %s=%j', async (campo, valor) => {
    expect(await crear({ ...valido, [campo]: valor })).toContain(campo);
  });
});

describe('updateEnrollmentValidator', () => {
  const editar = (body) => camposInvalidos(v.updateEnrollmentValidator, { body });

  it('acepta un cuerpo vacío (no se envía nada)', async () => {
    expect(await editar({})).toEqual([]);
  });

  it('acepta cambios válidos', async () => {
    expect(await editar({ parallel_id: 2 })).toEqual([]);
    expect(await editar({ teacher_assignment_ids: [1, '2'] })).toEqual([]);
    expect(await editar({ parallel_ids_by_period: { 1: 2 }, materia_ids_by_period: { 1: [3] } })).toEqual([]);
    expect(await editar({ plan_estudio_id: 3, observations: 'ok', enrollment_date: '2026-03-15' })).toEqual([]);
    expect(await editar({ enrollment_date: null, observations: '' })).toEqual([]);
    expect(await editar({ prior_history: [materiaAprobada, { materia_id: 3, period_id: 1, estado: 'CONVALIDADO' }] })).toEqual([]);
    expect(await editar({ prior_history: [] })).toEqual([]);
  });

  it('rechaza un envío parcial sin selección real de materias', async () => {
    expect((await editar({ teacher_assignment_ids: [] })).length).toBeGreaterThan(0);
    expect((await editar({ parallel_ids_by_period: { 1: 2 }, materia_ids_by_period: { 1: [] } })).length).toBeGreaterThan(0);
  });

  it.each([
    ['parallel_id', 0],
    ['parallel_id', 'x'],
    ['teacher_assignment_ids', 'x'],
    ['parallel_ids_by_period', 'x'],
    ['materia_ids_by_period', 5],
    ['plan_estudio_id', 0],
    ['observations', 42],
    ['observations', 'x'.repeat(1001)],
    ['enrollment_date', '15/03/2026'],
    ['enrollment_date', '2026-13-45'],
    ['enrollment_date', '2026-03-15; DROP TABLE'],
    ['prior_history', 'x'],
    ['prior_history', [7]],
    ['prior_history', [{ ...materiaAprobada, final_grade: 200 }]],
    ['prior_history', [{ ...materiaAprobada, status: 'OTRO' }]],
    ['prior_history', [{ materia_id: 0, period_id: 1, status: 'CONVALIDADO' }]],
    ['prior_history', [{ ...materiaAprobada, period_id: 0 }]],
  ])('rechaza %s=%j', async (campo, valor) => {
    expect(await editar({ [campo]: valor })).toContain(campo);
  });

  it('un elemento de teacher_assignment_ids inválido se convierte en error de selección', async () => {
    expect((await editar({ teacher_assignment_ids: [0] })).length).toBeGreaterThan(0);
  });
});

describe('updateEnrollmentPriorHistoryValidator', () => {
  const run = (body, id = '9') => camposInvalidos(v.updateEnrollmentPriorHistoryValidator, { params: { id }, body });

  it('acepta historial válido', async () => {
    expect(await run({ prior_history: [materiaAprobada] })).toEqual([]);
    expect(await run({ prior_history: [materiaAprobada, { materiaId: 2, periodId: 3, status: 'convalidado' }] })).toEqual([]);
    expect(await run({ prior_history: [{ materia_id: 1, period_id: 1, final_grade: 0 }, { materia_id: 2, period_id: 1, nota_final: 100 }] })).toEqual([]);
  });

  it.each([
    ['sin prior_history', {}],
    ['null', { prior_history: null }],
    ['vacío', { prior_history: [] }],
    ['no es arreglo', { prior_history: 'x' }],
    ['elemento nulo', { prior_history: [null] }],
    ['elemento no objeto', { prior_history: ['a'] }],
    ['estado inválido', { prior_history: [{ ...materiaAprobada, status: 'REPROBADO' }] }],
    ['nota fuera de rango', { prior_history: [{ ...materiaAprobada, final_grade: 101 }] }],
    ['nota no numérica', { prior_history: [{ ...materiaAprobada, final_grade: 'x' }] }],
    ['materia inválida', { prior_history: [{ ...materiaAprobada, materia_id: 0 }] }],
    ['periodo inválido', { prior_history: [{ ...materiaAprobada, period_id: 0 }] }],
    ['convalidada con materia inválida', { prior_history: [{ materia_id: 'x', period_id: 1, status: 'CONVALIDADO' }] }],
    ['convalidada con periodo inválido', { prior_history: [{ materia_id: 1, period_id: -1, status: 'CONVALIDADO' }] }],
    ['inyección', { prior_history: [{ materia_id: "1; DROP TABLE materias", period_id: 1, final_grade: 50 }] }],
  ])('rechaza: %s', async (_titulo, body) => {
    expect(await run(body)).toContain('prior_history');
  });

  it.each(['0', '-3', 'abc', ...MALICIOSOS])('rechaza :id=%p', async (id) => {
    expect(await run({ prior_history: [materiaAprobada] }, id)).toContain('id');
  });
});

describe('contextoMatriculaValidator', () => {
  const run = (query) => camposInvalidos(v.contextoMatriculaValidator, { query });

  it('acepta estudiante con filtros opcionales', async () => {
    expect(await run({ estudiante_id: '5' })).toEqual([]);
    expect(await run({ estudiante_id: '5', carrera_id: '1', plan_estudio_id: '2', excluir_inscripcion_id: '3' })).toEqual([]);
    expect(await run({ estudiante_id: '5', carrera_id: '', plan_estudio_id: '', excluir_inscripcion_id: '' })).toEqual([]);
  });

  it('exige estudiante_id', async () => {
    expect(await run({})).toContain('estudiante_id');
  });

  it.each(['0', '-1', 'x', '1.5', ...MALICIOSOS])('rechaza ids inválidos %p', async (malo) => {
    expect(await run({ estudiante_id: malo })).toContain('estudiante_id');
    expect(await run({ estudiante_id: '5', carrera_id: malo })).toContain('carrera_id');
    expect(await run({ estudiante_id: '5', plan_estudio_id: malo })).toContain('plan_estudio_id');
    expect(await run({ estudiante_id: '5', excluir_inscripcion_id: malo })).toContain('excluir_inscripcion_id');
  });
});
