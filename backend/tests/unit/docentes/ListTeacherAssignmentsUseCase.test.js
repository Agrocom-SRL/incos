import { describe, it, expect, jest } from '@jest/globals';
import { ListTeacherAssignmentsUseCase } from '../../../src/application/use-cases/docentes/ListTeacherAssignmentsUseCase.js';

describe('ListTeacherAssignmentsUseCase', () => {
  const crear = () => {
    const deps = {
      teacherAssignmentRepository: {
        findEnriched: jest.fn().mockResolvedValue({
          rows: [{ id: 1, oferta_curso_id: 5, docente_id: 2, vigente: 1 }],
          total: 7,
        }),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new ListTeacherAssignmentsUseCase(deps) };
  };

  it('traduce los filtros del query (alias snake y camel) y pagina', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({}, '2', '5', {
      gestion_plan_id: '3', cursoId: '5', paralelo_gestion_id: '7', docente_id: '2', vigente: 'true',
    });

    expect(deps.teacherAssignmentRepository.findEnriched).toHaveBeenCalledWith(
      { managementPlanId: 3, offerCourseId: 5, parallelManagementId: 7, teacherId: 2, vigente: true },
      2,
      5
    );
    expect(res).toMatchObject({ total: 7, page: 2, limit: 5, totalPages: 2 });
    expect(res.asignaciones[0]).toMatchObject({ id: 1, ofertaCursoId: 5, cursoId: 5, vigente: true });
  });

  it('con snakeCase devuelve filas snake_case', async () => {
    const { useCase } = crear();
    const res = await useCase.execute({}, 1, 10, {}, { snakeCase: true });
    expect(res.asignaciones[0]).toMatchObject({ oferta_curso_id: 5, docente_id: 2 });
  });

  it.each([
    ['abc'], [0], [-3], [''],
  ])('ids no numéricos o no positivos (%p) se ignoran como filtro', async (valor) => {
    const { useCase, deps } = crear();
    await useCase.execute({}, 1, 10, { docenteId: valor, gestionPlanId: valor, cursoId: valor });
    expect(deps.teacherAssignmentRepository.findEnriched).toHaveBeenCalledWith({}, 1, 10);
  });

  it.each([['false', false], ['0', false], ['1', true], ['talvez', undefined]])(
    'vigente=%p',
    async (valor, esperado) => {
      const { useCase, deps } = crear();
      await useCase.execute({}, 1, 10, { vigente: valor });
      const filtros = deps.teacherAssignmentRepository.findEnriched.mock.calls[0][0];
      if (esperado === undefined) expect(filtros).not.toHaveProperty('vigente');
      else expect(filtros.vigente).toBe(esperado);
    }
  );

  it('page/limit no numéricos usan 1 y 50; total ausente da 0 páginas', async () => {
    const { useCase, deps } = crear();
    deps.teacherAssignmentRepository.findEnriched.mockResolvedValue({ rows: [] });
    const res = await useCase.execute({}, 'x', 'y', {});
    expect(deps.teacherAssignmentRepository.findEnriched).toHaveBeenCalledWith({}, 1, 50);
    expect(res).toMatchObject({ asignaciones: [], total: 0, totalPages: 0 });
  });
});
