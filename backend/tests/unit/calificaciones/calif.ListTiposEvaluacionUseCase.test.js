import { describe, it, expect, jest } from '@jest/globals';
import { ListTiposEvaluacionUseCase } from '../../../src/application/use-cases/academico/ListTiposEvaluacionUseCase.js';

describe('ListTiposEvaluacionUseCase', () => {
  const crear = (result) => {
    const deps = {
      evaluationTypeRepository: {
        findAll: jest.fn().mockResolvedValue(
          result ?? {
            evaluationTypes: [
              {
                id: 1,
code: 'EXAMEN',
name: 'Examen',
description: null,
                isRecovery: false,
active: true,
allowsMultipleAttempts: () => true,
              },
              { id: 2, code: 'RECUP', name: 'Recuperatorio', isRecovery: 1, active: false },
            ],
            total: 2,
          }
        ),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new ListTiposEvaluacionUseCase(deps) };
  };

  it('lista los tipos bajo la clave tiposEvaluacion', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({}, 1, 50);

    expect(deps.evaluationTypeRepository.findAll).toHaveBeenCalledWith({}, 1, 50);
    expect(res).toEqual({
      tiposEvaluacion: [
        {
          id: 1,
codigo: 'EXAMEN',
nombre: 'Examen',
descripcion: null,
          esRecuperatorio: false,
permiteMultiplesIntentos: true,
activo: true,
        },
        {
          id: 2,
codigo: 'RECUP',
nombre: 'Recuperatorio',
descripcion: null,
          esRecuperatorio: true,
permiteMultiplesIntentos: false,
activo: false,
        },
      ],
      total: 2,
      page: 1,
      limit: 50,
      totalPages: 1,
    });
  });

  it('devuelve lista vacía si el repositorio no trae la colección', async () => {
    const { useCase } = crear({ total: 0 });
    const res = await useCase.execute();
    expect(res.tiposEvaluacion).toEqual([]);
    expect(res.totalPages).toBe(0);
  });

  it.each([
    ['true', true],
    [true, true],
    ['false', false],
    [false, false],
  ])('traduce incluirInactivos=%j a includeInactive=%s', async (valor, esperado) => {
    const { useCase, deps } = crear();
    await useCase.execute({ search: 'x' }, 2, 10, { incluirInactivos: valor });
    expect(deps.evaluationTypeRepository.findAll).toHaveBeenCalledWith(
      { search: 'x', includeInactive: esperado }, 2, 10
    );
  });

  it('sin incluirInactivos no agrega el filtro (solo activos)', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ search: 'x' }, 1, 10, { otro: '1' });
    expect(deps.evaluationTypeRepository.findAll).toHaveBeenCalledWith({ search: 'x' }, 1, 10);
  });

  it('calcula totalPages y registra y relanza errores del repositorio', async () => {
    const { useCase, deps } = crear({ evaluationTypes: [], total: 25 });
    expect((await useCase.execute({}, 1, 10)).totalPages).toBe(3);

    deps.evaluationTypeRepository.findAll.mockRejectedValue(new Error('db'));
    await expect(useCase.execute({}, 1, 10)).rejects.toThrow('db');
    expect(deps.logger.error).toHaveBeenCalled();
  });
});
