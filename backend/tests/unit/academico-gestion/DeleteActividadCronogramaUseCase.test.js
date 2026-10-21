import { describe, it, expect, jest } from '@jest/globals';
import { DeleteActividadCronogramaUseCase } from '../../../src/application/use-cases/academico/DeleteActividadCronogramaUseCase.js';

describe('DeleteActividadCronogramaUseCase', () => {
  const crear = (existente = { id: 6 }) => {
    const deps = {
      calendarActivityRepository: {
        findById: jest.fn().mockResolvedValue(existente),
        delete: jest.fn().mockResolvedValue(true),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new DeleteActividadCronogramaUseCase(deps) };
  };

  it('elimina y devuelve el id', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(6, 3)).resolves.toEqual({ id: 6 });
    expect(deps.calendarActivityRepository.delete).toHaveBeenCalledWith(6, 3);
  });

  it('404 si no existe y no elimina', async () => {
    const { useCase, deps } = crear(null);
    await expect(useCase.execute(6)).rejects.toMatchObject({ statusCode: 404, code: 'NOT_FOUND' });
    expect(deps.calendarActivityRepository.delete).not.toHaveBeenCalled();
  });
});
