import { describe, it, expect, jest } from '@jest/globals';
import { UpdateMateriaUseCase } from '../../../src/application/use-cases/configuracion/UpdateMateriaUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('UpdateMateriaUseCase', () => {
  const crear = ({ existing = { id: 3 } } = {}) => {
    const subjectRepository = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue({ id: 3, marca: 'ok' }),
    };
    const logger = { info: jest.fn() };
    return { subjectRepository, logger, useCase: new UpdateMateriaUseCase({ subjectRepository, logger }) };
  };

  it('mapea el body en español al patch del repositorio y devuelve { materia }', async () => {
    const { useCase, subjectRepository } = crear();
    const res = await useCase.execute(3, { sigla: 'MAT-1', nombre: 'Mate', objetivos: 'o', areaConocimiento: 'ac', clasificacion: 'cl', tipo: 'T', activo: false }, 9);
    expect(subjectRepository.findById).toHaveBeenCalledWith(3);
    expect(subjectRepository.update).toHaveBeenCalledWith(3, { acronym: 'MAT-1', name: 'Mate', objectives: 'o', knowledgeArea: 'ac', classification: 'cl', type: 'T', active: false }, 9);
    expect(res).toEqual({ materia: { id: 3, marca: 'ok' } });
  });

  it('acepta alias alternativos del body', async () => {
    const { useCase, subjectRepository } = crear();
    await useCase.execute(3, { acronym: 'S', name: 'N', type: 'X', active: true }, null);
    expect(subjectRepository.update).toHaveBeenCalledWith(3, { acronym: 'S', name: 'N', objectives: undefined, knowledgeArea: undefined, classification: undefined, type: 'X', active: true }, null);
  });

  it('con body vacío envía todos los campos undefined (no pisa nada)', async () => {
    const { useCase, subjectRepository } = crear();
    await useCase.execute(3);
    const patch = subjectRepository.update.mock.calls[0][1];
    expect(Object.values(patch).every((v) => v === undefined)).toBe(true);
  });

  it('lanza NotFoundError si no existe y no actualiza', async () => {
    const { useCase, subjectRepository } = crear({ existing: null });
    await expect(useCase.execute(99, {})).rejects.toBeInstanceOf(NotFoundError);
    expect(subjectRepository.update).not.toHaveBeenCalled();
  });

  it('propaga el error del repositorio', async () => {
    const { useCase, subjectRepository } = crear();
    subjectRepository.update.mockRejectedValue(new Error('db'));
    await expect(useCase.execute(3, {})).rejects.toThrow('db');
  });
});
