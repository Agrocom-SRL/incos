import { describe, it, expect, jest } from '@jest/globals';
import { CambiarEstadoFolioUseCase } from '../../../src/application/use-cases/academico/libros/CambiarEstadoFolioUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('CambiarEstadoFolioUseCase', () => {
  const crear = (folio = { id: 5, libroId: 2, estado: 'BORRADOR' }) => {
    const deps = {
      libroRegistroRepository: {
        findFolioById: jest.fn().mockResolvedValue(folio),
        updateFolio: jest.fn().mockResolvedValue(true),
      },
      libroRegistroViewRepository: {
        obtenerFolioPorId: jest.fn().mockResolvedValue({ id: 5, estado: 'ANULADO' }),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new CambiarEstadoFolioUseCase(deps) };
  };
  const ejecutar = (useCase, body, extra = {}) =>
    useCase.execute({ usuarioId: 7, id: 2, folioId: 5, body, ...extra });

  it('anula un folio BORRADOR con motivo (trim) y devuelve el DTO', async () => {
    const { useCase, deps } = crear();
    const res = await ejecutar(useCase, { estado: 'ANULADO', motivo: '  error de nómina ' });

    expect(deps.libroRegistroRepository.findFolioById).toHaveBeenCalledWith(5);
    expect(deps.libroRegistroRepository.updateFolio).toHaveBeenCalledWith(
      5,
      { estado: 'ANULADO', observaciones: 'error de nómina' },
      7,
    );
    expect(deps.libroRegistroViewRepository.obtenerFolioPorId).toHaveBeenCalledWith(5);
    expect(res.folio).toMatchObject({ id: 5, estado: 'ANULADO' });
  });

  it.each([undefined, '', 'IMPRESO'])('rechaza estado inválido (%p)', async (estado) => {
    const { useCase, deps } = crear();
    await expect(ejecutar(useCase, { estado })).rejects.toThrow('Estado de folio inválido');
    expect(deps.libroRegistroRepository.findFolioById).not.toHaveBeenCalled();
  });

  it('NotFound si el folio no existe', async () => {
    const { useCase } = crear(null);
    await expect(ejecutar(useCase, { estado: 'ANULADO', motivo: 'x' })).rejects.toThrow(NotFoundError);
  });

  it('NotFound si el folio pertenece a otro libro', async () => {
    const { useCase, deps } = crear({ id: 5, libroId: 99, estado: 'BORRADOR' });
    await expect(ejecutar(useCase, { estado: 'ANULADO', motivo: 'x' })).rejects.toThrow(NotFoundError);
    expect(deps.libroRegistroRepository.updateFolio).not.toHaveBeenCalled();
  });

  it('ANULADO es terminal: no admite más transiciones', async () => {
    const { useCase, deps } = crear({ id: 5, libroId: 2, estado: 'ANULADO' });
    await expect(ejecutar(useCase, { estado: 'BORRADOR' })).rejects.toThrow('Transición inválida');
    await expect(ejecutar(useCase, { estado: 'ANULADO', motivo: 'x' }))
      .rejects.toThrow('ANULADO → ANULADO');
    expect(deps.libroRegistroRepository.updateFolio).not.toHaveBeenCalled();
  });

  it.each([undefined, null, '   '])('exige motivo para anular (%p)', async (motivo) => {
    const { useCase, deps } = crear();
    await expect(ejecutar(useCase, { estado: 'ANULADO', motivo })).rejects.toThrow(ValidationError);
    expect(deps.libroRegistroRepository.updateFolio).not.toHaveBeenCalled();
  });
});
