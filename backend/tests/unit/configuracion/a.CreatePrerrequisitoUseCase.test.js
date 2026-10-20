import { describe, it, expect, jest } from '@jest/globals';
import { CreatePrerrequisitoUseCase } from '../../../src/application/use-cases/configuracion/CreatePrerrequisitoUseCase.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';

describe('CreatePrerrequisitoUseCase', () => {
  const crear = () => {
    const prerequisiteRepository = { create: jest.fn().mockResolvedValue({ id: 1 }) };
    const logger = { info: jest.fn() };
    return {
      prerequisiteRepository,
      useCase: new CreatePrerrequisitoUseCase({ prerequisiteRepository, logger }),
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

  // Nota: no se prueba asignatura_id === prerrequisito_id porque el use case no lo valida
  // (posible bug reportado: una asignatura puede ser prerrequisito de sí misma).
});
