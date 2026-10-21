import { describe, it, expect, jest } from '@jest/globals';
import { GetTipoEvaluacionByIdUseCase } from '../../../src/application/use-cases/configuracion/GetTipoEvaluacionByIdUseCase.js';

describe('GetTipoEvaluacionByIdUseCase', () => {
  const crear = ({ entity = { id: 2, code: 'EXA', name: 'Examen' }, cantidad = 4 } = {}) => {
    const evaluationTypeRepository = {
      findById: jest.fn().mockResolvedValue(entity),
      contarPorTipoEvaluacion: jest.fn().mockResolvedValue(cantidad),
    };
    return {
      evaluationTypeRepository,
      useCase: new GetTipoEvaluacionByIdUseCase({ evaluationTypeRepository, logger: { info: jest.fn() } }),
    };
  };

  it('devuelve la presentación con cantidadEvaluaciones', async () => {
    const { useCase, evaluationTypeRepository } = crear();
    const res = await useCase.execute(2);
    expect(evaluationTypeRepository.findById).toHaveBeenCalledWith(2, { paranoid: false });
    expect(evaluationTypeRepository.contarPorTipoEvaluacion).toHaveBeenCalledWith(2);
    expect(res).toMatchObject({ id: 2, codigo: 'EXA', nombre: 'Examen', cantidadEvaluaciones: 4 });
  });

  it('devuelve cantidadEvaluaciones 0 cuando no hay uso', async () => {
    const { useCase } = crear({ cantidad: 0 });
    const res = await useCase.execute(2);
    expect(res.cantidadEvaluaciones).toBe(0);
  });

  it('devuelve null y no cuenta si no existe', async () => {
    const { useCase, evaluationTypeRepository } = crear({ entity: null });
    await expect(useCase.execute(99)).resolves.toBeNull();
    expect(evaluationTypeRepository.contarPorTipoEvaluacion).not.toHaveBeenCalled();
  });

  it('propaga el error del conteo', async () => {
    const { useCase, evaluationTypeRepository } = crear();
    evaluationTypeRepository.contarPorTipoEvaluacion.mockRejectedValue(new Error('db'));
    await expect(useCase.execute(2)).rejects.toThrow('db');
  });
});
