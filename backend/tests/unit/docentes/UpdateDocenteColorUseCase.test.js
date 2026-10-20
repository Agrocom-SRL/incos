import { describe, it, expect, jest } from '@jest/globals';
import { UpdateDocenteColorUseCase } from '../../../src/application/use-cases/docentes/UpdateDocenteColorUseCase.js';
import {
  NotFoundError, UnprocessableEntityError, ValidationError,
} from '../../../src/domain/errors/AppError.js';

describe('UpdateDocenteColorUseCase', () => {
  const crear = () => {
    const deps = {
      teacherRepository: {
        findById: jest.fn().mockResolvedValue({ id: 3 }),
        findActiveByColorHex: jest.fn().mockResolvedValue(null),
        findActiveColorAssignments: jest.fn().mockResolvedValue([
          { docenteId: 9, colorHex: '#E6194B', docenteNombre: 'Otro' },
        ]),
        update: jest.fn().mockResolvedValue({ id: 3, colorHex: '#E6194B' }),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new UpdateDocenteColorUseCase(deps) };
  };

  it('normaliza el color (sin # y minúsculas), actualiza y devuelve la presentación', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ docenteId: '3', colorHex: 'e6194b' }, 11);

    expect(deps.teacherRepository.findActiveByColorHex).toHaveBeenCalledWith('#E6194B', 3);
    expect(deps.teacherRepository.update).toHaveBeenCalledWith(3, { colorHex: '#E6194B' }, 11);
    expect(res).toEqual({ docente_id: 3, color_hex: '#E6194B' });
  });

  it.each([[0], [-1], ['abc'], [undefined]])('docenteId inválido (%p) lanza ValidationError', async (docenteId) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ docenteId, colorHex: '#E6194B' }))
      .rejects.toBeInstanceOf(ValidationError);
    expect(deps.teacherRepository.findById).not.toHaveBeenCalled();
  });

  it.each([[''], [null], [undefined], ['#12345'], ['#GGGGGG'], ['rojo']])(
    'color inválido (%p) lanza 422',
    async (colorHex) => {
      const { useCase, deps } = crear();
      await expect(useCase.execute({ docenteId: 3, colorHex }))
        .rejects.toBeInstanceOf(UnprocessableEntityError);
      expect(deps.teacherRepository.update).not.toHaveBeenCalled();
    }
  );

  it('lanza NotFoundError si el docente no existe', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute({ docenteId: 3, colorHex: '#E6194B' }))
      .rejects.toBeInstanceOf(NotFoundError);
  });

  it('rechaza un color en uso por otro docente activo y devuelve los colores en uso', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findActiveByColorHex.mockResolvedValue({ id: 9 });
    const err = await useCase.execute({ docenteId: 3, colorHex: '#E6194B' }).catch((e) => e);
    expect(err).toBeInstanceOf(UnprocessableEntityError);
    expect(err.extensions.colores_en_uso).toEqual([
      { docente_id: 9, color_hex: '#E6194B', docente_nombre: 'Otro' },
    ]);
    expect(deps.teacherRepository.update).not.toHaveBeenCalled();
  });
});
