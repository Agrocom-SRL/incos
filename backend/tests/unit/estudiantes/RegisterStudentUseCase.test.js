import { jest } from '@jest/globals';
import { ConflictError, NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';
import { RegisterStudentUseCase } from '../../../src/application/use-cases/estudiantes/RegisterStudentUseCase.js';

describe('RegisterStudentUseCase', () => {
  const crear = ({ config = {}, conAcademico = true, conPagos = true } = {}) => {
    const claves = {
      gestion_actual: { id: 1, value: '2026' },
      admision_gestion_2026: { id: 2, value: '7' },
      ...config,
    };
    const deps = {
      studentRepository: {
        findBy: jest.fn().mockResolvedValue(null),
        create: jest.fn(async (d) => ({ id: 10, ...d })),
      },
      studentGuardianRepository: { create: jest.fn(async (d) => ({ id: 1, ...d })) },
      studentDisabilityRepository: { create: jest.fn(async (d) => ({ id: 1, ...d })) },
      studentOriginRepository: { create: jest.fn(async (d) => ({ id: 1, ...d })) },
      studentDocumentDeliveryRepository: { create: jest.fn(async (d) => ({ id: 1, ...d })) },
      configuracionSistemaRepository: {
        findBy: jest.fn(async ({ key }) => claves[key] ?? null),
        create: jest.fn(),
        update: jest.fn(),
      },
      managementRepository: {
        findById: jest.fn(),
        findBy: jest.fn().mockResolvedValue({ id: 3, year: 2026 }),
      },
      contributionPaymentRepository: conPagos
        ? { findBy: jest.fn().mockResolvedValue(null), create: jest.fn() }
        : undefined,
      contributionConfigurationRepository: conPagos
        ? {
          findAll: jest.fn().mockResolvedValue({ contributionConfigurations: [{ baseAmount: '450' }] }),
        }
        : undefined,
      studentAcademicDataRepository: conAcademico
        ? { create: jest.fn(async (d) => ({ id: 99, ...d })) }
        : undefined,
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new RegisterStudentUseCase(deps) };
  };

  it('registra un estudiante nuevo con código de la gestión actual y correlativo incrementado', async () => {
    const { useCase, deps } = crear();
    const result = await useCase.execute({ student: { ci: '123' } });

    expect(deps.studentRepository.findBy).toHaveBeenCalledWith(expect.objectContaining({ ci: '123' }));
    expect(deps.configuracionSistemaRepository.update).toHaveBeenCalledWith(2, { value: '8' });
    expect(deps.studentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ ci: '123', studentCode: '20260008' })
    );
    expect(result.student.studentCode).toBe('20260008');
    expect(result.guardians).toEqual([]);
    expect(deps.studentAcademicDataRepository.create).toHaveBeenCalledWith({
      studentId: 10, managementId: 3, careerId: null, admissionType: 'NUEVO',
    });
  });

  it('crea la deuda de aporte con el monto de la configuración', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ student: { ci: '1' } });
    expect(deps.contributionPaymentRepository.create).toHaveBeenCalledWith({
      studentId: 10,
      managementId: 3,
      baseAmount: 450,
      scholarshipDiscount: 0,
      mandatoryAmount: 450,
      state: 'PENDIENTE',
    });
  });

  it('no crea una segunda deuda si ya existe para la gestión', async () => {
    const { useCase, deps } = crear();
    deps.contributionPaymentRepository.findBy.mockResolvedValue({ id: 5 });
    await useCase.execute({ student: { ci: '1' } });
    expect(deps.contributionPaymentRepository.create).not.toHaveBeenCalled();
  });

  it('un fallo al crear la deuda no bloquea el registro', async () => {
    const { useCase, deps } = crear();
    deps.contributionPaymentRepository.create.mockRejectedValue(new Error('boom'));
    const result = await useCase.execute({ student: { ci: '1' } });
    expect(result.student.id).toBe(10);
    expect(deps.logger.error).toHaveBeenCalled();
  });

  it('rechaza un CI duplicado y no crea nada', async () => {
    const { useCase, deps } = crear();
    deps.studentRepository.findBy.mockResolvedValue({ id: 1 });
    await expect(useCase.execute({ student: { ci: '123' } }))
      .rejects.toThrow('Ya existe un estudiante con CI 123');
    expect(deps.studentRepository.create).not.toHaveBeenCalled();
  });

  it('el CI duplicado es un ConflictError (409), no un Error genérico (500)', async () => {
    const { useCase, deps } = crear();
    deps.studentRepository.findBy.mockResolvedValue({ id: 1 });
    await expect(useCase.execute({ student: { ci: '123' } })).rejects.toBeInstanceOf(ConflictError);
  });

  it('valida el CI duplicado con la expedición que entrega el DTO (expedition)', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ student: { ci: '123', expedition: 'LP' } });
    expect(deps.studentRepository.findBy).toHaveBeenCalledWith({ ci: '123', expedicion: 'LP' });
  });

  it('falla si no existe la configuración gestion_actual', async () => {
    const { useCase, deps } = crear({ config: { gestion_actual: null } });
    await expect(useCase.execute({ student: { ci: '1' } }))
      .rejects.toThrow('No se encontró la configuración de gestión actual');
    expect(deps.studentRepository.create).not.toHaveBeenCalled();
  });

  it('falla si la gestión actual no es un año válido', async () => {
    const { useCase } = crear({ config: { gestion_actual: { id: 1, value: 'abc' } } });
    await expect(useCase.execute({ student: { ci: '1' } }))
      .rejects.toThrow('no es un año válido');
  });

  it('crea el correlativo con valor 0 si no existe y arranca en 0001', async () => {
    const { useCase, deps } = crear({ config: { admision_gestion_2026: null } });
    // tras crear, el segundo findBy devuelve el registro recién creado
    let creada = false;
    deps.configuracionSistemaRepository.create.mockImplementation(async () => { creada = true; });
    const base = deps.configuracionSistemaRepository.findBy.getMockImplementation();
    deps.configuracionSistemaRepository.findBy.mockImplementation(async (q) => (
      q.key === 'admision_gestion_2026' && creada ? { id: 4, value: '0' } : base(q)
    ));
    const result = await useCase.execute({ student: { ci: '1' } });
    expect(deps.configuracionSistemaRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'admision_gestion_2026', value: '0' })
    );
    expect(result.student.studentCode).toBe('20260001');
  });

  it('estudiante antiguo: usa el año de la gestión de ingreso e infiere ANTIGUO', async () => {
    const { useCase, deps } = crear({ config: { admision_gestion_2023: { id: 8, value: '11' } } });
    deps.managementRepository.findById.mockResolvedValue({ id: 5, year: 2023 });
    const result = await useCase.execute({
      student: { ci: '1' }, gestionIngresoId: 5, carreraId: 4,
    });
    expect(deps.managementRepository.findById).toHaveBeenCalledWith(5);
    expect(result.student.studentCode).toBe('20230012');
    expect(deps.studentAcademicDataRepository.create).toHaveBeenCalledWith({
      studentId: 10, managementId: 5, careerId: 4, admissionType: 'ANTIGUO',
    });
  });

  it.each([
    ['sin gestión', { tipoAdmision: 'ANTIGUO', carreraId: 4 }, 'Gestión de ingreso es requerida'],
    ['gestión 0', { tipoAdmision: 'ANTIGUO', gestionIngresoId: 0, carreraId: 4 }, 'Gestión de ingreso es requerida'],
    ['sin carrera', { tipoAdmision: 'ANTIGUO', gestionIngresoId: 5 }, 'Carrera es requerida'],
    ['carrera null', { tipoAdmision: 'ANTIGUO', gestionIngresoId: 5, carreraId: null }, 'Carrera es requerida'],
    ['solo gestión (infiere ANTIGUO)', { gestionIngresoId: 5 }, 'Carrera es requerida'],
  ])('ANTIGUO exige gestión y carrera: %s', async (_, extra, mensaje) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ student: { ci: '1' }, ...extra })).rejects.toThrow(ValidationError);
    await expect(useCase.execute({ student: { ci: '1' }, ...extra })).rejects.toThrow(mensaje);
    expect(deps.studentRepository.create).not.toHaveBeenCalled();
  });

  it('falla si la gestión de ingreso no existe', async () => {
    const { useCase } = crear();
    useCase.managementRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute({ student: { ci: '1' }, gestionIngresoId: 77, carreraId: 4 }))
      .rejects.toThrow(new NotFoundError('Gestión con ID 77'));
  });

  it('crea apoderados, discapacidades, orígenes y documentos vinculados al estudiante', async () => {
    const { useCase, deps } = crear();
    const result = await useCase.execute({
      student: { ci: '1' },
      guardians: [{ name: 'Ana' }],
      disabilities: [{ type: 'X' }],
      origins: [{ countryId: 1 }],
      documentation: { doc_3: { entregado: true }, doc_x: { entregado: true }, doc_4: null },
    });
    expect(deps.studentGuardianRepository.create).toHaveBeenCalledWith({ name: 'Ana', studentId: 10 });
    expect(deps.studentDisabilityRepository.create).toHaveBeenCalledWith({ type: 'X', studentId: 10 });
    expect(deps.studentOriginRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ studentId: 10, countryId: 1, originType: 'BOLIVIANA', isPrincipal: true })
    );
    expect(deps.studentDocumentDeliveryRepository.create).toHaveBeenCalledTimes(1);
    expect(deps.studentDocumentDeliveryRepository.create).toHaveBeenCalledWith({
      studentId: 10, documentacionId: 3, entregado: true, enTramite: false, fechaEntrega: null, observaciones: null,
    });
    expect(result.guardians).toHaveLength(1);
    expect(result.documentDeliveries).toHaveLength(1);
  });

  it('omite documentos de TRASPASO si el tipo de admisión no es TRASPASO', async () => {
    const { useCase, deps } = crear();
    useCase.documentacionRepository = {
      findAll: jest.fn().mockResolvedValue({ documentations: [{ id: 3 }] }),
    };
    await useCase.execute({
      student: { ci: '1' },
      documentation: { doc_3: { entregado: true }, doc_4: { entregado: true } },
    });
    expect(deps.studentDocumentDeliveryRepository.create).toHaveBeenCalledTimes(1);
    expect(deps.studentDocumentDeliveryRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ documentacionId: 4 })
    );
  });

  it('un fallo en transitabilidad no bloquea el registro', async () => {
    const { useCase, deps } = crear();
    useCase.institutionRepository = { findBy: jest.fn().mockRejectedValue(new Error('x')) };
    useCase.transitabilityRepository = { create: jest.fn() };
    const result = await useCase.execute({
      student: { ci: '1' },
      tipoAdmision: 'TRANSITABILIDAD',
      transitability: { institucionNombre: 'U', tipoInstitucion: 'UETHP', carreraOrigen: 'C' },
    });
    expect(result.student.id).toBe(10);
    expect(deps.logger.error).toHaveBeenCalled();
  });

  it('crea el traspaso con institución ITT nueva', async () => {
    const { useCase } = crear();
    useCase.institutionRepository = {
      findBy: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 50 }),
    };
    useCase.transferRepository = { create: jest.fn().mockResolvedValue({ id: 60 }) };
    await useCase.execute({
      student: { ci: '1' },
      tipoAdmision: 'TRASPASO',
      transfer: { institucionNombre: 'ITT X', carreraOrigen: 'Y' },
    });
    expect(useCase.institutionRepository.findBy).toHaveBeenCalledWith({ name: 'ITT X', type: 'ITT' });
    expect(useCase.transferRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ estudianteId: 10, institucionOrigenId: 50, estado: 'SOLICITADO' })
    );
  });

  it('propaga errores del repositorio de estudiantes y los registra', async () => {
    const { useCase, deps } = crear();
    deps.studentRepository.create.mockRejectedValue(new Error('db'));
    await expect(useCase.execute({ student: { ci: '1' } })).rejects.toThrow('db');
    expect(deps.logger.error).toHaveBeenCalled();
  });
});
