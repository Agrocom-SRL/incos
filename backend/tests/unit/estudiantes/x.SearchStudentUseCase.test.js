import { jest } from '@jest/globals';
import { SearchStudentUseCase } from '../../../src/application/use-cases/estudiantes/SearchStudentUseCase.js';

describe('SearchStudentUseCase', () => {
  const crear = ({ results = [{ id: 1, studentCode: 'E1', firstName: 'Ana' }], withAcademic = true } = {}) => {
    const deps = {
      studentRepository: { search: jest.fn().mockResolvedValue(results) },
      studentAcademicDataRepository: withAcademic
        ? {
            obtenerDatosAcademicosPorEstudianteIds: jest.fn().mockResolvedValue([
              { estudiante_id: 1, gestion_ingreso_anio: 2023, carrera_id: 4, carrera_nombre: 'Enf' },
            ]),
            obtenerResumenAcademicoPorEstudianteIds: jest.fn().mockResolvedValue([
              { estudiante_id: 1, periodo_actual_nombre: 'Primero', promedio_historial: 80 },
            ]),
          }
        : undefined,
      logger: { info: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new SearchStudentUseCase(deps) };
  };

  it('busca con el término recortado y enriquece con datos académicos', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute('  ana  ', 10);
    expect(deps.studentRepository.search).toHaveBeenCalledWith('ana', { limit: 10 });
    expect(res).toEqual([
      expect.objectContaining({
        id: 1,
        codigoEstudiante: 'E1',
        nombres: 'Ana',
        gestionIngresoAnio: 2023,
        carreraId: 4,
        carreraNombre: 'Enf',
        periodoActualNombre: 'Primero',
        promedioHistorial: 80,
      }),
    ]);
  });

  it('sin resultados devuelve [] y no consulta datos académicos', async () => {
    const { useCase, deps } = crear({ results: [] });
    await expect(useCase.execute('zzz')).resolves.toEqual([]);
    expect(deps.studentAcademicDataRepository.obtenerDatosAcademicosPorEstudianteIds).not.toHaveBeenCalled();
  });

  it('sin repositorio académico devuelve el resultado base', async () => {
    const { useCase } = crear({ withAcademic: false });
    const res = await useCase.execute('ana');
    expect(res[0].codigoEstudiante).toBe('E1');
    expect(res[0].carreraNombre).toBeUndefined();
  });

  it('estudiante sin fila académica queda con nulls', async () => {
    const { useCase } = crear({ results: [{ id: 9, studentCode: 'E9' }] });
    const [r] = await useCase.execute('e9');
    expect(r).toEqual(expect.objectContaining({ gestionIngresoAnio: null, carreraId: null, periodoActualNumero: null }));
  });

  it('propaga el error del repositorio', async () => {
    const { useCase, deps } = crear();
    deps.studentRepository.search.mockRejectedValue(new Error('db'));
    await expect(useCase.execute('ana')).rejects.toThrow('db');
  });
});
