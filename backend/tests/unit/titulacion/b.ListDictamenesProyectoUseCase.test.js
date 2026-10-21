import { describe, it, expect, jest } from '@jest/globals';
import { ListDictamenesProyectoUseCase } from '../../../src/application/use-cases/titulacion/ListDictamenesProyectoUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('ListDictamenesProyectoUseCase', () => {
  const crear = ({ proyecto = { id: 10 }, dictamenes = [] } = {}) => {
    const deps = {
      proyectoGradoRepository: { findById: jest.fn().mockResolvedValue(proyecto) },
      dictamenProyectoRepository: { findByProyectoGradoId: jest.fn().mockResolvedValue(dictamenes) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new ListDictamenesProyectoUseCase(deps) };
  };

  it('lista dictámenes sin exponer rutaArchivo', async () => {
    const { useCase, deps } = crear({
      dictamenes: [
        { id: 1, tipo: 'VIABILIDAD_TECNICA', rutaArchivo: '/privado/a.pdf' },
        { id: 2, tipo: 'DESIGNACION_OFICIAL', rutaArchivo: '/privado/b.pdf' },
      ],
    });
    const r = await useCase.execute(10);
    expect(deps.dictamenProyectoRepository.findByProyectoGradoId).toHaveBeenCalledWith(10);
    expect(r.total).toBe(2);
    expect(r.dictamenes).toEqual([
      { id: 1, tipo: 'VIABILIDAD_TECNICA' },
      { id: 2, tipo: 'DESIGNACION_OFICIAL' },
    ]);
    expect(JSON.stringify(r)).not.toContain('rutaArchivo');
  });

  it('sin dictámenes devuelve lista vacía', async () => {
    const { useCase } = crear();
    expect(await useCase.execute(10)).toEqual({ dictamenes: [], total: 0 });
  });

  it('proyecto inexistente -> NotFoundError sin consultar dictámenes', async () => {
    const { useCase, deps } = crear({ proyecto: null });
    await expect(useCase.execute(99)).rejects.toThrow(NotFoundError);
    expect(deps.dictamenProyectoRepository.findByProyectoGradoId).not.toHaveBeenCalled();
  });

  it('id no numérico (NaN) -> NotFoundError', async () => {
    const { useCase } = crear({ proyecto: null });
    await expect(useCase.execute(Number('abc'))).rejects.toThrow(NotFoundError);
  });
});
