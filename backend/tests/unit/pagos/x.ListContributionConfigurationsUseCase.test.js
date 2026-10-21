import { jest } from '@jest/globals';
import { ListContributionConfigurationsUseCase } from '../../../src/application/use-cases/pagos/ListContributionConfigurationsUseCase.js';

describe('ListContributionConfigurationsUseCase', () => {
  const crear = (items = [{ id: 1, managementId: 3, baseAmount: 100.5, contributionActive: true, active: true }]) => {
    const repo = { findAll: jest.fn().mockResolvedValue({ contributionConfigurations: items, total: items.length }) };
    const logger = { info: jest.fn(), error: jest.fn() };
    return { repo, useCase: new ListContributionConfigurationsUseCase({ contributionConfigurationRepository: repo, logger }) };
  };

  it('lista mapeando al contrato en español bajo configuracionesAportes', async () => {
    const { useCase, repo } = crear();
    const res = await useCase.execute({ gestionId: 3 }, 1, 20);
    expect(repo.findAll).toHaveBeenCalledWith({ gestionId: 3 }, 1, 20);
    expect(res.configuracionesAportes[0]).toMatchObject({ id: 1, gestionId: 3, montoBase: 100.5, aporteActivo: true, activo: true });
    expect(res).toMatchObject({ total: 1, page: 1, limit: 20, totalPages: 1 });
  });

  it('lista vacía', async () => {
    const { useCase } = crear([]);
    const res = await useCase.execute();
    expect(res.configuracionesAportes).toEqual([]);
  });

  it('propaga errores del repositorio', async () => {
    const { useCase, repo } = crear();
    repo.findAll.mockRejectedValue(new Error('db'));
    await expect(useCase.execute()).rejects.toThrow('db');
  });
});
