import { describe, it, expect, jest } from '@jest/globals';
import { NotFoundError } from '../../../src/domain/errors/index.js';

import { GetParaleloGestionByIdUseCase } from '../../../src/application/use-cases/oferta/GetParaleloGestionByIdUseCase.js';

const logger = () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() });

describe('GetParaleloGestionByIdUseCase', () => {
  it('devuelve la ficha enriquecida bajo paraleloGestion', async () => {
    const repo = {
      findEnrichedById: jest.fn().mockResolvedValue({
        id: 3,
gestionPlanId: 1,
paraleloId: 2,
turno: 'TARDE',
estado: 'BORRADOR',
        cupoMaximo: 35,
cupoMinimo: 10,
bloquesRequeridos: '12',
activo: 1,
      }),
    };
    const useCase = new GetParaleloGestionByIdUseCase({ parallelManagementRepository: repo, logger: logger() });
    const res = await useCase.execute(3);
    expect(repo.findEnrichedById).toHaveBeenCalledWith(3);
    expect(res.paraleloGestion).toMatchObject({ id: 3, turno: 'TARDE', bloquesRequeridos: 12, bloquesAsignados: 0, activo: true });
  });

  it.each([99, NaN])('NotFoundError si no existe (id %p)', async (id) => {
    const repo = { findEnrichedById: jest.fn().mockResolvedValue(null) };
    const useCase = new GetParaleloGestionByIdUseCase({ parallelManagementRepository: repo, logger: logger() });
    await expect(useCase.execute(id)).rejects.toBeInstanceOf(NotFoundError);
  });
});
