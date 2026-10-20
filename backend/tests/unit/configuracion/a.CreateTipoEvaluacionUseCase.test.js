import { describe, it, expect, jest } from '@jest/globals';
import { CreateTipoEvaluacionUseCase } from '../../../src/application/use-cases/configuracion/CreateTipoEvaluacionUseCase.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';

describe('CreateTipoEvaluacionUseCase', () => {
  const crear = () => {
    const evaluationTypeRepository = { create: jest.fn().mockResolvedValue({ id: 8 }) };
    const logger = { info: jest.fn() };
    return {
      evaluationTypeRepository,
      logger,
      useCase: new CreateTipoEvaluacionUseCase({ evaluationTypeRepository, logger }),
    };
  };

  it('crea el tipo y registra el log', async () => {
    const { useCase, evaluationTypeRepository, logger } = crear();
    const res = await useCase.execute(
      { codigo: 'EX', nombre: 'Examen', descripcion: 'd', esRecuperatorio: true, activo: false },
      2
    );
    expect(res).toEqual({ tipoEvaluacion: { id: 8 } });
    expect(evaluationTypeRepository.create).toHaveBeenCalledWith(
      { code: 'EX', name: 'Examen', description: 'd', isRecovery: true, active: false },
      2
    );
    expect(logger.info).toHaveBeenCalledWith('Tipo de evaluación creado', { id: 8 });
  });

  it('acepta alias en inglés y aplica defaults', async () => {
    const { useCase, evaluationTypeRepository } = crear();
    await useCase.execute({ code: 'C', name: 'N' });
    expect(evaluationTypeRepository.create).toHaveBeenCalledWith(
      { code: 'C', name: 'N', description: undefined, isRecovery: false, active: true },
      null
    );
  });

  it('rechaza si falta codigo', async () => {
    const { useCase, evaluationTypeRepository } = crear();
    await expect(useCase.execute({ nombre: 'N' })).rejects.toBeInstanceOf(ValidationError);
    expect(evaluationTypeRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza si falta nombre', async () => {
    const { useCase, evaluationTypeRepository } = crear();
    await expect(useCase.execute({ codigo: 'C' })).rejects.toBeInstanceOf(ValidationError);
    expect(evaluationTypeRepository.create).not.toHaveBeenCalled();
  });
});
