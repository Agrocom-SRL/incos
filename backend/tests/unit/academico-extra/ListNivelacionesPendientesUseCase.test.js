import { describe, it, expect, jest } from '@jest/globals';
import { ListNivelacionesPendientesUseCase } from '../../../src/application/use-cases/academico/nivelaciones/ListNivelacionesPendientesUseCase.js';

describe('ListNivelacionesPendientesUseCase', () => {
  const crear = (rows) => {
    const repo = { listarNivelacionesPendientes: jest.fn().mockResolvedValue(rows) };
    const logger = { info: jest.fn() };
    return { repo, logger, useCase: new ListNivelacionesPendientesUseCase({ nivelacionParaleloViewRepository: repo, logger }) };
  };

  it('mapea la bandeja al contrato del frontend', async () => {
    const { useCase, repo } = crear([{
      nivelacion_id: '3',
nivelacion_estado: 'PROGRAMADA',
nota_nivelacion: null,
nivelacion_aprobada: null,
      fecha_examen: '2026-05-10',
docente_evaluador_id: '7',
historial_matricula_id: '8',
tipo_estado: 'NIVELACION_1RA',
      fecha_transicion: '2026-05-01',
historial_observaciones: 'obs',
matricula_materia_id: '9',
estudiante_id: '12',
      codigo_estudiante: 'E1',
nombre_completo: 'Ana',
asignatura_sigla: 'MAT',
asignatura_nombre: 'Matemática',
paralelo_gestion_id: '4',
    }]);
    const res = await useCase.execute();
    expect(repo.listarNivelacionesPendientes).toHaveBeenCalledTimes(1);
    expect(res).toEqual({
      nivelaciones: [{
        nivelacionId: 3,
status: 'PROGRAMADA',
levelingGrade: null,
passed: null,
examDate: '2026-05-10',
        evaluatorTeacherId: 7,
historialMatriculaId: 8,
stateType: 'NIVELACION_1RA',
transitionDate: '2026-05-01',
        observations: 'obs',
subjectEnrollmentId: 9,
estudianteId: 12,
codigoEstudiante: 'E1',
nombreCompleto: 'Ana',
        asignaturaSigla: 'MAT',
asignaturaNombre: 'Matemática',
paraleloGestionId: 4,
      }],
    });
  });

  it('materia arrastrada: paraleloGestionId null; passed booleano y nota numérica', async () => {
    const { useCase } = crear([{ nivelacion_id: 1, nivelacion_aprobada: 0, nota_nivelacion: '40', paralelo_gestion_id: null }]);
    const [n] = (await useCase.execute()).nivelaciones;
    expect(n).toMatchObject({ paraleloGestionId: null, passed: false, levelingGrade: 40, nombreCompleto: '', codigoEstudiante: null });
  });

  it.each([[[]], [null]])('lista vacía con %p', async (rows) => {
    const { useCase } = crear(rows);
    await expect(useCase.execute()).resolves.toEqual({ nivelaciones: [] });
  });

  it('exige repositorio y logger', () => {
    expect(() => new ListNivelacionesPendientesUseCase({ logger: {} })).toThrow(/requerido/);
    expect(() => new ListNivelacionesPendientesUseCase({ nivelacionParaleloViewRepository: {} })).toThrow(/requerido/);
  });
});
