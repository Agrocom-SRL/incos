import { describe, it, expect, jest } from '@jest/globals';
import { CreatePrerrequisitoUseCase } from '../../../src/application/use-cases/configuracion/CreatePrerrequisitoUseCase.js';
import { ConflictError, NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('CreatePrerrequisitoUseCase', () => {
  const rel = (subjectId, prerequisiteId) => ({ subjectId, prerequisiteId });
  const crear = ({ relaciones = [], planSubjects = null } = {}) => {
    const prerequisiteRepository = {
      create: jest.fn().mockResolvedValue({ id: 1 }),
      findAll: jest.fn().mockResolvedValue({ prerequisites: relaciones }),
    };
    const planSubjectRepository = planSubjects
      ? { findById: jest.fn(async (id) => planSubjects[id] ?? null) }
      : null;
    const logger = { info: jest.fn() };
    return {
      prerequisiteRepository,
      planSubjectRepository,
      useCase: new CreatePrerrequisitoUseCase({ prerequisiteRepository, planSubjectRepository, logger }),
    };
  };
  const valido = { plan_estudio_id: 1, asignatura_id: 2, prerrequisito_id: 3 };

  it('crea el prerrequisito con claves snake_case', async () => {
    const { useCase, prerequisiteRepository } = crear();
    const res = await useCase.execute(valido, 5);
    expect(res).toEqual({ prerrequisito: { id: 1 } });
    expect(prerequisiteRepository.create).toHaveBeenCalledWith(
      { studyPlanId: 1, subjectId: 2, prerequisiteId: 3, active: true },
      5
    );
  });

  it('acepta camelCase y userId null por defecto', async () => {
    const { useCase, prerequisiteRepository } = crear();
    await useCase.execute({ planEstudioId: 1, asignaturaId: 2, prerrequisitoId: 3 });
    expect(prerequisiteRepository.create).toHaveBeenCalledWith(
      { studyPlanId: 1, subjectId: 2, prerequisiteId: 3, active: true },
      null
    );
  });

  it.each([['plan_estudio_id'], ['asignatura_id'], ['prerrequisito_id']])(
    'rechaza si falta %s',
    async (campo) => {
      const { useCase, prerequisiteRepository } = crear();
      const body = { ...valido };
      delete body[campo];
      await expect(useCase.execute(body)).rejects.toBeInstanceOf(ValidationError);
      expect(prerequisiteRepository.create).not.toHaveBeenCalled();
    }
  );

  it('rechaza ids NaN', async () => {
    const { useCase } = crear();
    await expect(useCase.execute({ ...valido, asignatura_id: Number('abc') })).rejects.toBeInstanceOf(
      ValidationError
    );
  });

  it('una asignatura no puede ser prerrequisito de sí misma', async () => {
    const { useCase, prerequisiteRepository } = crear();
    await expect(useCase.execute({ ...valido, prerrequisito_id: 2 })).rejects.toBeInstanceOf(ValidationError);
    expect(prerequisiteRepository.create).not.toHaveBeenCalled();
  });

  it.each([['abc'], ['2x'], [-1], [1.5]])('id %p no válido: ValidationError sin crear', async (id) => {
    const { useCase, prerequisiteRepository } = crear();
    await expect(useCase.execute({ ...valido, prerrequisito_id: id })).rejects.toBeInstanceOf(ValidationError);
    expect(prerequisiteRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza un duplicado con ConflictError', async () => {
    const { useCase, prerequisiteRepository } = crear({ relaciones: [rel(2, 3)] });
    await expect(useCase.execute(valido)).rejects.toBeInstanceOf(ConflictError);
    expect(prerequisiteRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza el ciclo directo (A requiere B y B requiere A)', async () => {
    const { useCase, prerequisiteRepository } = crear({ relaciones: [rel(3, 2)] });
    await expect(useCase.execute(valido)).rejects.toBeInstanceOf(ValidationError);
    expect(prerequisiteRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza el ciclo indirecto (2→3, 3→4, 4→2)', async () => {
    const { useCase } = crear({ relaciones: [rel(3, 4), rel(4, 2)] });
    await expect(useCase.execute(valido)).rejects.toBeInstanceOf(ValidationError);
  });

  it('una cadena sin ciclo es válida (diamante)', async () => {
    const { useCase, prerequisiteRepository } = crear({ relaciones: [rel(2, 4), rel(3, 4)] });
    await useCase.execute(valido);
    expect(prerequisiteRepository.create).toHaveBeenCalledTimes(1);
  });

  it('consulta solo las relaciones del plan indicado', async () => {
    const { useCase, prerequisiteRepository } = crear();
    await useCase.execute(valido);
    expect(prerequisiteRepository.findAll).toHaveBeenCalledWith({ studyPlanId: 1 }, null, null);
  });

  describe('con planSubjectRepository', () => {
    it('acepta asignaturas del plan', async () => {
      const { useCase, prerequisiteRepository } = crear({ planSubjects: { 2: { studyPlanId: 1 }, 3: { studyPlanId: 1 } } });
      await useCase.execute(valido);
      expect(prerequisiteRepository.create).toHaveBeenCalledTimes(1);
    });

    it('rechaza una asignatura de otro plan', async () => {
      const { useCase, prerequisiteRepository } = crear({ planSubjects: { 2: { studyPlanId: 1 }, 3: { studyPlanId: 9 } } });
      await expect(useCase.execute(valido)).rejects.toBeInstanceOf(ValidationError);
      expect(prerequisiteRepository.create).not.toHaveBeenCalled();
    });

    it('asignatura inexistente: NotFoundError', async () => {
      const { useCase } = crear({ planSubjects: { 2: { studyPlanId: 1 } } });
      await expect(useCase.execute(valido)).rejects.toBeInstanceOf(NotFoundError);
    });
  });
});
