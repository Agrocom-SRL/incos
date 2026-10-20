import { jest } from '@jest/globals';
import { ListEnrollmentsUseCase } from '../../../src/application/use-cases/inscripciones/ListEnrollmentsUseCase.js';

describe('ListEnrollmentsUseCase', () => {
  const rows = [
    { inscripcion_id: 1, estudiante_id: 5, estudiante_nombre_completo: 'Lopez Ana', carrera_nombre: 'Enf', cantidad_materias: 6 },
    { inscripcion_id: 2, estudiante_id: 6 },
  ];
  const crear = (enrollments = rows, total = 25) => {
    const deps = {
      enrollmentRepository: { obtenerListadoMatriculas: jest.fn().mockResolvedValue({ enrollments, total }) },
      logger: { info: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new ListEnrollmentsUseCase(deps) };
  };

  it('lista vía obtenerListadoMatriculas bajo dataFieldName inscripciones', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ search: 'ana' }, 2, 10, { gestionId: '3' });

    expect(deps.enrollmentRepository.obtenerListadoMatriculas).toHaveBeenCalledWith(
      { search: 'ana' },
      2,
      10,
      { gestionId: '3' }
    );
    expect(res.inscripciones[0]).toEqual(
      expect.objectContaining({
        id: 1,
        cantidadMaterias: 6,
        estudiante: expect.objectContaining({ id: 5, nombreCompleto: 'Lopez Ana' }),
        carrera: expect.objectContaining({ nombre: 'Enf' }),
      })
    );
    expect(res).toEqual(expect.objectContaining({ total: 25, page: 2, limit: 10, totalPages: 3 }));
  });

  it('page/limit NaN caen a 1 y 50', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({}, 'x', 'y');
    expect(deps.enrollmentRepository.obtenerListadoMatriculas).toHaveBeenCalledWith({}, 1, 50, {});
    expect(res.totalPages).toBe(1);
  });

  it('resultado vacío: lista vacía y totalPages 0', async () => {
    const { useCase } = crear([], 0);
    const res = await useCase.execute();
    expect(res.inscripciones).toEqual([]);
    expect(res.totalPages).toBe(0);
  });

  it('total ausente se trata como 0', async () => {
    const { useCase, deps } = crear();
    deps.enrollmentRepository.obtenerListadoMatriculas.mockResolvedValue({ enrollments: [] });
    const res = await useCase.execute();
    expect(res.total).toBe(0);
  });

  it('propaga el error del repositorio y lo registra', async () => {
    const { useCase, deps } = crear();
    deps.enrollmentRepository.obtenerListadoMatriculas.mockRejectedValue(new Error('db'));
    await expect(useCase.execute()).rejects.toThrow('db');
    expect(deps.logger.error).toHaveBeenCalled();
  });
});
