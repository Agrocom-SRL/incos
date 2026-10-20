import { describe, it, expect, jest } from '@jest/globals';
import { TransicionarPasantiaUseCase } from '../../../src/application/use-cases/pasantias/TransicionarPasantiaUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

const crear = (current, informes = []) => {
  const pasantiaRepository = {
    findById: jest.fn().mockResolvedValue(current),
    update: jest.fn().mockResolvedValue({ id: current?.id, ok: true }),
  };
  const pasantiaInformeRepository = { findByPasantiaId: jest.fn().mockResolvedValue(informes) };
  const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
  const useCase = new TransicionarPasantiaUseCase({
    pasantiaRepository, pasantiaInformeRepository, logger,
  });
  return { pasantiaRepository, pasantiaInformeRepository, logger, useCase };
};

const pasantia = (extra = {}) => ({
  id: 2,
tipo: 'PASANTIA',
estado: 'SOLICITADA',
horasRequeridas: 300,
horasCumplidas: 0,
  observaciones: 'previa',
...extra,
});

describe('TransicionarPasantiaUseCase', () => {
  it('lanza NotFoundError si el trámite no existe', async () => {
    const { useCase, pasantiaRepository } = crear(null);
    await expect(useCase.execute(2, { estado: 'EN_CURSO' })).rejects.toBeInstanceOf(NotFoundError);
    expect(pasantiaRepository.update).not.toHaveBeenCalled();
  });

  it('PASANTIA SOLICITADA -> EN_CURSO con informe VERIFICACION_EMPRESA viable', async () => {
    const { useCase, pasantiaRepository, pasantiaInformeRepository } = crear(
      pasantia(),
      [{ tipo: 'VERIFICACION_EMPRESA', resultado: 'VIABLE' }]
    );
    const res = await useCase.execute(2, { estado: 'EN_CURSO', observaciones: 'ok' }, 7);
    expect(res).toEqual({ pasantia: { id: 2, ok: true } });
    expect(pasantiaInformeRepository.findByPasantiaId).toHaveBeenCalledWith(2);
    expect(pasantiaRepository.update).toHaveBeenCalledWith(
      2, { estado: 'EN_CURSO', observaciones: 'ok' }, 7
    );
  });

  it('conserva las observaciones actuales si no se envían', async () => {
    const { useCase, pasantiaRepository } = crear(pasantia());
    await useCase.execute(2, { estado: 'RECHAZADA' });
    expect(pasantiaRepository.update).toHaveBeenCalledWith(
      2, { estado: 'RECHAZADA', observaciones: 'previa' }, null
    );
  });

  it('RECHAZADA no exige informe', async () => {
    const { useCase, pasantiaInformeRepository } = crear(pasantia());
    await useCase.execute(2, { estado: 'RECHAZADA' });
    expect(pasantiaInformeRepository.findByPasantiaId).not.toHaveBeenCalled();
  });

  it.each([
    ['sin informes', []],
    ['informe NO_VIABLE', [{ tipo: 'VERIFICACION_EMPRESA', resultado: 'NO_VIABLE' }]],
    ['informe de otro tipo', [{ tipo: 'CONVALIDACION_TRABAJO', resultado: 'VIABLE' }]],
  ])('EN_CURSO rechazado: %s', async (_n, informes) => {
    const { useCase, pasantiaRepository } = crear(pasantia(), informes);
    await expect(useCase.execute(2, { estado: 'EN_CURSO' })).rejects.toBeInstanceOf(ValidationError);
    expect(pasantiaRepository.update).not.toHaveBeenCalled();
  });

  it('CONVALIDACION SOLICITADA -> CONVALIDADA con informe CONVALIDACION_TRABAJO viable', async () => {
    const { useCase, pasantiaRepository } = crear(
      pasantia({ tipo: 'CONVALIDACION' }),
      [{ tipo: 'CONVALIDACION_TRABAJO', resultado: 'VIABLE' }]
    );
    await useCase.execute(2, { estado: 'CONVALIDADA' });
    expect(pasantiaRepository.update).toHaveBeenCalled();
  });

  it('CONVALIDACION sin informe viable no puede convalidarse', async () => {
    const { useCase } = crear(pasantia({ tipo: 'CONVALIDACION' }), []);
    await expect(useCase.execute(2, { estado: 'CONVALIDADA' })).rejects.toBeInstanceOf(ValidationError);
  });

  it.each([
    ['PASANTIA', 'SOLICITADA', 'FINALIZADA'],
    ['PASANTIA', 'SOLICITADA', 'CONVALIDADA'],
    ['PASANTIA', 'SOLICITADA', 'CANCELADA'],
    ['PASANTIA', 'EN_CURSO', 'RECHAZADA'],
    ['PASANTIA', 'EN_CURSO', 'SOLICITADA'],
    ['PASANTIA', 'FINALIZADA', 'EN_CURSO'],
    ['PASANTIA', 'RECHAZADA', 'SOLICITADA'],
    ['PASANTIA', 'CANCELADA', 'EN_CURSO'],
    ['CONVALIDACION', 'SOLICITADA', 'EN_CURSO'],
    ['CONVALIDACION', 'SOLICITADA', 'FINALIZADA'],
    ['CONVALIDACION', 'CONVALIDADA', 'RECHAZADA'],
    ['PASANTIA', 'SOLICITADA', 'INEXISTENTE'],
    ['PASANTIA', 'SOLICITADA', undefined],
  ])('transición inválida %s %s -> %s', async (tipo, estado, destino) => {
    const { useCase, pasantiaRepository } = crear(pasantia({ tipo, estado }));
    await expect(useCase.execute(2, { estado: destino })).rejects.toBeInstanceOf(ValidationError);
    expect(pasantiaRepository.update).not.toHaveBeenCalled();
  });

  it('data nula: lanza ValidationError (estado destino indefinido)', async () => {
    const { useCase } = crear(pasantia());
    await expect(useCase.execute(2, undefined)).rejects.toBeInstanceOf(ValidationError);
  });

  it('estado actual desconocido no permite transiciones', async () => {
    const { useCase } = crear(pasantia({ estado: 'RARO' }));
    await expect(useCase.execute(2, { estado: 'EN_CURSO' })).rejects.toBeInstanceOf(ValidationError);
  });

  it('EN_CURSO -> CANCELADA no depende de horas ni informe', async () => {
    const { useCase, pasantiaRepository } = crear(pasantia({ estado: 'EN_CURSO' }));
    await useCase.execute(2, { estado: 'CANCELADA' });
    expect(pasantiaRepository.update).toHaveBeenCalled();
  });

  describe('FINALIZADA', () => {
    it('rechaza si horasCumplidas < horasRequeridas', async () => {
      const { useCase, pasantiaRepository } = crear(
        pasantia({ estado: 'EN_CURSO', horasCumplidas: 299 })
      );
      await expect(useCase.execute(2, { estado: 'FINALIZADA' })).rejects.toBeInstanceOf(ValidationError);
      expect(pasantiaRepository.update).not.toHaveBeenCalled();
    });

    it('rechaza si horasCumplidas es null', async () => {
      const { useCase } = crear(pasantia({ estado: 'EN_CURSO', horasCumplidas: null }));
      await expect(useCase.execute(2, { estado: 'FINALIZADA' })).rejects.toBeInstanceOf(ValidationError);
    });

    it('permite si horasCumplidas == horasRequeridas (valores string de BD)', async () => {
      const { useCase, pasantiaRepository } = crear(
        pasantia({ estado: 'EN_CURSO', horasCumplidas: '300.00', horasRequeridas: '300' })
      );
      await useCase.execute(2, { estado: 'FINALIZADA' });
      expect(pasantiaRepository.update).toHaveBeenCalledWith(
        2, { estado: 'FINALIZADA', observaciones: 'previa' }, null
      );
    });
  });
});
