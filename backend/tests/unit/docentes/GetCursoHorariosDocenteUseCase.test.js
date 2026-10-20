import { describe, it, expect, jest } from '@jest/globals';
import { GetCursoHorariosDocenteUseCase } from '../../../src/application/use-cases/docentes/GetCursoHorariosDocenteUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('GetCursoHorariosDocenteUseCase', () => {
  const crear = () => {
    const deps = {
      courseOfferRepository: {
        findById: jest.fn().mockResolvedValue({ code: 'OC-9', colorHex: '#E6194B' }),
      },
      asignacionHorarioRepository: {
        findBloquesByOfertaCursoIdForPresentation: jest.fn().mockResolvedValue([{ id: 1 }]),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GetCursoHorariosDocenteUseCase(deps) };
  };

  it('devuelve bloques y datos de la oferta (cursoId = ofertaCursoId)', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute('5');
    expect(deps.asignacionHorarioRepository.findBloquesByOfertaCursoIdForPresentation)
      .toHaveBeenCalledWith(5);
    expect(res).toEqual({
      bloques: [{ id: 1 }], cursoId: 5, ofertaCursoId: 5, cursoCodigo: 'OC-9', cursoColorHex: '#E6194B',
    });
  });

  it('usa OC-{id} y color null si la oferta no los trae', async () => {
    const { useCase, deps } = crear();
    deps.courseOfferRepository.findById.mockResolvedValue({ toPlainObject: () => ({}) });
    const res = await useCase.execute(5);
    expect(res).toMatchObject({ cursoCodigo: 'OC-5', cursoColorHex: null });
  });

  it.each([[0], [-1], ['abc'], [undefined]])('id inválido (%p) lanza NotFoundError', async (id) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(id)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.courseOfferRepository.findById).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si la oferta no existe', async () => {
    const { useCase, deps } = crear();
    deps.courseOfferRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(5)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.asignacionHorarioRepository.findBloquesByOfertaCursoIdForPresentation)
      .not.toHaveBeenCalled();
  });
});
