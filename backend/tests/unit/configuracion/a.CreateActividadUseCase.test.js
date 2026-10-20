import { describe, it, expect, jest } from '@jest/globals';
import { CreateActividadUseCase } from '../../../src/application/use-cases/configuracion/CreateActividadUseCase.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';

describe('CreateActividadUseCase', () => {
  const crear = () => {
    const activityRepository = { create: jest.fn().mockResolvedValue({ id: 7 }) };
    const logger = { info: jest.fn() };
    return { activityRepository, logger, useCase: new CreateActividadUseCase({ activityRepository, logger }) };
  };

  it('crea con alias en español, mapea a dominio y registra el log', async () => {
    const { useCase, activityRepository, logger } = crear();
    const res = await useCase.execute(
      { nombre: 'Feria', descripcion: 'd', tipo: 'FERIA', esDestacada: true, icono: '  star  ', activo: false },
      3
    );
    expect(res).toEqual({ actividad: { id: 7 } });
    expect(activityRepository.create).toHaveBeenCalledWith(
      { name: 'Feria', description: 'd', type: 'FERIA', isHighlighted: true, icon: 'star', active: false },
      3
    );
    expect(logger.info).toHaveBeenCalledWith('Actividad creada', { id: 7 });
  });

  it('acepta alias en inglés y aplica valores por defecto', async () => {
    const { useCase, activityRepository } = crear();
    await useCase.execute({ name: 'Taller' });
    expect(activityRepository.create).toHaveBeenCalledWith(
      {
        name: 'Taller',
        description: undefined,
        type: undefined,
        isHighlighted: false,
        icon: undefined,
        active: true,
      },
      null
    );
  });

  it('un icono vacío o solo espacios se convierte en undefined', async () => {
    const { useCase, activityRepository } = crear();
    await useCase.execute({ nombre: 'X', icono: '   ' });
    expect(activityRepository.create.mock.calls[0][0].icon).toBeUndefined();
  });

  it('rechaza si falta nombre', async () => {
    const { useCase, activityRepository } = crear();
    await expect(useCase.execute({})).rejects.toBeInstanceOf(ValidationError);
    await expect(useCase.execute()).rejects.toBeInstanceOf(ValidationError);
    await expect(useCase.execute({ nombre: '' })).rejects.toBeInstanceOf(ValidationError);
    expect(activityRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza un tipo fuera del catálogo', async () => {
    const { useCase, activityRepository } = crear();
    await expect(useCase.execute({ nombre: 'X', tipo: 'INVENTADO' })).rejects.toBeInstanceOf(ValidationError);
    expect(activityRepository.create).not.toHaveBeenCalled();
  });

  it('tipo null se permite (se trata como no informado)', async () => {
    const { useCase, activityRepository } = crear();
    await useCase.execute({ nombre: 'X', tipo: null });
    expect(activityRepository.create).toHaveBeenCalled();
  });
});
