import { jest } from '@jest/globals';
import { GetMiBoletinEstudianteUseCase } from '../../../src/application/use-cases/academico/GetMiBoletinEstudianteUseCase.js';
import { ForbiddenError } from '../../../src/domain/errors/AppError.js';

const fila = (over = {}) => ({
  paralelo_gestion_id: '7',
  gestion_id: 1,
  gestion_anio: 2026,
  gestion_nombre: 'Gestión 2026',
  codigo_estudiante: 'E1',
  nombre_completo: 'Ana Pérez',
  ci: '123',
  asignatura_sigla: 'MAT',
  asignatura_nombre: 'Matemática',
  asignatura_orden: 1,
  docente_nombre: 'Doc',
  bim1: '60.5',
  bim2: 70,
  bim3: null,
  bim4: null,
  promedio_anual: '65.25',
  nota_final: null,
  estado: 'CURSANDO',
  ...over,
});

describe('GetMiBoletinEstudianteUseCase', () => {
  const crear = (filas) => {
    const deps = {
      calificacionCentralizadorRepository: {
        listarFilasCentralizadorPorEstudiante: jest.fn().mockResolvedValue(filas),
      },
      studentRepository: {
        findAll: jest.fn().mockResolvedValue({ students: [{ id: 42 }] }),
        findById: jest.fn(),
      },
      userRepository: { findById: jest.fn() },
      parallelRepository: {
        obtenerCabeceraParaleloGestion: jest.fn().mockResolvedValue({ carrera_nombre: 'Enfermería' }),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GetMiBoletinEstudianteUseCase(deps) };
  };

  it.each([
    'calificacionCentralizadorRepository',
    'studentRepository',
    'userRepository',
    'parallelRepository',
    'logger',
  ])('exige %s', (k) => {
    const { deps } = crear([]);
    const resto = { ...deps };
    delete resto[k];
    expect(() => new GetMiBoletinEstudianteUseCase(resto)).toThrow(`${k} es requerido`);
  });

  it('resuelve el estudiante desde el usuario de sesión y lista sus filas', async () => {
    const { useCase, deps } = crear([fila()]);
    await useCase.execute({ usuarioId: 3 });
    expect(deps.studentRepository.findAll).toHaveBeenCalledWith({ userId: 3 });
    expect(
      deps.calificacionCentralizadorRepository.listarFilasCentralizadorPorEstudiante
    ).toHaveBeenCalledWith(42);
  });

  it('usuario no vinculado a un estudiante lanza ForbiddenError sin consultar notas', async () => {
    const { useCase, deps } = crear([fila()]);
    deps.studentRepository.findAll.mockResolvedValue([]);
    deps.userRepository.findById.mockResolvedValue({ referenceType: 'DOCENTE', referenceId: 1 });
    await expect(useCase.execute({ usuarioId: 3 })).rejects.toThrow(ForbiddenError);
    expect(
      deps.calificacionCentralizadorRepository.listarFilasCentralizadorPorEstudiante
    ).not.toHaveBeenCalled();
  });

  it.each([[[]], [null]])('sin filas (%p) devuelve boletín vacío', async (filas) => {
    const { useCase, deps } = crear(filas);
    const r = await useCase.execute({ usuarioId: 3 });
    expect(r).toEqual({
      gestion: null,
      estudiante: { codigo: null, nombreCompleto: null, ci: null },
      carrera: null,
      asignaturas: [],
      promedioGeneral: null,
      paraleloGestionId: null,
    });
    expect(deps.parallelRepository.obtenerCabeceraParaleloGestion).not.toHaveBeenCalled();
  });

  it('arma el boletín: gestión, estudiante, carrera, asignaturas numéricas y promedio', async () => {
    const filas = [
      fila({ asignatura_orden: 2, asignatura_sigla: 'LEN', promedio_anual: 80, bim1: 80 }),
      fila(),
    ];
    const { useCase, deps } = crear(filas);
    const r = await useCase.execute({ usuarioId: 3 });

    expect(deps.parallelRepository.obtenerCabeceraParaleloGestion).toHaveBeenCalledWith(7);
    expect(r.paraleloGestionId).toBe(7);
    expect(r.gestion).toEqual({ id: 1, anio: 2026, nombre: 'Gestión 2026' });
    expect(r.estudiante).toEqual({ codigo: 'E1', nombreCompleto: 'Ana Pérez', ci: '123' });
    expect(r.carrera).toEqual({ nombre: 'Enfermería' });
    expect(r.asignaturas.map((a) => a.asignaturaSigla)).toEqual(['MAT', 'LEN']);
    expect(r.asignaturas[0]).toEqual({
      asignaturaSigla: 'MAT',
      asignaturaNombre: 'Matemática',
      docenteNombre: 'Doc',
      bim1: 60.5,
      bim2: 70,
      bim3: null,
      bim4: null,
      promedioAnual: 65.25,
      notaFinal: null,
      estado: 'CURSANDO',
    });
    expect(r.promedioGeneral).toBe(72.63);
  });

  it('promedioGeneral es null si ninguna asignatura tiene promedio anual', async () => {
    const { useCase } = crear([fila({ promedio_anual: null })]);
    const r = await useCase.execute({ usuarioId: 3 });
    expect(r.promedioGeneral).toBeNull();
  });

  it('si falla la cabecera del paralelo, carrera queda null y registra advertencia', async () => {
    const { useCase, deps } = crear([fila()]);
    deps.parallelRepository.obtenerCabeceraParaleloGestion.mockRejectedValue(new Error('boom'));
    const r = await useCase.execute({ usuarioId: 3 });
    expect(r.carrera).toBeNull();
    expect(r.asignaturas).toHaveLength(1);
    expect(deps.logger.warn).toHaveBeenCalled();
  });

  it('cabecera sin carrera_nombre deja carrera null', async () => {
    const { useCase, deps } = crear([fila()]);
    deps.parallelRepository.obtenerCabeceraParaleloGestion.mockResolvedValue({});
    const r = await useCase.execute({ usuarioId: 3 });
    expect(r.carrera).toBeNull();
  });
});
