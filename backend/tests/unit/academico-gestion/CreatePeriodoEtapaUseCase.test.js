import { describe, it, expect, jest } from '@jest/globals';
import { CreatePeriodoEtapaUseCase } from '../../../src/application/use-cases/academico/CreatePeriodoEtapaUseCase.js';

describe('CreatePeriodoEtapaUseCase', () => {
  const crear = ({ ctx = { gestion_id: 3 } } = {}) => {
    const deps = {
      academicPeriodRepository: {
        create: jest.fn().mockImplementation(async (d) => ({ id: 20, ...d })),
      },
      calificacionContextoRepository: { obtenerContextoVigente: jest.fn().mockResolvedValue(ctx) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new CreatePeriodoEtapaUseCase(deps) };
  };
  const input = (o = {}) => ({ nombre: ' Etapa X ', fechaInicio: '2026-03-01', fechaFin: '2026-04-01', ...o });

  it('crea la etapa en la gestión vigente con división OTRO por defecto', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute(input({ colorHex: '' }), 7);

    expect(deps.academicPeriodRepository.create).toHaveBeenCalledWith(
      {
        managementId: 3,
        name: 'Etapa X',
        division: 'OTRO',
        orderNumber: null,
        startDate: '2026-03-01',
        endDate: '2026-04-01',
        colorHex: null,
      },
      7,
    );
    expect(res).toEqual({
      id: 20,
nombre: 'Etapa X',
division: 'OTRO',
numeroOrden: null,
colorHex: null,
      fechaInicio: '2026-03-01',
fechaFin: '2026-04-01',
    });
  });

  it.each([[undefined], [''], ['   ']])('400 si el nombre es %p', async (nombre) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(input({ nombre }))).rejects.toMatchObject({ statusCode: 400 });
    expect(deps.calificacionContextoRepository.obtenerContextoVigente).not.toHaveBeenCalled();
  });

  it.each([[{ fechaInicio: undefined }], [{ fechaFin: '' }]])('400 si faltan fechas %p', async (parche) => {
    const { useCase } = crear();
    await expect(useCase.execute(input(parche))).rejects.toMatchObject({ statusCode: 400 });
  });

  it('422 si fechaFin es anterior a fechaInicio', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(input({ fechaInicio: '2026-05-01', fechaFin: '2026-04-01' }))).rejects.toMatchObject({
      statusCode: 422,
    });
    expect(deps.academicPeriodRepository.create).not.toHaveBeenCalled();
  });

  it('422 si la división no es válida', async () => {
    const { useCase } = crear();
    await expect(useCase.execute(input({ division: 'XYZ' }))).rejects.toMatchObject({ statusCode: 422 });
  });

  it('404 si no hay gestión vigente', async () => {
    const { useCase, deps } = crear({ ctx: null });
    await expect(useCase.execute(input())).rejects.toMatchObject({ statusCode: 404, code: 'NOT_FOUND' });
    expect(deps.academicPeriodRepository.create).not.toHaveBeenCalled();
  });
});
