import { describe, it, expect, jest } from '@jest/globals';
import { UpdateStudentController } from '../../../../src/presentation/controllers/estudiantes/estudiantes/update.controller.js';
import { RegisterStudentController } from '../../../../src/presentation/controllers/estudiantes/estudiantes/register.controller.js';
import { ListStudentScholarshipsController } from '../../../../src/presentation/controllers/estudiantes/becas/list-student-scholarships.controller.js';
import { ForbiddenError } from '../../../../src/domain/errors/AppError.js';
import { buildReq, buildRes } from '../_helpers/controllerHarness.js';

const logger = () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() });
const formatter = () => ({
  updated: jest.fn((res) => res),
  created: jest.fn((res) => res),
  list: jest.fn((res) => res),
  success: jest.fn((res) => res),
  paginated: jest.fn((res) => res),
});

describe('UpdateStudentController', () => {
  const build = (execute = jest.fn().mockResolvedValue({ student: { id: 9 } })) => {
    const fmt = formatter();
    const ctrl = new UpdateStudentController({
      updateStudentUseCase: { execute },
      logger: logger(),
      responseFormatter: fmt,
    });
    return { ctrl, fmt, execute };
  };

  it('exige dependencias', () => {
    expect(() => new UpdateStudentController({ logger: logger(), responseFormatter: {} })).toThrow(/updateStudentUseCase/);
    expect(() => new UpdateStudentController({ updateStudentUseCase: {}, responseFormatter: {} })).toThrow(/logger/);
    expect(() => new UpdateStudentController({ updateStudentUseCase: {}, logger: logger() })).toThrow(/responseFormatter/);
  });

  it('prepareData traduce campos planos al dominio', () => {
    const { ctrl } = build();
    const out = ctrl.prepareData({
      ci: '123',
      expedicionId: 2,
      generoId: 1,
      nombres: 'Ana',
      apellidoPaterno: 'Paz',
      apellidoMaterno: 'Rios',
      fechaNacimiento: '2000-01-01',
      estadoCivilId: 3,
      tipoSangre: 'O+',
      tieneDiscapacidad: false,
      emailPersonal: 'a@b.c',
      celular: '7',
      telefonoFijo: '2',
      direccion: 'calle',
      municipioResidenciaId: 4,
      zona: 'z',
      observaciones: 'o',
      trabaja: true,
      empresaInstitucion: 'E',
      cargo: 'C',
    });
    expect(out.student).toMatchObject({
      ci: '123',
      expedition: 2,
      gender: 1,
      firstName: 'Ana',
      lastName: 'Paz',
      motherLastName: 'Rios',
      birthDate: '2000-01-01',
      civilStatusId: 3,
      bloodType: 'O+',
      hasDisability: false,
      personalEmail: 'a@b.c',
      mobilePhone: '7',
      landlinePhone: '2',
      address: 'calle',
      residenceMunicipalityId: 4,
      zone: 'z',
      observations: 'o',
      works: true,
      employerInstitution: 'E',
      position: 'C',
    });
    expect(out.student.nombres).toBeUndefined();
  });

  it('prepareData: datos académicos, normaliza vacíos a null', () => {
    const { ctrl } = build();
    expect(ctrl.prepareData({ tipoAdmision: 'REGULAR', gestionIngresoId: '', carreraId: null })).toEqual({
      tipoAdmision: 'REGULAR',
      gestionIngresoId: null,
      carreraId: null,
    });
    expect(ctrl.prepareData({ gestionIngresoId: 5, carreraId: 6 })).toEqual({ gestionIngresoId: 5, carreraId: 6 });
  });

  it('prepareData: transitabilidad y traspaso', () => {
    const { ctrl } = build();
    const t = ctrl.prepareData({
      tipoAdmision: 'TRANSITABILIDAD',
      transitabilidad_departamento_id: '3',
      transitabilidad_institucion_nombre: 'UE',
    });
    expect(t.transitability).toMatchObject({ institucionNombre: 'UE', departamentoId: 3, estado: 'SOLICITADO' });
    const t2 = ctrl.prepareData({ tipoAdmision: 'TRANSITABILIDAD' });
    expect(t2.transitability.departamentoId).toBeNull();

    const tr = ctrl.prepareData({
      tipoAdmision: 'TRASPASO',
      traspaso_departamento_id: '2',
      traspaso_estado: 'APROBADO',
    });
    expect(tr.transfer).toMatchObject({ departamentoId: 2, estado: 'APROBADO' });
    expect(ctrl.prepareData({ tipoAdmision: 'TRASPASO' }).transfer.departamentoId).toBeNull();
  });

  it('prepareData: discapacidades por campos planos o directas', () => {
    const { ctrl } = build();
    expect(
      ctrl.prepareData({ tieneDiscapacidad: true, tipoDiscapacidadId: 2, gradoDiscapacidad: 'LEVE', descripcion: 'd' }).disabilities,
    ).toEqual([{ disabilityTypeId: 2, description: 'd', disabilityDegree: 'LEVE', cause: null }]);
    expect(ctrl.prepareData({ disabilities: [{ a: 1 }] }).disabilities).toEqual([{ a: 1 }]);
  });

  it('prepareData: orígenes (boliviana, extranjera, doble) y directos', () => {
    const { ctrl } = build();
    const bol = ctrl.prepareData({ tipoOrigen: 0, municipioId: 4, localidadComunidad: 'L' }).origins;
    expect(bol).toEqual([
      expect.objectContaining({ originType: 'BOLIVIANA', birthMunicipalityId: 4, birthCity: 'L', countryId: null, isPrincipal: true }),
    ]);
    const ext = ctrl.prepareData({ tipoOrigen: '1', paisId: 9, ciudadNacimiento: 'Lima' }).origins;
    expect(ext[0]).toMatchObject({ originType: 'EXTRANJERA', countryId: 9, birthCity: 'Lima' });
    const doble = ctrl.prepareData({
      tipoOrigen: 2,
      primeraNacionalidad: 'BOLIVIANA',
      municipioId: 1,
      segundaPaisId: 8,
      segundaCiudadNacimiento: 'Quito',
    }).origins;
    expect(doble).toHaveLength(2);
    expect(doble[0]).toMatchObject({ originType: 'BOLIVIANA', isPrincipal: true });
    expect(doble[1]).toMatchObject({ originType: 'EXTRANJERA', countryId: 8, birthCity: 'Quito', isPrincipal: false });
    const dobleExt = ctrl.prepareData({ tipoOrigen: 'DOBLE_NACIONALIDAD', primeraNacionalidad: 'EXTRANJERA', paisId: 3 }).origins;
    expect(dobleExt[0].originType).toBe('EXTRANJERA');
    expect(dobleExt[1].originType).toBe('BOLIVIANA');
    expect(ctrl.prepareData({ origins: [{ x: 1 }] }).origins).toEqual([{ x: 1 }]);
  });

  it('prepareData: contactos de emergencia, guardians y documentación', () => {
    const { ctrl } = build();
    const g = ctrl.prepareData({
      contactosEmergencia: [
        { id: '4', tipoParentescoId: 1, nombres: 'N', apellidos: 'A', celular1: '1', celular2: '2', viveConEstudiante: true },
        { id: 5, nombres: 'M' },
        { nombres: 'sin id', id: '' },
      ],
    }).guardians;
    expect(g[0]).toMatchObject({ id: 4, relationshipTypeId: 1, livesWithStudent: true });
    expect(g[1].id).toBe(5);
    expect(g[2].id).toBeUndefined();
    expect(g[2].livesWithStudent).toBe(false);
    expect(ctrl.prepareData({ contactosEmergencia: 'no-array' }).guardians).toEqual([]);
    expect(ctrl.prepareData({ guardians: [{ z: 1 }] }).guardians).toEqual([{ z: 1 }]);

    const d = ctrl.prepareData({
      documentacion: { doc_1: { entregado: true, en_tramite: true, fechaEntrega: '2024-01-01' }, doc_2: {} },
    }).documentation;
    expect(d.doc_1).toEqual({ entregado: true, enTramite: true, fechaEntrega: '2024-01-01', observaciones: null });
    expect(d.doc_2).toEqual({ entregado: false, enTramite: false, fechaEntrega: null, observaciones: null });
    expect(ctrl.prepareData({ documentation: null }).documentation).toBeUndefined();
  });

  it('camino feliz: ejecuta el caso de uso con el id y responde updated', async () => {
    const { ctrl, fmt, execute } = build();
    const res = buildRes();
    const next = jest.fn();
    await ctrl.handle(buildReq({ method: 'PUT', body: { nombres: 'Ana' } }), res, next);
    expect(execute).toHaveBeenCalledWith(5, { student: { firstName: 'Ana' } });
    expect(fmt.updated).toHaveBeenCalledWith(res, { student: { id: 9 } }, 'estudiante', 9, expect.anything());
    expect(next).not.toHaveBeenCalled();
  });

  it('usa el id de la ruta si el resultado no trae student', async () => {
    const { ctrl, fmt } = build(jest.fn().mockResolvedValue({}));
    await ctrl.handle(buildReq({ body: { ci: '1' } }), buildRes(), jest.fn());
    expect(fmt.updated).toHaveBeenCalledWith(expect.anything(), {}, 'estudiante', 5, expect.anything());
  });

  it('validación: body vacío responde 400 y no llama al caso de uso', async () => {
    const { ctrl, execute } = build();
    const res = buildRes();
    await ctrl.handle(buildReq({ body: {} }), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, error: expect.objectContaining({ code: 'VALIDATION_ERROR' }) }),
    );
    expect(execute).not.toHaveBeenCalled();
  });

  it('error de dominio: next(error)', async () => {
    const err = new Error('no existe');
    const { ctrl } = build(jest.fn().mockRejectedValue(err));
    const next = jest.fn();
    await ctrl.handle(buildReq({ body: { ci: '1' } }), buildRes(), next);
    expect(next).toHaveBeenCalledWith(err);
  });

  it('sanitizeBodyForLogging oculta datos personales', () => {
    const { ctrl } = build();
    const out = ctrl.sanitizeBodyForLogging({ ci: '1', emailPersonal: 'a', celular: '2', telefonoFijo: '3', direccion: 'd', nombres: 'x' });
    expect(out).toEqual({ ci: '***', emailPersonal: '***', celular: '***', telefonoFijo: '***', direccion: '***', nombres: 'x' });
  });
});

describe('RegisterStudentController', () => {
  const ctrl = new RegisterStudentController({
    registerStudentUseCase: { execute: jest.fn() },
    logger: logger(),
    responseFormatter: formatter(),
  });

  it('sanitizeBodyForLogging oculta PII propia y de contactos', () => {
    const out = ctrl.sanitizeBodyForLogging({
      ci: '1',
      emailPersonal: 'a@b.c',
      celular: '2',
      telefonoFijo: '3',
      direccion: 'd',
      nombres: 'visible',
      contactosEmergencia: [{ celular1: '7', celular2: '8', nombres: 'c' }],
    });
    expect(out).toMatchObject({ ci: '***', emailPersonal: '***', celular: '***', telefonoFijo: '***', direccion: '***', nombres: 'visible' });
    expect(out.contactosEmergencia[0]).toEqual({ celular1: '***', celular2: '***', nombres: 'c' });
  });

  it('no muta el body original', () => {
    const body = { ci: '1' };
    ctrl.sanitizeBodyForLogging(body);
    expect(body.ci).toBe('1');
  });
});

describe('ListStudentScholarshipsController', () => {
  const build = (repos = {}) => {
    const useCase = { execute: jest.fn().mockResolvedValue({ becas: [], pagination: {} }) };
    const fmt = formatter();
    const ctrl = new ListStudentScholarshipsController({
      listStudentScholarshipsUseCase: useCase,
      studentRepository: repos.studentRepository,
      userRepository: repos.userRepository,
      logger: logger(),
      responseFormatter: fmt,
    });
    return { ctrl, useCase };
  };

  it('buildFilters convierte ids numéricos y conserva el estado', () => {
    const { ctrl } = build();
    expect(
      ctrl.buildFilters({ studentId: '3', managementId: '4', scholarshipId: '5', state: 'ACTIVA' }, { search: 'x' }),
    ).toEqual({ search: 'x', studentId: 3, managementId: 4, scholarshipId: 5, state: 'ACTIVA' });
    expect(ctrl.buildFilters({})).toEqual({});
  });

  it('rol distinto de ESTUDIANTE: respeta el studentId de la query', async () => {
    const { ctrl, useCase } = build();
    const req = buildReq({ query: { studentId: '99' }, usuario: { id: 1, rolCodigo: 'ADMIN' } });
    await ctrl.handle(req, buildRes(), jest.fn());
    expect(useCase.execute.mock.calls[0][3]).toMatchObject({ studentId: '99' });
  });

  it('ESTUDIANTE: sobrescribe el studentId de la query con el propio (anti-IDOR)', async () => {
    const studentRepository = { findAll: jest.fn().mockResolvedValue([{ id: 42 }]) };
    const { ctrl, useCase } = build({ studentRepository, userRepository: {} });
    const req = buildReq({ query: { studentId: '99' }, usuario: { id: 8, rolCodigo: 'ESTUDIANTE' } });
    await ctrl.handle(req, buildRes(), jest.fn());
    expect(studentRepository.findAll).toHaveBeenCalledWith({ userId: 8 });
    expect(useCase.execute.mock.calls[0][3]).toMatchObject({ studentId: '42' });
  });

  it('ESTUDIANTE sin vínculo: next(ForbiddenError) y no consulta el listado', async () => {
    const studentRepository = { findAll: jest.fn().mockResolvedValue([]) };
    const userRepository = { findById: jest.fn().mockResolvedValue({ referenceType: 'DOCENTE', referenceId: 1 }) };
    const { ctrl, useCase } = build({ studentRepository, userRepository });
    const next = jest.fn();
    await ctrl.handle(buildReq({ usuario: { id: 8, rolCodigo: 'ESTUDIANTE' } }), buildRes(), next);
    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
    expect(useCase.execute).not.toHaveBeenCalled();
  });
});
