import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/index.js';

const mockQuery = jest.fn();
const mockTransaction = jest.fn(async (fn) => fn('TX'));
const mockUpdateModel = jest.fn();

jest.unstable_mockModule('../../../src/infrastructure/database/sequelize.js', () => ({
  sequelize: { query: mockQuery, transaction: mockTransaction },
}));
jest.unstable_mockModule('../../../src/infrastructure/database/models/asignacion_horario.js', () => ({
  AsignacionHorario: { update: mockUpdateModel },
}));

const { CambiarTurnoParaleloGestionConBloquesUseCase } = await import(
  '../../../src/application/use-cases/horarios/CambiarTurnoParaleloGestionConBloquesUseCase.js'
);

describe('CambiarTurnoParaleloGestionConBloquesUseCase', () => {
  const bloque = (o = {}) => ({
    asignacionHorarioId: 1, dia: 'LUNES', numeroBloque: 1, horarioId: 100, ...o,
  });

  const crear = ({ pg = { id: 11, state: 'OFERTADO', shift: 'TARDE' }, bloques = [bloque()] } = {}) => {
    const deps = {
      parallelManagementRepository: {
        findById: jest.fn().mockResolvedValue(pg),
        update: jest.fn().mockResolvedValue({}),
      },
      grillaBloqueViewRepository: { findByParaleloGestionId: jest.fn().mockResolvedValue(bloques) },
      scheduleRepository: { findBy: jest.fn().mockResolvedValue({ id: 200 }) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new CambiarTurnoParaleloGestionConBloquesUseCase(deps) };
  };

  beforeEach(() => {
    mockQuery.mockReset().mockResolvedValue([{ maxBloque: 6 }]);
    mockUpdateModel.mockReset().mockResolvedValue([1]);
    mockTransaction.mockClear();
  });

  it.each([[undefined], [''], ['MADRUGADA'], [null]])('rechaza turno inválido %p', async (turno) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(11, { turno })).rejects.toThrow(ValidationError);
    expect(deps.parallelManagementRepository.findById).not.toHaveBeenCalled();
  });

  it('NotFound si el paralelo no existe', async () => {
    const { useCase, deps } = crear();
    deps.parallelManagementRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(11, { turno: 'NOCHE' })).rejects.toThrow(NotFoundError);
  });

  it.each(['PUBLICADO', 'CERRADO'])('no permite cambiar turno en estado %s', async (state) => {
    const { useCase, deps } = crear({ pg: { id: 11, state, shift: 'TARDE' } });
    await expect(useCase.execute(11, { turno: 'NOCHE' })).rejects.toThrow(ValidationError);
    expect(deps.parallelManagementRepository.update).not.toHaveBeenCalled();
  });

  it('si el turno ya es el actual no remapea nada', async () => {
    const { useCase, deps } = crear();
    const out = await useCase.execute(11, { turno: 'TARDE' });

    expect(out.bloques_remapeados).toBe(0);
    expect(out.advertencias).toEqual([]);
    expect(out.paralelo_gestion.turno).toBe('TARDE');
    expect(deps.grillaBloqueViewRepository.findByParaleloGestionId).not.toHaveBeenCalled();
    expect(deps.parallelManagementRepository.update).not.toHaveBeenCalled();
  });

  it('remapea bloques por día y número al turno destino dentro de una transacción', async () => {
    const { useCase, deps } = crear({
      bloques: [bloque({ asignacionHorarioId: 1 }), bloque({ asignacionHorarioId: 2, dia: 'MARTES', numeroBloque: 2, horarioId: 101 })],
    });
    deps.scheduleRepository.findBy
      .mockResolvedValueOnce({ id: 200 })
      .mockResolvedValueOnce({ id: 201 });
    deps.parallelManagementRepository.findById
      .mockResolvedValueOnce({ id: 11, state: 'OFERTADO', shift: 'TARDE' })
      .mockResolvedValueOnce({ id: 11, state: 'OFERTADO', shift: 'TARDE' })
      .mockResolvedValueOnce({ id: 11, state: 'OFERTADO', shift: 'NOCHE' });

    const out = await useCase.execute('11', { turno: 'NOCHE' }, 7);

    expect(deps.scheduleRepository.findBy).toHaveBeenCalledWith({
      shift: 'NOCHE', day: 'LUNES', blockNumber: 1, scheduleType: 'CLASES',
    });
    expect(mockUpdateModel).toHaveBeenCalledWith({ horarioId: 200 }, { where: { id: 1 }, transaction: 'TX' });
    expect(mockUpdateModel).toHaveBeenCalledWith({ horarioId: 201 }, { where: { id: 2 }, transaction: 'TX' });
    expect(deps.parallelManagementRepository.update).toHaveBeenCalledWith(11, { shift: 'NOCHE' }, 7, { transaction: 'TX' });
    expect(out.bloques_remapeados).toBe(2);
    expect(out.paralelo_gestion.turno).toBe('NOCHE');
  });

  it.each([
    ['cambió de estado', { id: 11, state: 'PUBLICADO', shift: 'TARDE' }],
    ['cambió de turno', { id: 11, state: 'OFERTADO', shift: 'NOCHE' }],
  ])('si el paralelo %s durante el proceso aborta sin escribir', async (_n, fresco) => {
    const { useCase, deps } = crear();
    deps.parallelManagementRepository.findById
      .mockResolvedValueOnce({ id: 11, state: 'OFERTADO', shift: 'TARDE' })
      .mockResolvedValueOnce(fresco);
    await expect(useCase.execute(11, { turno: 'NOCHE' })).rejects.toThrow(ValidationError);
    expect(mockUpdateModel).not.toHaveBeenCalled();
    expect(deps.parallelManagementRepository.update).not.toHaveBeenCalled();
  });

  it('la revalidación dentro de la transacción usa la transacción', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(11, { turno: 'NOCHE' });
    expect(deps.parallelManagementRepository.findById).toHaveBeenCalledWith(11, expect.objectContaining({ transaction: 'TX' }));
  });

  it('no actualiza bloques cuyo horario destino ya coincide', async () => {
    const { useCase } = crear({ bloques: [bloque({ horarioId: 200 })] });
    const out = await useCase.execute(11, { turno: 'NOCHE' });
    expect(out.bloques_remapeados).toBe(0);
    expect(mockUpdateModel).not.toHaveBeenCalled();
  });

  it('el sábado y los bloques sin número generan advertencia sin consultar el destino', async () => {
    const { useCase, deps } = crear({
      bloques: [
        bloque({ asignacionHorarioId: 1, dia: 'SABADO' }),
        bloque({ asignacionHorarioId: 2, numeroBloque: null }),
      ],
    });
    const out = await useCase.execute(11, { turno: 'NOCHE' });

    expect(out.advertencias).toHaveLength(2);
    expect(out.advertencias.map((a) => a.asignacion_horario_id)).toEqual([1, 2]);
    expect(deps.scheduleRepository.findBy).not.toHaveBeenCalled();
    expect(mockUpdateModel).not.toHaveBeenCalled();
    expect(deps.parallelManagementRepository.update).toHaveBeenCalled();
  });

  it('falla si el turno destino no tiene el bloque y no persiste nada', async () => {
    const { useCase, deps } = crear();
    deps.scheduleRepository.findBy.mockResolvedValue(null);
    await expect(useCase.execute(11, { turno: 'NOCHE' })).rejects.toThrow(/no tiene bloque #1 para LUNES/);
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(deps.parallelManagementRepository.update).not.toHaveBeenCalled();
  });

  it('falla si el turno destino tiene menos bloques que el actual', async () => {
    mockQuery.mockResolvedValue([{ maxBloque: 4 }]);
    const { useCase, deps } = crear({ bloques: [bloque({ numeroBloque: 5 })] });
    await expect(useCase.execute(11, { turno: 'NOCHE' })).rejects.toThrow(/menos bloques \(4\) que el actual \(5\)/);
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(deps.parallelManagementRepository.update).not.toHaveBeenCalled();
  });

  it('consulta el máximo de bloques del turno destino', async () => {
    const { useCase } = crear();
    await useCase.execute(11, { turno: 'NOCHE' });
    expect(mockQuery.mock.calls[0][1].replacements).toEqual({ turno: 'NOCHE' });
  });
});
