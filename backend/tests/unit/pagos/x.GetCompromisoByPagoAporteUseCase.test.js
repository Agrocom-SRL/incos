import { jest } from '@jest/globals';
import { GetCompromisoByPagoAporteUseCase } from '../../../src/application/use-cases/pagos/GetCompromisoByPagoAporteUseCase.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';

describe('GetCompromisoByPagoAporteUseCase', () => {
  const crear = (entity = null) => {
    const repo = { findVigenteByPagoAporteId: jest.fn().mockResolvedValue(entity) };
    return { repo, useCase: new GetCompromisoByPagoAporteUseCase({ compromisoPagoRepository: repo, logger: {} }) };
  };

  it('devuelve null si no hay compromiso vigente', async () => {
    const { useCase, repo } = crear(null);
    await expect(useCase.execute({ pagoAporteId: '8' })).resolves.toBeNull();
    expect(repo.findVigenteByPagoAporteId).toHaveBeenCalledWith(8);
  });

  it('arma el contrato con alerta VENCIDA para fecha pasada', async () => {
    const { useCase } = crear({ id: 2, fechaCompromiso: '2000-01-01', observacion: 'x', estado: 'VIGENTE' });
    const res = await useCase.execute({ pagoAporteId: 8 });
    expect(res).toMatchObject({ id: 2, fechaCompromiso: '2000-01-01', observacion: 'x', estado: 'VIGENTE', alerta: 'VENCIDA' });
    expect(res.diasAtraso).toBeGreaterThan(0);
  });

  it('alerta AL_DIA para fecha lejana futura', async () => {
    const { useCase } = crear({ id: 2, fechaCompromiso: '2999-01-01' });
    const res = await useCase.execute({ pagoAporteId: 8 });
    expect(res.alerta).toBe('AL_DIA');
    expect(res.diasAtraso).toBeLessThan(0);
  });

  it.each([[0], [-1], ['abc'], [undefined], [null]])('rechaza pagoAporteId inválido %p', async (id) => {
    const { useCase, repo } = crear();
    await expect(useCase.execute({ pagoAporteId: id })).rejects.toBeInstanceOf(ValidationError);
    expect(repo.findVigenteByPagoAporteId).not.toHaveBeenCalled();
  });
});
