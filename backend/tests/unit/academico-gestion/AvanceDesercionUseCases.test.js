import { describe, it, expect, jest } from '@jest/globals';

const mockTryResolve = jest.fn();
jest.unstable_mockModule('../../../src/application/utils/resolveEstudianteIdForUsuario.js', () => ({
  tryResolveEstudianteIdForUsuario: mockTryResolve,
  resolveEstudianteIdForUsuario: jest.fn(),
}));

const { GetAvanceAcademicoUseCase } = await import('../../../src/application/use-cases/academico/GetAvanceAcademicoUseCase.js');
const { GetDesercionUseCase } = await import('../../../src/application/use-cases/academico/GetDesercionUseCase.js');
const { ExportAvanceAcademicoExcelUseCase } = await import('../../../src/application/use-cases/academico/ExportAvanceAcademicoExcelUseCase.js');
const { ExportDesercionExcelUseCase } = await import('../../../src/application/use-cases/academico/ExportDesercionExcelUseCase.js');
const { ValidationError } = await import('../../../src/domain/errors/AppError.js');

const logger = () => ({ info: jest.fn() });

describe('GetAvanceAcademicoUseCase', () => {
  const fila = {
    estudiante_id: '1', codigo_estudiante: 'E1', nombre_completo: 'Ana', carrera_id: 2, carrera_nombre: 'Mec',
    total_asignaturas_plan: 10, materias_aprobadas: 3, materias_convalidadas: 1, materias_avanzadas: 4, materias_registradas: 5,
  };
  const crear = (rows) => {
    const view = { listarAvance: jest.fn().mockResolvedValue(rows) };
    return {
      view,
      useCase: new GetAvanceAcademicoUseCase({ avanceAcademicoViewRepository: view, studentRepository: {}, userRepository: {}, logger: logger() }),
    };
  };

  it('exige repositorio y logger', () => {
    expect(() => new GetAvanceAcademicoUseCase({ logger: {} })).toThrow(/avanceAcademicoViewRepository/);
    expect(() => new GetAvanceAcademicoUseCase({ avanceAcademicoViewRepository: {} })).toThrow(/logger/);
  });

  it('alcance global: calcula porcentaje y resumen bajo la clave "avance" (dataKey del frontend)', async () => {
    const { useCase, view } = crear([fila, { ...fila, estudiante_id: 2, total_asignaturas_plan: 0 }]);
    const r = await useCase.execute({ carreraId: '2' });
    expect(view.listarAvance).toHaveBeenCalledWith({ carreraId: 2, estudianteId: null });
    expect(useCase.dataFieldName).toBe('avance');
    expect(r.avance[0]).toMatchObject({ estudianteId: 1, pctAvance: 40, materiasAvanzadas: 4 });
    expect(r.avance[1].pctAvance).toBeNull();
    expect(r.resumen).toEqual({ totalEstudiantes: 2, promedioPctAvance: 40 });
    expect(r.alcance).toBe('GLOBAL');
  });

  it('alcance propio cuando el usuario es un estudiante', async () => {
    mockTryResolve.mockResolvedValue(9);
    const { useCase, view } = crear([fila]);
    const r = await useCase.execute({ usuarioId: 3 });
    expect(view.listarAvance).toHaveBeenCalledWith({ carreraId: null, estudianteId: 9 });
    expect(r.alcance).toBe('PROPIO');
  });

  it('respuesta no arreglo y carrera inválida se tratan como vacío', async () => {
    const { useCase, view } = crear(null);
    const r = await useCase.execute({ carreraId: 'abc' });
    expect(view.listarAvance).toHaveBeenCalledWith({ carreraId: null, estudianteId: null });
    expect(r.avance).toEqual([]);
    expect(r.resumen.promedioPctAvance).toBeNull();
    await expect(useCase.execute()).resolves.toBeDefined();
  });
});

describe('GetDesercionUseCase', () => {
  const resumenRow = {
    gestion_id: 1, gestion_anio: 2026, carrera_id: 2, total_matriculas_materia: 20, matriculas_abandono: 2,
    matriculas_retiro: 1, total_estudiantes: 10, estudiantes_desercion: 3,
  };
  const crear = (resumen = [resumenRow], desertores = [{ estudiante_id: 5, nombre_completo: 'Beto' }]) => {
    const repo = {
      listarResumenCarreraGestion: jest.fn().mockResolvedValue(resumen),
      listarDesertores: jest.fn().mockResolvedValue(desertores),
    };
    return { repo, useCase: new GetDesercionUseCase({ desercionViewRepository: repo, logger: logger() }) };
  };

  it('exige repositorio y logger', () => {
    expect(() => new GetDesercionUseCase({ logger: {} })).toThrow(/desercionViewRepository/);
    expect(() => new GetDesercionUseCase({ desercionViewRepository: {} })).toThrow(/logger/);
  });

  it('agrega totales y porcentaje global', async () => {
    const { useCase, repo } = crear([resumenRow, { ...resumenRow, carrera_id: 3, total_estudiantes: 10, estudiantes_desercion: 1 }]);
    const r = await useCase.execute({ gestionId: '1', carreraId: 2 });
    expect(repo.listarResumenCarreraGestion).toHaveBeenCalledWith({ gestionId: 1, carreraId: 2 });
    expect(r.resumen).toMatchObject({ totalEstudiantes: 20, estudiantesDesercion: 4, matriculasAbandono: 4, pctEstudiantesDesercion: 20 });
    expect(r.desertores[0]).toMatchObject({ estudianteId: 5, nombreCompleto: 'Beto', codigo: null });
  });

  it('sin datos el porcentaje es null y tolera respuestas no arreglo', async () => {
    const { useCase } = crear(null, null);
    const r = await useCase.execute();
    expect(r.carreras).toEqual([]);
    expect(r.desertores).toEqual([]);
    expect(r.resumen.pctEstudiantesDesercion).toBeNull();
  });

  it('rechaza ids inválidos', async () => {
    const { useCase } = crear();
    await expect(useCase.execute({ gestionId: 0 })).rejects.toBeInstanceOf(ValidationError);
    await expect(useCase.execute({ carreraId: 'x' })).rejects.toThrow('carreraId inválido');
  });
});

describe('ExportAvanceAcademicoExcelUseCase', () => {
  const crear = (avance) => {
    const get = { execute: jest.fn().mockResolvedValue({ avance }) };
    const gen = { generarAvanceAcademico: jest.fn().mockResolvedValue(new Uint8Array([1])) };
    return { get, gen, useCase: new ExportAvanceAcademicoExcelUseCase({ getAvanceAcademicoUseCase: get, avanceAcademicoExcelGenerator: gen, logger: logger() }) };
  };

  it('exige dependencias', () => {
    expect(() => new ExportAvanceAcademicoExcelUseCase({ avanceAcademicoExcelGenerator: {}, logger: {} })).toThrow(/getAvance/);
    expect(() => new ExportAvanceAcademicoExcelUseCase({ getAvanceAcademicoUseCase: {}, logger: {} })).toThrow(/avanceAcademicoExcelGenerator/);
    expect(() => new ExportAvanceAcademicoExcelUseCase({ getAvanceAcademicoUseCase: {}, avanceAcademicoExcelGenerator: {} })).toThrow(/logger/);
  });

  it('con filtro de carrera incluye su nombre en el archivo', async () => {
    const { useCase, gen } = crear([{ carreraNombre: 'Mecánica Automotriz' }]);
    const r = await useCase.execute({ carreraId: 2 });
    expect(gen.generarAvanceAcademico).toHaveBeenCalledWith(expect.objectContaining({ carreraFiltro: 'Mecánica Automotriz' }));
    expect(r.fileName).toMatch(/^Avance_Academico_Mecanica_Automotriz_\d{4}-\d{2}-\d{2}\.xlsx$/);
    expect(Buffer.isBuffer(r.buffer)).toBe(true);
  });

  it('sin carrera no agrega fragmento de carrera', async () => {
    const { useCase } = crear([]);
    const r = await useCase.execute();
    expect(r.fileName).toMatch(/^Avance_Academico_\d{4}-\d{2}-\d{2}\.xlsx$/);
  });
});

describe('ExportDesercionExcelUseCase', () => {
  const crear = (payload) => {
    const get = { execute: jest.fn().mockResolvedValue(payload) };
    const gen = { generarReporteDesercion: jest.fn().mockResolvedValue(Buffer.from('x')) };
    return { get, gen, useCase: new ExportDesercionExcelUseCase({ getDesercionUseCase: get, desercionExcelGenerator: gen, logger: logger() }) };
  };
  const base = { gestionId: 1, carreraId: null, carreras: [{ gestionAnio: 2026 }], desertores: [], resumen: {} };

  it('exige dependencias', () => {
    expect(() => new ExportDesercionExcelUseCase({ desercionExcelGenerator: {}, logger: {} })).toThrow(/getDesercion/);
    expect(() => new ExportDesercionExcelUseCase({ getDesercionUseCase: {}, logger: {} })).toThrow(/desercionExcelGenerator/);
    expect(() => new ExportDesercionExcelUseCase({ getDesercionUseCase: {}, desercionExcelGenerator: {} })).toThrow(/logger/);
  });

  it('con gestión filtrada usa el año en el nombre', async () => {
    const { useCase, gen } = crear(base);
    const r = await useCase.execute({ gestionId: 1 });
    expect(gen.generarReporteDesercion).toHaveBeenCalledWith(expect.objectContaining({ gestionFiltro: '2026' }));
    expect(r.fileName).toMatch(/^Desercion_2026_/);
  });

  it('usa el nombre de gestión si no hay año y "Todas" sin filtro', async () => {
    const a = crear({ ...base, carreras: [{ gestionNombre: 'G-26' }] });
    expect((await a.useCase.execute({ gestionId: 1 })).fileName).toMatch(/^Desercion_G-26_/);
    const b = crear({ ...base, gestionId: null });
    expect((await b.useCase.execute()).fileName).toMatch(/^Desercion_Todas_/);
    const c = crear({ ...base, carreras: [] });
    expect((await c.useCase.execute()).fileName).toMatch(/^Desercion_Todas_/);
  });
});
