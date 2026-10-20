import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

const mockTransaction = jest.fn(async (fn) => fn('TX'));

jest.unstable_mockModule('../../../src/infrastructure/database/sequelize.js', () => ({
  sequelize: { transaction: mockTransaction },
}));

const { UpdateBitacoraEntradaUseCase } = await import(
  '../../../src/application/use-cases/titulacion/UpdateBitacoraEntradaUseCase.js'
);

describe('UpdateBitacoraEntradaUseCase', () => {
  const crear = ({
    proyecto = { id: 10 },
    entrada = { id: 5, proyectoGradoId: 10, estado: 'PENDIENTE', avanceProyectoId: 77 },
  } = {}) => {
    const deps = {
      proyectoGradoRepository: { findById: jest.fn().mockResolvedValue(proyecto) },
      bitacoraProyectoRepository: {
        findById: jest.fn().mockResolvedValue(entrada),
        update: jest.fn().mockResolvedValue({ id: 5 }),
      },
      avanceProyectoRepository: { update: jest.fn().mockResolvedValue({}) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new UpdateBitacoraEntradaUseCase(deps) };
  };

  beforeEach(() => {
    mockTransaction.mockClear();
  });

  it('actualiza solo los campos permitidos dentro de una transacción', async () => {
    const { useCase, deps } = crear();
    const r = await useCase.execute(
      10, 5, { actividad: 'Revisión', porcentajeAvance: 40, proyectoGradoId: 99 }, 8
    );
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(deps.bitacoraProyectoRepository.update).toHaveBeenCalledWith(
      5,
      { actividad: 'Revisión', porcentajeAvance: 40 },
      8,
      { transaction: 'TX' }
    );
    expect(deps.avanceProyectoRepository.update).not.toHaveBeenCalled();
    expect(r).toEqual({ bitacoraEntrada: { id: 5 } });
  });

  it('al pasar a SUBSANADO marca el avance vinculado como SUBSANADO en la misma transacción', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(10, 5, { estado: 'SUBSANADO' }, 8);
    expect(deps.avanceProyectoRepository.update).toHaveBeenCalledWith(
      77,
      { estadoRevision: 'SUBSANADO', fechaRevision: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) },
      8,
      { transaction: 'TX' }
    );
  });

  it('si la entrada ya estaba SUBSANADO no vuelve a tocar el avance', async () => {
    const { useCase, deps } = crear({
      entrada: { id: 5, proyectoGradoId: 10, estado: 'SUBSANADO', avanceProyectoId: 77 },
    });
    await useCase.execute(10, 5, { estado: 'SUBSANADO' });
    expect(deps.avanceProyectoRepository.update).not.toHaveBeenCalled();
  });

  it('si la entrada no tiene avance vinculado no actualiza avances', async () => {
    const { useCase, deps } = crear({
      entrada: { id: 5, proyectoGradoId: 10, estado: 'PENDIENTE', avanceProyectoId: null },
    });
    await useCase.execute(10, 5, { estado: 'SUBSANADO' });
    expect(deps.bitacoraProyectoRepository.update).toHaveBeenCalled();
    expect(deps.avanceProyectoRepository.update).not.toHaveBeenCalled();
  });

  it('proyecto inexistente -> NotFoundError sin transacción', async () => {
    const { useCase, deps } = crear({ proyecto: null });
    await expect(useCase.execute(99, 5, {})).rejects.toThrow(NotFoundError);
    expect(deps.bitacoraProyectoRepository.findById).not.toHaveBeenCalled();
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it('entrada inexistente -> NotFoundError', async () => {
    const { useCase, deps } = crear({ entrada: null });
    await expect(useCase.execute(10, 5, { actividad: 'x' })).rejects.toThrow(NotFoundError);
    expect(deps.bitacoraProyectoRepository.update).not.toHaveBeenCalled();
  });

  it('entrada de otro proyecto -> NotFoundError (anti-IDOR)', async () => {
    const { useCase, deps } = crear({
      entrada: { id: 5, proyectoGradoId: 55, estado: 'PENDIENTE' },
    });
    await expect(useCase.execute(10, 5, { actividad: 'x' })).rejects.toThrow(NotFoundError);
    expect(deps.bitacoraProyectoRepository.update).not.toHaveBeenCalled();
  });

  it('proyectoGradoId no numérico (NaN) -> NotFoundError', async () => {
    const { useCase } = crear();
    await expect(useCase.execute('abc', 5, {})).rejects.toThrow(NotFoundError);
  });
});
