import { describe, it, expect, jest } from '@jest/globals';
import { autoOfertarParaleloGestion } from '../../../src/application/use-cases/oferta/autoOfertarParaleloGestion.js';

const crear = ({ pg = { id: 3, state: 'BORRADOR', classroomId: 8 }, cobertura = { cursosTotal: 3, cursosConDocente: 3 } } = {}) => {
  const deps = {
    parallelManagementRepository: {
      findById: jest.fn().mockResolvedValue(pg),
      update: jest.fn().mockResolvedValue({ id: 3, state: 'OFERTADO' }),
    },
    courseOfferRepository: { findCoberturaDocenteByParallelManagementId: jest.fn().mockResolvedValue(cobertura) },
    logger: { info: jest.fn(), warn: jest.fn() },
  };
  return deps;
};

describe('autoOfertarParaleloGestion', () => {
  it('BORRADOR con aula y todos los cursos con docente pasa a OFERTADO', async () => {
    const deps = crear();
    const res = await autoOfertarParaleloGestion(deps, '3', 5);
    expect(deps.parallelManagementRepository.update).toHaveBeenCalledWith(3, { state: 'OFERTADO' }, 5);
    expect(res).toEqual({ id: 3, state: 'OFERTADO' });
    expect(deps.logger.info).toHaveBeenCalled();
  });

  it('acepta el alias aulaId / estado', async () => {
    const deps = crear({ pg: { id: 3, estado: 'BORRADOR', aulaId: 2 } });
    expect(await autoOfertarParaleloGestion(deps, 3)).not.toBeNull();
  });

  it.each([NaN, 0, -1, 'abc', undefined])('id inválido %p devuelve null sin consultar', async (id) => {
    const deps = crear();
    expect(await autoOfertarParaleloGestion(deps, id)).toBeNull();
    expect(deps.parallelManagementRepository.findById).not.toHaveBeenCalled();
  });

  it('devuelve null si faltan dependencias', async () => {
    expect(await autoOfertarParaleloGestion(undefined, 3)).toBeNull();
    expect(await autoOfertarParaleloGestion({ parallelManagementRepository: {} }, 3)).toBeNull();
  });

  it('devuelve null si el paralelo no existe', async () => {
    const deps = crear({ pg: null });
    expect(await autoOfertarParaleloGestion(deps, 3)).toBeNull();
    expect(deps.parallelManagementRepository.update).not.toHaveBeenCalled();
  });

  it.each(['OFERTADO', 'PUBLICADO', 'CERRADO'])('no actúa si el estado es %s', async (state) => {
    const deps = crear({ pg: { id: 3, state, classroomId: 8 } });
    expect(await autoOfertarParaleloGestion(deps, 3)).toBeNull();
    expect(deps.parallelManagementRepository.update).not.toHaveBeenCalled();
  });

  it('no actúa sin aula', async () => {
    const deps = crear({ pg: { id: 3, state: 'BORRADOR', classroomId: null } });
    expect(await autoOfertarParaleloGestion(deps, 3)).toBeNull();
    expect(deps.courseOfferRepository.findCoberturaDocenteByParallelManagementId).not.toHaveBeenCalled();
  });

  it.each([
    ['sin cobertura', null],
    ['sin cursos', { cursosTotal: 0, cursosConDocente: 0 }],
    ['cursos sin docente', { cursosTotal: 3, cursosConDocente: 2 }],
  ])('no actúa %s', async (_n, cobertura) => {
    const deps = crear({ cobertura });
    expect(await autoOfertarParaleloGestion(deps, 3)).toBeNull();
    expect(deps.parallelManagementRepository.update).not.toHaveBeenCalled();
  });

  it('un error del repositorio se registra y devuelve null', async () => {
    const deps = crear();
    deps.parallelManagementRepository.update.mockRejectedValue(new Error('boom'));
    expect(await autoOfertarParaleloGestion(deps, 3)).toBeNull();
    expect(deps.logger.warn).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ error: 'boom' }));
  });

  it('funciona sin logger', async () => {
    const deps = crear();
    delete deps.logger;
    expect(await autoOfertarParaleloGestion(deps, 3)).not.toBeNull();
  });
});
