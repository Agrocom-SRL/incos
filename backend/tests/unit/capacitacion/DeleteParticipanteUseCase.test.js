import { describe, it, expect, jest } from '@jest/globals';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';
import { DeleteParticipanteUseCase } from '../../../src/application/use-cases/capacitacion/DeleteParticipanteUseCase.js';

describe('DeleteParticipanteUseCase', () => {
  const crear = ({ participante = { id: 9 }, inscripcionIds = [] } = {}) => {
    const orden = [];
    const deps = {
      participanteRepository: {
        findById: jest.fn().mockResolvedValue(participante),
        delete: jest.fn().mockImplementation(async () => { orden.push('participante'); return true; }),
      },
      inscripcionCapacitacionRepository: {
        findIdsByParticipanteId: jest.fn().mockResolvedValue(inscripcionIds),
      },
      deleteInscripcionCapacitacionUseCase: {
        execute: jest.fn().mockImplementation(async (id) => { orden.push(`inscripcion-${id}`); return true; }),
      },
      logger: { info: jest.fn() },
    };
    return { deps, orden, useCase: new DeleteParticipanteUseCase(deps) };
  };

  it('sin inscripciones elimina solo al participante', async () => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(9, 4)).resolves.toBe(true);
    expect(deps.deleteInscripcionCapacitacionUseCase.execute).not.toHaveBeenCalled();
    expect(deps.participanteRepository.delete).toHaveBeenCalledWith(9, 4);
  });

  it('en cascada: elimina cada inscripción (con sus pagos) y al final al participante', async () => {
    const { deps, orden, useCase } = crear({ inscripcionIds: [3, 5, 8] });
    await useCase.execute(9, 4);
    expect(deps.deleteInscripcionCapacitacionUseCase.execute).toHaveBeenCalledWith(3, 4);
    expect(deps.deleteInscripcionCapacitacionUseCase.execute).toHaveBeenCalledWith(5, 4);
    expect(deps.deleteInscripcionCapacitacionUseCase.execute).toHaveBeenCalledWith(8, 4);
    expect(orden).toEqual(['inscripcion-3', 'inscripcion-5', 'inscripcion-8', 'participante']);
  });

  it('si falla la eliminación de una inscripción no elimina al participante', async () => {
    const { deps, useCase } = crear({ inscripcionIds: [3, 5] });
    deps.deleteInscripcionCapacitacionUseCase.execute.mockRejectedValueOnce(new Error('fallo'));
    await expect(useCase.execute(9, 4)).rejects.toThrow('fallo');
    expect(deps.participanteRepository.delete).not.toHaveBeenCalled();
  });

  it('404 si el participante no existe', async () => {
    const { deps, useCase } = crear({ participante: null });
    await expect(useCase.execute(99)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.participanteRepository.delete).not.toHaveBeenCalled();
  });
});
