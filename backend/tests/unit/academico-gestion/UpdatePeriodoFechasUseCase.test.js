import { describe, it, expect, jest } from '@jest/globals';
import { UpdatePeriodoFechasUseCase } from '../../../src/application/use-cases/academico/UpdatePeriodoFechasUseCase.js';

describe('UpdatePeriodoFechasUseCase', () => {
  const crear = ({ existing = { id: 5, managementId: 3 }, ctx = { gestion_id: 3 } } = {}) => {
    const deps = {
      academicPeriodRepository: {
        findById: jest.fn().mockResolvedValue(existing),
        update: jest.fn().mockImplementation(async (id, d) => ({ id, name: 'P', division: 'OTRO', ...d })),
      },
      calificacionContextoRepository: { obtenerContextoVigente: jest.fn().mockResolvedValue(ctx) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new UpdatePeriodoFechasUseCase(deps) };
  };
  const params = (o = {}) => ({ id: '5', fechaInicio: '2026-03-01', fechaFin: '2026-04-01', ...o });

  it('actualiza las fechas y devuelve la presentación', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute(params(), 4);
    expect(deps.academicPeriodRepository.update).toHaveBeenCalledWith(
      5, { startDate: '2026-03-01', endDate: '2026-04-01' }, 4,
    );
    expect(res).toMatchObject({ id: 5, nombre: 'P', fechaInicio: '2026-03-01', fechaFin: '2026-04-01' });
  });

  it.each([['abc'], [0], [undefined]])('400 si el id es inválido (%p)', async (id) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(params({ id }))).rejects.toMatchObject({ statusCode: 400 });
    expect(deps.academicPeriodRepository.findById).not.toHaveBeenCalled();
  });

  it('422 si fechaFin < fechaInicio (antes de consultar el repositorio)', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(params({ fechaInicio: '2026-05-01', fechaFin: '2026-01-01' }))).rejects.toMatchObject({
      statusCode: 422,
    });
    expect(deps.academicPeriodRepository.findById).not.toHaveBeenCalled();
  });

  it('404 si el periodo no existe', async () => {
    const { useCase } = crear({ existing: null });
    await expect(useCase.execute(params())).rejects.toMatchObject({ statusCode: 404 });
  });

  it.each([[null], [{ gestion_id: 8 }]])('422 si el periodo no es de la gestión vigente (ctx %p)', async (ctx) => {
    const { useCase, deps } = crear({ ctx });
    await expect(useCase.execute(params())).rejects.toMatchObject({ statusCode: 422 });
    expect(deps.academicPeriodRepository.update).not.toHaveBeenCalled();
  });

  it.each([
    [{ fechaInicio: undefined }], [{ fechaFin: undefined }], [{ fechaInicio: '' }], [{ fechaFin: null }],
  ])('las dos fechas son obligatorias (%p)', async (o) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(params(o))).rejects.toMatchObject({ statusCode: 400 });
    expect(deps.academicPeriodRepository.update).not.toHaveBeenCalled();
  });

  it.each([['abc'], ['2026-02-31']])('fecha inválida (%p) => 400 sin actualizar', async (f) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(params({ fechaInicio: f }))).rejects.toMatchObject({ statusCode: 400 });
    await expect(useCase.execute(params({ fechaFin: f }))).rejects.toMatchObject({ statusCode: 400 });
    expect(deps.academicPeriodRepository.update).not.toHaveBeenCalled();
  });
});
