import { describe, it, expect, jest } from '@jest/globals';
import { UpdateActividadUseCase } from '../../../src/application/use-cases/configuracion/UpdateActividadUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('UpdateActividadUseCase', () => {
  const crear = ({ existing = { id: 3 } } = {}) => {
    const activityRepository = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue({ id: 3 }),
    };
    const logger = { info: jest.fn() };
    return { activityRepository, logger, useCase: new UpdateActividadUseCase({ activityRepository, logger }) };
  };

  it('mapea el body en español y devuelve { actividad }', async () => {
    const { useCase, activityRepository, logger } = crear();
    const res = await useCase.execute(
      3,
      { nombre: 'Feria', descripcion: 'd', tipo: 'FERIADO', esDestacada: true, icono: ' star ', activo: false },
      9
    );
    expect(activityRepository.update).toHaveBeenCalledWith(
      3,
      { name: 'Feria', description: 'd', type: 'FERIADO', isHighlighted: true, icon: 'star', active: false },
      9
    );
    expect(res).toEqual({ actividad: { id: 3 } });
    expect(logger.info).toHaveBeenCalled();
  });

  it('acepta alias en inglés', async () => {
    const { useCase, activityRepository } = crear();
    await useCase.execute(3, { name: 'N', description: 'd', type: 'ACADEMICA', isHighlighted: false, icon: 'x', active: true });
    expect(activityRepository.update).toHaveBeenCalledWith(
      3,
      { name: 'N', description: 'd', type: 'ACADEMICA', isHighlighted: false, icon: 'x', active: true },
      null
    );
  });

  it('icono vacío se normaliza a null y ausente queda undefined', async () => {
    const { useCase, activityRepository } = crear();
    await useCase.execute(3, { icono: '   ' });
    expect(activityRepository.update.mock.calls[0][1].icon).toBeNull();
    await useCase.execute(3, {});
    expect(activityRepository.update.mock.calls[1][1].icon).toBeUndefined();
  });

  it('lanza ValidationError con un tipo fuera del catálogo y no actualiza', async () => {
    const { useCase, activityRepository } = crear();
    await expect(useCase.execute(3, { tipo: 'INEXISTENTE' })).rejects.toBeInstanceOf(ValidationError);
    expect(activityRepository.update).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si no existe (antes de validar)', async () => {
    const { useCase, activityRepository } = crear({ existing: null });
    await expect(useCase.execute(99, { tipo: 'INEXISTENTE' })).rejects.toBeInstanceOf(NotFoundError);
    expect(activityRepository.update).not.toHaveBeenCalled();
  });
});
