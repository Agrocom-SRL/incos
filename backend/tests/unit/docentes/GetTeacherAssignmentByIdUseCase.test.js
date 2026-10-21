import { describe, it, expect, jest } from '@jest/globals';
import { GetTeacherAssignmentByIdUseCase } from '../../../src/application/use-cases/docentes/GetTeacherAssignmentByIdUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

const ROW = {
  id: 4,
gestion_plan_id: 3,
oferta_curso_id: 5,
docente_id: 1,
carga_horaria: 4,
vigente: 1,
  docente_apellido_paterno: 'Perez',
docente_nombres: 'Ana',
};

describe('GetTeacherAssignmentByIdUseCase', () => {
  const crear = () => {
    const deps = {
      teacherAssignmentRepository: { findEnrichedById: jest.fn().mockResolvedValue(ROW) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GetTeacherAssignmentByIdUseCase(deps) };
  };

  it('devuelve la presentación legacy (camelCase) por defecto', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute('4');
    expect(deps.teacherAssignmentRepository.findEnrichedById).toHaveBeenCalledWith(4);
    expect(res.asignacion).toMatchObject({
      id: 4,
gestionPlanId: 3,
ofertaCursoId: 5,
cursoId: 5,
docenteId: 1,
      cargaHoraria: 4,
vigente: true,
docenteNombre: 'Perez Ana',
    });
  });

  it('con snakeCase devuelve la presentación snake_case', async () => {
    const { useCase } = crear();
    const res = await useCase.execute(4, { snakeCase: true });
    expect(res.asignacion).toMatchObject({ oferta_curso_id: 5, docente_id: 1, carga_horaria: 4 });
    expect(res.asignacion.ofertaCursoId).toBeUndefined();
  });

  it.each([[0], [-1], ['abc'], [undefined]])('id inválido (%p) lanza NotFoundError', async (id) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(id)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.teacherAssignmentRepository.findEnrichedById).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si no existe', async () => {
    const { useCase, deps } = crear();
    deps.teacherAssignmentRepository.findEnrichedById.mockResolvedValue(null);
    await expect(useCase.execute(4)).rejects.toBeInstanceOf(NotFoundError);
  });
});
