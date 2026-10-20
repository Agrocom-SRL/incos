import { describe, it, expect, jest } from '@jest/globals';
import { ListHistorialMatriculaParaleloUseCase } from '../../../src/application/use-cases/academico/nivelaciones/ListHistorialMatriculaParaleloUseCase.js';

describe('ListHistorialMatriculaParaleloUseCase', () => {
  const fila = (o = {}) => ({
    oferta_curso_id: 100,
asignatura_sigla: 'MAT',
asignatura_nombre: 'Matemática',
asignatura_orden: 1,
    estudiante_id: 1,
codigo_estudiante: 'E1',
nombre_completo: 'Zoila',
nota_final: '45.5',
estado_matricula: 'REPROBADO',
    historial_matricula_id: null,
    ...o,
  });
  const crear = (rows = [fila()]) => {
    const repo = { listarEventosPorParaleloGestion: jest.fn().mockResolvedValue(rows) };
    const logger = { info: jest.fn() };
    return { repo, logger, useCase: new ListHistorialMatriculaParaleloUseCase({ nivelacionParaleloViewRepository: repo, logger }) };
  };
  const conEvento = (o = {}) => fila({
    historial_matricula_id: 7,
tipo_estado: 'NIVELACION_1RA',
nota_resultante: null,
nota_forzada: 0,
    fecha_transicion: '2026-05-01',
historial_observaciones: 'obs',
es_ancla_directa: 1,
    nivelacion_id: 3,
nivelacion_estado: 'APROBADA',
nota_nivelacion: '70',
nivelacion_aprobada: 1,
fecha_examen: '2026-05-10',
    ...o,
  });

  it('pivota por estudiante y asignatura y llama al repositorio con el id numérico', async () => {
    const { useCase, repo } = crear();
    const res = await useCase.execute({ paraleloGestionId: '4' });
    expect(repo.listarEventosPorParaleloGestion).toHaveBeenCalledWith(4);
    expect(res).toEqual({
      paraleloGestionId: 4,
      asignaturas: [{ ofertaCursoId: 100, sigla: 'MAT', nombre: 'Matemática', orden: 1 }],
      estudiantes: [{
        estudianteId: 1,
codigoEstudiante: 'E1',
nombreCompleto: 'Zoila',
tienePendiente: false,
        celdas: { 100: { notaFinal: 45.5, estadoMatricula: 'REPROBADO', evento: null } },
      }],
      totalEstudiantes: 1,
      totalPendientes: 0,
    });
  });

  it('expone el evento vigente con su nivelación y marca pendiente', async () => {
    const { useCase } = crear([conEvento()]);
    const res = await useCase.execute({ paraleloGestionId: 4 });
    expect(res.totalPendientes).toBe(1);
    expect(res.estudiantes[0].tienePendiente).toBe(true);
    expect(res.estudiantes[0].celdas[100].evento).toEqual({
      historialMatriculaId: 7,
stateType: 'NIVELACION_1RA',
resultingGrade: null,
forcedGrade: false,
      transitionDate: '2026-05-01',
observations: 'obs',
esAnclaDirecta: true,
      nivelacion: { id: 3, status: 'APROBADA', levelingGrade: 70, passed: true, examDate: '2026-05-10' },
    });
  });

  it('nivelacion es null sin fila de nivelación y passed null si no hay resultado', async () => {
    const sin = crear([conEvento({ nivelacion_id: null })]);
    expect((await sin.useCase.execute({ paraleloGestionId: 4 })).estudiantes[0].celdas[100].evento.nivelacion).toBeNull();
    const pendiente = crear([conEvento({ nivelacion_aprobada: null, nota_nivelacion: null })]);
    const n = (await pendiente.useCase.execute({ paraleloGestionId: 4 })).estudiantes[0].celdas[100].evento.nivelacion;
    expect(n).toMatchObject({ passed: null, levelingGrade: null });
  });

  it('decisión administrativa conserva nota forzada y resultante', async () => {
    const { useCase } = crear([conEvento({ tipo_estado: 'ABANDONO', nota_resultante: '30', nota_forzada: 1, nivelacion_id: null })]);
    const evento = (await useCase.execute({ paraleloGestionId: 4 })).estudiantes[0].celdas[100].evento;
    expect(evento).toMatchObject({ stateType: 'ABANDONO', resultingGrade: 30, forcedGrade: true, nivelacion: null });
  });

  it('cuenta pendientes por estudiante (no por celda), ordena asignaturas y estudiantes', async () => {
    const { useCase } = crear([
      conEvento({ estudiante_id: 2, nombre_completo: 'Beto', oferta_curso_id: 101, asignatura_orden: null }),
      conEvento({ estudiante_id: 2, nombre_completo: 'Beto', oferta_curso_id: 100, asignatura_orden: 1 }),
      fila({ estudiante_id: 1, nombre_completo: 'Ana', oferta_curso_id: 100 }),
    ]);
    const res = await useCase.execute({ paraleloGestionId: 4 });
    expect(res.asignaturas.map((a) => a.ofertaCursoId)).toEqual([100, 101]);
    expect(res.estudiantes.map((e) => e.nombreCompleto)).toEqual(['Ana', 'Beto']);
    expect(res.totalEstudiantes).toBe(2);
    expect(res.totalPendientes).toBe(1);
  });

  it('sin filas o con respuesta no-arreglo devuelve la grilla vacía', async () => {
    for (const rows of [[], null]) {
      const { useCase } = crear(rows);
      await expect(useCase.execute({ paraleloGestionId: 4 })).resolves.toMatchObject({
        asignaturas: [], estudiantes: [], totalEstudiantes: 0, totalPendientes: 0,
      });
    }
  });

  it('exige repositorio y logger', () => {
    expect(() => new ListHistorialMatriculaParaleloUseCase({ logger: {} })).toThrow(/requerido/);
    expect(() => new ListHistorialMatriculaParaleloUseCase({ nivelacionParaleloViewRepository: {} })).toThrow(/requerido/);
  });
});
