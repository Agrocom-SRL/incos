import { jest } from '@jest/globals';
import { GenerateActaCompromisoUseCase } from '../../../src/application/use-cases/estudiantes/GenerateActaCompromisoUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('GenerateActaCompromisoUseCase', () => {
  const crear = ({ tipoAdmision = 'NUEVO', withAcademic = true } = {}) => {
    const deps = {
      studentRepository: {
        findById: jest.fn().mockResolvedValue({
          id: 5, studentCode: 'E1', ci: '123', expedition: 'LP', firstName: 'Ana', lastName: 'Lopez', motherLastName: 'Rios',
        }),
      },
      studentDocumentRepository: {
        findBy: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 99 }),
        update: jest.fn(),
      },
      studentDocumentDeliveryRepository: {
        obtenerEntregasConDetalle: jest.fn().mockImplementation(async (f) => [{ tipo: f.tipo_documento }]),
      },
      studentAcademicDataRepository: withAcademic
        ? { findAll: jest.fn().mockResolvedValue({ studentAcademicData: [{ admissionType: tipoAdmision }] }) }
        : undefined,
      configuracionSistemaRepository: { findBy: jest.fn().mockResolvedValue({ value: '2026' }) },
      managementRepository: { findBy: jest.fn().mockResolvedValue({ id: 3, year: 2026 }) },
      pdfGenerator: { generateActaCompromiso: jest.fn().mockResolvedValue(Buffer.from('pdf')) },
      uploadsStorage: {
        saveToUploads: jest.fn().mockReturnValue({ filePath: '/uploads/a.pdf', absolutePath: '/abs/a.pdf', fileName: 'acta_compromiso_E1.pdf' }),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GenerateActaCompromisoUseCase(deps) };
  };

  it('genera el acta con las entregas pendientes de inscripción y la guarda', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute(5);

    expect(deps.studentRepository.findById).toHaveBeenCalledWith(5, expect.any(Object));
    expect(deps.studentDocumentDeliveryRepository.obtenerEntregasConDetalle).toHaveBeenCalledTimes(1);
    expect(deps.studentDocumentDeliveryRepository.obtenerEntregasConDetalle).toHaveBeenCalledWith({
      estudiante_id: 5,
      documento_padre_id: null,
      entregado: false,
      tipo_documento: 'INSCRIPCION',
    });
    const arg = deps.pdfGenerator.generateActaCompromiso.mock.calls[0][0];
    expect(arg.gestion).toBe(2026);
    expect(arg.diasPlazo).toBe(30);
    expect(arg.entregas).toEqual([{ tipo: 'INSCRIPCION' }]);
    expect(arg.student).toEqual(
      expect.objectContaining({ id: 5, codigoEstudiante: 'E1', ci: '123', expedicion: 'LP', nombres: 'Ana', apellidoPaterno: 'Lopez', apellidoMaterno: 'Rios' })
    );
    expect(deps.uploadsStorage.saveToUploads).toHaveBeenCalledWith(expect.any(String), 'acta_compromiso_E1.pdf', expect.any(Buffer));
    expect(deps.studentDocumentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ studentId: 5, tipoDocumento: 'INSCRIPCION', state: 'APROBADO' })
    );
    expect(res.fileName).toBe('acta_compromiso_E1.pdf');
  });

  it('estudiante de TRASPASO suma también las entregas pendientes de traspaso', async () => {
    const { useCase, deps } = crear({ tipoAdmision: 'traspaso' });
    await useCase.execute(5);
    expect(deps.studentDocumentDeliveryRepository.obtenerEntregasConDetalle).toHaveBeenCalledTimes(2);
    const arg = deps.pdfGenerator.generateActaCompromiso.mock.calls[0][0];
    expect(arg.entregas).toEqual([{ tipo: 'INSCRIPCION' }, { tipo: 'TRASPASO' }]);
  });

  it('sin repositorio de datos académicos no se considera traspaso', async () => {
    const { useCase, deps } = crear({ withAcademic: false });
    await useCase.execute(5);
    expect(deps.studentDocumentDeliveryRepository.obtenerEntregasConDetalle).toHaveBeenCalledTimes(1);
  });

  it('si falla la lectura del tipo de admisión asume que no es traspaso', async () => {
    const { useCase, deps } = crear();
    deps.studentAcademicDataRepository.findAll.mockRejectedValue(new Error('x'));
    await useCase.execute(5);
    expect(deps.studentDocumentDeliveryRepository.obtenerEntregasConDetalle).toHaveBeenCalledTimes(1);
    expect(deps.logger.warn).toHaveBeenCalled();
  });

  it('estudiante inexistente: NotFoundError sin generar PDF', async () => {
    const { useCase, deps } = crear();
    deps.studentRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(99)).rejects.toThrow(NotFoundError);
    expect(deps.pdfGenerator.generateActaCompromiso).not.toHaveBeenCalled();
  });

  it('gestión actual inválida (NaN): ValidationError sin generar PDF', async () => {
    const { useCase, deps } = crear();
    deps.configuracionSistemaRepository.findBy.mockResolvedValue({ value: 'abc' });
    await expect(useCase.execute(5)).rejects.toThrow(ValidationError);
    expect(deps.pdfGenerator.generateActaCompromiso).not.toHaveBeenCalled();
  });

  it('propaga el error del generador de PDF sin guardar', async () => {
    const { useCase, deps } = crear();
    deps.pdfGenerator.generateActaCompromiso.mockRejectedValue(new Error('pdf'));
    await expect(useCase.execute(5)).rejects.toThrow('pdf');
    expect(deps.uploadsStorage.saveToUploads).not.toHaveBeenCalled();
  });
});
