import { describe, it, expect, jest } from '@jest/globals';
import { GetTipoEvaluacionByIdUseCase } from '../../../src/application/use-cases/configuracion/GetTipoEvaluacionByIdUseCase.js';

describe('GetTipoEvaluacionByIdUseCase', () => {
  const crear = ({ entity, cantidad = 0 } = {}) => {
    const evaluationTypeRepository = {
      findById: jest.fn().mockResolvedValue(entity),
      contarPorTipoEvaluacion: jest.fn().mockResolvedValue(cantidad),
    };
    return {
      evaluationTypeRepository,
      useCase: new GetTipoEvaluacionByIdUseCase({ evaluationTypeRepository, logger: { info: jest.fn() } }),
    };
  };

  it('devuelve el tipo con cantidadEvaluaciones', async () => {
    const { useCase, evaluationTypeRepository } = crear({
      entity: { id: 2, code: 'EX', name: 'Examen', description: null, isRecovery: false, active: true },
      cantidad: 6,
    });
    const res = await useCase.execute(2);
    expect(evaluationTypeRepository.findById).toHaveBeenCalledWith(2, { paranoid: false });
    expect(evaluationTypeRepository.contarPorTipoEvaluacion).toHaveBeenCalledWith(2);
    expect(res).toMatchObject({
      id: 2,
      codigo: 'EX',
      nombre: 'Examen',
      descripcion: null,
      esRecuperatorio: false,
      activo: true,
      cantidadEvaluaciones: 6,
    });
  });

  it('devuelve null si no existe y no cuenta evaluaciones', async () => {
    const { useCase, evaluationTypeRepository } = crear({ entity: null });
    await expect(useCase.execute(99)).resolves.toBeNull();
    expect(evaluationTypeRepository.contarPorTipoEvaluacion).not.toHaveBeenCalled();
  });

  it('con id NaN delega al repositorio y devuelve null si no encuentra', async () => {
    const { useCase, evaluationTypeRepository } = crear({ entity: null });
    await expect(useCase.execute(Number('abc'))).resolves.toBeNull();
    expect(evaluationTypeRepository.findById).toHaveBeenCalledWith(NaN, { paranoid: false });
  });
});
