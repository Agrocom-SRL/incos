import { describe, it, expect, jest } from '@jest/globals';
import { UpdateIntegranteProyectoUseCase } from '../../../src/application/use-cases/titulacion/UpdateIntegranteProyectoUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('UpdateIntegranteProyectoUseCase', () => {
  const crear = ({ proyecto = { id: 10 }, integrante = { id: 3, proyectoGradoId: 10 } } = {}) => {
    const deps = {
      proyectoGradoRepository: { findById: jest.fn().mockResolvedValue(proyecto) },
      integranteProyectoRepository: {
        findById: jest.fn().mockResolvedValue(integrante),
        update: jest.fn().mockResolvedValue({ id: 3, rol: 'TITULAR' }),
      },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new UpdateIntegranteProyectoUseCase(deps) };
  };

  it('actualiza solo rol, estado, fechaIncorporacion y observaciones', async () => {
    const { useCase, deps } = crear();
    const r = await useCase.execute(10, 3, { rol: 'TITULAR', estudianteId: 9, proyectoGradoId: 77 }, 4);
    expect(deps.integranteProyectoRepository.findById).toHaveBeenCalledWith(3);
    expect(deps.integranteProyectoRepository.update).toHaveBeenCalledWith(3, { rol: 'TITULAR' }, 4);
    expect(r).toEqual({ integrante: { id: 3, rol: 'TITULAR' } });
  });

  it('acepta los cuatro campos editables', async () => {
    const { useCase, deps } = crear();
    const body = { rol: 'INTEGRANTE', estado: 'RETIRADO', fechaIncorporacion: '2026-01-01', observaciones: null };
    await useCase.execute(10, 3, body);
    expect(deps.integranteProyectoRepository.update).toHaveBeenCalledWith(3, body, null);
  });

  it('proyecto inexistente -> NotFoundError', async () => {
    const { useCase, deps } = crear({ proyecto: null });
    await expect(useCase.execute(99, 3, {})).rejects.toThrow(NotFoundError);
    expect(deps.integranteProyectoRepository.findById).not.toHaveBeenCalled();
  });

  it('integrante inexistente -> NotFoundError sin actualizar', async () => {
    const { useCase, deps } = crear({ integrante: null });
    await expect(useCase.execute(10, 3, { rol: 'TITULAR' })).rejects.toThrow(NotFoundError);
    expect(deps.integranteProyectoRepository.update).not.toHaveBeenCalled();
  });

  it('integrante de otro proyecto -> NotFoundError (anti-IDOR)', async () => {
    const { useCase, deps } = crear({ integrante: { id: 3, proyectoGradoId: 55 } });
    await expect(useCase.execute(10, 3, { rol: 'TITULAR' })).rejects.toThrow(NotFoundError);
    expect(deps.integranteProyectoRepository.update).not.toHaveBeenCalled();
  });

  it('el proyectoGradoId del integrante como texto numérico se acepta', async () => {
    const { useCase, deps } = crear({ integrante: { id: 3, proyectoGradoId: '10' } });
    await useCase.execute('10', 3, { estado: 'RETIRADO' });
    expect(deps.integranteProyectoRepository.update).toHaveBeenCalled();
  });

  it('proyectoGradoId no numérico (NaN) no coincide -> NotFoundError', async () => {
    const { useCase } = crear({ integrante: { id: 3, proyectoGradoId: 10 } });
    await expect(useCase.execute('abc', 3, {})).rejects.toThrow(NotFoundError);
  });
});
