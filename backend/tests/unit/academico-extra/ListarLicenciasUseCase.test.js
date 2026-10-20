import { describe, it, expect, jest } from '@jest/globals';
import { ListarLicenciasUseCase } from '../../../src/application/use-cases/academico/licencias/ListarLicenciasUseCase.js';
import { crearLicenseRepository, loggerLic } from './licenciasTestUtils.js';

describe('ListarLicenciasUseCase', () => {
  const crear = (rows) => {
    const licenseRepository = crearLicenseRepository(rows ? { findAllWithStudentName: jest.fn().mockResolvedValue(rows) } : {});
    return { licenseRepository, useCase: new ListarLicenciasUseCase({ licenseRepository, logger: loggerLic() }) };
  };

  it('sin filtro consulta todos los estados y mapea a DTO', async () => {
    const { useCase, licenseRepository } = crear();
    const res = await useCase.execute();
    expect(licenseRepository.findAllWithStudentName).toHaveBeenCalledWith({ states: undefined });
    expect(res.licencias).toHaveLength(1);
    expect(res.licencias[0]).toMatchObject({ id: 1, estudianteNombre: 'Ana Perez', fechaInicio: '2026-03-02' });
  });

  it('filtra por un estado válido', async () => {
    const { useCase, licenseRepository } = crear();
    await useCase.execute({ estado: 'APROBADA' });
    expect(licenseRepository.findAllWithStudentName).toHaveBeenCalledWith({ states: ['APROBADA'] });
  });

  it.each([['aprobada'], ['TODOS'], [''], [null]])('ignora el estado desconocido (%p)', async (estado) => {
    const { useCase, licenseRepository } = crear();
    await useCase.execute({ estado });
    expect(licenseRepository.findAllWithStudentName).toHaveBeenCalledWith({ states: undefined });
  });

  it('devuelve lista vacía si no hay filas', async () => {
    const { useCase } = crear([]);
    await expect(useCase.execute({})).resolves.toEqual({ licencias: [] });
  });
});
