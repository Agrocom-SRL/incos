import { describe, it, expect, jest } from '@jest/globals';
import { BulkAsignacionHorariosUseCase } from '../../../src/application/use-cases/horarios/BulkAsignacionHorariosUseCase.js';
import { ValidationError } from '../../../src/domain/errors/index.js';

describe('BulkAsignacionHorariosUseCase', () => {
  const crear = () => {
    const deps = {
      createAsignacionHorarioUseCase: { execute: jest.fn().mockResolvedValue({ creado: true }) },
      updateAsignacionHorarioUseCase: { execute: jest.fn().mockResolvedValue({ actualizado: true }) },
      deleteAsignacionHorarioUseCase: { execute: jest.fn().mockResolvedValue({ eliminado: true }) },
      asignacionHorarioRepository: { findById: jest.fn().mockResolvedValue(null) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new BulkAsignacionHorariosUseCase(deps) };
  };

  it.each([[undefined], [{}], [{ items: [] }], [[]], [{ items: 'x' }]])(
    'rechaza body sin operaciones %j',
    async (body) => {
      const { useCase } = crear();
      await expect(useCase.execute(body)).rejects.toThrow(ValidationError);
    }
  );

  it('crea por defecto y acepta el body como array', async () => {
    const { useCase, deps } = crear();
    const item = { asignacion_docente_id: 1, horario_id: 2 };
    const out = await useCase.execute([item], 7);

    expect(deps.createAsignacionHorarioUseCase.execute).toHaveBeenCalledWith(item, 7);
    expect(out).toEqual({
      completo: true,
      resultados: [{ index: 0, op: 'create', success: true, data: { creado: true } }],
    });
  });

  it('despacha delete (alias eliminar) con el id y userId', async () => {
    const { useCase, deps } = crear();
    const out = await useCase.execute(
      { items: [{ op: 'delete', id: 4 }, { operacion: 'ELIMINAR', asignacion_horario_id: 5 }] },
      9
    );

    expect(deps.deleteAsignacionHorarioUseCase.execute).toHaveBeenNthCalledWith(1, 4, 9, { coberturaReajuste: false });
    expect(deps.deleteAsignacionHorarioUseCase.execute).toHaveBeenNthCalledWith(2, 5, 9, { coberturaReajuste: false });
    expect(out.resultados.map((r) => r.op)).toEqual(['delete', 'delete']);
  });

  it('despacha update con su propio id excluido', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ items: [{ op: 'update', id: 4, horario_id: 8 }] }, 3);

    expect(deps.updateAsignacionHorarioUseCase.execute).toHaveBeenCalledWith(
      4,
      { op: 'update', id: 4, horario_id: 8, _exclude_asignacion_horario_ids: [4] },
      3
    );
  });

  it('en un intercambio de franjas excluye el bloque que libera la franja destino', async () => {
    const { useCase, deps } = crear();
    deps.asignacionHorarioRepository.findById.mockImplementation(async (id) => ({
      1: { scheduleId: 10 },
      2: { scheduleId: 20 },
    })[id]);

    await useCase.execute({
      items: [
        { op: 'update', id: 1, horario_id: 20 },
        { op: 'update', id: 2, horario_id: 10 },
      ],
    });

    const calls = deps.updateAsignacionHorarioUseCase.execute.mock.calls;
    expect(calls[0][1]._exclude_asignacion_horario_ids.sort()).toEqual([1, 2]);
    expect(calls[1][1]._exclude_asignacion_horario_ids.sort()).toEqual([1, 2]);
  });

  it('no excluye otros bloques si la franja destino no es la de ninguno', async () => {
    const { useCase, deps } = crear();
    deps.asignacionHorarioRepository.findById.mockImplementation(async (id) => ({
      1: { scheduleId: 10 },
      2: { scheduleId: 20 },
    })[id]);

    await useCase.execute({
      items: [
        { op: 'update', id: 1, horarioId: 30 },
        { op: 'update', id: 2, horarioId: 40 },
      ],
    });

    const calls = deps.updateAsignacionHorarioUseCase.execute.mock.calls;
    expect(calls[0][1]._exclude_asignacion_horario_ids).toEqual([1]);
    expect(calls[1][1]._exclude_asignacion_horario_ids).toEqual([2]);
  });

  it('cobertura_reajuste se propaga a create y delete', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({
      cobertura_reajuste: true,
      items: [{ asignacion_docente_id: 1, horario_id: 2 }, { op: 'delete', id: 3 }],
    });

    expect(deps.createAsignacionHorarioUseCase.execute).toHaveBeenCalledWith(
      { asignacion_docente_id: 1, horario_id: 2, cobertura_reajuste: true },
      null
    );
    expect(deps.deleteAsignacionHorarioUseCase.execute).toHaveBeenCalledWith(3, null, { coberturaReajuste: true });
  });

  it('un ítem que falla no detiene los demás y completo=false', async () => {
    const { useCase, deps } = crear();
    const err = Object.assign(new Error('Conflicto de horario'), { details: [{ tipo: 'DOCENTE' }] });
    deps.createAsignacionHorarioUseCase.execute
      .mockRejectedValueOnce(err)
      .mockResolvedValueOnce({ creado: true });

    const out = await useCase.execute({ items: [{ horario_id: 1 }, { horario_id: 2 }] });

    expect(out.completo).toBe(false);
    expect(out.resultados[0]).toEqual({
      index: 0,
      op: 'create',
      success: false,
      error: 'Conflicto de horario',
      details: [{ tipo: 'DOCENTE' }],
    });
    expect(out.resultados[1].success).toBe(true);
    expect(deps.logger.warn).toHaveBeenCalledTimes(1);
  });

  it('error sin details devuelve details null', async () => {
    const { useCase, deps } = crear();
    deps.deleteAsignacionHorarioUseCase.execute.mockRejectedValue(new Error('x'));
    const out = await useCase.execute({ items: [{ op: 'delete', id: 1 }] });
    expect(out.resultados[0].details).toBeNull();
  });
});
