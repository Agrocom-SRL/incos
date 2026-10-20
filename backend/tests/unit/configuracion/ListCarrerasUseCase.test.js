import { jest } from '@jest/globals';
import { ListCarrerasUseCase } from '../../../src/application/use-cases/configuracion/ListCarrerasUseCase.js';

describe('ListCarrerasUseCase', () => {
  const crear = ({ careers, total, resumen = new Map() }) => {
    const careerRepository = {
      findAll: jest.fn().mockResolvedValue({ careers, total }),
      findResumenAcademicoByCarreraIds: jest.fn().mockResolvedValue(resumen),
    };
    const logger = { info: jest.fn(), error: jest.fn() };
    return { careerRepository, useCase: new ListCarrerasUseCase({ careerRepository, logger }) };
  };

  it('devuelve la página y agrega el resumen académico por carrera', async () => {
    const { useCase, careerRepository } = crear({
      careers: [
        { id: 1, code: 'SIS', name: 'Sistemas' },
        { id: 2, code: 'CON', name: 'Contaduría' },
      ],
      total: 2,
      resumen: new Map([[1, { cantidad_materias: 30, cantidad_periodos: 6 }]]),
    });

    const res = await useCase.execute({}, 1, 10);

    expect(careerRepository.findAll).toHaveBeenCalledWith({}, 1, 10);
    expect(careerRepository.findResumenAcademicoByCarreraIds).toHaveBeenCalledWith([1, 2]);
    expect(res).toMatchObject({ total: 2, page: 1, limit: 10, totalPages: 1 });
    expect(res.carreras[0]).toMatchObject({
      codigo: 'SIS', nombre: 'Sistemas', cantidad_materias: 30, cantidad_periodos: 6,
    });
    // Sin resumen: cae en 0
    expect(res.carreras[1]).toMatchObject({ cantidad_materias: 0, cantidad_periodos: 0 });
  });

  it('no consulta el resumen si la lista viene vacía', async () => {
    const { useCase, careerRepository } = crear({ careers: [], total: 0 });
    const res = await useCase.execute();
    expect(res.carreras).toEqual([]);
    expect(res.totalPages).toBe(0);
    expect(careerRepository.findResumenAcademicoByCarreraIds).not.toHaveBeenCalled();
  });

  it('calcula totalPages con el límite recibido', async () => {
    const { useCase } = crear({ careers: [{ id: 1, code: 'A', name: 'A' }], total: 25 });
    const res = await useCase.execute({}, 2, 10);
    expect(res.totalPages).toBe(3);
    expect(res.page).toBe(2);
  });

  it('propaga el error del repositorio', async () => {
    const careerRepository = { findAll: jest.fn().mockRejectedValue(new Error('BD caída')) };
    const logger = { info: jest.fn(), error: jest.fn() };
    const useCase = new ListCarrerasUseCase({ careerRepository, logger });
    await expect(useCase.execute()).rejects.toThrow('BD caída');
    expect(logger.error).toHaveBeenCalled();
  });
});
