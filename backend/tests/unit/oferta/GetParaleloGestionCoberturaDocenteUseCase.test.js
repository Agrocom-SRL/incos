import { describe, it, expect, jest } from '@jest/globals';
import { NotFoundError } from '../../../src/domain/errors/index.js';

import { GetParaleloGestionCoberturaDocenteUseCase } from '../../../src/application/use-cases/oferta/GetParaleloGestionCoberturaDocenteUseCase.js';

const logger = () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() });

const crear = ({ pg = { id: 3 }, cobertura = { cursosTotal: 4, cursosConDocente: 3, faltantes: [{ ofertaCursoId: 8, asignatura: 'MAT' }] } } = {}) => {
  const deps = {
    parallelManagementRepository: { findById: jest.fn().mockResolvedValue(pg) },
    courseOfferRepository: { findCoberturaDocenteByParallelManagementId: jest.fn().mockResolvedValue(cobertura) },
    logger: logger(),
  };
  return { deps, useCase: new GetParaleloGestionCoberturaDocenteUseCase(deps) };
};

describe('GetParaleloGestionCoberturaDocenteUseCase', () => {
  it('devuelve la cobertura mapeada en snake_case', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute('3');
    expect(deps.parallelManagementRepository.findById).toHaveBeenCalledWith(3);
    expect(deps.courseOfferRepository.findCoberturaDocenteByParallelManagementId).toHaveBeenCalledWith(3);
    expect(res).toEqual({
      paralelo_gestion_id: 3,
      cursos_total: 4,
      cursos_con_docente: 3,
      cursos_sin_docente: 1,
      faltantes: [{ oferta_curso_id: 8, asignatura: 'MAT' }],
      cobertura_pct: 75,
    });
  });

  it('cobertura 0 % cuando no hay cursos', async () => {
    const { useCase } = crear({ cobertura: { cursosTotal: 0, cursosConDocente: 0 } });
    const res = await useCase.execute(3);
    expect(res).toMatchObject({ cursos_total: 0, cobertura_pct: 0, faltantes: [] });
  });

  it.each([NaN, 0, -2, 'abc', undefined])('NotFoundError sin consultar con id %p', async (id) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(id)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.parallelManagementRepository.findById).not.toHaveBeenCalled();
  });

  it('NotFoundError si el paralelo no existe', async () => {
    const { deps, useCase } = crear({ pg: null });
    await expect(useCase.execute(3)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.courseOfferRepository.findCoberturaDocenteByParallelManagementId).not.toHaveBeenCalled();
  });
});
