import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

const mockTransaction = jest.fn(async (fn) => fn('TX'));
jest.unstable_mockModule('../../../src/infrastructure/database/sequelize.js', () => ({
  sequelize: { transaction: mockTransaction },
}));

const { CreateCursoCapacitacionUseCase } = await import(
  '../../../src/application/use-cases/capacitacion/CreateCursoCapacitacionUseCase.js'
);

describe('CreateCursoCapacitacionUseCase', () => {
  const body = { titulo: ' Excel ', fechaInicio: '2999-01-01', fechaFin: '2999-02-01' };
  const crear = ({ aula = { id: 1 }, horario = { id: 1 } } = {}) => {
    const deps = {
      cursoCapacitacionRepository: {
        create: jest.fn().mockImplementation(async (d) => ({ id: 20, ...d })),
        replaceHorarios: jest.fn().mockResolvedValue(undefined),
      },
      scheduleRepository: { findById: jest.fn().mockResolvedValue(horario) },
      classroomRepository: { findById: jest.fn().mockResolvedValue(aula) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new CreateCursoCapacitacionUseCase(deps) };
  };

  beforeEach(() => mockTransaction.mockClear());

  it('crea el curso siempre PROPUESTO con valores por defecto', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute({ ...body, estado: 'ABIERTO' }, 4);
    expect(deps.cursoCapacitacionRepository.create).toHaveBeenCalledWith(
      {
        titulo: 'Excel',
descripcion: null,
costo: 0,
cupoMaximo: 30,
aulaId: null,
        fechaInicio: '2999-01-01',
fechaFin: '2999-02-01',
estado: 'PROPUESTO',
      },
      4,
      { transaction: 'TX' }
    );
    expect(deps.cursoCapacitacionRepository.replaceHorarios).not.toHaveBeenCalled();
    expect(res.cursoCapacitacion).toMatchObject({ id: 20, estado: 'PROPUESTO', horarioIds: [] });
  });

  it('valida aula, deduplica horarios y los reemplaza en la misma transacción', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute(
      { ...body, aulaId: 3, costo: '50', cupoMaximo: '12', activo: false, horarioIds: ['5', 5, 6] },
      4
    );
    expect(deps.classroomRepository.findById).toHaveBeenCalledWith(3);
    expect(deps.scheduleRepository.findById).toHaveBeenCalledTimes(2);
    expect(deps.cursoCapacitacionRepository.replaceHorarios).toHaveBeenCalledWith(20, [5, 6], 4, {
      transaction: 'TX',
    });
    const data = deps.cursoCapacitacionRepository.create.mock.calls[0][0];
    expect(data).toMatchObject({ costo: 50, cupoMaximo: 12, aulaId: 3, activo: false });
    expect(res.cursoCapacitacion.horarioIds).toEqual([5, 6]);
  });

  it.each([[undefined], [''], ['   ']])('rechaza titulo vacío (%p)', async (titulo) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute({ ...body, titulo })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.cursoCapacitacionRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza fechas faltantes', async () => {
    const { useCase } = crear();
    await expect(useCase.execute({ ...body, fechaInicio: undefined })).rejects.toBeInstanceOf(ValidationError);
    await expect(useCase.execute({ ...body, fechaFin: null })).rejects.toBeInstanceOf(ValidationError);
  });

  it('rechaza fechaFin anterior a fechaInicio', async () => {
    const { useCase } = crear();
    await expect(
      useCase.execute({ ...body, fechaInicio: '2999-03-01', fechaFin: '2999-02-01' })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it.each([['abc'], [NaN], [-1]])('rechaza costo inválido (%p)', async (costo) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute({ ...body, costo })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.cursoCapacitacionRepository.create).not.toHaveBeenCalled();
  });

  it.each([['x'], [{}], [[1, 'a']], [[0]], [[-2]], [[1.5]], [[NaN]]])(
    'rechaza horarioIds inválido (%p)',
    async (horarioIds) => {
      const { deps, useCase } = crear();
      await expect(useCase.execute({ ...body, horarioIds })).rejects.toBeInstanceOf(ValidationError);
      expect(deps.cursoCapacitacionRepository.create).not.toHaveBeenCalled();
    }
  );

  it('lanza NotFoundError si el aula no existe', async () => {
    const { deps, useCase } = crear({ aula: null });
    await expect(useCase.execute({ ...body, aulaId: 99 })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.cursoCapacitacionRepository.create).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si un horario no existe', async () => {
    const { deps, useCase } = crear({ horario: null });
    await expect(useCase.execute({ ...body, horarioIds: [1] })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.cursoCapacitacionRepository.create).not.toHaveBeenCalled();
  });
});
