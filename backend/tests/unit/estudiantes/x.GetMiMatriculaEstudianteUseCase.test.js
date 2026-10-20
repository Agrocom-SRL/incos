import { jest } from '@jest/globals';
import { GetMiMatriculaEstudianteUseCase } from '../../../src/application/use-cases/estudiantes/GetMiMatriculaEstudianteUseCase.js';
import { ForbiddenError } from '../../../src/domain/errors/AppError.js';

describe('GetMiMatriculaEstudianteUseCase', () => {
  const filas = [
    { paralelo_gestion_id: '9', gestion_id: '3', gestion_anio: 2026, gestion_nombre: 'G2026', nombre_completo: 'Lopez Ana', codigo_estudiante: 'E1', estado: 'CURSANDO', asignatura_orden: 2, asignatura_sigla: 'B', asignatura_nombre: 'Beta', docente_nombre: 'Doc B' },
    { paralelo_gestion_id: '9', estado: 'INSCRITO', asignatura_orden: 1, asignatura_sigla: 'A', asignatura_nombre: 'Alfa' },
    { paralelo_gestion_id: '9', estado: 'RETIRADO', asignatura_orden: 3, asignatura_sigla: 'C', asignatura_nombre: 'Gama' },
    { paralelo_gestion_id: '9', estado: 'CURSANDO', asignatura_orden: 4, asignatura_sigla: 'A', asignatura_nombre: 'Alfa dup' },
  ];
  const crear = ({ rows = filas } = {}) => {
    const deps = {
      calificacionCentralizadorRepository: { listarFilasCentralizadorPorEstudiante: jest.fn().mockResolvedValue(rows) },
      studentRepository: { findAll: jest.fn().mockResolvedValue({ students: [{ id: 5 }] }), findById: jest.fn() },
      userRepository: { findById: jest.fn().mockResolvedValue(null) },
      parallelRepository: { obtenerCabeceraParaleloGestion: jest.fn().mockResolvedValue({ carrera_nombre: 'Enfermeria' }) },
      getParaleloGestionGrillaHorarioUseCase: { execute: jest.fn().mockResolvedValue({ bloques: [] }) },
      logger: { info: jest.fn(), warn: jest.fn() },
    };
    return { deps, useCase: new GetMiMatriculaEstudianteUseCase(deps) };
  };

  it('exige dependencias', () => {
    const ok = {
      calificacionCentralizadorRepository: {},
studentRepository: {},
userRepository: {},
      parallelRepository: {},
getParaleloGestionGrillaHorarioUseCase: {},
logger: {},
    };
    for (const k of Object.keys(ok)) {
      const rest = { ...ok };
      delete rest[k];
      expect(() => new GetMiMatriculaEstudianteUseCase(rest)).toThrow();
    }
  });

  it('arma la matrícula: materias activas ordenadas, sin retiradas ni duplicadas', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ usuarioId: 11 });

    expect(deps.calificacionCentralizadorRepository.listarFilasCentralizadorPorEstudiante).toHaveBeenCalledWith(5);
    expect(deps.parallelRepository.obtenerCabeceraParaleloGestion).toHaveBeenCalledWith(9);
    expect(deps.getParaleloGestionGrillaHorarioUseCase.execute).toHaveBeenCalledWith(9);
    expect(res.materias.map((m) => m.asignaturaSigla)).toEqual(['A', 'B']);
    expect(res.materias[1]).toEqual({ asignaturaSigla: 'B', asignaturaNombre: 'Beta', docenteNombre: 'Doc B' });
    expect(res.paraleloGestionId).toBe(9);
    expect(res.carrera).toEqual({ nombre: 'Enfermeria' });
    expect(res.gestion).toEqual({ id: 3, anio: 2026, nombre: 'G2026' });
    expect(res.estudiante).toEqual({ nombre: 'Lopez Ana', codigo: 'E1' });
    expect(res.horario).toEqual({ bloques: [] });
  });

  it('no muta el arreglo de filas del repositorio al ordenar', async () => {
    const { useCase } = crear();
    const copia = filas.map((f) => f.asignatura_sigla);
    await useCase.execute({ usuarioId: 11 });
    expect(filas.map((f) => f.asignatura_sigla)).toEqual(copia);
  });

  it('sin filas devuelve respuesta vacía sin consultar paralelo ni horario', async () => {
    const { useCase, deps } = crear({ rows: [] });
    const res = await useCase.execute({ usuarioId: 11 });
    expect(res).toEqual({
      estudiante: { nombre: null, codigo: null },
      gestion: null,
      carrera: null,
      paraleloGestionId: null,
      materias: [],
      horario: null,
    });
    expect(deps.parallelRepository.obtenerCabeceraParaleloGestion).not.toHaveBeenCalled();
    expect(deps.getParaleloGestionGrillaHorarioUseCase.execute).not.toHaveBeenCalled();
  });

  it('si falla la carrera o el horario, degrada a null y avisa', async () => {
    const { useCase, deps } = crear();
    deps.parallelRepository.obtenerCabeceraParaleloGestion.mockRejectedValue(new Error('x'));
    deps.getParaleloGestionGrillaHorarioUseCase.execute.mockRejectedValue(new Error('y'));
    const res = await useCase.execute({ usuarioId: 11 });
    expect(res.carrera).toBeNull();
    expect(res.horario).toBeNull();
    expect(res.materias).toHaveLength(2);
    expect(deps.logger.warn).toHaveBeenCalledTimes(2);
  });

  it('usuario sin estudiante vinculado lanza ForbiddenError', async () => {
    const { useCase, deps } = crear();
    deps.studentRepository.findAll.mockResolvedValue({ students: [] });
    await expect(useCase.execute({ usuarioId: 11 })).rejects.toThrow(ForbiddenError);
    expect(deps.calificacionCentralizadorRepository.listarFilasCentralizadorPorEstudiante).not.toHaveBeenCalled();
  });
});
