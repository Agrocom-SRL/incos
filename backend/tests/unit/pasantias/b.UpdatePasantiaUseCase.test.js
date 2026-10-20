import { describe, it, expect, jest } from '@jest/globals';
import { UpdatePasantiaUseCase } from '../../../src/application/use-cases/pasantias/UpdatePasantiaUseCase.js';
import { ConflictError, NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

const crear = ({ current = { id: 3, tipo: 'PASANTIA', estudianteId: 5 }, tramites = [] } = {}) => {
  const pasantiaRepository = {
    findById: jest.fn().mockResolvedValue(current),
    findAll: jest.fn().mockResolvedValue({ pasantias: tramites }),
    getCollectionName: jest.fn().mockReturnValue('pasantias'),
    update: jest.fn().mockResolvedValue({ id: 3 }),
  };
  const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
  return { pasantiaRepository, logger, useCase: new UpdatePasantiaUseCase({ pasantiaRepository, logger }) };
};

describe('UpdatePasantiaUseCase', () => {
  it('actualiza sin re-verificar vigencia si no cambia el estudiante', async () => {
    const { useCase, pasantiaRepository } = crear();
    const res = await useCase.execute(3, { horasRequeridas: 320, estudianteId: 5 }, 8);
    expect(res).toEqual({ pasantia: { id: 3 } });
    expect(pasantiaRepository.findAll).not.toHaveBeenCalled();
    expect(pasantiaRepository.update).toHaveBeenCalledWith(3, { horasRequeridas: 320, estudianteId: 5 }, 8);
  });

  it('lanza NotFoundError si el trámite no existe', async () => {
    const { useCase, pasantiaRepository } = crear({ current: null });
    await expect(useCase.execute(99, {})).rejects.toBeInstanceOf(NotFoundError);
    expect(pasantiaRepository.update).not.toHaveBeenCalled();
  });

  it('al cambiar de estudiante verifica vigencia y rechaza con ConflictError', async () => {
    const { useCase, pasantiaRepository } = crear({ tramites: [{ id: 20, estado: 'SOLICITADA' }] });
    await expect(useCase.execute(3, { estudianteId: 6 })).rejects.toBeInstanceOf(ConflictError);
    expect(pasantiaRepository.findAll).toHaveBeenCalledWith({ estudianteId: 6 });
    expect(pasantiaRepository.update).not.toHaveBeenCalled();
  });

  it('al cambiar de estudiante sin trámites vigentes actualiza', async () => {
    const { useCase, pasantiaRepository } = crear({ tramites: [{ id: 20, estado: 'RECHAZADA' }] });
    await useCase.execute(3, { estudianteId: 6 });
    expect(pasantiaRepository.update).toHaveBeenCalledWith(3, { estudianteId: 6 }, null);
  });

  it('el propio trámite (excluido) no cuenta como vigente', async () => {
    const { useCase, pasantiaRepository } = crear({ tramites: [{ id: 3, estado: 'EN_CURSO' }] });
    await useCase.execute(3, { estudianteId: 6 });
    expect(pasantiaRepository.update).toHaveBeenCalled();
  });

  it.each([
    ['tipo inválido', { tipo: 'X' }],
    ['horas fuera de rango', { horasRequeridas: 10 }],
    ['contrato en trámite PASANTIA', { tipoContratoDetalle: 'algo' }],
  ])('valida la entrada: %s', async (_n, payload) => {
    const { useCase, pasantiaRepository } = crear();
    await expect(useCase.execute(3, payload)).rejects.toBeInstanceOf(ValidationError);
    expect(pasantiaRepository.update).not.toHaveBeenCalled();
  });

  it('acepta contrato si el tipo actual es CONVALIDACION', async () => {
    const { useCase, pasantiaRepository } = crear({
      current: { id: 3, tipo: 'CONVALIDACION', estudianteId: 5 },
    });
    await useCase.execute(3, { tipoContrato: 'PERMANENTE' });
    expect(pasantiaRepository.update).toHaveBeenCalledWith(3, { tipoContrato: 'PERMANENTE' }, null);
  });
});
