import { describe, it, expect, jest } from '@jest/globals';
import { DeletePeriodoEtapaUseCase } from '../../../src/application/use-cases/academico/DeletePeriodoEtapaUseCase.js';

describe('DeletePeriodoEtapaUseCase', () => {
  const crear = ({ existing = { id: 5, managementId: 3, division: 'OTRO' }, ctx = { gestion_id: 3 } } = {}) => {
    const deps = {
      academicPeriodRepository: {
        findById: jest.fn().mockResolvedValue(existing),
        delete: jest.fn().mockResolvedValue(true),
      },
      calificacionContextoRepository: { obtenerContextoVigente: jest.fn().mockResolvedValue(ctx) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new DeletePeriodoEtapaUseCase(deps) };
  };

  it('elimina una etapa adicional de la gestión vigente (id como string)', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute('5', 2)).resolves.toEqual({ id: 5 });
    expect(deps.academicPeriodRepository.findById).toHaveBeenCalledWith(5);
    expect(deps.academicPeriodRepository.delete).toHaveBeenCalledWith(5, 2);
  });

  it.each([['abc'], [0], [-1], [undefined], [NaN]])('400 si el id es inválido (%p)', async (id) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(id)).rejects.toMatchObject({ statusCode: 400 });
    expect(deps.academicPeriodRepository.findById).not.toHaveBeenCalled();
  });

  it('404 si el periodo no existe', async () => {
    const { useCase, deps } = crear({ existing: null });
    await expect(useCase.execute(5)).rejects.toMatchObject({ statusCode: 404 });
    expect(deps.academicPeriodRepository.delete).not.toHaveBeenCalled();
  });

  it.each([[null], [{ gestion_id: 99 }]])('422 si no pertenece a la gestión vigente (ctx %p)', async (ctx) => {
    const { useCase, deps } = crear({ ctx });
    await expect(useCase.execute(5)).rejects.toMatchObject({ statusCode: 422 });
    expect(deps.academicPeriodRepository.delete).not.toHaveBeenCalled();
  });

  it.each([['BIMESTRE'], ['PLANIFICACION'], ['CLAUSURA']])('422 al intentar borrar la etapa estructural %s', async (division) => {
    const { useCase, deps } = crear({ existing: { id: 5, managementId: 3, division } });
    await expect(useCase.execute(5)).rejects.toMatchObject({ statusCode: 422 });
    expect(deps.academicPeriodRepository.delete).not.toHaveBeenCalled();
  });
});
