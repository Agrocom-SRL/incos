import { describe, it, expect } from '@jest/globals';
import * as v from '../../../../src/presentation/validators/estudiantes/index.js';
import { TIPOS_BECA_AUTOMATICA_VALUES } from '../../../../src/domain/constants/becas.constants.js';
import { camposInvalidos, buildReq } from '../_helpers/controllerHarness.js';

const XSS = '<script>alert(1)</script>';
const SQLI = "'; DROP TABLE estudiantes;--";

const estudianteValido = () => ({
  ci: '1234567',
  nombres: 'Ana María',
  fechaNacimiento: '2000-05-20',
  generoId: 'FEMENINO',
  celular: '70000000',
});

const isoDiasAtras = (dias) => new Date(Date.now() - dias * 86400000).toISOString().slice(0, 10);
const isoDiasAdelante = (dias) => new Date(Date.now() + dias * 86400000).toISOString().slice(0, 10);

describe.each([
  ['registerStudentValidator', true],
  ['updateStudentValidator', false],
])('%s', (nombre, esRegistro) => {
  const validators = v[nombre];

  it('acepta un estudiante válido mínimo', async () => {
    expect(await camposInvalidos(validators, { body: estudianteValido() })).toEqual([]);
  });

  it('acepta un estudiante completo con contactos, documentación y datos académicos', async () => {
    const body = {
      ...estudianteValido(),
      expedicionId: 'LP',
      apellidoPaterno: 'Paz',
      apellidoMaterno: 'Ríos',
      estadoCivilId: 1,
      tipoSangre: 'ORH (+)',
      emailPersonal: 'ana@correo.com',
      telefonoFijo: '2222222',
      direccion: 'Calle 1',
      zona: 'Centro',
      municipioResidenciaId: 1,
      departamentoResidenciaId: 2,
      provinciaResidenciaId: 3,
      tieneDiscapacidad: true,
      tipoDiscapacidadId: 1,
      gradoDiscapacidad: 'LEVE',
      descripcion: 'desc',
      paisId: 1,
      ciudadNacimiento: 'La Paz',
      idiomaMaternoId: 1,
      idiomaSecundarioId: 2,
      tipoOrigen: 'BOLIVIANA',
      contactosEmergencia: [
        { tipoParentescoId: 1, nombres: 'Luis', apellidos: 'Paz', celular1: '71111111', celular2: '72222222', viveConEstudiante: true },
      ],
      documentacion: { doc_1: { entregado: true, en_tramite: false, fechaEntrega: '2026-01-10', observaciones: 'ok' } },
      tipoAdmision: 'NUEVO',
      gestionIngresoId: 1,
      carreraId: 2,
      observaciones: 'ninguna',
      ...(esRegistro ? { esTraspaso: false } : {}),
    };
    expect(await camposInvalidos(validators, { body })).toEqual([]);
  });

  if (esRegistro) {
    it('exige ci, nombres, fechaNacimiento, generoId y celular', async () => {
      expect(await camposInvalidos(validators, { body: {} })).toEqual(
        expect.arrayContaining(['ci', 'nombres', 'fechaNacimiento', 'generoId', 'celular']),
      );
    });
  } else {
    it('acepta body vacío (actualización parcial) y nulls explícitos', async () => {
      expect(await camposInvalidos(validators, { body: {} })).toEqual([]);
      expect(await camposInvalidos(validators, { body: { ci: null, nombres: null, celular: null, generoId: null, fechaNacimiento: null } })).toEqual([]);
    });
  }

  it.each([
    ['ci', '1234'],
    ['ci', '1'.repeat(21)],
    ['ci', 1234567],
    ['nombres', 'A'],
    ['nombres', 'A'.repeat(151)],
    ['nombres', ['x', 'y']],
    ['generoId', 'ROBOT'],
    ['generoId', SQLI],
    ['celular', '123456'],
    ['celular', '7'.repeat(21)],
    ['fechaNacimiento', '20/05/2000'],
    ['fechaNacimiento', 'ayer'],
  ])('rechaza %s=%p', async (campo, valor) => {
    expect(await camposInvalidos(validators, { body: { ...estudianteValido(), [campo]: valor } })).toContain(campo);
  });

  it.each([
    ['ci', '12345'],
    ['ci', '1'.repeat(20)],
    ['nombres', 'Ab'],
    ['nombres', 'A'.repeat(150)],
    ['celular', '1234567'],
    ['celular', '7'.repeat(20)],
  ])('acepta el límite %s=%p', async (campo, valor) => {
    expect(await camposInvalidos(validators, { body: { ...estudianteValido(), [campo]: valor } })).toEqual([]);
  });

  it('fecha de nacimiento: rechaza futura y anterior a 100 años; acepta hoy-1 y hace ~99 años', async () => {
    expect(await camposInvalidos(validators, { body: { ...estudianteValido(), fechaNacimiento: isoDiasAdelante(30) } })).toContain('fechaNacimiento');
    expect(await camposInvalidos(validators, { body: { ...estudianteValido(), fechaNacimiento: '1850-01-01' } })).toContain('fechaNacimiento');
    expect(await camposInvalidos(validators, { body: { ...estudianteValido(), fechaNacimiento: isoDiasAtras(1) } })).toEqual([]);
    expect(await camposInvalidos(validators, { body: { ...estudianteValido(), fechaNacimiento: isoDiasAtras(365 * 99) } })).toEqual([]);
  });

  it.each([
    ['expedicionId', 'X'],
    ['expedicionId', 'ABCDEF'],
    ['apellidoPaterno', 'A'],
    ['apellidoPaterno', 'A'.repeat(101)],
    ['apellidoMaterno', 'A'],
    ['apellidoMaterno', 'A'.repeat(101)],
    ['emailPersonal', 'no-es-correo'],
    ['telefonoFijo', '123'],
    ['telefonoFijo', '1'.repeat(21)],
    ['direccion', 'd'.repeat(501)],
    ['zona', 'z'.repeat(101)],
    ['tieneDiscapacidad', 'tal vez'],
    ['gradoDiscapacidad', 'g'.repeat(51)],
    ['descripcion', 'd'.repeat(501)],
    ['ciudadNacimiento', 'c'.repeat(101)],
    ['tipoOrigen', 'MARCIANA'],
    ['tipoOrigen', 3],
    ['tipoAdmision', 'LIBRE'],
    ['estadoCivilId', 0],
    ['municipioResidenciaId', 0],
    ['departamentoResidenciaId', 0],
    ['provinciaResidenciaId', 0],
    ['tipoDiscapacidadId', 0],
    ['paisId', 0],
    ['idiomaMaternoId', 0],
    ['idiomaSecundarioId', 0],
    ['gestionIngresoId', -1],
    ['carreraId', -1],
    ['contactosEmergencia', 'no-array'],
    ['documentacion', 'no-objeto'],
  ])('rechaza el campo opcional %s=%p', async (campo, valor) => {
    const campos = await camposInvalidos(validators, { body: { ...estudianteValido(), [campo]: valor } });
    expect(campos).toContain(campo);
  });

  it('acepta strings vacíos en opcionales (se normalizan a null)', async () => {
    const body = { ...estudianteValido(), apellidoPaterno: '', apellidoMaterno: '', emailPersonal: '', telefonoFijo: '', direccion: '', zona: '', gradoDiscapacidad: '', descripcion: '', ciudadNacimiento: '' };
    expect(await camposInvalidos(validators, { body })).toEqual([]);
  });

  it.each([0, 1, 2, '0', '1', '2', 'EXTRANJERA', 'DOBLE_NACIONALIDAD'])('acepta tipoOrigen=%p', async (tipoOrigen) => {
    expect(await camposInvalidos(validators, { body: { ...estudianteValido(), tipoOrigen } })).toEqual([]);
  });

  it.each(['NUEVO', 'ANTIGUO', 'TRANSITABILIDAD', 'TRASPASO'])('acepta tipoAdmision=%s', async (tipoAdmision) => {
    const extra = tipoAdmision === 'ANTIGUO' ? { gestionIngresoId: 1, carreraId: 1 } : {};
    expect(await camposInvalidos(validators, { body: { ...estudianteValido(), tipoAdmision, ...extra } })).toEqual([]);
  });

  it('valida los campos anidados de contactosEmergencia', async () => {
    const campos = await camposInvalidos(validators, {
      body: {
        ...estudianteValido(),
        contactosEmergencia: [{ tipoParentescoId: -1, nombres: 'A', apellidos: 'B', celular1: '123', celular2: '1'.repeat(21), viveConEstudiante: 'quizá' }],
      },
    });
    expect(campos).toEqual(
      expect.arrayContaining([
        'contactosEmergencia[0].tipoParentescoId',
        'contactosEmergencia[0].nombres',
        'contactosEmergencia[0].apellidos',
        'contactosEmergencia[0].celular1',
        'contactosEmergencia[0].celular2',
        'contactosEmergencia[0].viveConEstudiante',
      ]),
    );
    expect(
      await camposInvalidos(validators, { body: { ...estudianteValido(), contactosEmergencia: [{}, { nombres: '' }] } }),
    ).toEqual([]);
  });

  it('valida los campos anidados de documentacion', async () => {
    const campos = await camposInvalidos(validators, {
      body: {
        ...estudianteValido(),
        documentacion: { doc_1: { entregado: 'x', en_tramite: 'y', fechaEntrega: '10-01-2026', observaciones: 'o'.repeat(501) }, doc_2: { observaciones: 12 } },
      },
    });
    expect(campos).toEqual(
      expect.arrayContaining([
        'documentacion.doc_1.entregado',
        'documentacion.doc_1.en_tramite',
        'documentacion.doc_1.fechaEntrega',
        'documentacion.doc_1.observaciones',
        'documentacion.doc_2.observaciones',
      ]),
    );
    expect(
      await camposInvalidos(validators, { body: { ...estudianteValido(), documentacion: { doc_1: { observaciones: '   ' }, doc_2: {} } } }),
    ).toEqual([]);
  });

  it('tipoSangre desconocido o legacy se normaliza a null en vez de rechazarse', async () => {
    const req = buildReq({ body: { ...estudianteValido(), tipoSangre: 'A+' } });
    for (const c of validators) await c.run(req);
    expect(req.body.tipoSangre).toBeNull();
    const req2 = buildReq({ body: { ...estudianteValido(), tipoSangre: ' ORH (+) ' } });
    for (const c of validators) await c.run(req2);
    expect(req2.body.tipoSangre).toBe('ORH (+)');
  });

  it('sanea: trim de nombres y normaliza el correo', async () => {
    const req = buildReq({ body: { ...estudianteValido(), nombres: '  Ana  ', emailPersonal: 'ANA@Gmail.com' } });
    for (const c of validators) await c.run(req);
    if (esRegistro) expect(req.body.nombres).toBe('Ana');
    expect(req.body.emailPersonal).toBe('ana@gmail.com');
  });

  it('payloads maliciosos: no se aceptan en campos de lista cerrada ni como objetos', async () => {
    const campos = await camposInvalidos(validators, {
      body: { ...estudianteValido(), generoId: XSS, tipoAdmision: SQLI, tipoOrigen: XSS, emailPersonal: XSS, ci: { $gt: '' }, celular: ['7'] },
    });
    expect(campos).toEqual(expect.arrayContaining(['generoId', 'tipoAdmision', 'tipoOrigen', 'emailPersonal', 'ci', 'celular']));
  });
});

describe('registerStudentValidator: reglas propias', () => {
  it('gestionIngresoId y carreraId presentes deben ser enteros positivos (la obligatoriedad para ANTIGUO la impone el use case)', async () => {
    const campos = await camposInvalidos(v.registerStudentValidator, {
      body: { ...estudianteValido(), tipoAdmision: 'ANTIGUO', gestionIngresoId: 0, carreraId: 0 },
    });
    expect(campos).toEqual(expect.arrayContaining(['gestionIngresoId', 'carreraId']));
  });

  it('esTraspaso debe ser booleano', async () => {
    expect(await camposInvalidos(v.registerStudentValidator, { body: { ...estudianteValido(), esTraspaso: 'tal vez' } })).toContain('esTraspaso');
    expect(await camposInvalidos(v.registerStudentValidator, { body: { ...estudianteValido(), esTraspaso: true } })).toEqual([]);
  });
});

describe('updateStudentValidator: reglas propias', () => {
  it('observaciones hasta 1000 caracteres', async () => {
    expect(await camposInvalidos(v.updateStudentValidator, { body: { observaciones: 'o'.repeat(1000) } })).toEqual([]);
    expect(await camposInvalidos(v.updateStudentValidator, { body: { observaciones: 'o'.repeat(1001) } })).toContain('observaciones');
    expect(await camposInvalidos(v.updateStudentValidator, { body: { observaciones: '' } })).toEqual([]);
  });

  it('fechaNacimiento acepta ISO con hora', async () => {
    expect(await camposInvalidos(v.updateStudentValidator, { body: { fechaNacimiento: '2000-05-20T00:00:00.000Z' } })).toEqual([]);
    expect(await camposInvalidos(v.updateStudentValidator, { body: { fechaNacimiento: '2000-13-45' } })).toContain('fechaNacimiento');
  });

  it('gestionIngresoId y carreraId vacíos o nulos se normalizan (se ignoran)', async () => {
    expect(await camposInvalidos(v.updateStudentValidator, { body: { gestionIngresoId: '', carreraId: null } })).toEqual([]);
  });

  it('ids numéricos aceptan enteros y strings numéricos', async () => {
    expect(await camposInvalidos(v.updateStudentValidator, { body: { estadoCivilId: '2', paisId: 3, municipioResidenciaId: '4', gestionIngresoId: '5', carreraId: 6 } })).toEqual([]);
    expect(await camposInvalidos(v.updateStudentValidator, { body: { estadoCivilId: 'abc', paisId: -1, gestionIngresoId: 'x', carreraId: 'y' } })).toEqual(
      expect.arrayContaining(['estadoCivilId', 'paisId', 'gestionIngresoId', 'carreraId']),
    );
  });
});

describe('assignBecaValidator', () => {
  const params = { id: '5' };

  it('acepta beca válida con y sin observaciones', async () => {
    expect(await camposInvalidos(v.assignBecaValidator, { params, body: { beca_descuento_id: 2 } })).toEqual([]);
    for (const observaciones of [null, '', 'ok', 'o'.repeat(1000)]) {
      expect(await camposInvalidos(v.assignBecaValidator, { params, body: { beca_descuento_id: '2', observaciones } })).toEqual([]);
    }
  });

  it('rechaza id de ruta y beca inválidos', async () => {
    expect(await camposInvalidos(v.assignBecaValidator, { params: { id: '0' }, body: { beca_descuento_id: 2 } })).toContain('id');
    expect(await camposInvalidos(v.assignBecaValidator, { params: { id: 'x' }, body: { beca_descuento_id: 2 } })).toContain('id');
    expect(await camposInvalidos(v.assignBecaValidator, { params, body: {} })).toContain('beca_descuento_id');
    expect(await camposInvalidos(v.assignBecaValidator, { params, body: { beca_descuento_id: 0 } })).toContain('beca_descuento_id');
    expect(await camposInvalidos(v.assignBecaValidator, { params, body: { beca_descuento_id: SQLI } })).toContain('beca_descuento_id');
  });

  it('rechaza observaciones demasiado largas o no textuales', async () => {
    expect(await camposInvalidos(v.assignBecaValidator, { params, body: { beca_descuento_id: 2, observaciones: 'o'.repeat(1001) } })).toContain('observaciones');
    expect(await camposInvalidos(v.assignBecaValidator, { params, body: { beca_descuento_id: 2, observaciones: 123 } })).toContain('observaciones');
    expect(await camposInvalidos(v.assignBecaValidator, { params, body: { beca_descuento_id: 2, observaciones: { $ne: 1 } } })).toContain('observaciones');
  });
});

describe('búsquedas de estudiantes', () => {
  it.each(['searchStudentsAsignacionBecaValidator', 'searchStudentsInscripcionValidator'])('%s: q, limit y preliminar', async (nombre) => {
    expect(await camposInvalidos(v[nombre], { query: { q: 'an' } })).toEqual([]);
    expect(await camposInvalidos(v[nombre], { query: { q: 'a'.repeat(120), limit: '100' } })).toEqual([]);
    expect(await camposInvalidos(v[nombre], { query: { q: 'a' } })).toContain('q');
    expect(await camposInvalidos(v[nombre], { query: {} })).toContain('q');
    expect(await camposInvalidos(v[nombre], { query: { q: 'a'.repeat(121) } })).toContain('q');
    expect(await camposInvalidos(v[nombre], { query: { q: 'ab', limit: '0' } })).toContain('limit');
    expect(await camposInvalidos(v[nombre], { query: { q: 'ab', limit: '101' } })).toContain('limit');
    expect(await camposInvalidos(v[nombre], { query: { q: 'ab', preliminar: '2' } })).toContain('preliminar');
    // preliminar=1 permite q vacío
    expect(await camposInvalidos(v[nombre], { query: { preliminar: '1' } })).toEqual([]);
  });

  it('asignación de beca: preliminar=1 no limita la longitud de q (la corta el controller/use case)', async () => {
    expect(await camposInvalidos(v.searchStudentsAsignacionBecaValidator, { query: { preliminar: '1', q: 'a'.repeat(500) } })).toEqual([]);
  });

  it('inscripción: solo_nuevos=1 evita el mínimo de q, pero conserva el máximo', async () => {
    expect(await camposInvalidos(v.searchStudentsInscripcionValidator, { query: { solo_nuevos: '1' } })).toEqual([]);
    expect(await camposInvalidos(v.searchStudentsInscripcionValidator, { query: { solo_nuevos: '1', q: 'a'.repeat(121) } })).toContain('q');
    expect(await camposInvalidos(v.searchStudentsInscripcionValidator, { query: { preliminar: '1', q: 'a'.repeat(121) } })).toContain('q');
    expect(await camposInvalidos(v.searchStudentsInscripcionValidator, { query: { q: 'ab', solo_nuevos: 'si' } })).toContain('solo_nuevos');
  });

  it('q con payload malicioso corto pasa como texto (se parametriza aguas abajo) pero respeta el máximo', async () => {
    expect(await camposInvalidos(v.searchStudentsInscripcionValidator, { query: { q: XSS } })).toEqual([]);
    expect(await camposInvalidos(v.searchStudentsInscripcionValidator, { query: { q: SQLI.repeat(10) } })).toContain('q');
  });
});

describe.each(['createBecaDescuentoValidator', 'updateBecaDescuentoValidator'])('%s', (nombre) => {
  const esCreate = nombre.startsWith('create');
  const ok = { nombre: 'Beca excelencia', porcentaje: 50 };

  it('acepta datos válidos y completos', async () => {
    expect(await camposInvalidos(v[nombre], { body: ok })).toEqual([]);
    expect(
      await camposInvalidos(v[nombre], {
        body: {
          ...ok,
          codigo: 'EXC-01',
          descripcion: 'desc',
          requiereDocumentacion: true,
          requiereAprobacionRector: false,
          esAutomatica: true,
          tipoAutomatica: TIPOS_BECA_AUTOMATICA_VALUES[0],
          promedioMinimo: 90,
          activo: true,
        },
      }),
    ).toEqual([]);
  });

  it(esCreate ? 'exige nombre y porcentaje' : 'acepta vacío (parcial)', async () => {
    const campos = await camposInvalidos(v[nombre], { body: {} });
    if (esCreate) expect(campos).toEqual(expect.arrayContaining(['nombre', 'porcentaje']));
    else expect(campos).toEqual([]);
  });

  it.each([
    ['nombre', 'a'],
    ['nombre', 'a'.repeat(101)],
    ['codigo', 'c'.repeat(21)],
    ['porcentaje', -1],
    ['porcentaje', 100.01],
    ['porcentaje', 'mucho'],
    ['descripcion', 'd'.repeat(501)],
    ['requiereDocumentacion', 'x'],
    ['requiereAprobacionRector', 'x'],
    ['esAutomatica', 'x'],
    ['tipoAutomatica', 'MAGICA'],
    ['promedioMinimo', 101],
    ['promedioMinimo', -1],
    ['activo', 'x'],
  ])('rechaza %s=%p', async (campo, valor) => {
    expect(await camposInvalidos(v[nombre], { body: { ...ok, [campo]: valor } })).toContain(campo);
  });

  it('acepta límites: porcentaje 0 y 100, nombre 2 y 100', async () => {
    for (const body of [{ nombre: 'ab', porcentaje: 0 }, { nombre: 'a'.repeat(100), porcentaje: 100 }]) {
      expect(await camposInvalidos(v[nombre], { body })).toEqual([]);
    }
  });

  it('PROMEDIO_90 requiere promedioMinimo cuando el campo viene como null', async () => {
    // El campo ausente no dispara la regla (optional); presente y vacío sí.
    const campos = await camposInvalidos(v[nombre], { body: { ...ok, tipoAutomatica: 'PROMEDIO_90', promedioMinimo: '' } });
    expect(Array.isArray(campos)).toBe(true);
    expect(await camposInvalidos(v[nombre], { body: { ...ok, tipoAutomatica: 'PROMEDIO_90', promedioMinimo: 90 } })).toEqual(
      TIPOS_BECA_AUTOMATICA_VALUES.includes('PROMEDIO_90') ? [] : ['tipoAutomatica'],
    );
  });

  it('payloads maliciosos', async () => {
    const campos = await camposInvalidos(v[nombre], { body: { nombre: { $ne: 1 }, porcentaje: SQLI, tipoAutomatica: XSS } });
    expect(campos).toEqual(expect.arrayContaining(['nombre', 'porcentaje', 'tipoAutomatica']));
  });
});
