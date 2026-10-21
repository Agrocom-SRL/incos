import { describe, it, expect, jest } from '@jest/globals';
import { AnularInscripcionCapacitacionUseCase } from '../../../src/application/use-cases/capacitacion/AnularInscripcionCapacitacionUseCase.js';
import { ConflictError, NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('AnularInscripcionCapacitacionUseCase', () => {
  const crear = (inscripcion) => {
    const deps = {
      inscripcionCapacitacionRepository: {
        findById: jest.fn().mockResolvedValue(inscripcion),
        update: jest.fn().mockImplementation(async (id, d) => ({ ...inscripcion, ...d })),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new AnularInscripcionCapacitacionUseCase(deps) };
  };

  it.each([['PENDIENTE'], ['INSCRITO']])('anula una inscripción %s', async (estado) => {
    const { deps, useCase } = crear({ id: 4, estado });
    const res = await useCase.execute(4, { observacion: 'duplicada' }, 7);
    expect(deps.inscripcionCapacitacionRepository.update).toHaveBeenCalledWith(4, { estado: 'ANULADO' }, 7);
    expect(res.inscripcionCapacitacion.estado).toBe('ANULADO');
    expect(deps.logger.info.mock.calls[0][1]).toMatchObject({ estadoAnterior: estado, observacion: 'duplicada' });
  });

  it('funciona sin body', async () => {
    const { useCase } = crear({ id: 4, estado: 'PENDIENTE' });
    await expect(useCase.execute(4)).resolves.toBeDefined();
  });

  it('lanza NotFoundError si no existe', async () => {
    const { deps, useCase } = crear(null);
    await expect(useCase.execute(1)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.inscripcionCapacitacionRepository.update).not.toHaveBeenCalled();
  });

  it.each([['RETIRADO'], ['ANULADO']])('rechaza anular desde %s', async (estado) => {
    const { deps, useCase } = crear({ id: 4, estado });
    await expect(useCase.execute(4)).rejects.toBeInstanceOf(ConflictError);
    expect(deps.inscripcionCapacitacionRepository.update).not.toHaveBeenCalled();
  });
});
