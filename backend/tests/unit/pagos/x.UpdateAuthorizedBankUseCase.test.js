import { jest } from '@jest/globals';
import { UpdateAuthorizedBankUseCase } from '../../../src/application/use-cases/pagos/UpdateAuthorizedBankUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('UpdateAuthorizedBankUseCase', () => {
  const crear = (existing = { id: 4 }) => {
    const repo = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue({ id: 4 }),
    };
    return { repo, useCase: new UpdateAuthorizedBankUseCase({ authorizedBankRepository: repo, logger: { info: jest.fn() } }) };
  };

  it('actualiza solo los campos enviados', async () => {
    const { useCase, repo } = crear();
    const res = await useCase.execute('4', { codigo: ' B1 ', nombre: ' Banco ', metodo_pago_id: '2', activo: false }, 9);
    expect(res).toEqual({ id: 4 });
    expect(repo.update).toHaveBeenCalledWith(4, { code: 'B1', name: 'Banco', paymentMethodId: 2, active: false }, 9);
  });

  it('permite limpiar el método de pago con null', async () => {
    const { useCase, repo } = crear();
    await useCase.execute(4, { metodoPagoId: '' });
    expect(repo.update).toHaveBeenCalledWith(4, { paymentMethodId: null }, null);
  });

  it('lanza NotFoundError si no existe', async () => {
    const { useCase, repo } = crear(null);
    await expect(useCase.execute(4, { nombre: 'x' })).rejects.toBeInstanceOf(NotFoundError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it.each([[0], [-1], ['abc'], [null]])('rechaza id inválido %p', async (id) => {
    const { useCase, repo } = crear();
    await expect(useCase.execute(id, { nombre: 'x' })).rejects.toBeInstanceOf(ValidationError);
    expect(repo.findById).not.toHaveBeenCalled();
  });

  it.each([[{ codigo: '  ' }], [{ nombre: '' }], [{}]])('rechaza payload inválido %j', async (body) => {
    const { useCase, repo } = crear();
    await expect(useCase.execute(4, body)).rejects.toBeInstanceOf(ValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it.each([['abc'], ['5abc'], [0], [-1]])('rechaza metodo_pago_id %p (no se guarda NaN)', async (valor) => {
    const { useCase, repo } = crear();
    await expect(useCase.execute(4, { metodo_pago_id: valor })).rejects.toBeInstanceOf(ValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('rechaza activo no booleano', async () => {
    const { useCase, repo } = crear();
    await expect(useCase.execute(4, { activo: 'x' })).rejects.toBeInstanceOf(ValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it("activo 'false' desactiva", async () => {
    const { useCase, repo } = crear();
    await useCase.execute(4, { activo: 'false' });
    expect(repo.update).toHaveBeenCalledWith(4, { active: false }, null);
  });
});
