import { describe, it, expect, jest } from '@jest/globals';
import { CreateMateriaUseCase } from '../../../src/application/use-cases/configuracion/CreateMateriaUseCase.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';

describe('CreateMateriaUseCase', () => {
  const crear = () => {
    const subjectRepository = { create: jest.fn().mockResolvedValue({ id: 2 }) };
    const logger = { info: jest.fn() };
    return { subjectRepository, logger, useCase: new CreateMateriaUseCase({ subjectRepository, logger }) };
  };

  it('crea la materia y registra el log', async () => {
    const { useCase, subjectRepository, logger } = crear();
    const res = await useCase.execute(
      {
        sigla: 'MAT-101',
        nombre: 'Matemática',
        objetivos: 'o',
        areaConocimiento: 'Exactas',
        clasificacion: 'BASICA',
        tipo: 'TEORICA',
        activo: false,
      },
      5
    );
    expect(res).toEqual({ materia: { id: 2 } });
    expect(subjectRepository.create).toHaveBeenCalledWith(
      {
        acronym: 'MAT-101',
        name: 'Matemática',
        objectives: 'o',
        knowledgeArea: 'Exactas',
        classification: 'BASICA',
        type: 'TEORICA',
        active: false,
      },
      5
    );
    expect(logger.info).toHaveBeenCalledWith('Materia creada', { id: 2 });
  });

  it('acepta alias en inglés y activo=true por defecto', async () => {
    const { useCase, subjectRepository } = crear();
    await useCase.execute({ acronym: 'A', name: 'B' });
    expect(subjectRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ acronym: 'A', name: 'B', active: true }),
      null
    );
  });

  it('rechaza si falta sigla', async () => {
    const { useCase, subjectRepository } = crear();
    await expect(useCase.execute({ nombre: 'B' })).rejects.toBeInstanceOf(ValidationError);
    expect(subjectRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza si falta nombre', async () => {
    const { useCase, subjectRepository } = crear();
    await expect(useCase.execute({ sigla: 'A' })).rejects.toBeInstanceOf(ValidationError);
    expect(subjectRepository.create).not.toHaveBeenCalled();
  });
});
