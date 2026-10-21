import { jest } from '@jest/globals';
import { GenerateDeclaracionJuradaUseCase } from '../../../src/application/use-cases/estudiantes/GenerateDeclaracionJuradaUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('GenerateDeclaracionJuradaUseCase', () => {
  const crear = ({ tipoAdmision = 'NUEVO' } = {}) => {
    const deps = {
      studentRepository: {
        obtenerDatosPersonales: jest.fn().mockResolvedValue([
          { id: 5, codigo_estudiante: 'E1', nombres: 'Ana', apellido_paterno: 'Lopez', fecha_nacimiento: '2000-05-10' },
        ]),
      },
      studentDocumentRepository: {
        findAll: jest.fn().mockResolvedValue({ studentDocuments: [] }),
        findBy: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 99 }),
        update: jest.fn(),
      },
      enrollmentRepository: { obtenerInscripcionActual: jest.fn().mockResolvedValue([]) },
      studentAcademicDataRepository: {
        obtenerDatosAcademicos: jest.fn().mockResolvedValue([{ carrera_nombre: 'Enf', tipo_admision: tipoAdmision }]),
      },
      studentDocumentDeliveryRepository: {
        obtenerEntregasConDetalle: jest.fn().mockResolvedValue([]),
      },
      configuracionSistemaRepository: { findBy: jest.fn().mockResolvedValue({ value: '2026' }) },
      managementRepository: { findBy: jest.fn().mockResolvedValue({ id: 3, year: 2026 }) },
      pdfGenerator: { generateFormularioDeclaracionJurada: jest.fn().mockResolvedValue(Buffer.from('pdf')) },
      uploadsStorage: {
        saveToUploads: jest.fn().mockReturnValue({ filePath: '/uploads/x.pdf', absolutePath: '/abs/x.pdf', fileName: 'declaracion_jurada_E1.pdf' }),
      },
      transitabilityRepository: { findBy: jest.fn().mockResolvedValue({ institucionOrigenId: 30, anio: 2020 }) },
      transferRepository: { findBy: jest.fn().mockResolvedValue({ institucionOrigenId: 31, anioCursado: 2022 }) },
      institutionRepository: { findById: jest.fn().mockImplementation(async (id) => ({ id, name: `Inst ${id}` })) },
      documentacionRepository: null,
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GenerateDeclaracionJuradaUseCase(deps) };
  };

  it('admisión NUEVO/otra: usa datos de transitabilidad e institución y no consulta traspaso', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute(5);

    expect(deps.transitabilityRepository.findBy).toHaveBeenCalledWith({ studentId: 5 });
    expect(deps.transferRepository.findBy).not.toHaveBeenCalled();
    expect(deps.institutionRepository.findById).toHaveBeenCalledWith(30);
    const arg = deps.pdfGenerator.generateFormularioDeclaracionJurada.mock.calls[0][0];
    expect(arg.gestion).toBe(2026);
    expect(arg.tipoAdmision).toBe('NUEVO');
    expect(arg.transitabilityData).toEqual(expect.objectContaining({ institucionOrigenId: 30 }));
    expect(arg.transferData).toBeNull();
    expect(arg.institutionData).toEqual({ id: 30, name: 'Inst 30' });
    expect(arg.documentosPresentadosTraspaso).toBeUndefined();
    expect(arg.student).toEqual(expect.objectContaining({ edad: expect.any(String), fechaNacimientoLiteral: '10 de mayo de 2000' }));
    expect(deps.uploadsStorage.saveToUploads).toHaveBeenCalledWith(expect.any(String), 'declaracion_jurada_E1.pdf', expect.any(Buffer));
    expect(deps.studentDocumentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ studentId: 5, tipoDocumento: 'INSCRIPCION' })
    );
    expect(res.fileName).toBe('declaracion_jurada_E1.pdf');
  });

  it('admisión TRASPASO: usa datos de traspaso y lista documentos presentados', async () => {
    const { useCase, deps } = crear({ tipoAdmision: 'traspaso' });
    deps.studentDocumentDeliveryRepository.obtenerEntregasConDetalle.mockImplementation(async (f) =>
      f.entregado
        ? [
            { documentacion_id: 3, nombre_documento: 'Cedula' },
            { documentacion_id: 3, nombre_documento: 'Repetida' },
            { documentacion_id: 1, nombre_documento: 'Titulo' },
            { documentacion_id: 55, nombre_documento: 'Fuera de lista' },
          ]
        : []
    );
    await useCase.execute(5);

    expect(deps.transferRepository.findBy).toHaveBeenCalledWith({ studentId: 5 });
    expect(deps.transitabilityRepository.findBy).not.toHaveBeenCalled();
    const arg = deps.pdfGenerator.generateFormularioDeclaracionJurada.mock.calls[0][0];
    expect(arg.transferData).toEqual(expect.objectContaining({ institucionOrigenId: 31 }));
    expect(arg.institutionData).toEqual({ id: 31, name: 'Inst 31' });
    expect(arg.documentosPresentadosTraspaso).toEqual([{ nombre: 'Fotocopia de Cedula' }, { nombre: 'Fotocopia de Titulo' }]);
  });

  it('options.tipoAdmision tiene prioridad sobre los datos académicos', async () => {
    const { useCase, deps } = crear({ tipoAdmision: 'NUEVO' });
    await useCase.execute(5, { tipoAdmision: 'TRANSITABILIDAD' });
    const arg = deps.pdfGenerator.generateFormularioDeclaracionJurada.mock.calls[0][0];
    expect(arg.tipoAdmision).toBe('TRANSITABILIDAD');
    expect(arg.academicData.tipoAdmision).toBe('NUEVO');
  });

  it('un fallo al leer transitabilidad no impide generar el documento', async () => {
    const { useCase, deps } = crear();
    deps.transitabilityRepository.findBy.mockRejectedValue(new Error('x'));
    await useCase.execute(5);
    const arg = deps.pdfGenerator.generateFormularioDeclaracionJurada.mock.calls[0][0];
    expect(arg.transitabilityData).toBeNull();
    expect(deps.logger.error).toHaveBeenCalled();
  });

  it('con documentacionRepository ordena los ids de traspaso antes de los de inscripción', async () => {
    const { useCase, deps } = crear({ tipoAdmision: 'TRASPASO' });
    deps.documentacionRepository = {
      findAll: jest.fn().mockResolvedValue({ documentations: [{ id: 20, order: 2 }, { id: 10, order: 1 }] }),
    };
    useCase.documentacionRepository = deps.documentacionRepository;
    await expect(useCase._getOrderedDocumentacionIdsTraspasoForm()).resolves.toEqual([10, 20, 3, 2, 1]);

    deps.documentacionRepository.findAll.mockRejectedValue(new Error('x'));
    await expect(useCase._getOrderedDocumentacionIdsTraspasoForm()).resolves.toEqual([3, 2, 1]);
  });

  it('estudiante inexistente: NotFoundError sin generar PDF', async () => {
    const { useCase, deps } = crear();
    deps.studentRepository.obtenerDatosPersonales.mockResolvedValue([]);
    await expect(useCase.execute(99)).rejects.toThrow(NotFoundError);
    expect(deps.pdfGenerator.generateFormularioDeclaracionJurada).not.toHaveBeenCalled();
  });

  it('propaga el error del generador de PDF', async () => {
    const { useCase, deps } = crear();
    deps.pdfGenerator.generateFormularioDeclaracionJurada.mockRejectedValue(new Error('pdf'));
    await expect(useCase.execute(5)).rejects.toThrow('pdf');
    expect(deps.uploadsStorage.saveToUploads).not.toHaveBeenCalled();
  });
});
