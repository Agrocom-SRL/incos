import { describe, it, expect, jest } from '@jest/globals';
import { AnularActaDefensaUseCase } from '../../../src/application/use-cases/titulacion/AnularActaDefensaUseCase.js';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../../src/domain/errors/AppError.js';

describe('AnularActaDefensaUseCase', () => {
  const crear = (acta = { id: 3, proyectoGradoId: 5, estudianteId: 8, estado: 'EMITIDA' }) => {
    const deps = {
      actaDefensaRepository: {
        findById: jest.fn().mockResolvedValue(acta),
        update: jest.fn().mockResolvedValue({}),
        findByIdWithTribunal: jest.fn().mockResolvedValue({
          id: 3,
          proyectoGradoId: 5,
          numeroActa: 7,
          estado: 'ANULADA',
          tribunal: [
            { id: 2, orden: 2, nombreCompleto: 'B' },
            { id: 1, orden: 1, nombreCompleto: 'A' },
          ],
        }),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new AnularActaDefensaUseCase(deps) };
  };

  it('anula el acta, antepone el motivo y devuelve el detalle mapeado', async () => {
    const { deps, useCase } = crear();
    const result = await useCase.execute(5, 3, '  Error de foliado ', 11);

    expect(deps.actaDefensaRepository.update).toHaveBeenCalledWith(
      3,
      { estado: 'ANULADA', observaciones: 'ANULADA: Error de foliado' },
      11
    );
    expect(deps.actaDefensaRepository.findByIdWithTribunal).toHaveBeenCalledWith(3);
    expect(result.actaDefensa.numeroActaFormateado).toBe('007');
    expect(result.actaDefensa.tribunal.map((m) => m.orden)).toEqual([1, 2]);
    expect(deps.logger.info).toHaveBeenCalled();
  });

  it('conserva las observaciones previas tras el motivo', async () => {
    const { deps, useCase } = crear({
      id: 3, proyectoGradoId: 5, estado: 'EMITIDA', observaciones: ' Nota previa ',
    });
    await useCase.execute(5, 3, 'Duplicada');
    expect(deps.actaDefensaRepository.update).toHaveBeenCalledWith(
      3,
      { estado: 'ANULADA', observaciones: 'ANULADA: Duplicada | Nota previa' },
      null
    );
  });

  it.each([[undefined], [null], [''], ['   ']])(
    'rechaza motivo vacío (%p) sin consultar el acta',
    async (motivo) => {
      const { deps, useCase } = crear();
      await expect(useCase.execute(5, 3, motivo)).rejects.toBeInstanceOf(ValidationError);
      expect(deps.actaDefensaRepository.findById).not.toHaveBeenCalled();
    }
  );

  it('lanza NotFoundError si el acta no existe', async () => {
    const { deps, useCase } = crear(null);
    await expect(useCase.execute(5, 3, 'm')).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.actaDefensaRepository.update).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el acta pertenece a otro proyecto', async () => {
    const { deps, useCase } = crear({ id: 3, proyectoGradoId: 99, estado: 'EMITIDA' });
    await expect(useCase.execute(5, 3, 'm')).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.actaDefensaRepository.update).not.toHaveBeenCalled();
  });

  it('acepta ids de proyecto como cadena numérica', async () => {
    const { useCase } = crear();
    await expect(useCase.execute('5', 3, 'm')).resolves.toHaveProperty('actaDefensa');
  });

  it('rechaza proyectoGradoId no numérico (NaN) como acta inexistente', async () => {
    const { useCase } = crear();
    await expect(useCase.execute('abc', 3, 'm')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lanza ConflictError si el acta ya está anulada', async () => {
    const { deps, useCase } = crear({ id: 3, proyectoGradoId: 5, estado: 'ANULADA' });
    await expect(useCase.execute(5, 3, 'm')).rejects.toBeInstanceOf(ConflictError);
    expect(deps.actaDefensaRepository.update).not.toHaveBeenCalled();
  });
});
