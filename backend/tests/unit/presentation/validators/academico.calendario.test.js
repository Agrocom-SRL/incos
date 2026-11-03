import { describe, it, expect } from '@jest/globals';
import * as v from '../../../../src/presentation/validators/academico/index.js';
import { camposInvalidos } from '../_helpers/controllerHarness.js';
import { probarValidator, MALICIOSOS } from './_tabla.js';

describe('createActividadCronogramaValidator', () => {
  const valido = { periodoAcademicoId: 3, fechaInicio: '2026-03-01', fechaFin: '2026-03-10', actividadId: 2 };

  probarValidator('campos', v.createActividadCronogramaValidator, {
    valido,
    tambienValidos: [
      { fechaFin: null },
      { fechaFin: '2026-03-01' },
      { actividadId: null, nombrePersonalizado: 'Feria' },
      { nombrePersonalizado: 'x'.repeat(200) },
    ],
    requeridos: ['periodoAcademicoId', 'fechaInicio'],
    invalidos: [
      ['periodoAcademicoId', 0],
      ['periodoAcademicoId', 'abc'],
      ['fechaInicio', '2026-13-45'],
      ['fechaFin', 'mañana'],
      ['actividadId', -1],
      ['nombrePersonalizado', 'x'.repeat(201)],
      ['nombrePersonalizado', { $ne: 1 }],
    ],
    maliciosos: ['periodoAcademicoId', 'fechaInicio', 'fechaFin', 'actividadId'],
  });

  it('exige actividad del catálogo o nombre personalizado', async () => {
    const { actividadId: _a, ...sinActividad } = valido;
    expect((await camposInvalidos(v.createActividadCronogramaValidator, { body: sinActividad })).length).toBeGreaterThan(0);
  });

  it('rechaza fin anterior al inicio', async () => {
    expect((await camposInvalidos(v.createActividadCronogramaValidator, { body: { ...valido, fechaFin: '2026-02-28' } })).length).toBeGreaterThan(0);
  });
});

describe('updateActividadCronogramaValidator', () => {
  it('acepta edición parcial y body vacío con :id válido', async () => {
    expect(await camposInvalidos(v.updateActividadCronogramaValidator, { params: { id: '4' }, body: {} })).toEqual([]);
    expect(
      await camposInvalidos(v.updateActividadCronogramaValidator, {
        params: { id: '4' },
        body: { periodoAcademicoId: 2, fechaInicio: '2026-01-01', fechaFin: null, actividadId: null, nombrePersonalizado: 'ok' },
      }),
    ).toEqual([]);
  });

  it.each([
    ['periodoAcademicoId', 0],
    ['fechaInicio', 'x'],
    ['fechaFin', '31/12/2026'],
    ['actividadId', 0],
    ['nombrePersonalizado', 'x'.repeat(201)],
  ])('rechaza %s=%p', async (campo, valor) => {
    expect(await camposInvalidos(v.updateActividadCronogramaValidator, { params: { id: '4' }, body: { [campo]: valor } })).toContain(campo);
  });

  it.each(['0', '-1', 'abc', ...MALICIOSOS])('rechaza :id=%p', async (id) => {
    expect(await camposInvalidos(v.updateActividadCronogramaValidator, { params: { id }, body: {} })).toContain('id');
  });

  it('rechaza fin anterior al inicio', async () => {
    expect(
      (await camposInvalidos(v.updateActividadCronogramaValidator, { params: { id: '1' }, body: { fechaInicio: '2026-05-02', fechaFin: '2026-05-01' } })).length,
    ).toBeGreaterThan(0);
  });
});

describe('cronogramaIdValidator / periodoIdValidator', () => {
  it.each([['cronogramaIdValidator'], ['periodoIdValidator']])('%s valida :id', async (nombre) => {
    expect(await camposInvalidos(v[nombre], { params: { id: '9' } })).toEqual([]);
    for (const malo of [undefined, '0', '-1', 'x', ...MALICIOSOS]) {
      expect(await camposInvalidos(v[nombre], { params: malo === undefined ? {} : { id: malo } })).toContain('id');
    }
  });
});

describe('putPeriodoFechasValidator', () => {
  const valido = { fechaInicio: '2026-02-01', fechaFin: '2026-06-30' };
  const run = (body, id = '2') => camposInvalidos(v.putPeriodoFechasValidator, { params: { id }, body });

  it('acepta fechas válidas (incluida fin == inicio)', async () => {
    expect(await run(valido)).toEqual([]);
    expect(await run({ fechaInicio: '2026-02-01', fechaFin: '2026-02-01' })).toEqual([]);
  });

  it.each(['fechaInicio', 'fechaFin'])('exige %s', async (campo) => {
    const { [campo]: _q, ...resto } = valido;
    expect(await run(resto)).toContain(campo);
    expect(await run({ ...valido, [campo]: '' })).toContain(campo);
  });

  it.each(MALICIOSOS)('rechaza fecha maliciosa %p', async (m) => {
    expect(await run({ ...valido, fechaInicio: m })).toContain('fechaInicio');
    expect(await run({ ...valido, fechaFin: m })).toContain('fechaFin');
  });

  it('rechaza fin anterior al inicio y :id inválido', async () => {
    expect((await run({ fechaInicio: '2026-07-01', fechaFin: '2026-06-01' })).length).toBeGreaterThan(0);
    expect(await run(valido, '0')).toContain('id');
  });
});

describe('postPeriodoEtapaValidator', () => {
  const valido = { nombre: 'Etapa 1', fechaInicio: '2026-02-01', fechaFin: '2026-03-01' };

  probarValidator('campos', v.postPeriodoEtapaValidator, {
    valido,
    tambienValidos: [{ division: 'A' }, { division: null }, { colorHex: '#AbC123' }, { colorHex: null }],
    limitesOk: [['nombre', 'x'.repeat(100)]],
    requeridos: ['nombre', 'fechaInicio', 'fechaFin'],
    invalidos: [
      ['nombre', 'x'.repeat(101)],
      ['nombre', ''],
      ['fechaInicio', 'ayer'],
      ['fechaFin', '2026-02-30x'],
      ['colorHex', 'rojo'],
      ['colorHex', '#FFF'],
      ['colorHex', '#GGGGGG'],
      ['division', { a: 1 }],
    ],
    maliciosos: ['fechaInicio', 'fechaFin', 'colorHex'],
  });

  it('rechaza fin anterior al inicio', async () => {
    expect((await camposInvalidos(v.postPeriodoEtapaValidator, { body: { ...valido, fechaFin: '2026-01-01' } })).length).toBeGreaterThan(0);
  });
});

describe('cuaderno de evaluación', () => {
  const ruta = { asignacionId: '4', bimestre: '2' };
  const run = (cadena, params = ruta, body = {}) => camposInvalidos(cadena, { params, body });

  it.each(['getCuadernoBimestreValidator', 'getBimestreConsolidadoValidator', 'deleteEvaluacionCuadernoValidator'])('%s valida asignación y bimestre', async (nombre) => {
    const base = nombre === 'deleteEvaluacionCuadernoValidator' ? { ...ruta, evaluacionId: '3' } : ruta;
    expect(await run(v[nombre], base)).toEqual([]);
    for (const bimestre of ['0', '5', 'x', '1.5', ...MALICIOSOS]) {
      expect(await run(v[nombre], { ...base, bimestre })).toContain('bimestre');
    }
    for (const asignacionId of ['0', '-1', 'abc', ...MALICIOSOS]) {
      expect(await run(v[nombre], { ...base, asignacionId })).toContain('asignacionId');
    }
    if (nombre === 'deleteEvaluacionCuadernoValidator') {
      expect(await run(v[nombre], { ...ruta, evaluacionId: '0' })).toContain('evaluacionId');
    }
  });

  describe('createEvaluacionCuadernoValidator', () => {
    const valido = { tipoEvaluacionId: 1, nombre: 'Parcial', componente: 'TEORICO', puntos: 25, fecha: '2026-04-01' };
    const crear = (body, params = ruta) => run(v.createEvaluacionCuadernoValidator, params, body);

    it('acepta payload válido, límites y fecha nula', async () => {
      expect(await crear(valido)).toEqual([]);
      expect(await crear({ ...valido, puntos: 1, componente: 'PRACTICO', fecha: null })).toEqual([]);
      expect(await crear({ ...valido, puntos: 100, nombre: 'x'.repeat(255) })).toEqual([]);
      expect(await crear({ ...valido, puntos: '50' })).toEqual([]);
    });

    it.each([
      ['tipoEvaluacionId', 0],
      ['nombre', ''],
      ['nombre', '   '],
      ['nombre', 'x'.repeat(256)],
      ['componente', 'ORAL'],
      ['puntos', 0],
      ['puntos', 101],
      ['puntos', 2.5],
      ['puntos', 'mucho'],
      ['puntos', null],
      ['fecha', '2026-99-99'],
    ])('rechaza %s=%p', async (campo, valor) => {
      expect(await crear({ ...valido, [campo]: valor })).toContain(campo);
    });

    it.each(['tipoEvaluacionId', 'nombre', 'componente', 'puntos'])('exige %s', async (campo) => {
      const { [campo]: _q, ...resto } = valido;
      expect(await crear(resto)).toContain(campo);
    });

    it.each(MALICIOSOS)('rechaza carga maliciosa %p en tipo, componente y puntos', async (m) => {
      expect(await crear({ ...valido, tipoEvaluacionId: m })).toContain('tipoEvaluacionId');
      expect(await crear({ ...valido, componente: m })).toContain('componente');
      expect(await crear({ ...valido, puntos: m })).toContain('puntos');
    });
  });

  describe('updateEvaluacionCuadernoValidator', () => {
    const params = { ...ruta, evaluacionId: '8' };
    const editar = (body, p = params) => run(v.updateEvaluacionCuadernoValidator, p, body);

    it('acepta cuerpo vacío y parcial', async () => {
      expect(await editar({})).toEqual([]);
      expect(await editar({ tipoEvaluacionId: 2, nombre: 'N', componente: 'PRACTICO', puntos: 10, fecha: null })).toEqual([]);
    });

    it.each([
      ['tipoEvaluacionId', 0],
      ['nombre', ''],
      ['nombre', 'x'.repeat(256)],
      ['componente', 'otro'],
      ['puntos', 101],
      ['puntos', 0.5],
      ['fecha', 'nunca'],
    ])('rechaza %s=%p', async (campo, valor) => {
      expect(await editar({ [campo]: valor })).toContain(campo);
    });

    it('valida los ids de ruta', async () => {
      expect(await editar({}, { ...params, evaluacionId: 'x' })).toContain('evaluacionId');
      expect(await editar({}, { ...params, bimestre: '9' })).toContain('bimestre');
    });
  });

  describe('notas', () => {
    it('upsertNotaCuadernoValidator', async () => {
      const ok = { estudianteId: 5, evaluacionId: 6, nota: 80 };
      const run2 = (body) => run(v.upsertNotaCuadernoValidator, ruta, body);
      expect(await run2(ok)).toEqual([]);
      expect(await run2({ ...ok, nota: null })).toEqual([]);
      expect(await run2({ ...ok, nota: '' })).toEqual([]);
      expect(await run2({ ...ok, nota: 0 })).toEqual([]);
      expect(await run2({ estudianteId: 5, evaluacionId: 6 })).toEqual([]);
      for (const nota of [-1, 1.5, 'abc', ...MALICIOSOS]) {
        expect(await run2({ ...ok, nota })).toContain('nota');
      }
      expect(await run2({ evaluacionId: 6 })).toContain('estudianteId');
      expect(await run2({ estudianteId: 5 })).toContain('evaluacionId');
      expect(await run2({ ...ok, estudianteId: 0 })).toContain('estudianteId');
    });

    it('guardarNotasCuadernoBimestreValidator', async () => {
      const run2 = (body) => run(v.guardarNotasCuadernoBimestreValidator, ruta, body);
      expect(await run2({})).toEqual([]);
      expect(await run2({ notas: [{ estudianteId: 1, evaluacionId: 2, nota: 10 }, { estudianteId: 1, evaluacionId: 3, nota: null }] })).toEqual([]);
      expect(await run2({ notas: 'todas' })).toContain('notas');
      expect(await run2({ notas: [{ estudianteId: 0 }] })).toContain('notas[0].estudianteId');
      expect(await run2({ notas: [{ evaluacionId: 'x' }] })).toContain('notas[0].evaluacionId');
      expect(await run2({ notas: [{ nota: -5 }] })).toContain('notas[0].nota');
      expect(await run2({ notas: [{ nota: '9.5' }] })).toContain('notas[0].nota');
    });
  });
});

describe('putParaleloScheduleValidator', () => {
  const run = (body) => camposInvalidos(v.putParaleloScheduleValidator, { body });

  it.each(['schedules', 'schedule', 'courseSchedules'])('acepta %s como arreglo', async (clave) => {
    expect(await run({ [clave]: [] })).toEqual([]);
    expect(await run({ [clave]: [{ cursoId: '4', bloques: [] }] })).toEqual([]);
  });

  it.each([{}, { schedules: 'x' }, { schedules: { a: 1 } }, { otra: [] }])('rechaza body sin arreglo de horarios: %p', async (body) => {
    expect((await run(body)).length).toBeGreaterThan(0);
  });

  it('valida cursoId y bloques', async () => {
    expect(await run({ schedules: [{ cursoId: 0 }] })).toContain('schedules[0].cursoId');
    expect(await run({ schedules: [{ cursoId: '1 OR 1=1' }] })).toContain('schedules[0].cursoId');
    expect(await run({ schedule: [{ cursoId: -2 }] })).toContain('schedule[0].cursoId');
    expect(await run({ schedules: [{ cursoId: 1, bloques: 'x' }] })).toContain('schedules[0].bloques');
  });
});

describe('searchCoordinacionDocentesValidator', () => {
  const run = (query) => camposInvalidos(v.searchCoordinacionDocentesValidator, { query });

  it('acepta consulta vacía, q válida, límites y preliminar', async () => {
    expect(await run({})).toEqual([]);
    expect(await run({ q: 'ana', limit: '1' })).toEqual([]);
    expect(await run({ q: 'a'.repeat(120), limit: '100' })).toEqual([]);
    expect(await run({ q: 'a', preliminar: '1' })).toEqual([]);
    expect(await run({ q: 'ab', preliminar: '0' })).toEqual([]);
  });

  it('rechaza q corta sin preliminar o demasiado larga', async () => {
    expect(await run({ q: 'a' })).toContain('q');
    expect(await run({ q: 'a'.repeat(121) })).toContain('q');
  });

  it.each(['0', '101', 'x', '1.5', '-1'])('rechaza limit=%p', async (limit) => {
    expect(await run({ q: 'ana', limit })).toContain('limit');
  });

  it.each(['2', 'true', ...MALICIOSOS])('rechaza preliminar=%p', async (preliminar) => {
    expect(await run({ preliminar })).toContain('preliminar');
  });
});
