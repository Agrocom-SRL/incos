import { describe, it, expect } from '@jest/globals';
import { createAsignacionDocenteValidator, updateAsignacionDocenteValidator, listAsignacionesDocentesValidator } from '../../../../src/presentation/validators/asignaciones-docentes/asignaciones-docentes.validator.js';
import * as aulas from '../../../../src/presentation/validators/aulas-horarios/index.js';
import * as geo from '../../../../src/presentation/validators/geograficos/index.js';
import * as horarios from '../../../../src/presentation/validators/horarios/asignacion-horarios.validator.js';
import * as oferta from '../../../../src/presentation/validators/oferta/oferta.validator.js';
import { camposInvalidos } from '../_helpers/controllerHarness.js';
import { probarValidator, MALICIOSOS } from './_tabla.js';

describe('asignaciones-docentes: create', () => {
  const valido = { gestion_plan_id: 1, oferta_curso_id: 2, docente_id: 3 };

  probarValidator('campos', createAsignacionDocenteValidator, {
    valido,
    tambienValidos: [
      { carga_horaria: 0 },
      { carga_horaria: 200 },
      { carga_horaria: null },
      { fecha_asignacion: '2026-03-01' },
      { vigente: false },
      { confirmar_sobrecarga: true },
      { confirmar_sobrecarga: null },
    ],
    requeridos: ['gestion_plan_id', 'oferta_curso_id', 'docente_id'],
    invalidos: [
      ['gestion_plan_id', 0],
      ['oferta_curso_id', -1],
      ['docente_id', 'abc'],
      ['carga_horaria', 201],
      ['carga_horaria', -1],
      ['fecha_asignacion', '2026/03/01'],
      ['vigente', 'tal vez'],
      ['confirmar_sobrecarga', 'sí'],
    ],
    maliciosos: ['gestion_plan_id', 'oferta_curso_id', 'docente_id', 'carga_horaria', 'fecha_asignacion'],
  });

  it('acepta alias camelCase y teacherId / offerCourseId', async () => {
    expect(await camposInvalidos(createAsignacionDocenteValidator, { body: { gestionPlanId: 1, ofertaCursoId: '2', docenteId: '3' } })).toEqual([]);
    expect(await camposInvalidos(createAsignacionDocenteValidator, { body: { gestionPlanId: 1, offerCourseId: 2, teacherId: 3 } })).toEqual([]);
  });

  it.each([null, '', undefined])('trata %p como ausente', async (vacio) => {
    expect(await camposInvalidos(createAsignacionDocenteValidator, { body: { ...valido, docente_id: vacio } })).toContain('docente_id');
  });
});

describe('asignaciones-docentes: update y list', () => {
  const editar = (body) => camposInvalidos(updateAsignacionDocenteValidator, { body });

  it('acepta cuerpo vacío y cambios válidos', async () => {
    expect(await editar({})).toEqual([]);
    expect(await editar({ docente_id: 2, oferta_curso_id: 3, carga_horaria: 10, fecha_asignacion: '2026-01-02', vigente: true, motivo: 'cambio' })).toEqual([]);
    expect(await editar({ docente_id: null, motivo: null })).toEqual([]);
  });

  it.each([
    ['docente_id', 0],
    ['oferta_curso_id', 'x'],
    ['carga_horaria', 500],
    ['fecha_asignacion', '1/1/2026'],
    ['vigente', 'maybe'],
    ['motivo', 123],
  ])('rechaza %s=%p', async (campo, valor) => {
    expect(await editar({ [campo]: valor })).toContain(campo);
  });

  it('listAsignacionesDocentesValidator no impone reglas', () => {
    expect(listAsignacionesDocentesValidator).toEqual([]);
  });
});

describe('aulas-horarios', () => {
  it('cursoHorarioIdParamValidator', async () => {
    expect(await camposInvalidos(aulas.cursoHorarioIdParamValidator, { params: { cursoHorarioId: '4' } })).toEqual([]);
    for (const malo of [undefined, '0', '-2', 'abc', ...MALICIOSOS]) {
      expect(await camposInvalidos(aulas.cursoHorarioIdParamValidator, { params: malo === undefined ? {} : { cursoHorarioId: malo } })).toContain('cursoHorarioId');
    }
  });

  describe('listAulasHorariosValidator', () => {
    const lista = (query) => camposInvalidos(aulas.listAulasHorariosValidator, { query });

    it('acepta filtros válidos y consulta vacía', async () => {
      expect(await lista({})).toEqual([]);
      expect(await lista({ dia: 'LUNES', turno: 'NOCHE', aula_id: '3', page: '1', limit: '10', search: 'lab' })).toEqual([]);
    });

    it.each([
      ['dia', 'FERIADO'],
      ['dia', 'lunes'],
      ['turno', 'MAÑANA'],
      ['aula_id', '0'],
      ['aula_id', 'x'],
      ['page', '0'],
      ['limit', '10001'],
    ])('rechaza %s=%p', async (campo, valor) => {
      expect(await lista({ [campo]: valor })).toContain(campo);
    });

    it.each(MALICIOSOS)('rechaza carga maliciosa %p en dia y aula_id', async (m) => {
      expect(await lista({ dia: m })).toContain('dia');
      expect(await lista({ aula_id: m })).toContain('aula_id');
    });
  });

  describe('patchAulaHorarioValidator', () => {
    const parchar = (body) => camposInvalidos(aulas.patchAulaHorarioValidator, { body });

    it('acepta id positivo, null y omitido (quitar aula)', async () => {
      expect(await parchar({ aulaId: 5 })).toEqual([]);
      expect(await parchar({ aulaId: '5' })).toEqual([]);
      expect(await parchar({ aulaId: null })).toEqual([]);
      expect(await parchar({})).toEqual([]);
    });

    it.each([0, -1, 'abc', '', NaN, Infinity, '1 OR 1=1', { $gt: 0 }])('rechaza aulaId=%p', async (aulaId) => {
      expect(await parchar({ aulaId })).toContain('aulaId');
    });
  });
});

describe('geograficos', () => {
  it('listProvinciasValidator filtra por departamentoId', async () => {
    const lista = (query) => camposInvalidos(geo.listProvinciasValidator, { query });
    expect(await lista({ departamentoId: '2', page: '1' })).toEqual([]);
    expect(await lista({})).toEqual([]);
    for (const malo of ['0', 'x', '1.5', ...MALICIOSOS]) expect(await lista({ departamentoId: malo })).toContain('departamentoId');
  });

  it('listMunicipiosValidator filtra por provinciaId', async () => {
    const lista = (query) => camposInvalidos(geo.listMunicipiosValidator, { query });
    expect(await lista({ provinciaId: '2', limit: '50' })).toEqual([]);
    expect(await lista({})).toEqual([]);
    for (const malo of ['0', 'x', '-4', ...MALICIOSOS]) expect(await lista({ provinciaId: malo })).toContain('provinciaId');
    expect(await lista({ limit: '0' })).toContain('limit');
  });
});

describe('horarios: asignacion-horarios', () => {
  const ok = { asignacion_docente_id: 1, horario_id: 2 };

  it('asignacionHorarioIdValidator', async () => {
    expect(await camposInvalidos(horarios.asignacionHorarioIdValidator, { params: { id: '5' } })).toEqual([]);
    for (const malo of ['0', '-1', 'x', ...MALICIOSOS]) {
      expect(await camposInvalidos(horarios.asignacionHorarioIdValidator, { params: { id: malo } })).toContain('id');
    }
  });

  describe('createAsignacionHorarioValidator', () => {
    const crear = (body) => camposInvalidos(horarios.createAsignacionHorarioValidator, { body });

    it('acepta snake_case, camelCase y opcionales', async () => {
      expect(await crear(ok)).toEqual([]);
      expect(await crear({ asignacionDocenteId: 1, horarioId: 2 })).toEqual([]);
      expect(await crear({ ...ok, aula_id: null, aulaId: null, orden_secuencia: 2, ordenSecuencia: 3 })).toEqual([]);
    });

    it('exige asignación docente y horario', async () => {
      expect((await crear({ horario_id: 2 })).length).toBeGreaterThan(0);
      expect((await crear({ asignacion_docente_id: 1 })).length).toBeGreaterThan(0);
      expect((await crear({})).length).toBeGreaterThan(0);
    });

    it.each([
      ['asignacion_docente_id', 0],
      ['asignacionDocenteId', 'x'],
      ['horario_id', -3],
      ['horarioId', 'x'],
      ['aula_id', 0],
      ['aulaId', 'x'],
      ['orden_secuencia', 0],
      ['ordenSecuencia', 'x'],
    ])('rechaza %s=%p', async (campo, valor) => {
      expect(await crear({ ...ok, [campo]: valor })).toContain(campo);
    });

    it.each(MALICIOSOS)('rechaza carga maliciosa %p', async (m) => {
      expect(await crear({ ...ok, horario_id: m })).toContain('horario_id');
      expect(await crear({ ...ok, asignacion_docente_id: m })).toContain('asignacion_docente_id');
    });
  });

  describe('updateAsignacionHorarioValidator', () => {
    const editar = (body, id = '3') => camposInvalidos(horarios.updateAsignacionHorarioValidator, { params: { id }, body });

    it('acepta cuerpo vacío y parcial', async () => {
      expect(await editar({})).toEqual([]);
      expect(await editar({ asignacion_docente_id: 1, horario_id: 2, aula_id: null, orden_secuencia: 1 })).toEqual([]);
    });

    it.each([
      ['asignacion_docente_id', 0],
      ['horario_id', 'x'],
      ['aula_id', 0],
      ['orden_secuencia', -1],
    ])('rechaza %s=%p', async (campo, valor) => {
      expect(await editar({ [campo]: valor })).toContain(campo);
    });

    it('rechaza :id inválido', async () => {
      expect(await editar({}, '0')).toContain('id');
    });
  });

  describe('bulkAsignacionHorariosValidator', () => {
    const bulk = (body) => camposInvalidos(horarios.bulkAsignacionHorariosValidator, { body });

    it('acepta items[] con operaciones', async () => {
      expect(await bulk({ items: [{ op: 'crear' }] })).toEqual([]);
    });

    it('acepta el arreglo directo como body', async () => {
      expect(await bulk([{ op: 'crear' }])).toEqual([]);
    });

    it.each([{}, { items: [] }, { items: 'x' }, { otro: 1 }])('rechaza %p', async (body) => {
      expect((await bulk(body)).length).toBeGreaterThan(0);
    });
  });

  describe('validarConflictoHorarioValidator', () => {
    const validar = (body) => camposInvalidos(horarios.validarConflictoHorarioValidator, { body });

    it('acepta ids snake_case y camelCase con opcionales', async () => {
      expect(await validar(ok)).toEqual([]);
      expect(await validar({ asignacionDocenteId: 1, horarioId: 2 })).toEqual([]);
      expect(await validar({ ...ok, aula_id: null, aulaId: 3, asignacion_horario_id: 4, asignacionHorarioId: null, exclude_id: 5 })).toEqual([]);
    });

    it('exige asignación y horario', async () => {
      expect((await validar({ horario_id: 2 })).length).toBeGreaterThan(0);
      expect((await validar({ asignacion_docente_id: 1 })).length).toBeGreaterThan(0);
    });

    it.each([
      ['asignacion_docente_id', 0],
      ['horario_id', 0],
      ['aula_id', 0],
      ['aulaId', 'x'],
      ['asignacion_horario_id', -1],
      ['asignacionHorarioId', 'x'],
      ['exclude_id', 0],
    ])('rechaza %s=%p', async (campo, valor) => {
      expect(await validar({ ...ok, [campo]: valor })).toContain(campo);
    });
  });

  it('cambiarTurnoConBloquesValidator exige turno de texto', async () => {
    const turno = (body) => camposInvalidos(horarios.cambiarTurnoConBloquesValidator, { body });
    expect(await turno({ turno: 'NOCHE' })).toEqual([]);
    for (const malo of [{}, { turno: '' }, { turno: '   ' }, { turno: 5 }, { turno: ['NOCHE'] }]) {
      expect(await turno(malo)).toContain('turno');
    }
  });
});

describe('oferta', () => {
  const run = (cadena, cuerpo = {}, params = { id: '4' }) => camposInvalidos(cadena, { body: cuerpo, params });
  const idMalo = ['0', '-1', 'x', ...MALICIOSOS];

  describe('createGestionPlanValidator', () => {
    it('acepta snake_case y camelCase', async () => {
      expect(await run(oferta.createGestionPlanValidator, { gestion_id: 1, plan_estudio_id: 2 })).toEqual([]);
      expect(await run(oferta.createGestionPlanValidator, { gestionId: 1, planEstudioId: 2 })).toEqual([]);
    });

    it('exige gestión y plan', async () => {
      expect((await run(oferta.createGestionPlanValidator, { gestion_id: 1 })).length).toBeGreaterThan(0);
      expect((await run(oferta.createGestionPlanValidator, { plan_estudio_id: 1 })).length).toBeGreaterThan(0);
      expect((await run(oferta.createGestionPlanValidator, {})).length).toBeGreaterThan(0);
    });

    it.each(['gestion_id', 'gestionId', 'plan_estudio_id', 'planEstudioId'])('rechaza %s inválido', async (campo) => {
      for (const malo of [0, 'x', ...MALICIOSOS]) {
        expect(await run(oferta.createGestionPlanValidator, { gestion_id: 1, plan_estudio_id: 2, [campo]: malo })).toContain(campo);
      }
    });
  });

  describe.each([
    ['updateGestionPlanEstadoValidator', 'PROPUESTO', 'VIGENTE'],
    ['updateParaleloGestionEstadoValidator', 'BORRADOR', 'PUBLICADO'],
    ['updateOfertaCursoEstadoValidator', 'PROGRAMADA', 'ACTIVA'],
  ])('%s', (nombre, _a, valido) => {
    it('acepta un estado conocido', async () => {
      expect(await run(oferta[nombre], { estado: valido })).toEqual([]);
    });

    it('rechaza estado ausente, desconocido o malicioso', async () => {
      expect(await run(oferta[nombre], {})).toContain('estado');
      for (const malo of ['INVENTADO', 'activa', '', ...MALICIOSOS]) {
        expect(await run(oferta[nombre], { estado: malo })).toContain('estado');
      }
    });

    it.each(idMalo)('rechaza :id=%p', async (id) => {
      expect(await run(oferta[nombre], { estado: valido }, { id })).toContain('id');
    });
  });

  describe('updateParaleloGestionValidator', () => {
    it('acepta cuerpo vacío y parcial', async () => {
      expect(await run(oferta.updateParaleloGestionValidator)).toEqual([]);
      expect(await run(oferta.updateParaleloGestionValidator, { aula_id: null, aulaId: 2, cupo_maximo: 30, cupoMaximo: 30, cupo_minimo: 5, cupoMinimo: 5, observaciones: 'ok' })).toEqual([]);
    });

    it.each([
      ['aula_id', 0],
      ['aulaId', 'x'],
      ['cupo_maximo', 0],
      ['cupoMaximo', -4],
      ['cupo_minimo', 'x'],
      ['cupoMinimo', 0],
      ['observaciones', { a: 1 }],
    ])('rechaza %s=%p', async (campo, valor) => {
      expect(await run(oferta.updateParaleloGestionValidator, { [campo]: valor })).toContain(campo);
    });

    it('rechaza :id inválido', async () => {
      expect(await run(oferta.updateParaleloGestionValidator, {}, { id: '0' })).toContain('id');
    });
  });

  describe('cambiarTurnoParaleloGestionValidator', () => {
    it('acepta TARDE y NOCHE; rechaza otros', async () => {
      expect(await run(oferta.cambiarTurnoParaleloGestionValidator, { turno: 'TARDE' })).toEqual([]);
      expect(await run(oferta.cambiarTurnoParaleloGestionValidator, { turno: 'NOCHE' })).toEqual([]);
      for (const malo of [undefined, 'MADRUGADA', 'noche', ...MALICIOSOS]) {
        expect(await run(oferta.cambiarTurnoParaleloGestionValidator, malo === undefined ? {} : { turno: malo })).toContain('turno');
      }
      expect(await run(oferta.cambiarTurnoParaleloGestionValidator, { turno: 'TARDE' }, { id: 'x' })).toContain('id');
    });
  });

  describe('createOfertaCursoValidator', () => {
    it('acepta snake_case y camelCase', async () => {
      expect(await run(oferta.createOfertaCursoValidator, { paralelo_gestion_id: 1, asignatura_plan_id: 2 })).toEqual([]);
      expect(await run(oferta.createOfertaCursoValidator, { paraleloGestionId: 1, asignaturaPlanId: 2 })).toEqual([]);
    });

    it('exige paralelo y asignatura', async () => {
      expect((await run(oferta.createOfertaCursoValidator, {})).length).toBeGreaterThan(0);
      expect((await run(oferta.createOfertaCursoValidator, { paralelo_gestion_id: 1 })).length).toBeGreaterThan(0);
    });

    it.each(['paralelo_gestion_id', 'paraleloGestionId', 'asignatura_plan_id', 'asignaturaPlanId'])('rechaza %s inválido', async (campo) => {
      for (const malo of [0, 'x', ...MALICIOSOS]) {
        expect(await run(oferta.createOfertaCursoValidator, { paralelo_gestion_id: 1, asignatura_plan_id: 2, [campo]: malo })).toContain(campo);
      }
    });
  });

  describe('renovarOfertaGestionValidator', () => {
    const valido = { gestion_origen_id: 1, gestiones_planes: [{ gestion_plan_origen_id: 2, plan_estudio_destino_id: 3 }] };

    it('acepta payload completo, destino nulo y banderas', async () => {
      expect(await run(oferta.renovarOfertaGestionValidator, valido)).toEqual([]);
      expect(await run(oferta.renovarOfertaGestionValidator, { ...valido, incluir_asignaciones: true, incluir_horarios: false })).toEqual([]);
      expect(await run(oferta.renovarOfertaGestionValidator, { ...valido, gestiones_planes: [{ gestion_plan_origen_id: 2, plan_estudio_destino_id: null }] })).toEqual([]);
    });

    it.each([
      ['gestion_origen_id', 0],
      ['gestion_origen_id', undefined],
      ['gestiones_planes', []],
      ['gestiones_planes', 'x'],
      ['gestiones_planes', undefined],
      ['incluir_asignaciones', 'quizá'],
      ['incluir_horarios', 'quizá'],
    ])('rechaza %s=%p', async (campo, valor) => {
      expect(await run(oferta.renovarOfertaGestionValidator, { ...valido, [campo]: valor })).toContain(campo);
    });

    it('valida los elementos de gestiones_planes', async () => {
      expect(await run(oferta.renovarOfertaGestionValidator, { ...valido, gestiones_planes: [{ gestion_plan_origen_id: 0 }] })).toContain('gestiones_planes[0].gestion_plan_origen_id');
      expect(await run(oferta.renovarOfertaGestionValidator, { ...valido, gestiones_planes: [{ gestion_plan_origen_id: 1, plan_estudio_destino_id: 0 }] })).toContain('gestiones_planes[0].plan_estudio_destino_id');
    });

    it('rechaza :id inválido', async () => {
      expect(await run(oferta.renovarOfertaGestionValidator, valido, { id: 'x' })).toContain('id');
    });
  });
});
