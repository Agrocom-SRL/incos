import { describe, it, expect, jest } from '@jest/globals';
import { NotFoundError } from '../../../src/domain/errors/index.js';

import { UpdateParaleloGestionUseCase } from '../../../src/application/use-cases/oferta/UpdateParaleloGestionUseCase.js';

const logger = () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() });

const crear = ({ existing = { id: 3, state: 'BORRADOR', classroomId: null }, afterAula = { id: 3, state: 'BORRADOR', classroomId: 8 }, cobertura = { cursosTotal: 2, cursosConDocente: 2 } } = {}) => {
  const deps = {
    parallelManagementRepository: {
      findById: jest.fn().mockResolvedValueOnce(existing).mockResolvedValue(afterAula),
      update: jest.fn().mockResolvedValue({ id: 3, classroomId: 8, maxCapacity: 40 }),
    },
    courseOfferRepository: { findCoberturaDocenteByParallelManagementId: jest.fn().mockResolvedValue(cobertura) },
    logger: logger(),
  };
  return { deps, useCase: new UpdateParaleloGestionUseCase(deps) };
};

describe('UpdateParaleloGestionUseCase', () => {
  it('mapea claves snake_case a campos de dominio', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(3, { cupo_maximo: 40, cupo_minimo: 12, observaciones: 'x' }, 2);
    expect(deps.parallelManagementRepository.update).toHaveBeenCalledWith(
      3, { maxCapacity: 40, minCapacity: 12, observations: 'x' }, 2
    );
  });

  it('mapea claves camelCase y devuelve la presentación', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute(3, { cupoMaximo: 40, cupoMinimo: 5 });
    expect(deps.parallelManagementRepository.update).toHaveBeenCalledWith(3, { maxCapacity: 40, minCapacity: 5 }, null);
    expect(res.paraleloGestion).toMatchObject({ id: 3, aulaId: 8, cupoMaximo: 40 });
  });

  it('ignora campos no enviados (payload vacío)', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(3, {});
    expect(deps.parallelManagementRepository.update).toHaveBeenCalledWith(3, {}, null);
    expect(deps.courseOfferRepository.findCoberturaDocenteByParallelManagementId).not.toHaveBeenCalled();
  });

  it('al asignar aula con cobertura completa auto-oferta el paralelo', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(3, { aula_id: 8 }, 2);
    expect(deps.parallelManagementRepository.update).toHaveBeenNthCalledWith(1, 3, { classroomId: 8 }, 2);
    expect(deps.parallelManagementRepository.update).toHaveBeenNthCalledWith(2, 3, { state: 'OFERTADO' }, 2);
  });

  it('al asignar aula sin cobertura completa no cambia el estado', async () => {
    const { deps, useCase } = crear({ cobertura: { cursosTotal: 2, cursosConDocente: 1 } });
    await useCase.execute(3, { aulaId: 8 });
    expect(deps.parallelManagementRepository.update).toHaveBeenCalledTimes(1);
  });

  it('quitar el aula (null) no intenta auto-ofertar', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(3, { aula_id: null });
    expect(deps.parallelManagementRepository.update).toHaveBeenCalledWith(3, { classroomId: null }, null);
    expect(deps.courseOfferRepository.findCoberturaDocenteByParallelManagementId).not.toHaveBeenCalled();
  });

  it.each([99, NaN])('NotFoundError si el paralelo no existe (id %p)', async (id) => {
    const { deps, useCase } = crear({ existing: null });
    await expect(useCase.execute(id, { aula_id: 8 })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.parallelManagementRepository.update).not.toHaveBeenCalled();
  });
});
