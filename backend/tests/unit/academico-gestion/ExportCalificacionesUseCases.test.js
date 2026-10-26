import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const sanitizar = (v) => String(v ?? '').replace(/[^\dA-Za-z._-]/g, '_') || 'export';
const mockConstruirCentralizador = jest.fn();
const mockConstruirBoletin = jest.fn();
const mockConstruirHoja = jest.fn();
const mockEstadisticas = jest.fn();
const mockRegistroPayload = jest.fn();
const mockAssertAcceso = jest.fn();
const mockCuotas = jest.fn();
const mockResolverEstudiante = jest.fn();

jest.unstable_mockModule('../../../src/application/utils/centralizadorExcelDatos.js', () => ({
  construirDatosCentralizadorParalelo: mockConstruirCentralizador,
  sanitizarFilePart: sanitizar,
}));
jest.unstable_mockModule('../../../src/application/utils/boletinPdfDatos.js', () => ({
  construirDatosBoletinEstudiante: mockConstruirBoletin,
}));
jest.unstable_mockModule('../../../src/application/utils/libroFolioExcelDatos.js', () => ({
  construirHojaParalelo: mockConstruirHoja,
}));
jest.unstable_mockModule(
  '../../../src/application/use-cases/academico/libros/helpers/estadisticasParaleloHelper.js',
  () => ({ calcularEstadisticasParalelo: mockEstadisticas })
);
jest.unstable_mockModule('../../../src/application/mappers/academico/registroPedagogicoExcelMapper.js', () => ({
  construirRegistroPedagogicoExcelPayload: mockRegistroPayload,
}));
jest.unstable_mockModule('../../../src/application/utils/cuadernoCursoAccess.js', () => ({
  assertCuadernoCursoAccess: mockAssertAcceso,
}));
jest.unstable_mockModule('../../../src/application/utils/obtenerCuotasDesdePolitica.js', () => ({
  cargarCuotasPoliticaGestion: mockCuotas,
}));
jest.unstable_mockModule('../../../src/application/utils/resolveEstudianteIdForUsuario.js', () => ({
  resolveEstudianteIdForUsuario: mockResolverEstudiante,
}));

const { ExportCentralizadorParaleloBimestreExcelUseCase } = await import(
  '../../../src/application/use-cases/academico/ExportCentralizadorParaleloBimestreExcelUseCase.js'
);
const { ExportCentralizadorCarreraBimestreExcelUseCase } = await import(
  '../../../src/application/use-cases/academico/ExportCentralizadorCarreraBimestreExcelUseCase.js'
);
const { ExportBoletinEstudiantePdfUseCase } = await import(
  '../../../src/application/use-cases/academico/ExportBoletinEstudiantePdfUseCase.js'
);
const { ExportMiBoletinEstudiantePdfUseCase } = await import(
  '../../../src/application/use-cases/academico/ExportMiBoletinEstudiantePdfUseCase.js'
);
const { ExportCentralizadorAnualParaleloExcelUseCase } = await import(
  '../../../src/application/use-cases/academico/ExportCentralizadorAnualParaleloExcelUseCase.js'
);
const { ExportRegistroPedagogicoBimestreUseCase } = await import(
  '../../../src/application/use-cases/academico/ExportRegistroPedagogicoBimestreUseCase.js'
);
const { NotFoundError, ValidationError, ForbiddenError } = await import(
  '../../../src/domain/errors/AppError.js'
);

const XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const logger = () => ({ info: jest.fn() });

beforeEach(() => jest.clearAllMocks());

describe('ExportCentralizadorParaleloBimestreExcelUseCase', () => {
  const crear = () => {
    const deps = {
      getCentralizadorParaleloUseCase: { execute: jest.fn().mockResolvedValue({ m: 1 }) },
      parallelRepository: { obtenerCabeceraParaleloGestion: jest.fn().mockResolvedValue({ c: 1 }) },
      centralizadorExcelGenerator: { generarCentralizadorParaleloBimestre: jest.fn().mockResolvedValue(new Uint8Array([1])) },
      logger: logger(),
    };
    mockConstruirCentralizador.mockReturnValue({
      datos: { estudiantes: [1], asignaturas: [1, 2] },
      carrera: 'Mec', periodo: 'Primero', paralelo: 'A', gestionAnio: '2026',
    });
    return { deps, useCase: new ExportCentralizadorParaleloBimestreExcelUseCase(deps) };
  };

  it('exige dependencias', () => {
    const { deps } = crear();
    for (const k of Object.keys(deps)) {
      expect(() => new ExportCentralizadorParaleloBimestreExcelUseCase({ ...deps, [k]: null })).toThrow(/requerido/);
    }
  });

  it('genera el Excel del bimestre', async () => {
    const { useCase, deps } = crear();
    const r = await useCase.execute({ paraleloGestionId: '4', bimestre: '2' });
    expect(mockConstruirCentralizador).toHaveBeenCalledWith({ matriz: { m: 1 }, cabeceraRow: { c: 1 }, bimestre: 2 });
    expect(deps.centralizadorExcelGenerator.generarCentralizadorParaleloBimestre).toHaveBeenCalled();
    expect(r.fileName).toBe('Centralizador_Mec_Primero_A_Bim2_2026.xlsx');
    expect(r.mimeType).toBe(XLSX);
    expect(Buffer.isBuffer(r.buffer)).toBe(true);
  });

  it('paralelo o bimestre inválidos son NotFound', async () => {
    const { useCase } = crear();
    await expect(useCase.execute({ paraleloGestionId: 0, bimestre: 1 })).rejects.toBeInstanceOf(NotFoundError);
    await expect(useCase.execute({ paraleloGestionId: 'x', bimestre: 1 })).rejects.toBeInstanceOf(NotFoundError);
    await expect(useCase.execute({ paraleloGestionId: 1, bimestre: 5 })).rejects.toBeInstanceOf(NotFoundError);
    await expect(useCase.execute({ paraleloGestionId: 1, bimestre: 'x' })).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('ExportCentralizadorCarreraBimestreExcelUseCase', () => {
  const crear = () => {
    const deps = {
      getCentralizadorParaleloUseCase: { execute: jest.fn().mockResolvedValue({}) },
      parallelRepository: {
        obtenerCabeceraParaleloGestion: jest.fn().mockResolvedValue({ carrera_id: 8, carrera_nombre: 'Mecánica' }),
        listarParalelosPorCarreraGestionVigente: jest.fn().mockResolvedValue([
          { paralelo_gestion_id: 1, paralelo_nombre: ' A ', cantidad_estudiantes: 10 },
          { paralelo_gestion_id: 2, paralelo_nombre: 'B', cantidad_estudiantes: 0 },
          { paralelo_gestion_id: 3, paralelo_nombre: 'C', cantidad_estudiantes: '5' },
        ]),
      },
      centralizadorExcelGenerator: { generarCentralizadorCarreraBimestre: jest.fn().mockResolvedValue(Buffer.from('x')) },
      logger: logger(),
    };
    mockConstruirCentralizador.mockReturnValue({ datos: { estudiantes: [1, 2] }, gestionAnio: '2026' });
    return { deps, useCase: new ExportCentralizadorCarreraBimestreExcelUseCase(deps) };
  };

  it('exige dependencias', () => {
    const { deps } = crear();
    for (const k of Object.keys(deps)) {
      expect(() => new ExportCentralizadorCarreraBimestreExcelUseCase({ ...deps, [k]: null })).toThrow(/requerido/);
    }
  });

  it('arma una hoja por paralelo con matrícula', async () => {
    const { useCase, deps } = crear();
    const r = await useCase.execute({ paraleloGestionId: 1, bimestre: 3 });
    const arg = deps.centralizadorExcelGenerator.generarCentralizadorCarreraBimestre.mock.calls[0][0];
    expect(arg.hojas.map((h) => h.nombreHoja)).toEqual(['A', 'C']);
    expect(arg.carrera).toEqual({ nombre: 'Mecánica', bimestre: 3, gestionAnio: '2026' });
    expect(deps.getCentralizadorParaleloUseCase.execute).toHaveBeenCalledTimes(2);
    expect(r.fileName).toBe('Centralizador_Mec_nica_Bim3_2026.xlsx');
  });

  it('valida entrada, carrera y paralelos con matrícula', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ paraleloGestionId: 0, bimestre: 1 })).rejects.toBeInstanceOf(NotFoundError);
    await expect(useCase.execute({ paraleloGestionId: 1, bimestre: 0 })).rejects.toBeInstanceOf(NotFoundError);
    deps.parallelRepository.obtenerCabeceraParaleloGestion.mockResolvedValueOnce({});
    await expect(useCase.execute({ paraleloGestionId: 1, bimestre: 1 })).rejects.toThrow('Carrera del paralelo');
    deps.parallelRepository.listarParalelosPorCarreraGestionVigente.mockResolvedValueOnce(null);
    await expect(useCase.execute({ paraleloGestionId: 1, bimestre: 1 })).rejects.toThrow('Paralelos con matrícula');
  });
});

describe('ExportBoletinEstudiantePdfUseCase', () => {
  const crear = () => {
    const deps = {
      getCentralizadorParaleloUseCase: { execute: jest.fn().mockResolvedValue({ m: 1 }) },
      parallelRepository: { obtenerCabeceraParaleloGestion: jest.fn().mockResolvedValue({ c: 1 }) },
      boletinPdfGenerator: { generarBoletinEstudiante: jest.fn().mockResolvedValue(new Uint8Array([1])) },
      calificacionCentralizadorRepository: { listarDesgloseBimestrePorEstudiante: jest.fn().mockResolvedValue([{ d: 1 }]) },
      logger: logger(),
    };
    mockConstruirBoletin.mockReturnValue({
      datos: { filas: [1, 2] },
      fileNameParts: { estudiante: 'Ana P', carrera: 'Mec', paralelo: 'A', gestion: '2026' },
    });
    return { deps, useCase: new ExportBoletinEstudiantePdfUseCase(deps) };
  };

  it('exige dependencias', () => {
    expect(() => new ExportBoletinEstudiantePdfUseCase({ parallelRepository: {}, boletinPdfGenerator: {}, logger: {} })).toThrow(/getCentralizador/);
    expect(() => new ExportBoletinEstudiantePdfUseCase({ getCentralizadorParaleloUseCase: {}, boletinPdfGenerator: {}, logger: {} })).toThrow(/parallelRepository/);
    expect(() => new ExportBoletinEstudiantePdfUseCase({ getCentralizadorParaleloUseCase: {}, parallelRepository: {}, logger: {} })).toThrow(/boletinPdfGenerator/);
    expect(() => new ExportBoletinEstudiantePdfUseCase({ getCentralizadorParaleloUseCase: {}, parallelRepository: {}, boletinPdfGenerator: {} })).toThrow(/logger/);
  });

  it('boletín anual: sin desglose de bimestre', async () => {
    const { useCase, deps } = crear();
    const r = await useCase.execute({ paraleloGestionId: 4, estudianteId: 9 });
    expect(deps.calificacionCentralizadorRepository.listarDesgloseBimestrePorEstudiante).not.toHaveBeenCalled();
    expect(mockConstruirBoletin).toHaveBeenCalledWith(expect.objectContaining({ bimestre: null, desgloseBimestre: null }));
    expect(r.fileName).toBe('Boletin_Ana_P_Mec_A_2026.pdf');
    expect(r.mimeType).toBe('application/pdf');
  });

  it('boletín bimestral: incluye desglose y sufijo', async () => {
    const { useCase, deps } = crear();
    const r = await useCase.execute({ paraleloGestionId: 4, estudianteId: 9, bimestre: '2' });
    expect(deps.calificacionCentralizadorRepository.listarDesgloseBimestrePorEstudiante).toHaveBeenCalledWith(4, 9, 2);
    expect(r.fileName).toMatch(/_Bimestre2\.pdf$/);
  });

  it('valida ids, bimestre, repositorio de desglose y estudiante inexistente', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ paraleloGestionId: 0, estudianteId: 1 })).rejects.toBeInstanceOf(NotFoundError);
    await expect(useCase.execute({ paraleloGestionId: 1, estudianteId: 'x' })).rejects.toBeInstanceOf(NotFoundError);
    await expect(useCase.execute({ paraleloGestionId: 1, estudianteId: 1, bimestre: 7 })).rejects.toBeInstanceOf(ValidationError);
    await expect(useCase.execute({ paraleloGestionId: 1, estudianteId: 1, bimestre: 1.5 })).rejects.toBeInstanceOf(ValidationError);
    deps.calificacionCentralizadorRepository = null;
    useCase.calificacionCentralizadorRepository = null;
    await expect(useCase.execute({ paraleloGestionId: 1, estudianteId: 1, bimestre: 1 })).rejects.toThrow('calificacionCentralizadorRepository');
    mockConstruirBoletin.mockReturnValue(null);
    await expect(useCase.execute({ paraleloGestionId: 1, estudianteId: 1 })).rejects.toThrow('Estudiante');
  });
});

describe('ExportMiBoletinEstudiantePdfUseCase', () => {
  const crear = () => {
    const deps = {
      calificacionCentralizadorRepository: { listarFilasCentralizadorPorEstudiante: jest.fn().mockResolvedValue([{ paralelo_gestion_id: '4' }]) },
      studentRepository: {},
      userRepository: {},
      exportBoletinEstudiantePdfUseCase: { execute: jest.fn().mockResolvedValue({ fileName: 'b.pdf' }) },
      logger: logger(),
    };
    mockResolverEstudiante.mockResolvedValue(9);
    return { deps, useCase: new ExportMiBoletinEstudiantePdfUseCase(deps) };
  };

  it('exige dependencias', () => {
    const { deps } = crear();
    for (const k of Object.keys(deps)) {
      expect(() => new ExportMiBoletinEstudiantePdfUseCase({ ...deps, [k]: null })).toThrow(/requerido/);
    }
  });

  it('deriva el paralelo del estudiante de la sesión y delega en el boletín', async () => {
    const { useCase, deps } = crear();
    const r = await useCase.execute({ usuarioId: 3, bimestre: 2 });
    expect(mockResolverEstudiante).toHaveBeenCalledWith(expect.objectContaining({ usuarioId: 3 }));
    expect(deps.exportBoletinEstudiantePdfUseCase.execute).toHaveBeenCalledWith({
      paraleloGestionId: 4,
      estudianteId: 9,
      bimestre: 2,
    });
    expect(r.fileName).toBe('b.pdf');
  });

  it('sin filas de centralizador es NotFound', async () => {
    const { useCase, deps } = crear();
    deps.calificacionCentralizadorRepository.listarFilasCentralizadorPorEstudiante.mockResolvedValue([]);
    await expect(useCase.execute({ usuarioId: 3 })).rejects.toBeInstanceOf(NotFoundError);
    deps.calificacionCentralizadorRepository.listarFilasCentralizadorPorEstudiante.mockResolvedValue(null);
    await expect(useCase.execute({ usuarioId: 3 })).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('ExportCentralizadorAnualParaleloExcelUseCase', () => {
  const folio = { id: 1, numero_libro: 5, codigo_registro: 'R1', carrera_nombre: 'Mec', carrera_codigo: 'MEC', gestion_anio: 2026, paralelo_nombre: 'A' };
  const crear = () => {
    const deps = {
      libroRegistroViewRepository: { listarFoliosPorParaleloGestion: jest.fn().mockResolvedValue([folio, { ...folio, id: 2 }]) },
      libroRegistroRepository: { listarEstudiantesFolio: jest.fn().mockResolvedValue([{ e: 1 }]) },
      calificacionCentralizadorRepository: { listarFilasCentralizadorPorParaleloGestion: jest.fn().mockResolvedValue([]) },
      libroRegistroExcelGenerator: { generarLibroRegistro: jest.fn().mockResolvedValue(Buffer.from('x')) },
      logger: logger(),
    };
    mockEstadisticas.mockReturnValue({ s: 1 });
    mockConstruirHoja.mockReturnValue({ hoja: 1 });
    return { deps, useCase: new ExportCentralizadorAnualParaleloExcelUseCase(deps) };
  };

  it('exige dependencias', () => {
    const { deps } = crear();
    for (const k of Object.keys(deps)) {
      expect(() => new ExportCentralizadorAnualParaleloExcelUseCase({ ...deps, [k]: null })).toThrow(/requerido/);
    }
  });

  it('arma la hoja del paralelo con los estudiantes de cada folio', async () => {
    const { useCase, deps } = crear();
    const r = await useCase.execute({ paraleloGestionId: 4 });
    expect(deps.libroRegistroRepository.listarEstudiantesFolio).toHaveBeenCalledTimes(2);
    const hojaArg = mockConstruirHoja.mock.calls[0][0];
    expect(hojaArg.estudiantesPorFolio.get(2)).toEqual([{ e: 1 }]);
    expect(deps.libroRegistroExcelGenerator.generarLibroRegistro).toHaveBeenCalledWith({
      libro: { numeroLibro: 5, codigoRegistro: 'R1', carreraNombre: 'Mec', gestionAnio: 2026 },
      hojas: [{ hoja: 1 }],
    });
    expect(r.fileName).toBe('Centralizador_Anual_MEC_A_2026.xlsx');
  });

  it('valida paralelo y que existan folios', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ paraleloGestionId: 0 })).rejects.toBeInstanceOf(NotFoundError);
    deps.libroRegistroViewRepository.listarFoliosPorParaleloGestion.mockResolvedValue([]);
    await expect(useCase.execute({ paraleloGestionId: 4 })).rejects.toBeInstanceOf(ValidationError);
    deps.libroRegistroViewRepository.listarFoliosPorParaleloGestion.mockResolvedValue(null);
    await expect(useCase.execute({ paraleloGestionId: 4 })).rejects.toBeInstanceOf(ValidationError);
  });

  it('tolera datos de folio incompletos', async () => {
    const { useCase, deps } = crear();
    deps.libroRegistroViewRepository.listarFoliosPorParaleloGestion.mockResolvedValue([{ id: 1 }]);
    const r = await useCase.execute({ paraleloGestionId: 4 });
    expect(r.fileName).toBe('Centralizador_Anual_export_export_export.xlsx');
  });
});

describe('ExportRegistroPedagogicoBimestreUseCase', () => {
  const crear = () => {
    const deps = {
      calificacionCoordinacionRepository: {
        obtenerCursoPorAsignacion: jest.fn().mockResolvedValue({ docente_id: '6' }),
        obtenerDocenteCalificaciones: jest.fn().mockResolvedValue({ d: 1 }),
      },
      calificacionContextoRepository: {
        obtenerPeriodosBimestresGestion: jest.fn().mockResolvedValue([{ numero_orden: 2, estado_calendario: 'cerrado' }]),
        obtenerContextoVigente: jest.fn().mockResolvedValue({ ctx: 1 }),
      },
      cuadernoRepository: {
        obtenerPeriodoAcademicoId: jest.fn().mockResolvedValue(77),
        listarEvaluaciones: jest.fn().mockResolvedValue([1]),
        listarEstudiantesExportRegistroPedagogico: jest.fn().mockResolvedValue([2]),
        listarTodasNotasBimestreCuaderno: jest.fn().mockResolvedValue([3]),
      },
      evaluationConfigurationRepository: {},
      teacherRepository: {},
      userRepository: {},
      authRepository: {},
      registroPedagogicoExcelGenerator: { generarRegistroPedagogicoBimestre: jest.fn().mockResolvedValue(Buffer.from('x')) },
      logger: logger(),
    };
    mockAssertAcceso.mockResolvedValue({ bimestreVigente: 3, gestionId: 5 });
    mockCuotas.mockResolvedValue({ p: 1 });
    mockRegistroPayload.mockReturnValue({ codigo_asignatura: 'MAT-101', bimestre: 'SEGUNDO', gestion: '2026', estudiantes: [1] });
    return { deps, useCase: new ExportRegistroPedagogicoBimestreUseCase(deps) };
  };

  it('exporta un bimestre cerrado', async () => {
    const { useCase, deps } = crear();
    const r = await useCase.execute({ usuarioId: 1, asignacionId: '9', bimestre: '2' });
    expect(mockAssertAcceso).toHaveBeenCalledWith(expect.objectContaining({ usuarioId: 1, asignacionId: 9 }));
    expect(deps.cuadernoRepository.obtenerPeriodoAcademicoId).toHaveBeenCalledWith(5, 2);
    expect(mockRegistroPayload).toHaveBeenCalledWith(expect.objectContaining({
      bimestreNum: 2, periodoId: 77, filasEvaluaciones: [1], filasEstudiantes: [2], filasNotas: [3], politica: { p: 1 },
    }));
    expect(deps.calificacionCoordinacionRepository.obtenerDocenteCalificaciones).toHaveBeenCalledWith(6);
    expect(r.fileName).toBe('registro_pedagogico_MAT-101_SEGUNDO_2026.xlsx');
  });

  it('también es exportable si el bimestre es anterior al vigente aunque el calendario no diga cerrado', async () => {
    const { useCase, deps } = crear();
    deps.calificacionContextoRepository.obtenerPeriodosBimestresGestion.mockResolvedValue(null);
    await expect(useCase.execute({ usuarioId: 1, asignacionId: 9, bimestre: 2 })).resolves.toBeDefined();
  });

  it('rechaza bimestre inválido, no cerrado, sin periodo o sin curso', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ usuarioId: 1, asignacionId: 9, bimestre: 9 })).rejects.toBeInstanceOf(NotFoundError);
    mockAssertAcceso.mockResolvedValue({ bimestreVigente: 2, gestionId: 5 });
    deps.calificacionContextoRepository.obtenerPeriodosBimestresGestion.mockResolvedValue([{ numero_orden: 2, estado_calendario: 'vigente' }]);
    await expect(useCase.execute({ usuarioId: 1, asignacionId: 9, bimestre: 2 })).rejects.toBeInstanceOf(ForbiddenError);
    mockAssertAcceso.mockResolvedValue({ bimestreVigente: 3, gestionId: 5 });
    deps.cuadernoRepository.obtenerPeriodoAcademicoId.mockResolvedValue(null);
    await expect(useCase.execute({ usuarioId: 1, asignacionId: 9, bimestre: 2 })).rejects.toThrow('Periodo académico');
    deps.cuadernoRepository.obtenerPeriodoAcademicoId.mockResolvedValue(77);
    deps.calificacionCoordinacionRepository.obtenerCursoPorAsignacion.mockResolvedValue(null);
    await expect(useCase.execute({ usuarioId: 1, asignacionId: 9, bimestre: 2 })).rejects.toThrow('Curso');
  });
});
