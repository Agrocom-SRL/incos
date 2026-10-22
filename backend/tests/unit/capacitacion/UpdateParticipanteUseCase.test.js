import { describe, it, expect, jest } from '@jest/globals';
import { UpdateParticipanteUseCase } from '../../../src/application/use-cases/capacitacion/UpdateParticipanteUseCase.js';
import { ConflictError, NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('UpdateParticipanteUseCase', () => {
  const existing = { id: 4, ci: '111', expedicion: 'LP', nombres: 'Ana' };
  const crear = ({ found = existing, duplicado = null } = {}) => {
    const deps = {
      participanteRepository: {
        findById: jest.fn().mockResolvedValue(found),
        findByCiExpedicion: jest.fn().mockResolvedValue(duplicado),
        update: jest.fn().mockImplementation(async (id, data) => ({ ...existing, ...data })),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new UpdateParticipanteUseCase(deps) };
  };

  it('actualiza campos recortando textos y devuelve presentación', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute(4, { nombres: '  Luis ', celular: ' 700 ', email: undefined, activo: false }, 8);
    expect(deps.participanteRepository.findById).toHaveBeenCalledWith(4, { paranoid: false });
    expect(deps.participanteRepository.update).toHaveBeenCalledWith(
      4,
      { nombres: 'Luis', celular: '700', email: null, activo: false },
      8
    );
    expect(deps.participanteRepository.findByCiExpedicion).not.toHaveBeenCalled();
    expect(res.participante.nombres).toBe('Luis');
  });

  it('lanza NotFoundError si no existe', async () => {
    const { deps, useCase } = crear({ found: null });
    await expect(useCase.execute(1, { nombres: 'X' })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.participanteRepository.update).not.toHaveBeenCalled();
  });

  it.each([['ci'], ['nombres'], ['celular']])('rechaza %s vacío', async (campo) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(4, { [campo]: '   ' })).rejects.toBeInstanceOf(ValidationError);
    await expect(useCase.execute(4, { [campo]: null })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.participanteRepository.update).not.toHaveBeenCalled();
  });

  it('revalida unicidad al cambiar ci excluyendo al propio participante', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(4, { ci: ' 222 ' });
    expect(deps.participanteRepository.findByCiExpedicion).toHaveBeenCalledWith('222', 'LP', { excludeId: 4 });
  });

  it('al cambiar solo expedición usa el ci existente', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(4, { expedicion: null });
    expect(deps.participanteRepository.findByCiExpedicion).toHaveBeenCalledWith('111', null, { excludeId: 4 });
  });

  it('lanza ConflictError si el CI + expedición ya existe en otro participante', async () => {
    const { deps, useCase } = crear({ duplicado: { id: 77 } });
    await expect(useCase.execute(4, { ci: '999' })).rejects.toBeInstanceOf(ConflictError);
    expect(deps.participanteRepository.update).not.toHaveBeenCalled();
  });

  it('dentro de una transacción externa la propaga a la lectura y a la escritura', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(4, { nombres: 'Luis' }, 8, { transaction: 'TX' });
    expect(deps.participanteRepository.findById).toHaveBeenCalledWith(4, { paranoid: false, transaction: 'TX' });
    expect(deps.participanteRepository.update).toHaveBeenCalledWith(4, { nombres: 'Luis' }, 8, { transaction: 'TX' });
  });

});
