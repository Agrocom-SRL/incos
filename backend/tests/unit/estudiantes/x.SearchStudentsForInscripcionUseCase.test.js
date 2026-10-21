import { jest } from '@jest/globals';
import { SearchStudentsForInscripcionUseCase } from '../../../src/application/use-cases/estudiantes/SearchStudentsForInscripcionUseCase.js';

describe('SearchStudentsForInscripcionUseCase', () => {
  const fila = {
    id: 1,
    codigo_estudiante: 'E-001',
    nombres: 'Ana',
    apellido_paterno: 'Lopez',
    apellido_materno: 'Rios',
    total_inscripciones: '0',
    inscripcion_gestion_actual_id: null,
  };
  const crear = (rows = [fila]) => {
    const deps = {
      studentRepository: { buscarParaInscripcion: jest.fn().mockResolvedValue(rows) },
      logger: { info: jest.fn() },
    };
    return { deps, useCase: new SearchStudentsForInscripcionUseCase(deps) };
  };

  it('exige studentRepository y logger', () => {
    expect(() => new SearchStudentsForInscripcionUseCase({ logger: {} })).toThrow();
    expect(() => new SearchStudentsForInscripcionUseCase({ studentRepository: {} })).toThrow();
  });

  it('búsqueda normal: recorta el término y mapea a DTO con nombre APELLIDOS NOMBRES', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ q: '  ana ', limit: 10 });
    expect(deps.studentRepository.buscarParaInscripcion).toHaveBeenCalledWith({ q: 'ana', limit: 10 });
    expect(res[0]).toEqual(
      expect.objectContaining({
        id: 1,
        nombreCompleto: 'Lopez Rios Ana',
        esNuevoSistema: true,
        totalInscripciones: 0,
        yaMatriculadoGestionActual: false,
      })
    );
  });

  it('término de menos de 2 caracteres devuelve [] sin consultar', async () => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ q: ' a ' })).resolves.toEqual([]);
    await expect(useCase.execute({})).resolves.toEqual([]);
    expect(deps.studentRepository.buscarParaInscripcion).not.toHaveBeenCalled();
  });

  it('modo preliminar no exige término', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ preliminar: true, limit: 5 });
    expect(deps.studentRepository.buscarParaInscripcion).toHaveBeenCalledWith({ preliminar: true, limit: 5 });
  });

  it('modo soloNuevos no exige término y tiene prioridad sobre preliminar', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ soloNuevos: true, preliminar: true, q: ' x ' });
    expect(deps.studentRepository.buscarParaInscripcion).toHaveBeenCalledWith({ soloNuevos: true, q: 'x', limit: 50 });
  });

  it('marca matriculado en la gestión actual y no nuevo', async () => {
    const { useCase } = crear([
      { ...fila, total_inscripciones: 2, inscripcion_gestion_actual_id: 44, inscripcion_gestion_actual_anio: 2026 },
    ]);
    const [dto] = await useCase.execute({ q: 'lopez' });
    expect(dto).toEqual(
      expect.objectContaining({
        esNuevoSistema: false,
        totalInscripciones: 2,
        yaMatriculadoGestionActual: true,
        inscripcionGestionActualId: 44,
        gestionActualAnio: 2026,
      })
    );
  });

  it('sin nombres usa el código como nombreCompleto', async () => {
    const { useCase } = crear([{ id: 3, codigo_estudiante: 'E-003' }]);
    const [dto] = await useCase.execute({ q: 'E-0' });
    expect(dto.nombreCompleto).toBe('E-003');
    expect(dto.totalInscripciones).toBe(0);
  });
});
