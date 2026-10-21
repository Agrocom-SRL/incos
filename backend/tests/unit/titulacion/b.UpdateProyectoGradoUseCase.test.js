import { describe, it, expect, jest } from '@jest/globals';
import { UpdateProyectoGradoUseCase } from '../../../src/application/use-cases/titulacion/UpdateProyectoGradoUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('UpdateProyectoGradoUseCase', () => {
  const crear = ({ proyecto = { id: 10 } } = {}) => {
    const deps = {
      proyectoGradoRepository: {
        findById: jest.fn().mockResolvedValue(proyecto),
        update: jest.fn().mockResolvedValue({ id: 10, titulo: 'Nuevo' }),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new UpdateProyectoGradoUseCase(deps) };
  };

  it('actualiza solo los campos editables presentes en el body', async () => {
    const { useCase, deps } = crear();
    const r = await useCase.execute(10, { titulo: 'Nuevo', notaPerfil: 70 }, 5);
    expect(deps.proyectoGradoRepository.update).toHaveBeenCalledWith(
      10,
      { titulo: 'Nuevo', notaPerfil: 70 },
      5
    );
    expect(r).toEqual({ proyectoGrado: { id: 10, titulo: 'Nuevo' } });
  });

  it('descarta campos no editables (estado, tutorId, id, activo)', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(10, { estado: 'APROBADO', tutorId: 3, id: 99, activo: false, titulo: 'X' });
    expect(deps.proyectoGradoRepository.update).toHaveBeenCalledWith(10, { titulo: 'X' }, null);
  });

  it('conserva valores null explícitos para limpiar un campo', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(10, { descripcion: null });
    expect(deps.proyectoGradoRepository.update).toHaveBeenCalledWith(10, { descripcion: null }, null);
  });

  it('body vacío envía datos vacíos', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(10);
    expect(deps.proyectoGradoRepository.update).toHaveBeenCalledWith(10, {}, null);
  });

  it('proyecto inexistente -> NotFoundError sin actualizar', async () => {
    const { useCase, deps } = crear({ proyecto: null });
    await expect(useCase.execute(99, { titulo: 'X' })).rejects.toThrow(NotFoundError);
    expect(deps.proyectoGradoRepository.update).not.toHaveBeenCalled();
  });

  it('id no numérico (NaN) -> NotFoundError', async () => {
    const { useCase } = crear({ proyecto: null });
    await expect(useCase.execute(Number('abc'), {})).rejects.toThrow(NotFoundError);
  });
});
