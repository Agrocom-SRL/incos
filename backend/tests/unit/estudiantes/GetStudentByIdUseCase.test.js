import { jest } from '@jest/globals';
import { GetStudentByIdUseCase } from '../../../src/application/use-cases/estudiantes/GetStudentByIdUseCase.js';

describe('GetStudentByIdUseCase', () => {
  const fila = {
    id: 7,
    codigo_estudiante: '20260001',
    ci: '123',
    nombres: 'Ana',
    apoderados: JSON.stringify([{ apoderado_id: 1, apoderado_nombres: 'Luis' }]),
    discapacidades: '[]',
    origenes: '[]',
  };

  const crear = (overrides = {}) => {
    const deps = {
      studentRepository: { obtenerDatosPersonales: jest.fn().mockResolvedValue([fila]) },
      studentDocumentDeliveryRepository: {
        obtenerEntregasConDetalle: jest.fn().mockResolvedValue([]),
      },
      studentScholarshipRepository: {
        findAll: jest.fn().mockResolvedValue({ studentScholarships: [] }),
      },
      scholarshipRepository: { findById: jest.fn() },
      managementRepository: { findById: jest.fn() },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
      ...overrides,
    };
    return { deps, useCase: new GetStudentByIdUseCase(deps) };
  };

  it('devuelve el estudiante con sus datos relacionados mapeados', async () => {
    const { useCase, deps } = crear();
    const result = await useCase.execute(7);

    expect(deps.studentRepository.obtenerDatosPersonales).toHaveBeenCalledWith({ id: 7 });
    expect(deps.studentDocumentDeliveryRepository.obtenerEntregasConDetalle)
      .toHaveBeenCalledWith({ estudiante_id: 7 });
    expect(deps.studentScholarshipRepository.findAll).toHaveBeenCalledWith({ studentId: 7 }, null, null);
    expect(result.student).toEqual({ id: 7, studentCode: '20260001', ci: '123', firstName: 'Ana' });
    expect(result.guardians).toEqual([{ id: 1, studentId: 7, firstName: 'Luis' }]);
    expect(result.access).toEqual({ tieneAcceso: false });
    expect(result.tieneDocumentosFaltantes).toBe(false);
    expect(result.catalogs).toEqual({ scholarships: {}, managements: {} });
    expect(result.actaCompromiso).toBeNull();
    expect(result.inscripcion).toBeNull();
    expect(result.academicData).toBeNull();
  });

  it('lanza error si el estudiante no existe', async () => {
    const { useCase, deps } = crear();
    deps.studentRepository.obtenerDatosPersonales.mockResolvedValue([]);
    await expect(useCase.execute(99)).rejects.toMatchObject({ statusCode: 404, code: 'NOT_FOUND', message: 'estudiante con ID 99 no encontrado' });
    expect(deps.studentDocumentDeliveryRepository.obtenerEntregasConDetalle).not.toHaveBeenCalled();
    expect(deps.logger.error).toHaveBeenCalled();
  });

  it('lanza error si la vista devuelve null', async () => {
    const { useCase, deps } = crear();
    deps.studentRepository.obtenerDatosPersonales.mockResolvedValue(null);
    await expect(useCase.execute(1)).rejects.toMatchObject({ statusCode: 404, code: 'NOT_FOUND' });
  });

  it('marca documentos faltantes si un documento raíz de INSCRIPCION no está entregado', async () => {
    const { useCase, deps } = crear();
    deps.studentDocumentDeliveryRepository.obtenerEntregasConDetalle.mockResolvedValue([
      { entrega_id: 1, tipo_documento: 'INSCRIPCION', documento_padre_id: null, entregado: 0 },
    ]);
    const result = await useCase.execute(7);
    expect(result.tieneDocumentosFaltantes).toBe(true);
    expect(result.documentDeliveries[0]).toMatchObject({ id: 1, tipoDocumento: 'INSCRIPCION', entregado: 0 });
  });

  it('ignora documentos hijos o ya entregados al calcular faltantes', async () => {
    const { useCase, deps } = crear();
    deps.studentDocumentDeliveryRepository.obtenerEntregasConDetalle.mockResolvedValue([
      { tipo_documento: 'INSCRIPCION', documento_padre_id: 3, entregado: 0 },
      { tipo_documento: 'INSCRIPCION', documento_padre_id: null, entregado: 1 },
    ]);
    const result = await useCase.execute(7);
    expect(result.tieneDocumentosFaltantes).toBe(false);
  });

  it('carga el catálogo de becas y gestiones de las asignaciones', async () => {
    const { useCase, deps } = crear();
    deps.studentScholarshipRepository.findAll.mockResolvedValue({
      studentScholarships: [{ scholarshipId: 2, managementId: 3 }],
    });
    deps.scholarshipRepository.findById.mockResolvedValue({ toPlainObject: () => ({ id: 2, name: 'Beca' }) });
    deps.managementRepository.findById.mockResolvedValue({ id: 3, year: 2026 });
    const result = await useCase.execute(7);
    expect(deps.scholarshipRepository.findById).toHaveBeenCalledWith(2);
    expect(deps.managementRepository.findById).toHaveBeenCalledWith(3);
    expect(result.catalogs.scholarships[2]).toEqual({ id: 2, name: 'Beca' });
    expect(result.catalogs.managements[3]).toEqual({ id: 3, year: 2026 });
  });

  it('un fallo al leer una beca no rompe la respuesta', async () => {
    const { useCase, deps } = crear();
    deps.studentScholarshipRepository.findAll.mockResolvedValue({
      studentScholarships: [{ scholarshipId: 2 }],
    });
    deps.scholarshipRepository.findById.mockRejectedValue(new Error('db'));
    const result = await useCase.execute(7);
    expect(result.catalogs.scholarships).toEqual({});
    expect(deps.logger.warn).toHaveBeenCalled();
  });

  it('expone la cuenta de acceso cuando la vista trae usuario', async () => {
    const { useCase, deps } = crear();
    deps.studentRepository.obtenerDatosPersonales.mockResolvedValue([
      { ...fila, usuario_id: '4', usuario_username: 'ana', rol_nombre: 'Estudiante' },
    ]);
    const result = await useCase.execute(7);
    expect(result.access).toEqual({
      tieneAcceso: true, usuarioId: 4, usuario: 'ana', estadoCuenta: 'Activo', rol: 'Estudiante',
    });
  });

  it('incluye datos académicos enriquecidos y la inscripción más reciente', async () => {
    const { useCase, deps } = crear({
      studentAcademicDataRepository: {
        findAll: jest.fn().mockResolvedValue({
          studentAcademicData: [{ id: 11, managementId: 3, careerId: 4, admissionType: 'TRASPASO' }],
        }),
      },
      enrollmentRepository: {
        findAll: jest.fn().mockResolvedValue({
          enrollments: [
            { id: 1, createdAt: '2025-01-01' },
            { id: 2, createdAt: '2026-02-01' },
          ],
        }),
      },
      getEnrollmentByIdUseCase: { execute: jest.fn().mockResolvedValue({ id: 2, detalle: true }) },
      careerRepository: { findById: jest.fn().mockResolvedValue({ id: 4, name: 'Sistemas' }) },
    });
    deps.managementRepository.findById.mockResolvedValue({ id: 3, name: 'G26', year: 2026 });
    deps.studentDocumentDeliveryRepository.obtenerEntregasConDetalle.mockResolvedValue([
      { tipo_documento: 'TRASPASO', documento_padre_id: null, entregado: false },
    ]);

    const result = await useCase.execute(7);

    expect(deps.enrollmentRepository.findAll).toHaveBeenCalledWith({ academicDataId: 11 }, null, null);
    expect(useCase.getEnrollmentByIdUseCase.execute).toHaveBeenCalledWith(2);
    expect(result.inscripcion).toEqual({ id: 2, detalle: true });
    expect(result.academicData.management).toMatchObject({ id: 3, name: 'G26', year: 2026 });
    expect(result.academicData.career).toMatchObject({ id: 4, name: 'Sistemas' });
    // TRASPASO: un documento de traspaso raíz no entregado también cuenta como faltante
    expect(result.tieneDocumentosFaltantes).toBe(true);
  });

  it('resuelve la ruta del acta de compromiso', async () => {
    const { useCase } = crear({
      studentDocumentRepository: {
        findAll: jest.fn().mockResolvedValue({
          studentDocuments: [{ fileName: 'ACTA_COMPROMISO_1.pdf', filePath: 'actas/a.pdf' }],
        }),
      },
    });
    const result = await useCase.execute(7);
    expect(result.actaCompromiso.fileName).toBe('ACTA_COMPROMISO_1.pdf');
    expect(result.actaCompromiso.filePath).toMatch(/^\/.+\/actas\/a\.pdf$/);
  });

  it('expone transitabilidad con los datos de la institución de origen', async () => {
    const { useCase } = crear({
      institutionRepository: {
        findById: jest.fn().mockResolvedValue({ nombre: 'UE X', tipo: 'UETHP', departamentoId: 2 }),
      },
      transitabilityRepository: {
        findBy: jest.fn().mockResolvedValue({ institucionOrigenId: 5, carreraOrigen: 'Mecánica' }),
      },
      departmentRepository: { findById: jest.fn().mockResolvedValue({ name: 'La Paz' }) },
    });
    const result = await useCase.execute(7);
    expect(useCase.transitabilityRepository.findBy).toHaveBeenCalledWith({ studentId: 7 });
    expect(result.transitability).toMatchObject({
      institucionNombre: 'UE X', tipoInstitucion: 'UETHP', departamento: 'La Paz', carreraOrigen: 'Mecánica',
    });
    expect(result.transfer).toBeNull();
  });
});
