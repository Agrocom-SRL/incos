import { describe, it, expect, jest } from '@jest/globals';
import { CreatePasantiaUseCase } from '../../../src/application/use-cases/pasantias/CreatePasantiaUseCase.js';
import { ConflictError, ValidationError } from '../../../src/domain/errors/AppError.js';

const crear = (tramites = []) => {
  const pasantiaRepository = {
    findAll: jest.fn().mockResolvedValue({ pasantias: tramites }),
    getCollectionName: jest.fn().mockReturnValue('pasantias'),
    create: jest.fn().mockResolvedValue({ id: 9, tipo: 'PASANTIA', estudianteId: 5 }),
  };
  const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
  return { pasantiaRepository, logger, useCase: new CreatePasantiaUseCase({ pasantiaRepository, logger }) };
};

describe('CreatePasantiaUseCase', () => {
  const data = { estudianteId: 5, tipo: 'PASANTIA', horasRequeridas: 300 };

  it('crea el trámite y devuelve { pasantia }', async () => {
    const { useCase, pasantiaRepository, logger } = crear();
    const res = await useCase.execute(data, 7);
    expect(res).toEqual({ pasantia: { id: 9, tipo: 'PASANTIA', estudianteId: 5 } });
    expect(pasantiaRepository.findAll).toHaveBeenCalledWith({ estudianteId: 5 });
    expect(pasantiaRepository.create).toHaveBeenCalledWith(data, 7);
    expect(logger.info).toHaveBeenCalled();
  });

  it('permite crear si los trámites previos no están vigentes', async () => {
    const { useCase, pasantiaRepository } = crear([{ id: 1, estado: 'FINALIZADA' }]);
    await useCase.execute(data);
    expect(pasantiaRepository.create).toHaveBeenCalledWith(data, null);
  });

  it('rechaza si el estudiante ya tiene un trámite vigente', async () => {
    const { useCase, pasantiaRepository } = crear([{ id: 1, estado: 'EN_CURSO' }]);
    await expect(useCase.execute(data)).rejects.toBeInstanceOf(ConflictError);
    expect(pasantiaRepository.create).not.toHaveBeenCalled();
  });

  it.each([
    ['sin estudianteId', { tipo: 'PASANTIA' }],
    ['tipo inválido', { estudianteId: 5, tipo: 'OTRO' }],
    ['horas por debajo del mínimo', { estudianteId: 5, tipo: 'PASANTIA', horasRequeridas: 299 }],
    ['horas por encima del máximo', { estudianteId: 5, tipo: 'PASANTIA', horasRequeridas: 361 }],
    ['contrato en PASANTIA', { estudianteId: 5, tipo: 'PASANTIA', tipoContrato: 'PERMANENTE' }],
  ])('valida la entrada: %s', async (_n, payload) => {
    const { useCase, pasantiaRepository } = crear();
    await expect(useCase.execute(payload)).rejects.toBeInstanceOf(ValidationError);
    expect(pasantiaRepository.findAll).not.toHaveBeenCalled();
    expect(pasantiaRepository.create).not.toHaveBeenCalled();
  });

  it('acepta campos de contrato en CONVALIDACION y horas límite 360', async () => {
    const { useCase, pasantiaRepository } = crear();
    const payload = {
      estudianteId: 5, tipo: 'CONVALIDACION', horasRequeridas: 360, tipoContrato: 'OTRO',
    };
    await useCase.execute(payload);
    expect(pasantiaRepository.create).toHaveBeenCalledWith(payload, null);
  });
});
