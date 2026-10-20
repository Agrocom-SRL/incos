import { describe, it, expect, jest } from '@jest/globals';
import { GetParaleloGestionConflictosUseCase } from '../../../src/application/use-cases/horarios/GetParaleloGestionConflictosUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/index.js';

describe('GetParaleloGestionConflictosUseCase', () => {
  const crear = (conflictos = []) => {
    const deps = {
      parallelManagementRepository: { findById: jest.fn().mockResolvedValue({ id: 11 }) },
      horarioConflictosService: { listarConflictosParaleloGestion: jest.fn().mockResolvedValue(conflictos) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GetParaleloGestionConflictosUseCase(deps) };
  };

  it.each([[0], ['x'], [undefined], [-4]])('NotFound con id inválido %p', async (id) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(id)).rejects.toThrow(NotFoundError);
    expect(deps.parallelManagementRepository.findById).not.toHaveBeenCalled();
  });

  it('NotFound si el paralelo no existe', async () => {
    const { useCase, deps } = crear();
    deps.parallelManagementRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(11)).rejects.toThrow(NotFoundError);
    expect(deps.horarioConflictosService.listarConflictosParaleloGestion).not.toHaveBeenCalled();
  });

  it('devuelve los conflictos del servicio (docente, aula, solape)', async () => {
    const conflictos = [{ tipo: 'DOCENTE' }, { tipo: 'AULA' }, { tipo: 'PARALELO' }];
    const { useCase, deps } = crear(conflictos);
    const out = await useCase.execute('11');

    expect(deps.parallelManagementRepository.findById).toHaveBeenCalledWith(11);
    expect(deps.horarioConflictosService.listarConflictosParaleloGestion).toHaveBeenCalledWith(11);
    expect(out).toEqual({ paralelo_gestion_id: 11, conflictos });
  });

  it('lista vacía sin conflictos', async () => {
    const { useCase } = crear([]);
    expect(await useCase.execute(11)).toEqual({ paralelo_gestion_id: 11, conflictos: [] });
  });
});
