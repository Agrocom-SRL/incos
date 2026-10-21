import { describe, it, expect, jest } from '@jest/globals';
import { ListMateriasPendientesEstudianteUseCase } from '../../../src/application/use-cases/academico/nivelaciones/ListMateriasPendientesEstudianteUseCase.js';

describe('ListMateriasPendientesEstudianteUseCase', () => {
  const fila = (o = {}) => ({
    paralelo_gestion_id: 4,
oferta_curso_id: 100,
asignatura_plan_id: 30,
asignatura_sigla: 'MAT',
    asignatura_nombre: 'Matemática',
matricula_materia_id: 9,
inscripcion_id: 5,
es_ancla_directa: 1,
    historial_matricula_id: 7,
tipo_estado: 'NIVELACION_1RA',
nota_resultante: null,
nota_forzada: 0,
    fecha_transicion: '2026-05-01',
historial_observaciones: null,
    nivelacion_id: 3,
nivelacion_estado: 'PROGRAMADA',
nota_nivelacion: null,
nivelacion_aprobada: null,
fecha_examen: '2026-05-10',
    codigo_estudiante: 'E1',
nombre_completo: 'Ana Perez',
    ...o,
  });
  const crear = (rows = [fila()]) => {
    const repo = { listarEventosPorEstudiante: jest.fn().mockResolvedValue(rows) };
    const logger = { info: jest.fn() };
    return { repo, logger, useCase: new ListMateriasPendientesEstudianteUseCase({ nivelacionParaleloViewRepository: repo, logger }) };
  };

  it('devuelve los datos del estudiante y sus materias con ancla de escritura', async () => {
    const { useCase, repo } = crear();
    const res = await useCase.execute({ estudianteId: '12' });
    expect(repo.listarEventosPorEstudiante).toHaveBeenCalledWith(12);
    expect(res).toEqual({
      estudianteId: 12,
      codigoEstudiante: 'E1',
      nombreCompleto: 'Ana Perez',
      materiasPendientes: [{
        paraleloGestionId: 4,
ofertaCursoId: 100,
asignaturaPlanId: 30,
asignaturaSigla: 'MAT',
asignaturaNombre: 'Matemática',
        matriculaMateriaId: 9,
inscripcionId: 5,
esAnclaDirecta: true,
        evento: {
          historialMatriculaId: 7,
stateType: 'NIVELACION_1RA',
resultingGrade: null,
forcedGrade: false,
          transitionDate: '2026-05-01',
observations: null,
          nivelacion: { id: 3, status: 'PROGRAMADA', levelingGrade: null, passed: null, examDate: '2026-05-10' },
        },
      }],
    });
  });

  it('materia arrastrada: ids de oferta/matrícula null y sin nivelación', async () => {
    const { useCase } = crear([fila({
      paralelo_gestion_id: null, oferta_curso_id: null, matricula_materia_id: null, es_ancla_directa: 0, nivelacion_id: null,
    })]);
    const [m] = (await useCase.execute({ estudianteId: 12 })).materiasPendientes;
    expect(m).toMatchObject({ paraleloGestionId: null, ofertaCursoId: null, matriculaMateriaId: null, esAnclaDirecta: false, inscripcionId: 5 });
    expect(m.evento.nivelacion).toBeNull();
  });

  it('convierte passed y notas numéricas de la nivelación', async () => {
    const { useCase } = crear([fila({ nivelacion_aprobada: 0, nota_nivelacion: '55', nota_resultante: '30', nota_forzada: 1 })]);
    const { evento } = (await useCase.execute({ estudianteId: 12 })).materiasPendientes[0];
    expect(evento.nivelacion).toMatchObject({ passed: false, levelingGrade: 55 });
    expect(evento).toMatchObject({ resultingGrade: 30, forcedGrade: true });
  });

  it('usa los datos de la primera fila y lista todas las materias', async () => {
    const { useCase } = crear([fila(), fila({ oferta_curso_id: 101, nombre_completo: 'Otro' })]);
    const res = await useCase.execute({ estudianteId: 12 });
    expect(res.materiasPendientes).toHaveLength(2);
    expect(res.nombreCompleto).toBe('Ana Perez');
  });

  it.each([[[]], [null]])('devuelve null si el estudiante no tiene eventos vigentes (%p)', async (rows) => {
    const { useCase, logger } = crear(rows);
    await expect(useCase.execute({ estudianteId: 12 })).resolves.toBeNull();
    expect(logger.info).toHaveBeenCalled();
  });

  it('exige repositorio y logger', () => {
    expect(() => new ListMateriasPendientesEstudianteUseCase({ logger: {} })).toThrow(/requerido/);
    expect(() => new ListMateriasPendientesEstudianteUseCase({ nivelacionParaleloViewRepository: {} })).toThrow(/requerido/);
  });
});
