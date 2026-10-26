import { describe, it, expect } from '@jest/globals';
import * as v from '../../../../src/presentation/validators/pasantias/index.js';
import {
  HORAS_PASANTIA_MAX,
  HORAS_PASANTIA_MIN,
  TIPOS_CONTRATO_PASANTIA_VALUES,
  TIPOS_INFORME_PASANTIA_VALUES,
  RESULTADOS_INFORME_PASANTIA_VALUES,
  NIVELES_DESEMPENO_PASANTIA_VALUES,
  TIPOS_SOCIETARIO_EMPRESA_VALUES,
  ESTADOS_PASANTIA_VALUES,
} from '../../../../src/domain/constants/pasantias.constants.js';
import { camposInvalidos } from '../_helpers/controllerHarness.js';

const XSS = '<img src=x onerror=alert(1)>';
const SQLI = "1 OR 1=1; DROP TABLE pasantias;--";

describe('validators de ids en ruta', () => {
  it.each([
    ['empresaIdValidator', 'empresaId'],
    ['informeIdValidator', 'informeId'],
    ['seguimientoIdValidator', 'seguimientoId'],
  ])('%s', async (nombre, param) => {
    expect(await camposInvalidos(v[nombre], { params: { [param]: '8' } })).toEqual([]);
    for (const malo of [undefined, '0', '-3', 'abc', SQLI, '1.5']) {
      const params = malo === undefined ? {} : { [param]: malo };
      expect(await camposInvalidos(v[nombre], { params })).toContain(param);
    }
  });
});

describe('listPasantiasValidator', () => {
  it('acepta consulta vacía y filtros válidos', async () => {
    expect(await camposInvalidos(v.listPasantiasValidator, { query: {} })).toEqual([]);
    expect(
      await camposInvalidos(v.listPasantiasValidator, {
        query: { carreraId: '1', gestionId: '2', estado: 'EN_CURSO', tipo: 'PASANTIA', docenteSupervisorId: '3', estudianteId: '4', page: '1', limit: '20' },
      }),
    ).toEqual([]);
  });

  it('rechaza filtros inválidos', async () => {
    const campos = await camposInvalidos(v.listPasantiasValidator, {
      query: { carreraId: '0', gestionId: 'x', estado: 'INVENTADO', tipo: SQLI, docenteSupervisorId: '-1', estudianteId: '0' },
    });
    expect(campos).toEqual(
      expect.arrayContaining(['carreraId', 'gestionId', 'estado', 'tipo', 'docenteSupervisorId', 'estudianteId']),
    );
  });
});

describe('listPasantiasEmpresasValidator', () => {
  it('valida incluirInactivos y tipoSocietario', async () => {
    expect(await camposInvalidos(v.listPasantiasEmpresasValidator, { query: { incluirInactivos: 'true', tipoSocietario: TIPOS_SOCIETARIO_EMPRESA_VALUES[0] } })).toEqual([]);
    expect(
      await camposInvalidos(v.listPasantiasEmpresasValidator, { query: { incluirInactivos: 'si', tipoSocietario: XSS } }),
    ).toEqual(expect.arrayContaining(['incluirInactivos', 'tipoSocietario']));
  });
});

describe('createPasantiaValidator', () => {
  const ok = { estudianteId: 1, tipo: 'PASANTIA' };

  it('acepta mínimo y completo', async () => {
    expect(await camposInvalidos(v.createPasantiaValidator, { body: ok })).toEqual([]);
    expect(
      await camposInvalidos(v.createPasantiaValidator, {
        body: {
          ...ok,
          empresaId: 2,
          carreraId: 3,
          gestionId: 4,
          docenteSupervisorId: 5,
          areaDepartamento: 'TI',
          cargoPuesto: 'Auxiliar',
          funciones: 'soporte',
          fechaInicio: '2026-02-01',
          fechaFinalizacion: '2026-05-01',
          horasRequeridas: HORAS_PASANTIA_MIN,
          horasCumplidas: 0,
          tipoContrato: TIPOS_CONTRATO_PASANTIA_VALUES[0],
          tipoContratoDetalle: 'detalle',
          responsableEmpresa: 'Juan',
          cargoResponsable: 'Gerente',
          telefonoResponsable: '2200000',
          observaciones: 'n/a',
        },
      }),
    ).toEqual([]);
  });

  it('exige estudianteId y tipo', async () => {
    expect(await camposInvalidos(v.createPasantiaValidator, { body: {} })).toEqual(expect.arrayContaining(['estudianteId', 'tipo']));
  });

  it('acepta null en los opcionales con nullable', async () => {
    expect(
      await camposInvalidos(v.createPasantiaValidator, {
        body: { ...ok, empresaId: null, carreraId: null, fechaInicio: null, horasRequeridas: null, observaciones: null },
      }),
    ).toEqual([]);
  });

  it.each([
    ['estudianteId', 0],
    ['estudianteId', 'uno'],
    ['tipo', 'OTRA'],
    ['empresaId', 0],
    ['carreraId', -1],
    ['gestionId', 'x'],
    ['docenteSupervisorId', 0],
    ['areaDepartamento', 'a'.repeat(151)],
    ['cargoPuesto', 'a'.repeat(151)],
    ['fechaInicio', '01/02/2026'],
    ['fechaFinalizacion', 'pronto'],
    ['horasRequeridas', HORAS_PASANTIA_MIN - 1],
    ['horasRequeridas', HORAS_PASANTIA_MAX + 1],
    ['horasCumplidas', -1],
    ['tipoContrato', 'SIN_CONTRATO'],
    ['tipoContratoDetalle', 'a'.repeat(151)],
    ['responsableEmpresa', 'a'.repeat(151)],
    ['cargoResponsable', 'a'.repeat(151)],
    ['telefonoResponsable', '9'.repeat(31)],
    ['funciones', 123],
    ['observaciones', { a: 1 }],
  ])('rechaza %s=%p', async (campo, valor) => {
    expect(await camposInvalidos(v.createPasantiaValidator, { body: { ...ok, [campo]: valor } })).toContain(campo);
  });

  it('acepta los límites de horas y de longitud', async () => {
    for (const h of [HORAS_PASANTIA_MIN, HORAS_PASANTIA_MAX]) {
      expect(await camposInvalidos(v.createPasantiaValidator, { body: { ...ok, horasRequeridas: h } })).toEqual([]);
    }
    expect(await camposInvalidos(v.createPasantiaValidator, { body: { ...ok, areaDepartamento: 'a'.repeat(150), telefonoResponsable: '9'.repeat(30) } })).toEqual([]);
  });

  it('payloads maliciosos en listas cerradas e ids', async () => {
    const campos = await camposInvalidos(v.createPasantiaValidator, {
      body: { estudianteId: SQLI, tipo: XSS, empresaId: { $gt: 0 }, tipoContrato: SQLI },
    });
    expect(campos).toEqual(expect.arrayContaining(['estudianteId', 'tipo', 'empresaId', 'tipoContrato']));
  });
});

describe('updatePasantiaValidator', () => {
  it('acepta body vacío (todo opcional) y parcial', async () => {
    expect(await camposInvalidos(v.updatePasantiaValidator, { body: {} })).toEqual([]);
    expect(await camposInvalidos(v.updatePasantiaValidator, { body: { horasCumplidas: 100, tipo: 'CONVALIDACION' } })).toEqual([]);
  });

  it.each([
    ['estudianteId', 0],
    ['tipo', 'X'],
    ['empresaId', 'a'],
    ['horasRequeridas', 10],
    ['horasRequeridas', 1000],
    ['horasCumplidas', -5],
    ['fechaInicio', 'mal'],
    ['telefonoResponsable', '1'.repeat(31)],
    ['tipoContrato', 'ZZZ'],
  ])('rechaza %s=%p', async (campo, valor) => {
    expect(await camposInvalidos(v.updatePasantiaValidator, { body: { [campo]: valor } })).toContain(campo);
  });
});

describe('transicionPasantiaValidator', () => {
  it.each(ESTADOS_PASANTIA_VALUES)('acepta estado %s', async (estado) => {
    expect(await camposInvalidos(v.transicionPasantiaValidator, { body: { estado, observaciones: 'ok' } })).toEqual([]);
  });
  it.each([[undefined], [''], ['CERRADA'], [XSS]])('rechaza estado %p', async (estado) => {
    expect(await camposInvalidos(v.transicionPasantiaValidator, { body: { estado } })).toContain('estado');
  });
  it('rechaza observaciones no textuales', async () => {
    expect(await camposInvalidos(v.transicionPasantiaValidator, { body: { estado: 'EN_CURSO', observaciones: 5 } })).toContain('observaciones');
  });
});

describe.each([
  ['createPasantiaEmpresaValidator', true],
  ['updatePasantiaEmpresaValidator', false],
])('%s', (nombre, exigeNombre) => {
  it('acepta datos válidos', async () => {
    expect(
      await camposInvalidos(v[nombre], {
        body: {
          nombre: 'Empresa SRL',
          nombreComercial: 'Comercial',
          tipoSocietario: TIPOS_SOCIETARIO_EMPRESA_VALUES[0],
          nit: '123456',
          enFuncionamiento: true,
          direccion: 'Calle 1',
          telefono: '2200000',
          sectorActividad: 'TI',
          observaciones: 'ok',
        },
      }),
    ).toEqual([]);
  });

  it(exigeNombre ? 'exige nombre' : 'nombre es opcional', async () => {
    const campos = await camposInvalidos(v[nombre], { body: {} });
    if (exigeNombre) expect(campos).toContain('nombre');
    else expect(campos).toEqual([]);
  });

  it.each([
    ['nombre', 'a'],
    ['nombre', 'a'.repeat(256)],
    ['nombreComercial', 'a'.repeat(201)],
    ['tipoSocietario', 'COOPERATIVA_X'],
    ['nit', '1'.repeat(31)],
    ['enFuncionamiento', 'tal vez'],
    ['direccion', 'a'.repeat(256)],
    ['telefono', '1'.repeat(31)],
    ['sectorActividad', 'a'.repeat(151)],
  ])('rechaza %s=%p', async (campo, valor) => {
    expect(await camposInvalidos(v[nombre], { body: { nombre: 'Valida', [campo]: valor } })).toContain(campo);
  });

  it('acepta límites de nombre (2 y 255)', async () => {
    for (const n of ['ab', 'a'.repeat(255)]) {
      expect(await camposInvalidos(v[nombre], { body: { nombre: n } })).toEqual([]);
    }
  });
});

describe('setEstadoPasantiaEmpresaValidator', () => {
  it.each([[true], [false], ['true'], ['0']])('acepta activo=%p', async (activo) => {
    expect(await camposInvalidos(v.setEstadoPasantiaEmpresaValidator, { body: { activo } })).toEqual([]);
  });
  it.each([[undefined], [null], ['quizá'], [{}]])('rechaza activo=%p', async (activo) => {
    expect(await camposInvalidos(v.setEstadoPasantiaEmpresaValidator, { body: { activo } })).toContain('activo');
  });
});

describe.each([
  ['createInformePasantiaValidator', true],
  ['updateInformePasantiaValidator', false],
])('%s', (nombre, exigeTipo) => {
  const tipo = TIPOS_INFORME_PASANTIA_VALUES[0];

  it('acepta datos válidos', async () => {
    expect(
      await camposInvalidos(v[nombre], {
        body: {
          tipo,
          docenteId: 2,
          numeroMemo: 'M-001',
          fechaVerificacion: '2026-03-01',
          fechaEmision: '2026-03-02',
          destinatario: 'Dirección',
          areaRelacionada: 'TI',
          evaluacionCualitativa: 'buena',
          resultado: RESULTADOS_INFORME_PASANTIA_VALUES[0],
          contenido: 'texto',
        },
      }),
    ).toEqual([]);
  });

  it(exigeTipo ? 'exige tipo' : 'tipo es opcional', async () => {
    const campos = await camposInvalidos(v[nombre], { body: {} });
    if (exigeTipo) expect(campos).toContain('tipo');
    else expect(campos).toEqual([]);
  });

  it.each([
    ['tipo', 'RARO'],
    ['docenteId', 0],
    ['numeroMemo', 'm'.repeat(51)],
    ['fechaVerificacion', 'nunca'],
    ['fechaEmision', '2026-13-45'],
    ['destinatario', 'd'.repeat(151)],
    ['areaRelacionada', 'a'.repeat(151)],
    ['resultado', 'TAL_VEZ'],
    ['evaluacionCualitativa', 99],
    ['contenido', ['x']],
  ])('rechaza %s=%p', async (campo, valor) => {
    expect(await camposInvalidos(v[nombre], { body: { tipo, [campo]: valor } })).toContain(campo);
  });
});

describe.each([
  ['createSeguimientoPasantiaValidator', true],
  ['updateSeguimientoPasantiaValidator', false],
])('%s', (nombre, exigeFecha) => {
  it('acepta datos válidos', async () => {
    expect(
      await camposInvalidos(v[nombre], {
        body: {
          fecha: '2026-04-01',
          descripcionTrabajo: 'a',
          principalesActividades: 'b',
          nivelDesempeno: NIVELES_DESEMPENO_PASANTIA_VALUES[0],
          fortalezas: 'c',
          areasMejorar: 'd',
          sugerencias: 'e',
          firmadoDocente: true,
          firmadoEmpresa: false,
        },
      }),
    ).toEqual([]);
  });

  it(exigeFecha ? 'exige fecha' : 'fecha es opcional', async () => {
    const campos = await camposInvalidos(v[nombre], { body: {} });
    if (exigeFecha) expect(campos).toContain('fecha');
    else expect(campos).toEqual([]);
  });

  it.each([
    ['fecha', '2026/04/01'],
    ['nivelDesempeno', 'EXCELENTE_PLUS'],
    ['firmadoDocente', 'tal vez'],
    ['firmadoEmpresa', 'x'],
    ['descripcionTrabajo', 10],
    ['fortalezas', {}],
  ])('rechaza %s=%p', async (campo, valor) => {
    expect(await camposInvalidos(v[nombre], { body: { fecha: '2026-04-01', [campo]: valor } })).toContain(campo);
  });
});
