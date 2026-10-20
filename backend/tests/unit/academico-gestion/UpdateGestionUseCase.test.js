import { describe, it, expect, jest } from '@jest/globals';
import { UpdateGestionUseCase } from '../../../src/application/use-cases/academico/UpdateGestionUseCase.js';

describe('UpdateGestionUseCase', () => {
  const crear = ({ gestion = { id: 3, active: true, startDate: '2026-02-01', endDate: '2026-12-01' }, porCodigo = null } = {}) => {
    const deps = {
      managementRepository: {
        findById: jest.fn().mockResolvedValue(gestion),
        findBy: jest.fn().mockResolvedValue(porCodigo),
        update: jest.fn().mockImplementation(async (id, data) => ({ id, ...data })),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new UpdateGestionUseCase(deps) };
  };

  it('actualiza solo los campos enviados y devuelve la presentación', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute(3, { nombre: ' Nuevo ', anio: '2027', tipo: 'VERANO' }, 8);

    expect(deps.managementRepository.update).toHaveBeenCalledWith(
      3,
      { name: 'Nuevo', year: 2027, type: 'VERANO' },
      8,
    );
    expect(res.gestion).toMatchObject({ id: 3, nombre: 'Nuevo', anio: 2027, tipo: 'VERANO' });
  });

  it('ignora `vigente` del body', async () => {
    const { useCase, deps } = crear();
    await useCase.execute(3, { nombre: 'X', vigente: true });
    expect(deps.managementRepository.update.mock.calls[0][1]).not.toHaveProperty('vigente');
  });

  it.each([[null], [{ id: 3, active: false }]])('404 si la gestión no existe o está inactiva (%p)', async (g) => {
    const { useCase, deps } = crear({ gestion: g });
    await expect(useCase.execute(3, { nombre: 'X' })).rejects.toMatchObject({ statusCode: 404 });
    expect(deps.managementRepository.update).not.toHaveBeenCalled();
  });

  it('permite conservar el propio código (mismo id)', async () => {
    const { useCase, deps } = crear({ porCodigo: { id: 3 } });
    await useCase.execute(3, { codigo: 'ABC' });
    expect(deps.managementRepository.update).toHaveBeenCalledWith(3, { code: 'ABC' }, null);
  });

  it('rechaza un código que pertenece a otra gestión', async () => {
    const { useCase } = crear({ porCodigo: { id: 99 } });
    await expect(useCase.execute(3, { codigo: 'ABC' })).rejects.toThrow(/Ya existe una gestión activa/);
  });

  it.each([
    [{ codigo: '  ' }, 'codigo no puede estar vacío'],
    [{ nombre: '' }, 'nombre no puede estar vacío'],
    [{ anio: 'abc' }, 'anio debe ser un año válido'],
    [{ anio: 1900 }, 'anio debe ser un año válido'],
    [{ anio: null }, 'anio debe ser un año válido'],
    [{ tipo: 'NOPE' }, /tipo debe ser uno de/],
  ])('rechaza entrada inválida %p', async (body, msg) => {
    const { useCase, deps } = crear();
    const esperado = expect(useCase.execute(3, body)).rejects;
    await (msg instanceof RegExp ? esperado.toThrow(msg) : esperado.toThrow(msg));
    expect(deps.managementRepository.update).not.toHaveBeenCalled();
  });

  it('valida coherencia de fechas contra las ya guardadas', async () => {
    const { useCase } = crear();
    await expect(useCase.execute(3, { fecha_fin: '2026-01-01' })).rejects.toThrow(
      'fecha_fin no puede ser anterior a fecha_inicio',
    );
  });

  it('rechaza body sin campos editables', async () => {
    const { useCase } = crear();
    await expect(useCase.execute(3, {})).rejects.toThrow('No se envió ningún campo editable');
    await expect(useCase.execute(3, { vigente: true })).rejects.toThrow('No se envió ningún campo editable');
  });
});
