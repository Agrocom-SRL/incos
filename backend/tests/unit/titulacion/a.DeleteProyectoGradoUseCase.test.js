import { describe, it, expect, jest } from '@jest/globals';
import { DeleteProyectoGradoUseCase } from '../../../src/application/use-cases/titulacion/DeleteProyectoGradoUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('DeleteProyectoGradoUseCase', () => {
  const crear = (proyecto = { id: 5 }) => {
    const deps = {
      proyectoGradoRepository: {
        findById: jest.fn().mockResolvedValue(proyecto),
        delete: jest.fn().mockResolvedValue(true),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new DeleteProyectoGradoUseCase(deps) };
  };

  it('elimina el proyecto y registra en el log', async () => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(5, 2)).resolves.toBe(true);
    expect(deps.proyectoGradoRepository.findById).toHaveBeenCalledWith(5);
    expect(deps.proyectoGradoRepository.delete).toHaveBeenCalledWith(5, 2);
    expect(deps.logger.info).toHaveBeenCalledWith(expect.any(String), { id: 5 });
  });

  it('usa userId null por defecto', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(5);
    expect(deps.proyectoGradoRepository.delete).toHaveBeenCalledWith(5, null);
  });

  it('lanza NotFoundError si el proyecto no existe y no elimina', async () => {
    const { deps, useCase } = crear(null);
    await expect(useCase.execute(99)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.proyectoGradoRepository.delete).not.toHaveBeenCalled();
    expect(deps.logger.info).not.toHaveBeenCalled();
  });

  it('un id no numérico (NaN) se trata como proyecto inexistente', async () => {
    const { deps, useCase } = crear(null);
    await expect(useCase.execute(Number('abc'))).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.proyectoGradoRepository.delete).not.toHaveBeenCalled();
  });
});
