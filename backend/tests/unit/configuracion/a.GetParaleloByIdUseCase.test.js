import { describe, it, expect, jest } from '@jest/globals';
import { GetParaleloByIdUseCase } from '../../../src/application/use-cases/configuracion/GetParaleloByIdUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('GetParaleloByIdUseCase', () => {
  const entity = { id: 1, careerId: 2, periodId: 3, name: 'A', shift: 'TARDE', active: true };
  const crear = ({ parallel = entity, career = { name: 'Sistemas', code: 'SIS' }, period = { name: 'P1', number: 1 } } = {}) => {
    const parallelRepository = { findById: jest.fn().mockResolvedValue(parallel) };
    const careerRepository = { findById: jest.fn().mockResolvedValue(career) };
    const periodRepository = { findById: jest.fn().mockResolvedValue(period) };
    return {
      parallelRepository,
      careerRepository,
      periodRepository,
      useCase: new GetParaleloByIdUseCase({
        parallelRepository,
        careerRepository,
        periodRepository,
        logger: { info: jest.fn() },
      }),
    };
  };

  it('devuelve el paralelo enriquecido con carrera y periodo', async () => {
    const { useCase, careerRepository, periodRepository } = crear();
    const res = await useCase.execute(1);
    expect(careerRepository.findById).toHaveBeenCalledWith(2);
    expect(periodRepository.findById).toHaveBeenCalledWith(3);
    expect(res).toMatchObject({
      id: 1,
      carreraId: 2,
      periodoId: 3,
      nombre: 'A',
      turno: 'TARDE',
      carreraNombre: 'Sistemas',
      carreraCodigo: 'SIS',
      periodoNombre: 'P1',
      periodoNumero: 1,
    });
  });

  it('lanza NotFoundError si el paralelo no existe', async () => {
    const { useCase, careerRepository } = crear({ parallel: null });
    await expect(useCase.execute(9)).rejects.toBeInstanceOf(NotFoundError);
    expect(careerRepository.findById).not.toHaveBeenCalled();
  });

  it('no consulta carrera ni periodo si el paralelo no los referencia', async () => {
    const { useCase, careerRepository, periodRepository } = crear({
      parallel: { id: 1, name: 'A', shift: 'TARDE' },
    });
    const res = await useCase.execute(1);
    expect(careerRepository.findById).not.toHaveBeenCalled();
    expect(periodRepository.findById).not.toHaveBeenCalled();
    expect(res.carreraNombre).toBeUndefined();
  });

  it('omite los datos de carrera/periodo si no se encuentran', async () => {
    const { useCase } = crear({ career: null, period: null });
    const res = await useCase.execute(1);
    expect(res.carreraNombre).toBeUndefined();
    expect(res.periodoNombre).toBeUndefined();
    expect(res.id).toBe(1);
  });

  it('con id NaN delega y falla con NotFoundError si no hay resultado', async () => {
    const { useCase } = crear({ parallel: null });
    await expect(useCase.execute(Number('abc'))).rejects.toBeInstanceOf(NotFoundError);
  });
});
