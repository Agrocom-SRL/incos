import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

const mockTransaction = jest.fn(async (fn) => fn('TX'));
jest.unstable_mockModule('../../../src/infrastructure/database/sequelize.js', () => ({
  sequelize: { transaction: mockTransaction },
}));

const { UpdateCursoCapacitacionUseCase } = await import(
  '../../../src/application/use-cases/capacitacion/UpdateCursoCapacitacionUseCase.js'
);

describe('UpdateCursoCapacitacionUseCase', () => {
  const existing = {
    id: 2, titulo: 'Viejo', estado: 'PROPUESTO', fechaInicio: '2999-01-01', fechaFin: '2999-02-01',
  };
  const crear = ({ found = existing, aula = { id: 1 }, horario = { id: 1 } } = {}) => {
    const deps = {
      cursoCapacitacionRepository: {
        findById: jest.fn().mockResolvedValue(found),
        update: jest.fn().mockImplementation(async (id, d) => ({ ...existing, ...d })),
        replaceHorarios: jest.fn().mockResolvedValue(undefined),
        findHorarioIdsByCapacitacionId: jest.fn().mockResolvedValue([9]),
      },
      scheduleRepository: { findById: jest.fn().mockResolvedValue(horario) },
      classroomRepository: { findById: jest.fn().mockResolvedValue(aula) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new UpdateCursoCapacitacionUseCase(deps) };
  };

  beforeEach(() => mockTransaction.mockClear());

  it('actualiza campos, ignora estado y lee horarioIds del repositorio', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute(2, { titulo: ' Nuevo ', costo: '15', estado: 'CERRADO' }, 3);
    expect(deps.cursoCapacitacionRepository.findById).toHaveBeenCalledWith(2, { paranoid: false });
    expect(deps.cursoCapacitacionRepository.update).toHaveBeenCalledWith(
      2,
      { titulo: 'Nuevo', costo: 15 },
      3,
      { transaction: 'TX' }
    );
    expect(deps.cursoCapacitacionRepository.replaceHorarios).not.toHaveBeenCalled();
    expect(res.cursoCapacitacion).toMatchObject({ titulo: 'Nuevo', estado: 'PROPUESTO', horarioIds: [9] });
  });

  it('body vacío no actualiza nada', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(2, {});
    expect(deps.cursoCapacitacionRepository.update).not.toHaveBeenCalled();
  });

  it('reemplaza horarios (deduplicados) y valida aula', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute(2, { aulaId: 4, horarioIds: ['1', 1, 2] }, 3);
    expect(deps.classroomRepository.findById).toHaveBeenCalledWith(4);
    expect(deps.cursoCapacitacionRepository.replaceHorarios).toHaveBeenCalledWith(2, [1, 2], 3, {
      transaction: 'TX',
    });
    expect(res.cursoCapacitacion.horarioIds).toEqual([1, 2]);
    expect(deps.cursoCapacitacionRepository.findHorarioIdsByCapacitacionId).not.toHaveBeenCalled();
  });

  it('horarioIds null vacía los horarios y aulaId null no consulta el aula', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(2, { aulaId: null, horarioIds: null });
    expect(deps.classroomRepository.findById).not.toHaveBeenCalled();
    expect(deps.cursoCapacitacionRepository.replaceHorarios).toHaveBeenCalledWith(2, [], null, {
      transaction: 'TX',
    });
  });

  it('lanza NotFoundError si el curso no existe', async () => {
    const { deps, useCase } = crear({ found: null });
    await expect(useCase.execute(9, { titulo: 'x' })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.cursoCapacitacionRepository.update).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si el aula o el horario no existen', async () => {
    await expect(crear({ aula: null }).useCase.execute(2, { aulaId: 8 })).rejects.toBeInstanceOf(NotFoundError);
    await expect(crear({ horario: null }).useCase.execute(2, { horarioIds: [8] })).rejects.toBeInstanceOf(
      NotFoundError
    );
  });

  it.each([[''], ['   '], [null]])('rechaza titulo vacío (%p)', async (titulo) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(2, { titulo })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.cursoCapacitacionRepository.update).not.toHaveBeenCalled();
  });

  it.each([['abc'], [NaN], [-5]])('rechaza costo inválido (%p)', async (costo) => {
    const { useCase } = crear();
    await expect(useCase.execute(2, { costo })).rejects.toBeInstanceOf(ValidationError);
  });

  it('valida coherencia de fechas contra los valores existentes', async () => {
    const { useCase } = crear();
    await expect(useCase.execute(2, { fechaFin: '2998-01-01' })).rejects.toBeInstanceOf(ValidationError);
    await expect(useCase.execute(2, { fechaInicio: '2999-12-31' })).rejects.toBeInstanceOf(ValidationError);
  });

  it.each([['x'], [[0]], [[1.5]], [['a']]])('rechaza horarioIds inválido (%p)', async (horarioIds) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(2, { horarioIds })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.cursoCapacitacionRepository.update).not.toHaveBeenCalled();
  });
});
