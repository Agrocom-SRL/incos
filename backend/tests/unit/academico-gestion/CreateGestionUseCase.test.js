import { describe, it, expect, jest } from '@jest/globals';
import { CreateGestionUseCase } from '../../../src/application/use-cases/academico/CreateGestionUseCase.js';

describe('CreateGestionUseCase', () => {
  const body = (o = {}) => ({
    codigo: '2026-R',
    nombre: 'Gestión 2026',
    anio: 2026,
    tipo: 'REGULAR',
    fecha_inicio: '2026-02-01',
    fecha_fin: '2026-12-15',
    ...o,
  });

  const crear = ({ existente = null } = {}) => {
    const deps = {
      managementRepository: {
        findBy: jest.fn().mockResolvedValue(existente),
        create: jest.fn().mockImplementation(async (data) => ({ id: 9, ...data })),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new CreateGestionUseCase(deps) };
  };

  it('crea la gestión no vigente y la devuelve en formato de presentación', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute(body({ codigo: '  2026-R ', nombre: ' Gestión 2026 ' }), 5);

    expect(deps.managementRepository.findBy).toHaveBeenCalledWith({ code: '2026-R' });
    expect(deps.managementRepository.create).toHaveBeenCalledWith(
      {
        code: '2026-R',
        name: 'Gestión 2026',
        year: 2026,
        type: 'REGULAR',
        startDate: '2026-02-01',
        endDate: '2026-12-15',
        vigente: false,
      },
      5,
    );
    expect(res.gestion).toMatchObject({ id: 9, codigo: '2026-R', anio: 2026, vigente: false });
    expect(deps.logger.info).toHaveBeenCalledTimes(1);
  });

  it('acepta alias en inglés y camelCase', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({
      code: 'X', name: 'N', year: '2027', type: 'VERANO', fechaInicio: '2027-01-01', fechaFin: '2027-02-01',
    });
    expect(deps.managementRepository.create.mock.calls[0][0]).toMatchObject({
      code: 'X', name: 'N', year: 2027, type: 'VERANO',
    });
  });

  it.each([
    ['codigo', { codigo: '  ' }],
    ['nombre', { nombre: '' }],
    ['tipo', { tipo: undefined }],
    ['fecha_inicio', { fecha_inicio: undefined }],
    ['fecha_fin', { fecha_fin: undefined }],
  ])('rechaza con 400 si falta %s', async (_c, parche) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(body(parche))).rejects.toMatchObject({ statusCode: 400 });
    expect(deps.managementRepository.create).not.toHaveBeenCalled();
  });

  it.each([['abc'], [''], [null], [1999], [2101], [NaN]])('rechaza anio inválido (%p)', async (anio) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(body({ anio }))).rejects.toMatchObject({
      statusCode: 400,
      message: 'anio debe ser un año válido',
    });
    expect(deps.managementRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza tipo fuera del catálogo', async () => {
    const { useCase } = crear();
    await expect(useCase.execute(body({ tipo: 'OTRA' }))).rejects.toThrow(/tipo debe ser uno de/);
  });

  it('rechaza fecha_fin anterior a fecha_inicio', async () => {
    const { useCase } = crear();
    await expect(
      useCase.execute(body({ fecha_inicio: '2026-12-01', fecha_fin: '2026-01-01' })),
    ).rejects.toThrow('fecha_fin no puede ser anterior a fecha_inicio');
  });

  it('rechaza código duplicado entre gestiones activas', async () => {
    const { useCase, deps } = crear({ existente: { id: 1 } });
    await expect(useCase.execute(body())).rejects.toThrow('Ya existe una gestión activa con el código 2026-R');
    expect(deps.managementRepository.create).not.toHaveBeenCalled();
  });

  it.each([['abc'], ['2026-02-31']])('fecha inválida (%p) => 400 sin crear', async (f) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(body({ fecha_inicio: f }))).rejects.toMatchObject({ statusCode: 400 });
    await expect(useCase.execute(body({ fecha_fin: f }))).rejects.toMatchObject({ statusCode: 400 });
    expect(deps.managementRepository.create).not.toHaveBeenCalled();
  });
});
