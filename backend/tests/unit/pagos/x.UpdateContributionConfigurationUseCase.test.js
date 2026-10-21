import { jest } from '@jest/globals';
import { UpdateContributionConfigurationUseCase } from '../../../src/application/use-cases/pagos/UpdateContributionConfigurationUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('UpdateContributionConfigurationUseCase', () => {
  const crear = (existing = { id: 4 }) => {
    const repo = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue({ id: 4 }),
    };
    return {
      repo,
      useCase: new UpdateContributionConfigurationUseCase({ contributionConfigurationRepository: repo, logger: { info: jest.fn() } }),
    };
  };

  it('actualiza los campos enviados', async () => {
    const { useCase, repo } = crear();
    await useCase.execute('4', { monto_base: '99.99', fecha_inicio: '2026-02-01', fecha_fin: '', aporte_activo: false, activo: true }, 6);
    expect(repo.update).toHaveBeenCalledWith(
      4,
      { baseAmount: 99.99, startDate: '2026-02-01', endDate: null, contributionActive: false, active: true },
      6
    );
  });

  it('acepta monto cero', async () => {
    const { useCase, repo } = crear();
    await useCase.execute(4, { monto_base: 0 });
    expect(repo.update).toHaveBeenCalledWith(4, { baseAmount: 0 }, null);
  });

  it.each([[-5], ['-0.01'], ['abc'], [NaN]])('rechaza monto_base inválido %p', async (monto) => {
    const { useCase, repo } = crear();
    await expect(useCase.execute(4, { monto_base: monto })).rejects.toBeInstanceOf(ValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('rechaza fecha_inicio vacía', async () => {
    const { useCase, repo } = crear();
    await expect(useCase.execute(4, { fecha_inicio: '' })).rejects.toBeInstanceOf(ValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si no existe', async () => {
    const { useCase, repo } = crear(null);
    await expect(useCase.execute(4, { monto_base: 1 })).rejects.toBeInstanceOf(NotFoundError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it.each([[0], ['x'], [undefined]])('rechaza id inválido %p', async (id) => {
    const { useCase } = crear();
    await expect(useCase.execute(id, { monto_base: 1 })).rejects.toBeInstanceOf(ValidationError);
  });

  it('rechaza payload vacío', async () => {
    const { useCase, repo } = crear();
    await expect(useCase.execute(4, {})).rejects.toBeInstanceOf(ValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it.each([[''], ['   '], [Infinity], [null]])('rechaza monto_base %p (no se guarda como 0)', async (monto) => {
    const { useCase, repo } = crear();
    await expect(useCase.execute(4, { monto_base: monto })).rejects.toBeInstanceOf(ValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it.each([['false', false], ['true', true]])('activo %p se interpreta de forma estricta', async (activo, esperado) => {
    const { useCase, repo } = crear();
    await useCase.execute(4, { activo, aporte_activo: activo });
    expect(repo.update).toHaveBeenCalledWith(4, { active: esperado, contributionActive: esperado }, null);
  });

  it('rechaza activo no booleano', async () => {
    const { useCase, repo } = crear();
    await expect(useCase.execute(4, { activo: 'quizás' })).rejects.toBeInstanceOf(ValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it.each([['2026-02-31'], ['abc']])('rechaza fecha_inicio %p', async (fecha) => {
    const { useCase, repo } = crear();
    await expect(useCase.execute(4, { fecha_inicio: fecha })).rejects.toBeInstanceOf(ValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });
});
