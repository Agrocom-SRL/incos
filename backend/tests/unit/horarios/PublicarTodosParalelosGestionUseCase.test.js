import { describe, it, expect, jest } from '@jest/globals';
import { PublicarTodosParalelosGestionUseCase } from '../../../src/application/use-cases/horarios/PublicarTodosParalelosGestionUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/index.js';

describe('PublicarTodosParalelosGestionUseCase', () => {
  const crear = (candidatos = []) => {
    const deps = {
      managementRepository: { findById: jest.fn().mockResolvedValue({ id: 2 }) },
      parallelManagementRepository: { findEnrichedOfertadoByGestionId: jest.fn().mockResolvedValue(candidatos) },
      publicarParaleloGestionUseCase: {
        evaluarPrecondiciones: jest.fn().mockResolvedValue({ puedePublicar: true, fallas: [] }),
        ejecutarPublicacion: jest.fn().mockImplementation(async (id) => ({ paralelo_gestion: { id } })),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new PublicarTodosParalelosGestionUseCase(deps) };
  };

  it.each([[0], ['x'], [undefined]])('NotFound con gestión inválida %p', async (id) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(id)).rejects.toThrow(NotFoundError);
    expect(deps.managementRepository.findById).not.toHaveBeenCalled();
  });

  it('NotFound si la gestión no existe', async () => {
    const { useCase, deps } = crear();
    deps.managementRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(2)).rejects.toThrow(NotFoundError);
    expect(deps.parallelManagementRepository.findEnrichedOfertadoByGestionId).not.toHaveBeenCalled();
  });

  it('sin candidatos devuelve resumen en cero', async () => {
    const { useCase } = crear([]);
    const out = await useCase.execute(2);
    expect(out).toEqual({
      gestion_id: 2,
      resumen: { candidatos_ofertado: 0, publicados: 0, omitidos: 0 },
      publicados: [],
      omitidos: [],
    });
  });

  it('publica los que cumplen reutilizando la evaluación y omite los que no', async () => {
    const { useCase, deps } = crear([
      { id: 11, paraleloNombre: 'A', turno: 'TARDE', estado: 'OFERTADO' },
      { id: 12, paraleloNombre: 'B', turno: 'NOCHE', estado: 'OFERTADO' },
    ]);
    const evalOk = { puedePublicar: true, fallas: [] };
    const fallas = [{ condicion: 'cobertura', mensaje: 'x' }];
    deps.publicarParaleloGestionUseCase.evaluarPrecondiciones.mockImplementation(async (id) =>
      id === 11 ? evalOk : { puedePublicar: false, fallas }
    );

    const out = await useCase.execute('2', 7);

    expect(deps.parallelManagementRepository.findEnrichedOfertadoByGestionId).toHaveBeenCalledWith(2);
    expect(deps.publicarParaleloGestionUseCase.ejecutarPublicacion).toHaveBeenCalledTimes(1);
    expect(deps.publicarParaleloGestionUseCase.ejecutarPublicacion).toHaveBeenCalledWith(11, 7, evalOk);
    expect(out.resumen).toEqual({ candidatos_ofertado: 2, publicados: 1, omitidos: 1 });
    expect(out.publicados[0]).toEqual({
      paralelo_gestion_id: 11, paralelo_nombre: 'A', turno: 'TARDE', paralelo_gestion: { id: 11 },
    });
    expect(out.omitidos[0]).toEqual({
      paralelo_gestion_id: 12, paralelo_nombre: 'B', turno: 'NOCHE', estado: 'OFERTADO', fallas,
    });
  });

  it('si la publicación lanza con details, los usa como fallas', async () => {
    const { useCase, deps } = crear([{ id: 11 }]);
    const details = [{ condicion: 'conflictos' }];
    deps.publicarParaleloGestionUseCase.ejecutarPublicacion.mockRejectedValue(
      Object.assign(new Error('fallo'), { details })
    );
    const out = await useCase.execute(2);
    expect(out.publicados).toEqual([]);
    expect(out.omitidos[0].fallas).toEqual(details);
    expect(out.omitidos[0].paralelo_nombre).toBeNull();
  });

  it('si lanza sin details, usa el mensaje como falla y continúa con el resto', async () => {
    const { useCase, deps } = crear([{ id: 11 }, { id: 12 }]);
    deps.publicarParaleloGestionUseCase.ejecutarPublicacion
      .mockRejectedValueOnce(new Error('fallo'))
      .mockResolvedValueOnce({ paralelo_gestion: { id: 12 } });
    const out = await useCase.execute(2);
    expect(out.omitidos[0].fallas).toEqual([{ mensaje: 'fallo' }]);
    expect(out.publicados.map((p) => p.paralelo_gestion_id)).toEqual([12]);
  });
});
