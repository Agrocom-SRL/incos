import { describe, it, expect, jest } from '@jest/globals';
import { UpdateTipoEvaluacionUseCase } from '../../../src/application/use-cases/configuracion/UpdateTipoEvaluacionUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('UpdateTipoEvaluacionUseCase', () => {
  const crear = ({ existing = { id: 3 } } = {}) => {
    const evaluationTypeRepository = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue({ id: 3, marca: 'ok' }),
    };
    const logger = { info: jest.fn() };
    return { evaluationTypeRepository, logger, useCase: new UpdateTipoEvaluacionUseCase({ evaluationTypeRepository, logger }) };
  };

  it('mapea el body en español al patch del repositorio y devuelve { tipoEvaluacion }', async () => {
    const { useCase, evaluationTypeRepository } = crear();
    const res = await useCase.execute(3, { codigo: 'EXA', nombre: 'Examen', descripcion: 'd', esRecuperatorio: true, activo: false }, 9);
    expect(evaluationTypeRepository.findById).toHaveBeenCalledWith(3);
    expect(evaluationTypeRepository.update).toHaveBeenCalledWith(3, { code: 'EXA', name: 'Examen', description: 'd', isRecovery: true, active: false }, 9);
    expect(res).toEqual({ tipoEvaluacion: { id: 3, marca: 'ok' } });
  });

  it('acepta alias alternativos del body', async () => {
    const { useCase, evaluationTypeRepository } = crear();
    await useCase.execute(3, { code: 'C', name: 'N', isRecovery: false, active: true }, null);
    expect(evaluationTypeRepository.update).toHaveBeenCalledWith(3, { code: 'C', name: 'N', description: undefined, isRecovery: false, active: true }, null);
  });

  it('con body vacío envía todos los campos undefined (no pisa nada)', async () => {
    const { useCase, evaluationTypeRepository } = crear();
    await useCase.execute(3);
    const patch = evaluationTypeRepository.update.mock.calls[0][1];
    expect(Object.values(patch).every((v) => v === undefined)).toBe(true);
  });

  it('lanza NotFoundError si no existe y no actualiza', async () => {
    const { useCase, evaluationTypeRepository } = crear({ existing: null });
    await expect(useCase.execute(99, {})).rejects.toBeInstanceOf(NotFoundError);
    expect(evaluationTypeRepository.update).not.toHaveBeenCalled();
  });

  it('propaga el error del repositorio', async () => {
    const { useCase, evaluationTypeRepository } = crear();
    evaluationTypeRepository.update.mockRejectedValue(new Error('db'));
    await expect(useCase.execute(3, {})).rejects.toThrow('db');
  });
});
