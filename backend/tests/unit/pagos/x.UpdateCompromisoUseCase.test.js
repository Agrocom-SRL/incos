import { jest } from '@jest/globals';
import { UpdateCompromisoUseCase } from '../../../src/application/use-cases/pagos/UpdateCompromisoUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('UpdateCompromisoUseCase', () => {
  const crear = (existing = { id: 4 }) => {
    const repo = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue({ id: 4 }),
    };
    return { repo, useCase: new UpdateCompromisoUseCase({ compromisoPagoRepository: repo, logger: { info: jest.fn() } }) };
  };

  it('actualiza fecha, observación y estado normalizados', async () => {
    const { useCase, repo } = crear();
    const res = await useCase.execute('4', { fechaCompromiso: '2026-05-10T10:00:00Z', observacion: ' hola ', estado: ' cumplido ' }, 2);
    expect(res).toEqual({ id: 4 });
    expect(repo.update).toHaveBeenCalledWith(4, { fechaCompromiso: '2026-05-10', observacion: 'hola', estado: 'CUMPLIDO' }, 2);
  });

  it('observación vacía o null se guarda como null', async () => {
    const { useCase, repo } = crear();
    await useCase.execute(4, { observacion: '   ' });
    expect(repo.update).toHaveBeenCalledWith(4, { observacion: null }, null);
    await useCase.execute(4, { observacion: null });
    expect(repo.update).toHaveBeenLastCalledWith(4, { observacion: null }, null);
  });

  it('lanza NotFoundError si no existe', async () => {
    const { useCase, repo } = crear(null);
    await expect(useCase.execute(4, { estado: 'VIGENTE' })).rejects.toBeInstanceOf(NotFoundError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it.each([[0], ['x'], [undefined]])('rechaza id inválido %p', async (id) => {
    const { useCase } = crear();
    await expect(useCase.execute(id, { estado: 'VIGENTE' })).rejects.toBeInstanceOf(ValidationError);
  });

  it.each([
    [{}],
    [undefined],
    [{ fechaCompromiso: '' }],
    [{ fechaCompromiso: null }],
    [{ fechaCompromiso: '10/05/2026' }],
    [{ fechaCompromiso: '2026-13-01' }],
    [{ estado: 'PAGADO' }],
    [{ estado: null }],
    [{ observacion: 'x'.repeat(501) }],
  ])('rechaza datos inválidos %j', async (data) => {
    const { useCase, repo } = crear();
    await expect(useCase.execute(4, data)).rejects.toBeInstanceOf(ValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('acepta observación de exactamente 500 caracteres', async () => {
    const { useCase, repo } = crear();
    await useCase.execute(4, { observacion: 'x'.repeat(500) });
    expect(repo.update).toHaveBeenCalled();
  });

  it.each([['2026-02-31'], ['2026-13-01'], ['abc']])('rechaza fecha %p (no rueda a otro mes)', async (fecha) => {
    const { useCase, repo } = crear();
    await expect(useCase.execute(4, { fechaCompromiso: fecha })).rejects.toBeInstanceOf(ValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });
});
