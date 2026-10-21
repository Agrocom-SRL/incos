import { describe, it, expect, jest } from '@jest/globals';
import { ListParticipantesUseCase } from '../../../src/application/use-cases/capacitacion/ListParticipantesUseCase.js';

describe('ListParticipantesUseCase', () => {
  const crear = (participantes = [], total = participantes.length) => {
    const deps = {
      participanteRepository: { findAll: jest.fn().mockResolvedValue({ participantes, total }) },
      logger: { info: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new ListParticipantesUseCase(deps) };
  };

  it('lista bajo la clave participantes con paginación', async () => {
    const { deps, useCase } = crear([{ id: 1, ci: '1', nombres: 'Ana', apellidoPaterno: 'Paz' }], 11);
    const res = await useCase.execute({ search: 'a' }, 2, 5, { ci: ' 123 ' });
    expect(deps.participanteRepository.findAll).toHaveBeenCalledWith({ search: 'a', ci: '123' }, 2, 5);
    expect(res).toMatchObject({ total: 11, page: 2, limit: 5, totalPages: 3 });
    expect(res.participantes[0]).toMatchObject({ id: 1, nombreCompleto: 'Paz Ana' });
  });

  it('convierte incluirInactivos y sinInscripcionActiva a booleano', () => {
    const { useCase } = crear();
    expect(useCase.buildSpecificFilters({ incluirInactivos: 'true', sinInscripcionActiva: true })).toEqual({
      includeInactive: true,
      sinInscripcionActiva: true,
    });
    expect(useCase.buildSpecificFilters({ incluirInactivos: 'false', sinInscripcionActiva: 'no' })).toEqual({
      includeInactive: false,
      sinInscripcionActiva: false,
    });
  });

  it('sin queryParams usa baseFilters y valores por defecto', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute({ search: 'z' }, 'x', NaN);
    expect(deps.participanteRepository.findAll).toHaveBeenCalledWith({ search: 'z' }, 1, 50);
    expect(res.participantes).toEqual([]);
  });

  it('propaga el error del repositorio y lo registra', async () => {
    const { deps, useCase } = crear();
    deps.participanteRepository.findAll.mockRejectedValue(new Error('boom'));
    await expect(useCase.execute({}, 1, 10)).rejects.toThrow('boom');
    expect(deps.logger.error).toHaveBeenCalled();
  });
});
