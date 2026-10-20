import { describe, it, expect, jest } from '@jest/globals';
import { BuscarParaAltaUsuarioVinculosUseCase } from '../../../src/application/use-cases/seguridad/BuscarParaAltaUsuarioVinculosUseCase.js';

describe('BuscarParaAltaUsuarioVinculosUseCase', () => {
  const crear = () => {
    const repo = {
      buscarEstudiantesSinCuenta: jest.fn().mockResolvedValue([{ id: 1 }]),
      buscarDocentesSinCuenta: jest.fn().mockResolvedValue([{ id: 2 }]),
    };
    return { repo, useCase: new BuscarParaAltaUsuarioVinculosUseCase({ seguridadAltaUsuarioLookupRepository: repo }) };
  };

  it('estudiantes (normaliza mayúsculas y espacios)', async () => {
    const { repo, useCase } = crear();
    expect(await useCase.execute(' Estudiantes ', 'ana', 5)).toEqual([{ id: 1 }]);
    expect(repo.buscarEstudiantesSinCuenta).toHaveBeenCalledWith('ana', 5);
    expect(repo.buscarDocentesSinCuenta).not.toHaveBeenCalled();
  });

  it('docentes con limit por defecto 20', async () => {
    const { repo, useCase } = crear();
    expect(await useCase.execute('docentes', 'x')).toEqual([{ id: 2 }]);
    expect(repo.buscarDocentesSinCuenta).toHaveBeenCalledWith('x', 20);
  });

  it.each([['otro'], [''], [undefined], [null]])('tipo %p devuelve [] sin consultar', async (tipo) => {
    const { repo, useCase } = crear();
    expect(await useCase.execute(tipo, 'x')).toEqual([]);
    expect(repo.buscarEstudiantesSinCuenta).not.toHaveBeenCalled();
    expect(repo.buscarDocentesSinCuenta).not.toHaveBeenCalled();
  });
});
