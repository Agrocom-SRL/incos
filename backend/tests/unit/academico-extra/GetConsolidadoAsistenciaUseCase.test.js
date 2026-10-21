import { describe, it, expect, jest } from '@jest/globals';
import { GetConsolidadoAsistenciaUseCase } from '../../../src/application/use-cases/academico/asistencia/GetConsolidadoAsistenciaUseCase.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';
import { crearLogger } from './asistenciaTestUtils.js';

describe('GetConsolidadoAsistenciaUseCase', () => {
  const fila = (o = {}) => ({
    gestion_id: 3,
gestion_anio: 2026,
oferta_curso_id: 100,
asignacion_docente_id: 20,
    asignatura_sigla: 'MAT',
asignatura_nombre: 'Matemática',
asignatura_orden: 1,
    docente_nombre: 'Ana',
registro_estado: 'CERRADO',
estudiante_id: 1,
estudiante_codigo: 'E1',
    estudiante_nombre: 'Zoila',
matricula_materia_id: 9,
    sesiones_computadas: 10,
faltas_no_neutralizadas: 2,
ausencias: 1,
tardanzas: 2,
neutralizadas_licencia: 0,
    ...o,
  });
  const crear = (rows = [fila()]) => {
    const repo = { listarFilasConsolidado: jest.fn().mockResolvedValue(rows) };
    const logger = crearLogger();
    return { repo, logger, useCase: new GetConsolidadoAsistenciaUseCase({ asistenciaConsolidadoViewRepository: repo, logger }) };
  };

  it('pivota a matriz y calcula el % por celda y el promedio', async () => {
    const { useCase, repo } = crear();
    const res = await useCase.execute({ paraleloGestionId: '4', bimestre: '2' });
    expect(repo.listarFilasConsolidado).toHaveBeenCalledWith({ paraleloGestionId: 4, bimestre: 2 });
    expect(res.paraleloGestionId).toBe(4);
    expect(res.gestionId).toBe(3);
    expect(res.gestionAnio).toBe(2026);
    expect(res.bimestre).toBe(2);
    expect(res.asignaturas).toEqual([{
      ofertaCursoId: 100,
asignacionDocenteId: 20,
sigla: 'MAT',
nombre: 'Matemática',
orden: 1,
      docenteNombre: 'Ana',
registroEstado: 'CERRADO',
    }]);
    expect(res.estudiantes[0].asistencia[100]).toEqual({
      matriculaMateriaId: 9, sesiones: 10, faltas: 2, ausencias: 1, tardanzas: 2, licencias: 0, pctAsistencia: 80,
    });
    expect(res.estudiantes[0].promedioPct).toBe(80);
  });

  it('sin bimestre acumula sesiones y faltas y deja registroEstado en null', async () => {
    const { useCase, repo } = crear([fila(), fila({ sesiones_computadas: 10, faltas_no_neutralizadas: 0, registro_estado: 'ABIERTO' })]);
    const res = await useCase.execute({ paraleloGestionId: 4 });
    expect(repo.listarFilasConsolidado).toHaveBeenCalledWith({ paraleloGestionId: 4, bimestre: null });
    expect(res.bimestre).toBeNull();
    expect(res.asignaturas[0].registroEstado).toBeNull();
    expect(res.estudiantes[0].asistencia[100]).toMatchObject({ sesiones: 20, faltas: 2, pctAsistencia: 90 });
  });

  it.each([[''], [null]])('trata bimestre %p como acumulado anual', async (bimestre) => {
    const { useCase, repo } = crear();
    await useCase.execute({ paraleloGestionId: 4, bimestre });
    expect(repo.listarFilasConsolidado).toHaveBeenCalledWith({ paraleloGestionId: 4, bimestre: null });
  });

  it('pondera el promedio general por sesiones (no promedio simple de %)', async () => {
    const { useCase } = crear([
      fila({ oferta_curso_id: 100, sesiones_computadas: 10, faltas_no_neutralizadas: 0 }),
      fila({ oferta_curso_id: 101, asignatura_orden: 2, sesiones_computadas: 30, faltas_no_neutralizadas: 15 }),
    ]);
    const res = await useCase.execute({ paraleloGestionId: 4 });
    // (40 - 15) / 40 = 62.5 ; el promedio simple de 100 y 50 daría 75
    expect(res.estudiantes[0].promedioPct).toBe(62.5);
  });

  it('pct es null si no hay sesiones computadas', async () => {
    const { useCase } = crear([fila({ sesiones_computadas: 0, faltas_no_neutralizadas: 0 })]);
    const res = await useCase.execute({ paraleloGestionId: 4 });
    expect(res.estudiantes[0].asistencia[100].pctAsistencia).toBeNull();
    expect(res.estudiantes[0].promedioPct).toBeNull();
  });

  it('ordena asignaturas por orden (null al final) y estudiantes por nombre', async () => {
    const { useCase } = crear([
      fila({ oferta_curso_id: 102, asignatura_orden: null, estudiante_id: 1, estudiante_nombre: 'Zoila' }),
      fila({ oferta_curso_id: 101, asignatura_orden: 2, estudiante_id: 2, estudiante_nombre: 'Ana' }),
      fila({ oferta_curso_id: 100, asignatura_orden: 1, estudiante_id: 2, estudiante_nombre: 'Ana' }),
    ]);
    const res = await useCase.execute({ paraleloGestionId: 4 });
    expect(res.asignaturas.map((a) => a.ofertaCursoId)).toEqual([100, 101, 102]);
    expect(res.estudiantes.map((e) => e.nombreCompleto)).toEqual(['Ana', 'Zoila']);
  });

  it('sin filas devuelve estructura vacía con gestión null', async () => {
    const { useCase } = crear([]);
    const res = await useCase.execute({ paraleloGestionId: 4 });
    expect(res).toMatchObject({ gestionId: null, gestionAnio: null, asignaturas: [], estudiantes: [] });
  });

  it('tolera que el repositorio devuelva algo que no es arreglo', async () => {
    const { useCase } = crear(null);
    await expect(useCase.execute({ paraleloGestionId: 4 })).resolves.toMatchObject({ estudiantes: [] });
  });

  it.each([[undefined], [null], ['abc'], [0], [-1]])('rechaza paraleloGestionId inválido (%p)', async (paraleloGestionId) => {
    const { useCase, repo } = crear();
    await expect(useCase.execute({ paraleloGestionId })).rejects.toBeInstanceOf(ValidationError);
    expect(repo.listarFilasConsolidado).not.toHaveBeenCalled();
  });

  it.each([[0], [5], ['abc'], [-1]])('rechaza bimestre inválido (%p)', async (bimestre) => {
    const { useCase, repo } = crear();
    await expect(useCase.execute({ paraleloGestionId: 4, bimestre })).rejects.toBeInstanceOf(ValidationError);
    expect(repo.listarFilasConsolidado).not.toHaveBeenCalled();
  });

  it('exige repositorio y logger', () => {
    expect(() => new GetConsolidadoAsistenciaUseCase({ logger: {} })).toThrow(/requerido/);
    expect(() => new GetConsolidadoAsistenciaUseCase({ asistenciaConsolidadoViewRepository: {} })).toThrow(/requerido/);
  });
});
