import { jest } from '@jest/globals';
import { SearchStudentsForBecaAsignacionUseCase } from '../../../src/application/use-cases/estudiantes/becas/SearchStudentsForBecaAsignacionUseCase.js';

describe('SearchStudentsForBecaAsignacionUseCase', () => {
  const fila = {
    id: 1,
    codigo_estudiante: 'E-001',
    nombres: 'Ana',
    apellido_paterno: 'Lopez',
    apellido_materno: 'Rios',
    carrera_nombre: 'Enfermeria',
  };
  const crear = (rows = [fila]) => {
    const deps = {
      studentRepository: { buscarParaAsignacionBeca: jest.fn().mockResolvedValue(rows) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new SearchStudentsForBecaAsignacionUseCase(deps) };
  };

  it('exige studentRepository y logger', () => {
    expect(() => new SearchStudentsForBecaAsignacionUseCase({ logger: {} })).toThrow();
    expect(() => new SearchStudentsForBecaAsignacionUseCase({ studentRepository: {} })).toThrow();
  });

  it('búsqueda por término recortado y mapeo a DTO', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ q: ' ana ', limit: 20 });
    expect(deps.studentRepository.buscarParaAsignacionBeca).toHaveBeenCalledWith({ q: 'ana', limit: 20 });
    expect(res[0]).toEqual(
      expect.objectContaining({ id: 1, nombreCompleto: 'Ana Lopez Rios', carreraNombre: 'Enfermeria', celular: null })
    );
  });

  it('término corto devuelve [] sin consultar', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ q: 'a' })).resolves.toEqual([]);
    await expect(useCase.execute({})).resolves.toEqual([]);
    expect(deps.studentRepository.buscarParaAsignacionBeca).not.toHaveBeenCalled();
  });

  it('modo preliminar consulta sin término', async () => {
    const { useCase, deps } = crear([]);
    const res = await useCase.execute({ preliminar: true });
    expect(deps.studentRepository.buscarParaAsignacionBeca).toHaveBeenCalledWith({ preliminar: true, limit: 50 });
    expect(res).toEqual([]);
  });

  it('sin nombres usa el código', async () => {
    const { useCase } = crear([{ id: 2, codigo_estudiante: 'E-002' }]);
    const [dto] = await useCase.execute({ q: 'E-' });
    expect(dto.nombreCompleto).toBe('E-002');
  });
});
