import { describe, it, expect } from '@jest/globals';
import * as v from '../../../../src/presentation/validators/docentes/index.js';
import { camposInvalidos } from '../_helpers/controllerHarness.js';

const docenteValido = () => ({
  ci: '1234567',
  nombres: 'Ana María',
  apellidoPaterno: 'Paz',
  fechaNacimiento: '1985-04-30',
  genero: 'FEMENINO',
  celular: '70000000',
});

const XSS = '<script>alert(1)</script>';
const SQLI = "'; DROP TABLE docentes;--";

describe('createTeacherValidator / updateTeacherValidator', () => {
  it('acepta un docente mínimo válido', async () => {
    expect(await camposInvalidos(v.createTeacherValidator, { body: docenteValido() })).toEqual([]);
  });

  it('update usa el mismo contrato que create', () => {
    expect(v.updateTeacherValidator).toHaveLength(v.createTeacherValidator.length);
  });

  it('acepta un docente completo', async () => {
    const body = {
      ...docenteValido(),
      expedicion: 'LP',
      apellidoMaterno: 'Ríos',
      estadoCivilId: 2,
      nacionalidad: 'Boliviana',
      telefono: '2222222',
      emailPersonal: 'ana@incos.edu.bo',
      direccion: 'Av. 6 de Agosto',
      municipioResidenciaId: 3,
      zona: 'Sopocachi',
      tituloProfesional: 'Ing.',
      especialidad: 'Redes',
      nivelAcademico: 'MAESTRIA',
      institucionEgreso: 'UMSA',
      anioEgreso: 2010,
      aniosExperiencia: 12,
      fechaContratacion: '2020-01-15',
      tipoContrato: 'PLANTA',
      estadoLaboral: 'ACTIVO',
      observaciones: 'ninguna',
      activo: true,
      maxHorasSemana: 20,
      maxHorasMes: 80,
    };
    expect(await camposInvalidos(v.updateTeacherValidator, { body })).toEqual([]);
  });

  it.each([
    ['ci', undefined],
    ['nombres', ''],
    ['apellidoPaterno', undefined],
    ['fechaNacimiento', undefined],
    ['genero', undefined],
    ['celular', undefined],
  ])('rechaza cuando falta %s', async (campo, valor) => {
    const body = { ...docenteValido(), [campo]: valor };
    expect(await camposInvalidos(v.createTeacherValidator, { body })).toContain(campo);
  });

  it('rechaza un body vacío', async () => {
    const campos = await camposInvalidos(v.createTeacherValidator, { body: {} });
    expect(campos).toEqual(expect.arrayContaining(['ci', 'nombres', 'apellidoPaterno', 'fechaNacimiento', 'genero', 'celular']));
  });

  it.each([
    ['ci', 'x'.repeat(26)],
    ['nombres', 'x'.repeat(151)],
    ['apellidoPaterno', 'x'.repeat(101)],
    ['apellidoMaterno', 'x'.repeat(101)],
    ['celular', '7'.repeat(21)],
    ['expedicion', 'ZZ'],
    ['genero', 'ROBOT'],
    ['fechaNacimiento', '30/04/1985'],
    ['emailPersonal', 'no-es-correo'],
    ['estadoCivilId', 0],
    ['anioEgreso', 1949],
    ['anioEgreso', 2101],
    ['aniosExperiencia', -1],
    ['aniosExperiencia', 81],
    ['maxHorasSemana', 0],
    ['maxHorasSemana', 61],
    ['maxHorasMes', 321],
    ['nivelAcademico', 'ESTUDIANTE'],
    ['tipoContrato', 'EVENTUAL'],
    ['estadoLaboral', 'DESCONOCIDO'],
    ['fechaContratacion', 'ayer'],
    ['activo', 'quizás'],
  ])('rechaza %s=%p', async (campo, valor) => {
    const body = { ...docenteValido(), [campo]: valor };
    expect(await camposInvalidos(v.createTeacherValidator, { body })).toContain(campo);
  });

  it.each([
    ['ci', 'x'.repeat(25)],
    ['nombres', 'x'.repeat(150)],
    ['anioEgreso', 1950],
    ['anioEgreso', 2100],
    ['aniosExperiencia', 0],
    ['aniosExperiencia', 80],
    ['maxHorasSemana', 1],
    ['maxHorasSemana', 60],
    ['maxHorasMes', 320],
  ])('acepta el límite %s=%p', async (campo, valor) => {
    const body = { ...docenteValido(), [campo]: valor };
    expect(await camposInvalidos(v.createTeacherValidator, { body })).toEqual([]);
  });

  it('rechaza tipos no textuales (objetos, arreglos) en campos de texto', async () => {
    const body = { ...docenteValido(), nombres: { $ne: null }, apellidoPaterno: ['a'], celular: { x: 1 } };
    const campos = await camposInvalidos(v.createTeacherValidator, { body });
    expect(campos).toEqual(expect.arrayContaining(['nombres', 'apellidoPaterno', 'celular']));
  });

  it('payloads maliciosos: valores de lista cerrada no pasan; el texto libre se normaliza sin ejecutarse', async () => {
    const mal = { ...docenteValido(), genero: SQLI, expedicion: XSS, tipoContrato: SQLI, estadoLaboral: XSS, emailPersonal: XSS };
    const campos = await camposInvalidos(v.createTeacherValidator, { body: mal });
    expect(campos).toEqual(expect.arrayContaining(['genero', 'expedicion', 'tipoContrato', 'estadoLaboral', 'emailPersonal']));
  });

  it('sanea (trim/toInt/toBoolean) los valores aceptados', async () => {
    const { buildReq } = await import('../_helpers/controllerHarness.js');
    const req = buildReq({
      body: { ...docenteValido(), nombres: '  Ana  ', anioEgreso: '2010', activo: 'true', maxHorasSemana: '20' },
    });
    for (const chain of v.createTeacherValidator) await chain.run(req);
    expect(req.body.nombres).toBe('Ana');
    expect(req.body.anioEgreso).toBe(2010);
    expect(req.body.activo).toBe(true);
    expect(req.body.maxHorasSemana).toBe(20);
  });
});

describe('createTeacherAssignmentValidator', () => {
  const ok = { gestionPlanId: 1, ofertaCursoId: 2, docenteId: 3 };

  it('acepta camelCase y alias snake_case / offerCourseId', async () => {
    expect(await camposInvalidos(v.createTeacherAssignmentValidator, { body: ok })).toEqual([]);
    expect(
      await camposInvalidos(v.createTeacherAssignmentValidator, {
        body: { gestion_plan_id: 1, oferta_curso_id: '2', docente_id: 3 },
      }),
    ).toEqual([]);
    expect(
      await camposInvalidos(v.createTeacherAssignmentValidator, { body: { gestionPlanId: 1, offerCourseId: 2, docenteId: 3 } }),
    ).toEqual([]);
  });

  it('campos ausentes: gestionPlanId, ofertaCursoId y docenteId son requeridos', async () => {
    expect(await camposInvalidos(v.createTeacherAssignmentValidator, { body: {} })).toEqual(
      expect.arrayContaining(['gestionPlanId', 'ofertaCursoId', 'docenteId'])
    );
  });

  it.each([null, '', undefined])('docenteId=%p cuenta como ausente', async (docenteId) => {
    expect(await camposInvalidos(v.createTeacherAssignmentValidator, { body: { ...ok, docenteId } })).toContain('docenteId');
  });

  it.each([
    ['gestionPlanId', 0],
    ['ofertaCursoId', -4],
    ['docenteId', 'abc'],
    ['cargaHoraria', 201],
    ['cargaHoraria', -1],
    ['fechaAsignacion', '2024/01/01'],
    ['vigente', 'tal vez'],
  ])('rechaza %s=%p', async (campo, valor) => {
    expect(await camposInvalidos(v.createTeacherAssignmentValidator, { body: { ...ok, [campo]: valor } })).toContain(campo);
  });

  it('acepta límites de cargaHoraria 0 y 200 y fecha ISO', async () => {
    for (const c of [0, 200]) {
      expect(await camposInvalidos(v.createTeacherAssignmentValidator, { body: { ...ok, cargaHoraria: c, fechaAsignacion: '2026-02-28', vigente: false } })).toEqual([]);
    }
  });

  it('rechaza inyección en identificadores', async () => {
    const campos = await camposInvalidos(v.createTeacherAssignmentValidator, {
      body: { gestionPlanId: SQLI, ofertaCursoId: XSS, docenteId: { $gt: 0 } },
    });
    expect(campos).toEqual(expect.arrayContaining(['gestionPlanId', 'ofertaCursoId', 'docenteId']));
  });
});

describe('assignTeacherToCourseValidator', () => {
  it('body vacío o con ids nulos/vacíos: ofertaCursoId y docenteId son requeridos', async () => {
    expect(await camposInvalidos(v.assignTeacherToCourseValidator, { body: {} })).toEqual(
      expect.arrayContaining(['ofertaCursoId', 'docenteId'])
    );
    expect(await camposInvalidos(v.assignTeacherToCourseValidator, { body: { ofertaCursoId: null, docenteId: '' } })).toEqual(
      expect.arrayContaining(['ofertaCursoId', 'docenteId'])
    );
    expect(await camposInvalidos(v.assignTeacherToCourseValidator, { body: { docenteId: 2 } })).toEqual(['ofertaCursoId']);
  });

  it('acepta ids válidos (y alias)', async () => {
    expect(await camposInvalidos(v.assignTeacherToCourseValidator, { body: { ofertaCursoId: 1, docenteId: 2 } })).toEqual([]);
    expect(await camposInvalidos(v.assignTeacherToCourseValidator, { body: { oferta_curso_id: 1, docente_id: 2, gestionPlanId: 4, vigente: true } })).toEqual([]);
  });

  it.each([
    ['ofertaCursoId', 0],
    ['docenteId', 'x'],
    ['gestionPlanId', 0],
    ['vigente', 'nope'],
  ])('rechaza %s=%p', async (campo, valor) => {
    expect(await camposInvalidos(v.assignTeacherToCourseValidator, { body: { ofertaCursoId: 1, docenteId: 2, [campo]: valor } })).toContain(campo);
  });
});

describe('updateTeacherAssignmentValidator', () => {
  it('acepta una edición parcial', async () => {
    expect(await camposInvalidos(v.updateTeacherAssignmentValidator, { body: { cargaHoraria: 10, motivo: 'cambio' } })).toEqual([]);
  });

  it('rechaza un body sin ningún campo editable', async () => {
    expect((await camposInvalidos(v.updateTeacherAssignmentValidator, { body: {} })).length).toBeGreaterThan(0);
    expect((await camposInvalidos(v.updateTeacherAssignmentValidator, { body: { otroCampo: 1 } })).length).toBeGreaterThan(0);
  });

  it.each([
    ['ofertaCursoId', 0],
    ['oferta_curso_id', 'a'],
    ['docenteId', -1],
    ['cargaHoraria', 201],
    ['vigente', 'x'],
    ['motivo', 'm'.repeat(1001)],
    ['motivo', 123],
    ['fechaAsignacion', 'hoy'],
  ])('rechaza %s=%p', async (campo, valor) => {
    expect(await camposInvalidos(v.updateTeacherAssignmentValidator, { body: { [campo]: valor } })).toContain(campo);
  });

  it('acepta motivo en el límite de 1000', async () => {
    expect(await camposInvalidos(v.updateTeacherAssignmentValidator, { body: { motivo: 'm'.repeat(1000) } })).toEqual([]);
  });
});

describe('listTeacherAssignmentsValidator', () => {
  it('acepta con al menos un filtro de alcance', async () => {
    for (const k of ['docenteId', 'gestionPlanId', 'ofertaCursoId', 'oferta_curso_id', 'cursoId', 'curso_id', 'parallelManagementId', 'paralelo_gestion_id']) {
      expect(await camposInvalidos(v.listTeacherAssignmentsValidator, { query: { [k]: '5' } })).toEqual([]);
    }
  });

  it('rechaza sin ningún filtro de alcance', async () => {
    expect((await camposInvalidos(v.listTeacherAssignmentsValidator, { query: {} })).length).toBeGreaterThan(0);
  });

  it('rechaza ids no positivos, vigente inválido y paginación fuera de rango', async () => {
    const campos = await camposInvalidos(v.listTeacherAssignmentsValidator, {
      query: { docenteId: '0', vigente: 'talvez', page: '0', limit: '10001' },
    });
    expect(campos).toEqual(expect.arrayContaining(['docenteId', 'vigente', 'page', 'limit']));
  });

  it('acepta vigente true/false/0/1 y límites de paginación', async () => {
    for (const val of ['true', 'false', '0', '1']) {
      expect(await camposInvalidos(v.listTeacherAssignmentsValidator, { query: { docenteId: '1', vigente: val, page: '1', limit: '10000' } })).toEqual([]);
    }
  });
});

describe('validators de catálogos de asignación (query)', () => {
  const casos = [
    ['listPlanesDocenteValidator', {}, { gestionId: '0' }, 'gestionId'],
    ['listCursosDisponiblesDocenteValidator', { gestionPlanId: '1' }, { gestionPlanId: '0' }, 'gestionPlanId'],
    ['listPeriodosDocenteValidator', { gestionPlanId: '1' }, { gestionPlanId: 'x' }, 'gestionPlanId'],
    ['listParalelosDocenteValidator', { gestionPlanId: '1', periodoId: '2' }, { gestionPlanId: '1', periodoId: '-2' }, 'periodoId'],
    ['listCursosParaleloDocenteValidator', { gestionPlanId: '1', paraleloId: '2' }, { gestionPlanId: '1', paraleloId: '0' }, 'paraleloId'],
  ];

  it.each(casos)('%s: acepta válido y rechaza inválido', async (nombre, bueno, malo, campo) => {
    expect(await camposInvalidos(v[nombre], { query: bueno })).toEqual([]);
    expect(await camposInvalidos(v[nombre], { query: malo })).toContain(campo);
  });

  it.each(['listCursosDisponiblesDocenteValidator', 'listPeriodosDocenteValidator', 'listParalelosDocenteValidator', 'listCursosParaleloDocenteValidator'])(
    '%s exige gestionPlanId',
    async (nombre) => {
      expect(await camposInvalidos(v[nombre], { query: {} })).toContain('gestionPlanId');
    },
  );

  it('listCursosParaleloDocenteValidator valida paraleloGestionId opcional', async () => {
    const base = { gestionPlanId: '1', paraleloId: '2' };
    expect(await camposInvalidos(v.listCursosParaleloDocenteValidator, { query: { ...base, paraleloGestionId: '3' } })).toEqual([]);
    expect(await camposInvalidos(v.listCursosParaleloDocenteValidator, { query: { ...base, paraleloGestionId: '0' } })).toContain('paraleloGestionId');
  });

  it('el término de búsqueda respeta 2..100 caracteres y se sanea', async () => {
    const q = { gestionPlanId: '1' };
    expect(await camposInvalidos(v.listPeriodosDocenteValidator, { query: { ...q, search: 'a' } })).toContain('search');
    expect(await camposInvalidos(v.listPeriodosDocenteValidator, { query: { ...q, search: 'a'.repeat(101) } })).toContain('search');
    expect(await camposInvalidos(v.listPeriodosDocenteValidator, { query: { ...q, search: 'ab' } })).toEqual([]);
    expect(await camposInvalidos(v.listPeriodosDocenteValidator, { query: { ...q, incluir_estadisticas: 'quizás' } })).toContain('incluir_estadisticas');
  });
});

describe('cursoIdParamValidator', () => {
  it('acepta un entero positivo', async () => {
    expect(await camposInvalidos(v.cursoIdParamValidator, { params: { cursoId: '12' } })).toEqual([]);
  });
  it.each([[undefined], ['0'], ['-1'], ['abc'], ['1; DROP TABLE x']])('rechaza %p', async (val) => {
    expect(await camposInvalidos(v.cursoIdParamValidator, { params: val === undefined ? {} : { cursoId: val } })).toContain('cursoId');
  });
});

describe('getDocenteCargaGestionValidator', () => {
  it('acepta id y gestion_id válidos', async () => {
    expect(await camposInvalidos(v.getDocenteCargaGestionValidator, { params: { id: '3' }, query: { gestion_id: '2' } })).toEqual([]);
  });
  it('rechaza id y gestion_id inválidos', async () => {
    const campos = await camposInvalidos(v.getDocenteCargaGestionValidator, { params: { id: '0' }, query: {} });
    expect(campos).toEqual(expect.arrayContaining(['id', 'gestion_id']));
    expect(await camposInvalidos(v.getDocenteCargaGestionValidator, { params: { id: '1' }, query: { gestion_id: '-5' } })).toContain('gestion_id');
  });
});

describe('putDocenteColorValidator', () => {
  const params = { id: '4' };
  it.each(['#FF00aa', '112233', '#000000'])('acepta color %s', async (color) => {
    expect(await camposInvalidos(v.putDocenteColorValidator, { params, body: { color_hex: color } })).toEqual([]);
  });
  it.each(['#FFF', 'rojo', '#GG0000', '#1234567', '<script>', ''])('rechaza color %p', async (color) => {
    expect(await camposInvalidos(v.putDocenteColorValidator, { params, body: { color_hex: color } })).toContain('color_hex');
  });
  it('rechaza id inválido', async () => {
    expect(await camposInvalidos(v.putDocenteColorValidator, { params: { id: 'x' }, body: { color_hex: '#FFFFFF' } })).toContain('id');
  });
});

describe('fichas de seguimiento', () => {
  const crear = { asignacionDocenteId: 4, fechaSeguimiento: '2026-03-10' };

  it('create acepta mínimo y completo', async () => {
    expect(await camposInvalidos(v.createFichaSeguimientoValidator, { body: crear })).toEqual([]);
    expect(
      await camposInvalidos(v.createFichaSeguimientoValidator, {
        body: {
          ...crear,
          claseObservada: 'PRESENCIAL',
          tieneCronogramaBimestral: true,
          tienePlanBimestral: 'false',
          tieneRegistroAsistencia: true,
          tieneRegistroPedagogico: false,
          estudiantesEnPlanilla: 30,
          estudiantesAsistentes: 0,
          obsDocumentacion: 'x'.repeat(5000),
          otrasObservaciones: 'ok',
        },
      }),
    ).toEqual([]);
  });

  it('create exige asignación y fecha', async () => {
    expect(await camposInvalidos(v.createFichaSeguimientoValidator, { body: {} })).toEqual(
      expect.arrayContaining(['asignacionDocenteId', 'fechaSeguimiento']),
    );
  });

  it.each([
    ['asignacionDocenteId', 0],
    ['fechaSeguimiento', '10-03-2026'],
    ['claseObservada', 'VIRTUAL'],
    ['tienePlanBimestral', 'quizá'],
    ['estudiantesEnPlanilla', -1],
    ['estudiantesAsistentes', 'muchos'],
    ['obsRecursos', 'x'.repeat(5001)],
    ['obsExposicion', 42],
  ])('create rechaza %s=%p', async (campo, valor) => {
    expect(await camposInvalidos(v.createFichaSeguimientoValidator, { body: { ...crear, [campo]: valor } })).toContain(campo);
  });

  it('update admite payload parcial y valida lo enviado', async () => {
    expect(await camposInvalidos(v.updateFichaSeguimientoValidator, { body: {} })).toEqual([]);
    expect(await camposInvalidos(v.updateFichaSeguimientoValidator, { body: { fechaSeguimiento: '2026-01-01', estudiantesAsistentes: 3 } })).toEqual([]);
    expect(await camposInvalidos(v.updateFichaSeguimientoValidator, { body: { asignacionDocenteId: 0 } })).toContain('asignacionDocenteId');
    expect(await camposInvalidos(v.updateFichaSeguimientoValidator, { body: { fechaSeguimiento: 'x' } })).toContain('fechaSeguimiento');
  });

  it('list valida filtros y rango de fechas', async () => {
    expect(await camposInvalidos(v.listFichasSeguimientoValidator, { query: { docenteId: '1', gestionId: '2', fechaDesde: '2026-01-01', fechaHasta: '2026-12-31' } })).toEqual([]);
    expect(
      await camposInvalidos(v.listFichasSeguimientoValidator, { query: { docenteId: '0', gestionId: 'x', fechaDesde: 'ayer', fechaHasta: 'mañana' } }),
    ).toEqual(expect.arrayContaining(['docenteId', 'gestionId', 'fechaDesde', 'fechaHasta']));
  });
});
