import { jest } from '@jest/globals';
import { CreateContributionConfigurationUseCase } from '../../../src/application/use-cases/pagos/CreateContributionConfigurationUseCase.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';

describe('CreateContributionConfigurationUseCase', () => {
  const crear = () => {
    const repo = { create: jest.fn().mockResolvedValue({ id: 1 }) };
    const managementRepository = { findBy: jest.fn().mockResolvedValue({ id: 77 }) };
    const logger = { info: jest.fn() };
    return {
      repo,
      managementRepository,
      useCase: new CreateContributionConfigurationUseCase({
        contributionConfigurationRepository: repo,
        managementRepository,
        logger,
      }),
    };
  };
  const base = { monto_base: 150.5, fecha_inicio: '2026-01-01' };

  it('crea con gestión indicada sin consultar la vigente', async () => {
    const { useCase, repo, managementRepository } = crear();
    await useCase.execute({ ...base, gestion_id: '4', fecha_fin: '2026-12-31' }, 2);
    expect(managementRepository.findBy).not.toHaveBeenCalled();
    expect(repo.create).toHaveBeenCalledWith(
      {
        managementId: 4,
        baseAmount: 150.5,
        contributionActive: true,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        active: true,
      },
      2
    );
  });

  it('usa la gestión vigente cuando no se envía gestionId', async () => {
    const { useCase, repo, managementRepository } = crear();
    await useCase.execute(base);
    expect(managementRepository.findBy).toHaveBeenCalledWith({ vigente: true });
    expect(repo.create.mock.calls[0][0].managementId).toBe(77);
    expect(repo.create.mock.calls[0][0].endDate).toBeNull();
  });

  it('falla si no hay gestión vigente', async () => {
    const { useCase, repo, managementRepository } = crear();
    managementRepository.findBy.mockResolvedValue(null);
    await expect(useCase.execute(base)).rejects.toBeInstanceOf(ValidationError);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('acepta monto cero y respeta aporte_activo=false', async () => {
    const { useCase, repo } = crear();
    await useCase.execute({ ...base, monto_base: 0, aporte_activo: false });
    expect(repo.create.mock.calls[0][0].baseAmount).toBe(0);
    expect(repo.create.mock.calls[0][0].contributionActive).toBe(false);
  });

  it.each([[undefined], [null], [''], [-1], ['-0.01'], ['abc'], [NaN]])(
    'rechaza monto_base inválido %p',
    async (monto) => {
      const { useCase, repo } = crear();
      await expect(useCase.execute({ ...base, monto_base: monto })).rejects.toBeInstanceOf(ValidationError);
      expect(repo.create).not.toHaveBeenCalled();
    }
  );

  it('rechaza si falta fecha_inicio', async () => {
    const { useCase, repo } = crear();
    await expect(useCase.execute({ monto_base: 10 })).rejects.toBeInstanceOf(ValidationError);
    expect(repo.create).not.toHaveBeenCalled();
  });
});
