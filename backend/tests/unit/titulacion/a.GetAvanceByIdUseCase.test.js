import { describe, it, expect, jest } from '@jest/globals';
import { GetAvanceByIdUseCase } from '../../../src/application/use-cases/titulacion/GetAvanceByIdUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('GetAvanceByIdUseCase', () => {
  const crear = ({
    proyecto = { id: 5 },
    avance = { id: 12, proyectoGradoId: 5 },
    revisiones = { bitacoraEntradas: [{ id: 1 }, { id: 2 }] },
  } = {}) => {
    const deps = {
      proyectoGradoRepository: { findById: jest.fn().mockResolvedValue(proyecto) },
      avanceProyectoRepository: { findById: jest.fn().mockResolvedValue(avance) },
      bitacoraProyectoRepository: { findAll: jest.fn().mockResolvedValue(revisiones) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new GetAvanceByIdUseCase(deps) };
  };

  it('devuelve el avance con su historial de revisiones', async () => {
    const { deps, useCase } = crear();
    const { avance } = await useCase.execute(5, 12);

    expect(avance.id).toBe(12);
    expect(avance.revisiones).toEqual([{ id: 1 }, { id: 2 }]);
    expect(deps.bitacoraProyectoRepository.findAll).toHaveBeenCalledWith({ avanceProyectoId: 12 });
    expect(deps.logger.info).toHaveBeenCalled();
  });

  it('usa lista vacía si el repositorio no trae bitacoraEntradas', async () => {
    const { useCase } = crear({ revisiones: {} });
    const { avance } = await useCase.execute(5, 12);
    expect(avance.revisiones).toEqual([]);
  });

  it('lanza NotFoundError si el proyecto no existe', async () => {
    const { deps, useCase } = crear({ proyecto: null });
    await expect(useCase.execute(5, 12)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.avanceProyectoRepository.findById).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el avance no existe', async () => {
    const { deps, useCase } = crear({ avance: null });
    await expect(useCase.execute(5, 12)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.bitacoraProyectoRepository.findAll).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el avance es de otro proyecto (anti-IDOR)', async () => {
    const { deps, useCase } = crear({ avance: { id: 12, proyectoGradoId: 77 } });
    await expect(useCase.execute(5, 12)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.bitacoraProyectoRepository.findAll).not.toHaveBeenCalled();
  });

  it('compara proyectoGradoId numéricamente (cadena vs número)', async () => {
    const { useCase } = crear({ avance: { id: 12, proyectoGradoId: '5' } });
    await expect(useCase.execute('5', 12)).resolves.toHaveProperty('avance');
  });

  it('un proyectoGradoId no numérico (NaN) no coincide con ningún avance', async () => {
    const { useCase } = crear();
    await expect(useCase.execute('abc', 12)).rejects.toBeInstanceOf(NotFoundError);
  });
});
