import { jest } from '@jest/globals';
import { GenerateFormularioInscripcionUseCase } from '../../../src/application/use-cases/inscripciones/GenerateFormularioInscripcionUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('GenerateFormularioInscripcionUseCase', () => {
  const filaEstudiante = {
    id: 5,
    codigo_estudiante: 'E1',
    ci: '123',
    nombres: 'Ana',
    apellido_paterno: 'Lopez',
    apellido_materno: 'Rios',
    fecha_nacimiento: '2000-05-10',
    trabaja: 1,
    apoderados: '[{"nombre":"Mama"}]',
    origenes: null,
    discapacidades: 'no es json',
  };

  const crear = () => {
    const deps = {
      studentRepository: { obtenerDatosPersonales: jest.fn().mockResolvedValue([filaEstudiante]) },
      studentDocumentRepository: {
        findAll: jest.fn().mockResolvedValue({ studentDocuments: [] }),
        findBy: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 99 }),
        update: jest.fn().mockResolvedValue({ id: 98 }),
      },
      enrollmentRepository: {
        obtenerInscripcionActual: jest.fn().mockResolvedValue([
          {
            inscripcion_id: 4,
            tipo_inscripcion: 'NUEVO',
            materia_sigla: 'ENF-101',
            materia_nombre: 'Anatomia',
            periodo_nombre: 'Primero',
            paralelo_nombre: 'A',
            paralelo_turno: 'MAÑANA',
            horas_semanales: 4,
          },
          { inscripcion_id: 4, materia_sigla: 'ENF-102', materia_nombre: 'Fisiologia', periodo_nombre: 'Primero' },
        ]),
      },
      studentAcademicDataRepository: {
        obtenerDatosAcademicos: jest.fn().mockResolvedValue([{ carrera_nombre: 'Enfermeria', tipo_admision: 'NUEVO' }]),
      },
      studentDocumentDeliveryRepository: {
        obtenerEntregasConDetalle: jest.fn().mockResolvedValue([{ nombre_documento: 'CI' }]),
      },
      configuracionSistemaRepository: { findBy: jest.fn().mockResolvedValue({ value: '2026' }) },
      managementRepository: { findBy: jest.fn().mockResolvedValue({ id: 3, year: 2026 }) },
      pdfGenerator: { generateFormularioInscripcion: jest.fn().mockResolvedValue(Buffer.from('pdf')) },
      uploadsStorage: {
        saveToUploads: jest.fn().mockReturnValue({
          filePath: '/uploads/documentos/estudiantes/5/formulario_inscripcion_E1.pdf',
          absolutePath: '/abs/formulario_inscripcion_E1.pdf',
          fileName: 'formulario_inscripcion_E1.pdf',
        }),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GenerateFormularioInscripcionUseCase(deps) };
  };

  afterEach(() => jest.useRealTimers());

  it('exige las dependencias base', () => {
    const { deps } = crear();
    expect(() => new GenerateFormularioInscripcionUseCase({ ...deps, pdfGenerator: undefined })).toThrow();
    expect(() => new GenerateFormularioInscripcionUseCase({ ...deps, uploadsStorage: undefined })).toThrow();
    expect(() => new GenerateFormularioInscripcionUseCase({ ...deps, studentDocumentRepository: undefined })).toThrow();
  });

  it('genera el PDF, lo guarda y registra el documento INSCRIPCION', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute(5);

    expect(deps.studentRepository.obtenerDatosPersonales).toHaveBeenCalledWith({ id: 5 });
    expect(deps.enrollmentRepository.obtenerInscripcionActual).toHaveBeenCalledWith({ estudiante_id: 5, gestion_id: 3 });
    expect(deps.studentDocumentDeliveryRepository.obtenerEntregasConDetalle).toHaveBeenCalledWith(
      expect.objectContaining({ estudiante_id: 5, documento_padre_id: null, entregado: true })
    );

    const arg = deps.pdfGenerator.generateFormularioInscripcion.mock.calls[0][0];
    expect(arg.gestion).toBe(2026);
    expect(arg.student).toEqual(
      expect.objectContaining({
        codigoEstudiante: 'E1',
        trabaja: true,
        apoderados: [{ nombre: 'Mama' }],
        origenes: [],
        discapacidades: [],
      })
    );
    expect(arg.academicData).toEqual({ carreraNombre: 'Enfermeria', carreraCodigo: null, estadoAcademico: null, tipoAdmision: 'NUEVO' });
    expect(arg.enrollmentData).toEqual(
      expect.objectContaining({
        inscripcionId: 4,
        periodoNombre: 'Primero',
        paraleloLabel: 'A - MAÑANA (Primero)',
        materias: [expect.objectContaining({ sigla: 'ENF-101', horas: 4 }), expect.objectContaining({ sigla: 'ENF-102', horas: null })],
      })
    );
    expect(deps.uploadsStorage.saveToUploads).toHaveBeenCalledWith(
      expect.any(String),
      'formulario_inscripcion_E1.pdf',
      expect.any(Buffer)
    );
    expect(deps.studentDocumentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ studentId: 5, tipoDocumento: 'INSCRIPCION', extension: 'pdf', tipoMime: 'application/pdf', state: 'APROBADO' })
    );
    expect(res.fileName).toBe('formulario_inscripcion_E1.pdf');
  });

  it('si el documento ya está registrado con esa ruta lo actualiza en lugar de crearlo', async () => {
    const { useCase, deps } = crear();
    deps.studentDocumentRepository.findBy.mockResolvedValue({ id: 77 });
    await useCase.execute(5);
    expect(deps.studentDocumentRepository.update).toHaveBeenCalledWith(77, expect.objectContaining({ extension: 'pdf' }));
    expect(deps.studentDocumentRepository.create).not.toHaveBeenCalled();
  });

  it('si falla el guardado en BD igual devuelve el archivo generado', async () => {
    const { useCase, deps } = crear();
    deps.studentDocumentRepository.create.mockRejectedValue(new Error('db'));
    const res = await useCase.execute(5);
    expect(res.fileName).toBe('formulario_inscripcion_E1.pdf');
    expect(deps.logger.error).toHaveBeenCalled();
  });

  it('si el registro existe en BD pero el archivo no está en disco, regenera', async () => {
    const { useCase, deps } = crear();
    deps.studentDocumentRepository.findAll.mockResolvedValue({
      studentDocuments: [
        { tipoDocumento: 'INSCRIPCION', fileName: 'FORMULARIO_INSCRIPCION_1.pdf', extension: 'pdf', filePath: '/uploads/documentos/estudiantes/5/inexistente-xyz.pdf' },
      ],
    });
    await useCase.execute(5);
    expect(deps.pdfGenerator.generateFormularioInscripcion).toHaveBeenCalled();
  });

  it('estudiante inexistente: NotFoundError y no genera nada', async () => {
    const { useCase, deps } = crear();
    deps.studentRepository.obtenerDatosPersonales.mockResolvedValue([]);
    await expect(useCase.execute(99)).rejects.toThrow(NotFoundError);
    expect(deps.pdfGenerator.generateFormularioInscripcion).not.toHaveBeenCalled();
    expect(deps.uploadsStorage.saveToUploads).not.toHaveBeenCalled();
  });

  it('gestión actual no configurada: NotFoundError; valor no numérico: ValidationError; sin vigente: NotFoundError', async () => {
    const { useCase, deps } = crear();
    deps.configuracionSistemaRepository.findBy.mockResolvedValue(null);
    await expect(useCase.execute(5)).rejects.toThrow(NotFoundError);

    deps.configuracionSistemaRepository.findBy.mockResolvedValue({ value: 'abc' });
    await expect(useCase.execute(5)).rejects.toThrow(ValidationError);

    deps.configuracionSistemaRepository.findBy.mockResolvedValue({ value: '2026' });
    deps.managementRepository.findBy.mockResolvedValue(null);
    await expect(useCase.execute(5)).rejects.toThrow(NotFoundError);
    expect(deps.pdfGenerator.generateFormularioInscripcion).not.toHaveBeenCalled();
  });

  it('sin inscripción actual o con datos académicos/entregas fallidos, genera igual con valores por defecto', async () => {
    const { useCase, deps } = crear();
    deps.enrollmentRepository.obtenerInscripcionActual.mockResolvedValue([]);
    deps.studentAcademicDataRepository.obtenerDatosAcademicos.mockRejectedValue(new Error('x'));
    deps.studentDocumentDeliveryRepository.obtenerEntregasConDetalle.mockRejectedValue(new Error('y'));
    await useCase.execute(5);
    const arg = deps.pdfGenerator.generateFormularioInscripcion.mock.calls[0][0];
    expect(arg.enrollmentData).toBeNull();
    expect(arg.academicData).toBeNull();
    expect(arg.entregas).toEqual([]);
  });

  it('si el generador de PDF falla propaga el error sin guardar', async () => {
    const { useCase, deps } = crear();
    deps.pdfGenerator.generateFormularioInscripcion.mockRejectedValue(new Error('pdf'));
    await expect(useCase.execute(5)).rejects.toThrow('pdf');
    expect(deps.uploadsStorage.saveToUploads).not.toHaveBeenCalled();
  });

  describe('utilidades de fecha', () => {
    it('_formatFechaLiteral formatea fechas ISO y devuelve "—" para valores inválidos', () => {
      const { useCase } = crear();
      expect(useCase._formatFechaLiteral('2000-05-10')).toBe('10 de mayo de 2000');
      expect(useCase._formatFechaLiteral('2000-05-10T00:00:00.000Z')).toBe('10 de mayo de 2000');
      expect(useCase._formatFechaLiteral('')).toBe('—');
      expect(useCase._formatFechaLiteral(null)).toBe('—');
      expect(useCase._formatFechaLiteral('basura')).toBe('—');
      expect(useCase._formatFechaLiteral('2000-13-10')).toBe('—');
    });

    it('_calcEdad respeta el cumpleaños y rechaza fechas inválidas o futuras', () => {
      const { useCase } = crear();
      jest.useFakeTimers({ now: new Date(2026, 4, 9, 12) });
      expect(useCase._calcEdad('2000-05-10')).toBe('25');
      jest.setSystemTime(new Date(2026, 4, 10, 12));
      expect(useCase._calcEdad('2000-05-10')).toBe('26');
      expect(useCase._calcEdad('2030-01-01')).toBe('—');
      expect(useCase._calcEdad(undefined)).toBe('—');
      expect(useCase._calcEdad('abc')).toBe('—');
    });

    it('_getCurrentDate usa el mes en español', () => {
      const { useCase } = crear();
      jest.useFakeTimers({ now: new Date(2026, 8, 3, 12) });
      expect(useCase._getCurrentDate()).toBe('3 de septiembre de 2026');
    });
  });
});
