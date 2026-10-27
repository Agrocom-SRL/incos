import { jest } from '@jest/globals';
import { UpdateStudentUseCase } from '../../../src/application/use-cases/estudiantes/UpdateStudentUseCase.js';
import { ConflictError, NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('UpdateStudentUseCase', () => {
  const repoVacio = () => ({
    findAll: jest.fn().mockResolvedValue({}),
    create: jest.fn(async (d) => ({ id: 100, ...d })),
    update: jest.fn(async (id, d) => ({ id, ...d })),
    delete: jest.fn().mockResolvedValue(true),
  });

  const crear = (extra = {}) => {
    const deps = {
      studentRepository: {
        findById: jest.fn().mockResolvedValue({ id: 5, ci: '111', expedition: 'LP', studentCode: '20260001' }),
        findAll: jest.fn().mockResolvedValue({ students: [] }),
        update: jest.fn(async (id, d) => ({ id, ci: '111', ...d })),
      },
      studentGuardianRepository: repoVacio(),
      studentDisabilityRepository: repoVacio(),
      studentOriginRepository: repoVacio(),
      studentDocumentDeliveryRepository: repoVacio(),
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
      ...extra,
    };
    return { deps, useCase: new UpdateStudentUseCase(deps) };
  };

  it('lanza NotFoundError si el estudiante no existe y no modifica nada', async () => {
    const { useCase, deps } = crear();
    deps.studentRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(99, { student: { firstName: 'X' } })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.studentRepository.update).not.toHaveBeenCalled();
  });

  it('actualiza los datos básicos y devuelve las relaciones existentes sin tocarlas', async () => {
    const { useCase, deps } = crear();
    deps.studentGuardianRepository.findAll.mockResolvedValue({ studentGuardians: [{ id: 1 }] });
    const result = await useCase.execute(5, { student: { firstName: 'Ana' } });

    expect(deps.studentRepository.update).toHaveBeenCalledWith(5, { firstName: 'Ana' });
    expect(result.student).toMatchObject({ id: 5, firstName: 'Ana' });
    expect(result.guardians).toEqual([{ id: 1 }]);
    expect(deps.studentGuardianRepository.delete).not.toHaveBeenCalled();
    expect(deps.studentGuardianRepository.create).not.toHaveBeenCalled();
  });

  it('no actualiza el estudiante si data.student viene vacío', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(5, { student: {} });
    expect(deps.studentRepository.update).not.toHaveBeenCalled();
  });

  it('rechaza un CI que ya pertenece a otro estudiante', async () => {
    const { useCase, deps } = crear();
    deps.studentRepository.findAll.mockResolvedValue({ students: [{ id: 8 }] });
    await expect(useCase.execute(5, { student: { ci: '999' } }))
      .rejects.toThrow('Ya existe otro estudiante con CI 999 LP');
    await expect(useCase.execute(1, { student: { ci: '999', expedition: 'LP' } }))
      .rejects.toBeInstanceOf(ConflictError);
    expect(deps.studentRepository.findAll).toHaveBeenCalledWith(
      { ci: '999', expedicion: 'LP', excludeId: 5 }, 1, 10
    );
    expect(deps.studentRepository.update).not.toHaveBeenCalled();
  });

  it('permite cambiar el CI cuando no hay duplicado', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(5, { student: { ci: '999' } });
    expect(deps.studentRepository.update).toHaveBeenCalledWith(5, { ci: '999' });
  });

  it('apoderados: actualiza los existentes, crea los nuevos y elimina los omitidos', async () => {
    const { useCase, deps } = crear();
    deps.studentGuardianRepository.findAll.mockResolvedValue({
      studentGuardians: [{ id: 1 }, { id: 2 }],
    });
    const result = await useCase.execute(5, {
      guardians: [{ id: 1, firstName: 'Uno' }, { firstName: 'Nuevo' }],
    });
    expect(deps.studentGuardianRepository.update).toHaveBeenCalledWith(
      1, expect.objectContaining({ firstName: 'Uno' })
    );
    expect(deps.studentGuardianRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: 'Nuevo', studentId: 5 })
    );
    expect(deps.studentGuardianRepository.delete).toHaveBeenCalledTimes(1);
    expect(deps.studentGuardianRepository.delete).toHaveBeenCalledWith(2);
    expect(result.guardians).toHaveLength(2);
  });

  it('apoderados: una lista vacía elimina todos los existentes', async () => {
    const { useCase, deps } = crear();
    deps.studentGuardianRepository.findAll.mockResolvedValue({ studentGuardians: [{ id: 1 }, { id: 2 }] });
    const result = await useCase.execute(5, { guardians: [] });
    expect(deps.studentGuardianRepository.delete).toHaveBeenCalledWith(1);
    expect(deps.studentGuardianRepository.delete).toHaveBeenCalledWith(2);
    expect(result.guardians).toEqual([]);
  });

  it('discapacidades: reemplazo completo (borra y recrea)', async () => {
    const { useCase, deps } = crear();
    deps.studentDisabilityRepository.findAll.mockResolvedValue({ studentDisabilities: [{ id: 3 }] });
    await useCase.execute(5, { disabilities: [{ disabilityTypeId: 1 }] });
    expect(deps.studentDisabilityRepository.delete).toHaveBeenCalledWith(3);
    expect(deps.studentDisabilityRepository.create).toHaveBeenCalledWith({ disabilityTypeId: 1, studentId: 5 });
  });

  it('orígenes: crea con tipo BOLIVIANA por defecto y elimina los omitidos', async () => {
    const { useCase, deps } = crear();
    deps.studentOriginRepository.findAll.mockResolvedValue({ studentOrigins: [{ id: 9 }] });
    await useCase.execute(5, { origins: [{ countryId: 1 }] });
    expect(deps.studentOriginRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ studentId: 5, countryId: 1, originType: 'BOLIVIANA', isPrincipal: true })
    );
    expect(deps.studentOriginRepository.delete).toHaveBeenCalledWith(9);
  });

  it('documentos: actualiza la entrega existente y crea las nuevas; ignora claves inválidas', async () => {
    const { useCase, deps } = crear();
    deps.studentDocumentDeliveryRepository.findAll.mockResolvedValue({
      studentDocumentDeliveries: [{ id: 20, documentacionId: 3 }, { id: 21, documentacionId: 3 }],
    });
    await useCase.execute(5, {
      documentation: {
        doc_3: { entregado: true, observaciones: 'x' },
        doc_4: { entregado: false, observaciones: 'falta' },
        doc_x: { entregado: true },
      },
    });
    // con duplicados toma la entrega de mayor id; si entregado => observaciones null
    expect(deps.studentDocumentDeliveryRepository.update).toHaveBeenCalledWith(21, {
      entregado: true, enTramite: false, fechaEntrega: null, observaciones: null,
    });
    expect(deps.studentDocumentDeliveryRepository.create).toHaveBeenCalledTimes(1);
    expect(deps.studentDocumentDeliveryRepository.create).toHaveBeenCalledWith({
      entregado: false, enTramite: false, fechaEntrega: null, observaciones: 'falta', studentId: 5, documentacionId: 4,
    });
  });

  it('documentos de TRASPASO se ignoran si el tipo de admisión no es TRASPASO', async () => {
    const { useCase, deps } = crear({
      documentacionRepository: { findAll: jest.fn().mockResolvedValue({ documentations: [{ id: 7 }] }) },
    });
    await useCase.execute(5, { tipoAdmision: 'ANTIGUO', documentation: { doc_7: { entregado: true } } });
    expect(deps.studentDocumentDeliveryRepository.create).not.toHaveBeenCalled();
    expect(deps.studentDocumentDeliveryRepository.update).not.toHaveBeenCalled();
  });

  describe('datos académicos', () => {
    const conAcademico = (existente, extra = {}) => {
      const academic = {
        findAll: jest.fn().mockResolvedValue({ studentAcademicData: existente ? [existente] : [] }),
        create: jest.fn(),
        update: jest.fn(),
      };
      const ctx = crear({
        studentAcademicDataRepository: academic,
        configuracionSistemaRepository: {
          findBy: jest.fn(async ({ key }) => ({
            gestion_actual: { id: 1, value: '2026' },
            admision_gestion_2026: { id: 2, value: '3' },
            admision_gestion_2023: { id: 6, value: '40' },
          }[key] ?? null)),
          create: jest.fn(),
          update: jest.fn(),
        },
        managementRepository: {
          findById: jest.fn(async (id) => ({ 5: { id: 5, year: 2023 }, 3: { id: 3, year: 2026 } }[id] ?? null)),
          findBy: jest.fn().mockResolvedValue({ id: 3, year: 2026 }),
        },
        ...extra,
      });
      return { ...ctx, academic };
    };

    it('crea los datos académicos si no existían y asigna código por la gestión', async () => {
      const { useCase, deps, academic } = conAcademico(null);
      await useCase.execute(5, { tipoAdmision: 'ANTIGUO', gestionIngresoId: 5, carreraId: '4' });
      expect(academic.create).toHaveBeenCalledWith({
        studentId: 5, managementId: 5, careerId: 4, admissionType: 'ANTIGUO',
      });
      expect(deps.studentRepository.update).toHaveBeenCalledWith(5, { studentCode: '20230041' });
    });

    it.each([
      ['sin datos previos ni payload', null, {}, 'Gestión de ingreso es requerida'],
      ['gestión 0', { id: 50, managementId: 5, careerId: 4 }, { gestionIngresoId: 0 }, 'Gestión de ingreso es requerida'],
      ['gestión null', { id: 50, managementId: 5, careerId: 4 }, { gestionIngresoId: null }, 'Gestión de ingreso es requerida'],
      ['carrera vacía', { id: 50, managementId: 5, careerId: 4 }, { carreraId: '' }, 'Carrera es requerida'],
      ['carrera ausente y sin carrera guardada', { id: 50, managementId: 5 }, { gestionIngresoId: 5 }, 'Carrera es requerida'],
    ])('ANTIGUO exige gestión y carrera: %s', async (_, existente, payload, mensaje) => {
      const { useCase, academic } = conAcademico(existente);
      await expect(useCase.execute(5, { tipoAdmision: 'ANTIGUO', ...payload })).rejects.toThrow(ValidationError);
      await expect(useCase.execute(5, { tipoAdmision: 'ANTIGUO', ...payload })).rejects.toThrow(mensaje);
      expect(academic.update).not.toHaveBeenCalled();
      expect(academic.create).not.toHaveBeenCalled();
    });

    it('ANTIGUO sin enviar gestión ni carrera usa lo ya guardado', async () => {
      const { useCase } = conAcademico({ id: 50, admissionType: 'ANTIGUO', managementId: 5, careerId: 4 });
      await expect(useCase.execute(5, { tipoAdmision: 'ANTIGUO' })).resolves.toBeDefined();
    });

    it('NUEVO usa la gestión vigente y anula la carrera', async () => {
      const { useCase, academic } = conAcademico({ id: 50, admissionType: 'ANTIGUO', managementId: 5, careerId: 4 });
      await useCase.execute(5, { tipoAdmision: 'NUEVO', carreraId: 4 });
      expect(academic.update).toHaveBeenCalledWith(50, {
        admissionType: 'NUEVO', managementId: 3, careerId: null,
      });
    });

    it('cambio de tipo de admisión regenera el código', async () => {
      const { useCase, deps } = conAcademico({ id: 50, admissionType: 'ANTIGUO', managementId: 5 });
      await useCase.execute(5, { tipoAdmision: 'NUEVO' });
      expect(deps.studentRepository.update).toHaveBeenCalledWith(5, { studentCode: '20260004' });
    });

    it('sin cambio de tipo ni gestión no regenera el código', async () => {
      const { useCase, deps } = conAcademico({ id: 50, admissionType: 'ANTIGUO', managementId: 5 });
      await useCase.execute(5, { tipoAdmision: 'ANTIGUO', gestionIngresoId: 5, carreraId: 8 });
      expect(deps.studentRepository.update).not.toHaveBeenCalled();
    });

    it('si falla la generación del código lanza un error descriptivo', async () => {
      const { useCase } = conAcademico(null);
      await expect(useCase.execute(5, { tipoAdmision: 'ANTIGUO', gestionIngresoId: 999, carreraId: 4 }))
        .rejects.toThrow('No se pudo actualizar el código del estudiante');
    });

    it('al cambiar a un tipo distinto elimina transitabilidad y traspaso previos', async () => {
      const { useCase } = conAcademico(
        { id: 50, admissionType: 'TRANSITABILIDAD', managementId: 3 },
        {
          transitabilityRepository: {
            findBy: jest.fn().mockResolvedValue({ id: 70 }),
            delete: jest.fn(),
          },
          transferRepository: { findBy: jest.fn().mockResolvedValue({ id: 80 }), delete: jest.fn() },
        }
      );
      await useCase.execute(5, { tipoAdmision: 'ANTIGUO', gestionIngresoId: 3, carreraId: 4 });
      expect(useCase.transitabilityRepository.delete).toHaveBeenCalledWith(70);
      expect(useCase.transferRepository.delete).toHaveBeenCalledWith(80);
    });
  });

  it('un error en transitabilidad no bloquea la actualización', async () => {
    const { useCase, deps } = crear({
      institutionRepository: { findBy: jest.fn().mockRejectedValue(new Error('x')) },
      transitabilityRepository: { findBy: jest.fn() },
    });
    const result = await useCase.execute(5, {
      transitability: { institucionNombre: 'U', tipoInstitucion: 'CEA', carreraOrigen: 'C' },
    });
    expect(result.student.id).toBe(5);
    expect(deps.logger.error).toHaveBeenCalled();
  });

  it('propaga errores del repositorio', async () => {
    const { useCase, deps } = crear();
    deps.studentRepository.update.mockRejectedValue(new Error('db'));
    await expect(useCase.execute(5, { student: { firstName: 'A' } })).rejects.toThrow('db');
  });
});
