import { jest } from '@jest/globals';
import { ListStudentsUseCase } from '../../../src/application/use-cases/estudiantes/ListStudentsUseCase.js';

describe('ListStudentsUseCase', () => {
  const crear = ({ withAcademic = true, students = [{ id: 1, codigo_estudiante: 'E1', nombres: 'Ana' }, { id: 2, nombres: 'Luis' }], total = 2 } = {}) => {
    const deps = {
      studentRepository: { listFromView: jest.fn().mockResolvedValue({ students, total }) },
      studentAcademicDataRepository: withAcademic
        ? {
            obtenerDatosAcademicosPorEstudianteIds: jest.fn().mockResolvedValue([
              { estudiante_id: 1, carrera_nombre: 'Enf', carrera_codigo: 'ENF', gestion_ingreso_anio: 2024, tipo_admision: 'NUEVO' },
              { estudiante_id: 1, carrera_nombre: 'DUPLICADA' },
            ]),
            obtenerResumenAcademicoPorEstudianteIds: jest.fn().mockResolvedValue([
              { estudiante_id: 1, periodo_actual_numero: 2, paralelo_actual: 'A', promedio_historial: '75.5' },
            ]),
          }
        : undefined,
      logger: { info: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new ListStudentsUseCase(deps) };
  };

  it('lista desde la vista y enriquece con datos académicos y resumen', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ search: 'a' }, 2, 10);

    expect(deps.studentRepository.listFromView).toHaveBeenCalledWith({ search: 'a' }, 2, 10);
    expect(deps.studentAcademicDataRepository.obtenerDatosAcademicosPorEstudianteIds).toHaveBeenCalledWith([1, 2]);
    expect(res.estudiantes[0]).toEqual(
      expect.objectContaining({
        id: 1,
        carreraNombre: 'Enf',
        gestionIngresoAnio: 2024,
        periodoActualNumero: 2,
        paraleloActual: 'A',
        promedioHistorial: 75.5,
      })
    );
    expect(res.estudiantes[1]).toEqual(
      expect.objectContaining({ id: 2, carreraNombre: null, periodoActualNumero: null, promedioHistorial: null })
    );
    expect(res).toEqual(expect.objectContaining({ total: 2, page: 2, limit: 10, totalPages: 1 }));
  });

  it('sin repositorio académico devuelve campos académicos en null', async () => {
    const { useCase } = crear({ withAcademic: false });
    const res = await useCase.execute();
    expect(res.estudiantes[0].carreraNombre).toBeNull();
    expect(res.estudiantes[0].paraleloActual).toBeNull();
  });

  it('sin estudiantes no consulta datos académicos', async () => {
    const { useCase, deps } = crear({ students: [], total: 0 });
    const res = await useCase.execute();
    expect(deps.studentAcademicDataRepository.obtenerDatosAcademicosPorEstudianteIds).not.toHaveBeenCalled();
    expect(res.estudiantes).toEqual([]);
    expect(res.totalPages).toBe(0);
  });

  it('page/limit NaN caen a 1 y 50', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({}, 'x', 'y');
    expect(deps.studentRepository.listFromView).toHaveBeenCalledWith({}, 1, 50);
  });

  it('propaga el error del repositorio y lo registra', async () => {
    const { useCase, deps } = crear();
    deps.studentRepository.listFromView.mockRejectedValue(new Error('db'));
    await expect(useCase.execute()).rejects.toThrow('db');
    expect(deps.logger.error).toHaveBeenCalled();
  });
});
