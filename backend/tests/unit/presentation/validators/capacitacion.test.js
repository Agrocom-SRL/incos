import { describe, it, expect } from '@jest/globals';
import * as v from '../../../../src/presentation/validators/capacitacion/index.js';
import {
  CONCEPTOS_PAGO_CAPACITACION_VALUES,
  ESTADOS_CAPACITACION_VALUES,
  ESTADOS_INSCRIPCION_CAPACITACION_VALUES,
  MODALIDADES_CAPACITACION_VALUES,
} from '../../../../src/domain/constants/capacitacion.constants.js';
import { DIAS_SEMANA_VALUES } from '../../../../src/domain/constants/cursos.constants.js';
import { camposInvalidos, buildReq } from '../_helpers/controllerHarness.js';

const XSS = '<script>alert(1)</script>';
const SQLI = "'; DROP TABLE capacitacion_cursos;--";
const concepto = CONCEPTOS_PAGO_CAPACITACION_VALUES[0];

describe('listados (query)', () => {
  it('listCursosCapacitacionValidator', async () => {
    expect(await camposInvalidos(v.listCursosCapacitacionValidator, { query: { estado: ESTADOS_CAPACITACION_VALUES[0], incluirInactivos: '1' } })).toEqual([]);
    expect(await camposInvalidos(v.listCursosCapacitacionValidator, { query: { estado: SQLI, incluirInactivos: 'si' } })).toEqual(
      expect.arrayContaining(['estado', 'incluirInactivos']),
    );
  });

  it('listGruposCapacitacionValidator', async () => {
    expect(await camposInvalidos(v.listGruposCapacitacionValidator, { query: { cursoId: '3' } })).toEqual([]);
    expect(await camposInvalidos(v.listGruposCapacitacionValidator, { query: { cursoId: '0', estado: 'X' } })).toEqual(
      expect.arrayContaining(['cursoId', 'estado']),
    );
  });

  it('listHorariosCapacitacionValidator: aulaId, search, sort, excludeCursoId', async () => {
    for (const sort of ['dia', 'hora:asc', 'NOMBRE:DESC']) {
      expect(await camposInvalidos(v.listHorariosCapacitacionValidator, { query: { sort } })).toEqual([]);
    }
    const campos = await camposInvalidos(v.listHorariosCapacitacionValidator, {
      query: { aulaId: '0', search: 'a'.repeat(101), sort: 'costo; DROP', excludeCursoId: 'x' },
    });
    expect(campos).toEqual(expect.arrayContaining(['aulaId', 'search', 'sort', 'excludeCursoId']));
  });

  it('listHorariosDisponiblesCapacitacionValidator exige aulaId', async () => {
    expect(await camposInvalidos(v.listHorariosDisponiblesCapacitacionValidator, { query: { aulaId: '2', excludeCursoId: '1' } })).toEqual([]);
    expect(await camposInvalidos(v.listHorariosDisponiblesCapacitacionValidator, { query: {} })).toContain('aulaId');
    expect(await camposInvalidos(v.listHorariosDisponiblesCapacitacionValidator, { query: { aulaId: '-1' } })).toContain('aulaId');
  });

  it('listInscripcionesCapacitacionValidator', async () => {
    expect(
      await camposInvalidos(v.listInscripcionesCapacitacionValidator, {
        query: { capacitacionId: '1', participanteId: '2', estado: ESTADOS_INSCRIPCION_CAPACITACION_VALUES[0], incluirInactivos: 'true' },
      }),
    ).toEqual([]);
    expect(
      await camposInvalidos(v.listInscripcionesCapacitacionValidator, {
        query: { capacitacionId: '0', participanteId: 'a', estado: 'Z', incluirInactivos: '9' },
      }),
    ).toEqual(expect.arrayContaining(['capacitacionId', 'participanteId', 'estado', 'incluirInactivos']));
  });

  it('listParticipantesValidator', async () => {
    expect(await camposInvalidos(v.listParticipantesValidator, { query: { ci: '1234567', incluirInactivos: '0', sinInscripcionActiva: 'true' } })).toEqual([]);
    expect(await camposInvalidos(v.listParticipantesValidator, { query: { ci: '1'.repeat(21), incluirInactivos: 'x', sinInscripcionActiva: 'x' } })).toEqual(
      expect.arrayContaining(['ci', 'incluirInactivos', 'sinInscripcionActiva']),
    );
  });
});

describe('horarios de capacitación', () => {
  it.each(['createHorarioCapacitacionValidator', 'updateHorarioCapacitacionValidator'])('%s', async (nombre) => {
    const ok = { dia: DIAS_SEMANA_VALUES[0], horaInicio: '08:00', horaFin: '10:30:15' };
    expect(await camposInvalidos(v[nombre], { body: ok })).toEqual([]);
    // dia se normaliza a mayúsculas
    expect(await camposInvalidos(v[nombre], { body: { ...ok, dia: DIAS_SEMANA_VALUES[0].toLowerCase() } })).toEqual([]);
    expect(await camposInvalidos(v[nombre], { body: {} })).toEqual(expect.arrayContaining(['dia', 'horaInicio', 'horaFin']));
    for (const h of ['24:00', '8:00', '12:60', 'mediodía', '12:00; --']) {
      expect(await camposInvalidos(v[nombre], { body: { ...ok, horaInicio: h } })).toContain('horaInicio');
    }
    for (const h of ['00:00', '23:59', '23:59:59']) {
      expect(await camposInvalidos(v[nombre], { body: { ...ok, horaFin: h } })).toEqual([]);
    }
    expect(await camposInvalidos(v[nombre], { body: { ...ok, dia: 'FERIADO' } })).toContain('dia');
  });
});

describe('createCursoCapacitacionValidator / updateCursoCapacitacionValidator', () => {
  const ok = { titulo: 'Excel avanzado', fechaInicio: '2026-05-01' };

  it('create acepta mínimo; exige titulo y fechaInicio', async () => {
    expect(await camposInvalidos(v.createCursoCapacitacionValidator, { body: ok })).toEqual([]);
    expect(await camposInvalidos(v.createCursoCapacitacionValidator, { body: {} })).toEqual(expect.arrayContaining(['titulo', 'fechaInicio']));
  });

  it('update acepta body vacío (todo opcional)', async () => {
    expect(await camposInvalidos(v.updateCursoCapacitacionValidator, { body: {} })).toEqual([]);
  });

  it('acepta un curso completo con grupos, horarios y requisitos', async () => {
    const body = {
      ...ok,
      descripcion: 'desc',
      costo: 150.5,
      cupoMaximo: 30,
      fechaFin: '2026-06-01',
      edicion: 'I-2026',
      cursoOrigenId: 4,
      tieneCosto: true,
      cobraMatricula: false,
      costoMatricula: 0,
      entidadCertificadora: 'INCOS',
      modalidad: MODALIDADES_CAPACITACION_VALUES[0],
      nivel: 'Básico',
      dirigidoA: 'Público en general',
      duracion: '40 horas',
      activo: true,
      grupos: [
        { id: 1, nombre: 'Grupo A', aulaId: 2, cupoMaximo: 20, costoMatricula: 10, orden: 1, horarios: [{ horarioId: 3 }] },
      ],
      requisitos: [{ id: 1, descripcion: 'Fotocopia CI', obligatorio: true, acreditaPagoCurso: false, orden: 1 }],
    };
    expect(await camposInvalidos(v.createCursoCapacitacionValidator, { body })).toEqual([]);
    expect(await camposInvalidos(v.updateCursoCapacitacionValidator, { body })).toEqual([]);
  });

  it.each([
    ['titulo', 'a'],
    ['titulo', 'a'.repeat(201)],
    ['titulo', 123],
    ['descripcion', 'a'.repeat(5001)],
    ['costo', -1],
    ['costo', 'gratis'],
    ['cupoMaximo', 0],
    ['fechaInicio', '1/5/2026'],
    ['fechaFin', 'luego'],
    ['edicion', 'e'.repeat(61)],
    ['cursoOrigenId', 0],
    ['tieneCosto', 'quizá'],
    ['cobraMatricula', 'quizá'],
    ['costoMatricula', -0.01],
    ['entidadCertificadora', 'e'.repeat(151)],
    ['modalidad', 'TELEPATICA'],
    ['nivel', 'n'.repeat(61)],
    ['dirigidoA', 'd'.repeat(256)],
    ['duracion', 'd'.repeat(61)],
    ['activo', 'x'],
    ['grupos', 'no-array'],
    ['grupos', Array.from({ length: 11 }, () => ({ nombre: 'g' }))],
    ['requisitos', Array.from({ length: 51 }, () => ({ descripcion: 'r' }))],
  ])('create y update rechazan %s=%p', async (campo, valor) => {
    expect(await camposInvalidos(v.createCursoCapacitacionValidator, { body: { ...ok, [campo]: valor } })).toContain(campo);
    expect(await camposInvalidos(v.updateCursoCapacitacionValidator, { body: { [campo]: valor } })).toContain(campo);
  });

  it('valida los elementos anidados de grupos y requisitos', async () => {
    const campos = await camposInvalidos(v.createCursoCapacitacionValidator, {
      body: {
        ...ok,
        grupos: [{ id: 0, nombre: '', aulaId: 0, cupoMaximo: 0, costoMatricula: -1, orden: 0, horarios: [{ horarioId: 0 }] }],
        requisitos: [{ id: 0, descripcion: '', obligatorio: 'x', acreditaPagoCurso: 'x', orden: 0 }],
      },
    });
    expect(campos).toEqual(
      expect.arrayContaining([
        'grupos[0].id',
        'grupos[0].nombre',
        'grupos[0].aulaId',
        'grupos[0].cupoMaximo',
        'grupos[0].costoMatricula',
        'grupos[0].orden',
        'grupos[0].horarios[0].horarioId',
        'requisitos[0].id',
        'requisitos[0].descripcion',
        'requisitos[0].obligatorio',
        'requisitos[0].acreditaPagoCurso',
        'requisitos[0].orden',
      ]),
    );
  });

  it('límites: titulo 2/200, descripcion 5000, 10 grupos, 50 requisitos', async () => {
    for (const t of ['ab', 'a'.repeat(200)]) {
      expect(await camposInvalidos(v.createCursoCapacitacionValidator, { body: { ...ok, titulo: t } })).toEqual([]);
    }
    expect(await camposInvalidos(v.createCursoCapacitacionValidator, { body: { ...ok, descripcion: 'a'.repeat(5000) } })).toEqual([]);
    expect(
      await camposInvalidos(v.createCursoCapacitacionValidator, {
        body: { ...ok, grupos: Array.from({ length: 10 }, (_, i) => ({ nombre: `G${i}` })), requisitos: Array.from({ length: 50 }, () => ({ descripcion: 'r' })) },
      }),
    ).toEqual([]);
  });

  it('fechaFin vacía o null se tolera (opcional)', async () => {
    expect(await camposInvalidos(v.createCursoCapacitacionValidator, { body: { ...ok, fechaFin: '' } })).toEqual([]);
    expect(await camposInvalidos(v.createCursoCapacitacionValidator, { body: { ...ok, fechaFin: null } })).toEqual([]);
  });

  it('payloads maliciosos no pasan en campos tipados; texto libre queda como texto', async () => {
    const campos = await camposInvalidos(v.createCursoCapacitacionValidator, {
      body: { titulo: XSS, fechaInicio: SQLI, costo: SQLI, modalidad: XSS, cursoOrigenId: SQLI },
    });
    expect(campos).toEqual(expect.arrayContaining(['fechaInicio', 'costo', 'modalidad', 'cursoOrigenId']));
  });

  it('trim del título', async () => {
    const req = buildReq({ body: { ...ok, titulo: '   Curso   ' } });
    for (const c of v.createCursoCapacitacionValidator) await c.run(req);
    expect(req.body.titulo).toBe('Curso');
  });
});

describe('participantes', () => {
  const ok = { ci: '1234567', nombres: 'Ana', celular: '70000000' };

  it('create exige ci, nombres y celular; update no', async () => {
    expect(await camposInvalidos(v.createParticipanteValidator, { body: ok })).toEqual([]);
    expect(await camposInvalidos(v.createParticipanteValidator, { body: {} })).toEqual(expect.arrayContaining(['ci', 'nombres', 'celular']));
    expect(await camposInvalidos(v.updateParticipanteValidator, { body: {} })).toEqual([]);
  });

  it.each([
    ['ci', '123'],
    ['ci', '1'.repeat(21)],
    ['expedicion', 'LPZ-X'.repeat(2)],
    ['nombres', 'A'],
    ['nombres', 'A'.repeat(151)],
    ['apellidoPaterno', 'A'.repeat(101)],
    ['apellidoMaterno', 'A'.repeat(101)],
    ['celular', '123456'],
    ['celular', '7'.repeat(21)],
    ['email', 'no-email'],
    ['email', `${'a'.repeat(145)}@x.com`],
    ['activo', 'tal vez'],
  ])('rechaza %s=%p', async (campo, valor) => {
    expect(await camposInvalidos(v.createParticipanteValidator, { body: { ...ok, [campo]: valor } })).toContain(campo);
    expect(await camposInvalidos(v.updateParticipanteValidator, { body: { [campo]: valor } })).toContain(campo);
  });

  it('acepta los límites (ci 4/20, celular 7/20, nombres 2/150)', async () => {
    for (const body of [
      { ci: '1234', nombres: 'Ab', celular: '1234567' },
      { ci: '1'.repeat(20), nombres: 'A'.repeat(150), celular: '7'.repeat(20), expedicion: 'LP', email: 'a@b.co', apellidoPaterno: 'P', apellidoMaterno: 'M', activo: true },
    ]) {
      expect(await camposInvalidos(v.createParticipanteValidator, { body })).toEqual([]);
    }
  });

  it('buildParticipanteFieldValidators respeta prefijo y obligatoriedad', async () => {
    const anidado = v.buildParticipanteFieldValidators('participante.', true);
    expect(await camposInvalidos(anidado, { body: { participante: {} } })).toEqual(
      expect.arrayContaining(['participante.ci', 'participante.nombres', 'participante.celular']),
    );
    expect(await camposInvalidos(v.buildParticipanteFieldValidators(), { body: ok })).toEqual([]);
  });

  it('payloads maliciosos: tipos no textuales rechazados', async () => {
    const campos = await camposInvalidos(v.createParticipanteValidator, { body: { ci: { $ne: 1 }, nombres: ['a', 'b'], celular: SQLI } });
    expect(campos).toEqual(expect.arrayContaining(['ci', 'nombres', 'celular']));
  });
});

describe('inscripciones', () => {
  const ok = { capacitacionId: 1 };

  it('create: acepta con capacitacionId, o con alias cursoId', async () => {
    expect(await camposInvalidos(v.createInscripcionCapacitacionValidator, { body: ok })).toEqual([]);
    expect(await camposInvalidos(v.createInscripcionCapacitacionValidator, { body: { cursoId: 2 } })).toEqual([]);
  });

  it('create: exige capacitacionId (o cursoId)', async () => {
    expect(await camposInvalidos(v.createInscripcionCapacitacionValidator, { body: {} })).toContain('capacitacionId');
    expect(await camposInvalidos(v.createInscripcionCapacitacionValidator, { body: { capacitacionId: 0 } })).toContain('capacitacionId');
    expect(await camposInvalidos(v.createInscripcionCapacitacionValidator, { body: { cursoId: 0 } })).toContain('cursoId');
  });

  it('create: participante existente, nuevo y pago inicial válidos', async () => {
    expect(
      await camposInvalidos(v.createInscripcionCapacitacionValidator, {
        body: {
          ...ok,
          capacitacionGrupoId: 3,
          requisitosEntregados: [1, 2],
          fechaCompromiso: '2026-06-01',
          participanteId: 9,
          participante: { ci: '1234567', nombres: 'Ana', celular: '70000000' },
          fechaInscripcion: '2026-05-01',
          pagoInicial: { concepto, monto: 50, metodoPagoId: 1, cuentaPagoId: 2, fechaPago: '2026-05-01', observaciones: 'ok', fechaCompromiso: '2026-06-01' },
        },
      }),
    ).toEqual([]);
  });

  it.each([
    ['capacitacionGrupoId', 0],
    ['requisitosEntregados', 'x'],
    ['requisitosEntregados', [0]],
    ['fechaCompromiso', 'x'],
    ['participanteId', 0],
    ['participante', 'texto'],
    ['fechaInscripcion', '2026-99-99'],
    ['pagoInicial', 'texto'],
  ])('create rechaza %s=%p', async (campo, valor) => {
    const campos = await camposInvalidos(v.createInscripcionCapacitacionValidator, { body: { ...ok, [campo]: valor } });
    expect(campos.some((c) => c === campo || c.startsWith(`${campo}[`))).toBe(true);
  });

  it('create: pagoInicial presente sin concepto, con monto/método inválidos', async () => {
    const campos = await camposInvalidos(v.createInscripcionCapacitacionValidator, {
      body: { ...ok, pagoInicial: { monto: 0, metodoPagoId: 0, cuentaPagoId: 0, fechaPago: 'x', observaciones: 'o'.repeat(2001), fechaCompromiso: 'x' } },
    });
    expect(campos).toEqual(
      expect.arrayContaining([
        'pagoInicial.concepto',
        'pagoInicial.monto',
        'pagoInicial.metodoPagoId',
        'pagoInicial.cuentaPagoId',
        'pagoInicial.fechaPago',
        'pagoInicial.observaciones',
        'pagoInicial.fechaCompromiso',
      ]),
    );
  });

  it('registerPagoCapacitacionValidator: requeridos, límites y normalización de concepto', async () => {
    expect(await camposInvalidos(v.registerPagoCapacitacionValidator, { body: {} })).toEqual(
      expect.arrayContaining(['concepto', 'monto', 'metodoPagoId']),
    );
    const base = { concepto: concepto.toLowerCase(), monto: 0.01, metodoPagoId: 1 };
    expect(await camposInvalidos(v.registerPagoCapacitacionValidator, { body: base })).toEqual([]);
    expect(await camposInvalidos(v.registerPagoCapacitacionValidator, { body: { ...base, monto: 0 } })).toContain('monto');
    expect(await camposInvalidos(v.registerPagoCapacitacionValidator, { body: { ...base, monto: -5 } })).toContain('monto');
    expect(await camposInvalidos(v.registerPagoCapacitacionValidator, { body: { ...base, monto: 'mucho' } })).toContain('monto');
    expect(await camposInvalidos(v.registerPagoCapacitacionValidator, { body: { ...base, concepto: SQLI } })).toContain('concepto');
    expect(await camposInvalidos(v.registerPagoCapacitacionValidator, { body: { ...base, metodoPagoId: 'x' } })).toContain('metodoPagoId');
  });

  it('anularInscripcionCapacitacionValidator: observacion opcional hasta 500', async () => {
    expect(await camposInvalidos(v.anularInscripcionCapacitacionValidator, { body: {} })).toEqual([]);
    expect(await camposInvalidos(v.anularInscripcionCapacitacionValidator, { body: { observacion: 'o'.repeat(500) } })).toEqual([]);
    expect(await camposInvalidos(v.anularInscripcionCapacitacionValidator, { body: { observacion: 'o'.repeat(501) } })).toContain('observacion');
    expect(await camposInvalidos(v.anularInscripcionCapacitacionValidator, { body: { observacion: 7 } })).toContain('observacion');
  });

  it('pagoIdValidator', async () => {
    expect(await camposInvalidos(v.pagoIdValidator, { params: { pagoId: '4' } })).toEqual([]);
    for (const p of [{}, { pagoId: '0' }, { pagoId: 'a' }]) {
      expect(await camposInvalidos(v.pagoIdValidator, { params: p })).toContain('pagoId');
    }
  });

  it('updateRequisitosInscripcionValidator', async () => {
    expect(
      await camposInvalidos(v.updateRequisitosInscripcionValidator, {
        body: { requisitos: [{ requisitoId: 1, entregado: true, fechaEntrega: '2026-05-02', observacion: 'ok' }] },
      }),
    ).toEqual([]);
    expect(await camposInvalidos(v.updateRequisitosInscripcionValidator, { body: {} })).toContain('requisitos');
    expect(await camposInvalidos(v.updateRequisitosInscripcionValidator, { body: { requisitos: [] } })).toContain('requisitos');
    expect(
      await camposInvalidos(v.updateRequisitosInscripcionValidator, {
        body: { requisitos: [{ requisitoId: 0, entregado: 'x', fechaEntrega: 'x', observacion: 'o'.repeat(256) }] },
      }),
    ).toEqual(
      expect.arrayContaining(['requisitos[0].requisitoId', 'requisitos[0].entregado', 'requisitos[0].fechaEntrega', 'requisitos[0].observacion']),
    );
  });

  it('updateInscripcionCapacitacionValidator: todo opcional y valida lo enviado', async () => {
    expect(await camposInvalidos(v.updateInscripcionCapacitacionValidator, { body: {} })).toEqual([]);
    expect(await camposInvalidos(v.updateInscripcionCapacitacionValidator, { body: { participante: { nombres: 'Luz' }, capacitacionGrupoId: 2 } })).toEqual([]);
    expect(await camposInvalidos(v.updateInscripcionCapacitacionValidator, { body: { participante: 'x', capacitacionGrupoId: 0 } })).toEqual(
      expect.arrayContaining(['participante', 'capacitacionGrupoId']),
    );
    expect(await camposInvalidos(v.updateInscripcionCapacitacionValidator, { body: { participante: { ci: '1' } } })).toContain('participante.ci');
  });

  it('updatePagoCapacitacionValidator: parcial', async () => {
    expect(await camposInvalidos(v.updatePagoCapacitacionValidator, { body: {} })).toEqual([]);
    expect(await camposInvalidos(v.updatePagoCapacitacionValidator, { body: { concepto: concepto.toLowerCase(), monto: 10, metodoPagoId: 2, cuentaPagoId: 1, fechaPago: '2026-01-01', observaciones: 'ok' } })).toEqual([]);
    expect(
      await camposInvalidos(v.updatePagoCapacitacionValidator, {
        body: { concepto: 'REGALO', monto: 0, metodoPagoId: 0, cuentaPagoId: 0, fechaPago: 'x', observaciones: 'o'.repeat(2001) },
      }),
    ).toEqual(expect.arrayContaining(['concepto', 'monto', 'metodoPagoId', 'cuentaPagoId', 'fechaPago', 'observaciones']));
  });

  it('anularPagoCapacitacionValidator: motivo 3..500 obligatorio', async () => {
    expect(await camposInvalidos(v.anularPagoCapacitacionValidator, { body: {} })).toContain('motivo');
    expect(await camposInvalidos(v.anularPagoCapacitacionValidator, { body: { motivo: 'ab' } })).toContain('motivo');
    expect(await camposInvalidos(v.anularPagoCapacitacionValidator, { body: { motivo: 'm'.repeat(501) } })).toContain('motivo');
    expect(await camposInvalidos(v.anularPagoCapacitacionValidator, { body: { motivo: '   ' } })).toContain('motivo');
    expect(await camposInvalidos(v.anularPagoCapacitacionValidator, { body: { motivo: 'abc' } })).toEqual([]);
    expect(await camposInvalidos(v.anularPagoCapacitacionValidator, { body: { motivo: 'm'.repeat(500) } })).toEqual([]);
  });
});

describe('setEstadoCatalogoValidator', () => {
  it.each([[true], [false], ['true'], [1]])('acepta %p', async (activo) => {
    expect(await camposInvalidos(v.setEstadoCatalogoValidator, { body: { activo } })).toEqual([]);
  });
  it.each([[undefined], [null], ['no'], [{}]])('rechaza %p', async (activo) => {
    expect(await camposInvalidos(v.setEstadoCatalogoValidator, { body: { activo } })).toContain('activo');
  });
});
