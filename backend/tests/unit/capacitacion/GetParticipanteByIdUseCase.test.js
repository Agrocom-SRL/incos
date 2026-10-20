import { describe, it, expect, jest } from '@jest/globals';
import { GetParticipanteByIdUseCase } from '../../../src/application/use-cases/capacitacion/GetParticipanteByIdUseCase.js';

describe('GetParticipanteByIdUseCase', () => {
  const crear = ({ entity = { id: 3, ci: '1', nombres: 'Ana', celular: '7' }, rows = [] } = {}) => {
    const deps = {
      participanteRepository: { findById: jest.fn().mockResolvedValue(entity) },
      inscripcionCapacitacionRepository: { findListadoRows: jest.fn().mockResolvedValue({ rows }) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new GetParticipanteByIdUseCase(deps) };
  };

  it('devuelve la ficha con inscripciones', async () => {
    const { deps, useCase } = crear({ rows: [{ id: 1, estado: 'INSCRITO' }, { id: 2, estado: 'RETIRADO' }] });
    const res = await useCase.execute(3);
    expect(deps.participanteRepository.findById).toHaveBeenCalledWith(3, { paranoid: false });
    expect(deps.inscripcionCapacitacionRepository.findListadoRows).toHaveBeenCalledWith(
      { participanteId: 3, includeInactive: true },
      1,
      500
    );
    expect(res.id).toBe(3);
    expect(res.inscripciones).toHaveLength(2);
  });

  it('devuelve null si el participante no existe y no consulta inscripciones', async () => {
    const { deps, useCase } = crear({ entity: null });
    await expect(useCase.execute(99)).resolves.toBeNull();
    expect(deps.inscripcionCapacitacionRepository.findListadoRows).not.toHaveBeenCalled();
  });

  it('sin inscripciones devuelve arreglo vacío', async () => {
    const { useCase } = crear();
    const res = await useCase.execute(3);
    expect(res.inscripciones).toEqual([]);
  });
});
