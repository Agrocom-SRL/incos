import { describe, it, expect, jest } from '@jest/globals';
import { GetMateriaByIdUseCase } from '../../../src/application/use-cases/configuracion/GetMateriaByIdUseCase.js';

describe('GetMateriaByIdUseCase', () => {
  const crear = ({ materia = { id: 1, acronym: 'MAT', name: 'Matemática', active: true }, rows = [] } = {}) => {
    const subjectRepository = {
      findById: jest.fn().mockResolvedValue(materia),
      findAsignaturasMatrizByMateriaId: jest.fn().mockResolvedValue(rows),
    };
    return {
      subjectRepository,
      useCase: new GetMateriaByIdUseCase({ subjectRepository, logger: { info: jest.fn() } }),
    };
  };

  it('devuelve null si la materia no existe y no consulta la matriz', async () => {
    const { useCase, subjectRepository } = crear({ materia: null });
    await expect(useCase.execute(9)).resolves.toBeNull();
    expect(subjectRepository.findAsignaturasMatrizByMateriaId).not.toHaveBeenCalled();
  });

  it('devuelve la materia y sus asignaturas mapeadas', async () => {
    const rows = [
      {
        asignatura_plan_id: 10,
        plan_estudio_id: 2,
        nombre_plan: 'Plan 2026',
        plan_vigente: 1,
        carrera_id: 4,
        carrera_codigo: 'SIS',
        carrera_nombre: 'Sistemas',
        carrera_color_hex: '#fff',
        periodo_id: 6,
        periodo_nombre: 'P1',
        periodo_numero: 1,
        horas_semanales: 4,
        creditos: 5,
        modalidad: 'PRESENCIAL',
        orden_visualizacion: 1,
        cantidad_prerrequisitos: '2',
      },
      { asignatura_plan_id: 11, plan_estudio_id: 3, plan_vigente: 0, cantidad_prerrequisitos: 0 },
    ];
    const { useCase, subjectRepository } = crear({ rows });
    const res = await useCase.execute(1);
    expect(subjectRepository.findById).toHaveBeenCalledWith(1, { paranoid: false });
    expect(subjectRepository.findAsignaturasMatrizByMateriaId).toHaveBeenCalledWith(1);
    expect(res.materia).toMatchObject({ id: 1, sigla: 'MAT', nombre: 'Matemática' });
    expect(res.asignaturas[0]).toMatchObject({
      asignatura_plan_id: 10,
      plan_nombre: 'Plan 2026',
      plan_vigente: true,
      carrera_nombre: 'Sistemas',
      periodo_numero: 1,
      cantidad_prerrequisitos: 2,
      tiene_prerrequisitos: true,
    });
    expect(res.asignaturas[1]).toMatchObject({
      plan_nombre: null,
      plan_vigente: false,
      carrera_id: null,
      cantidad_prerrequisitos: 0,
      tiene_prerrequisitos: false,
    });
  });

  it('cantidad_prerrequisitos no numérica (NaN) se normaliza a 0', async () => {
    const { useCase } = crear({ rows: [{ asignatura_plan_id: 1, cantidad_prerrequisitos: 'abc' }] });
    const res = await useCase.execute(1);
    expect(res.asignaturas[0].cantidad_prerrequisitos).toBe(0);
    expect(res.asignaturas[0].tiene_prerrequisitos).toBe(false);
  });

  it('si el repositorio devuelve null en la matriz, asignaturas es []', async () => {
    const { useCase } = crear({ rows: null });
    const res = await useCase.execute(1);
    expect(res.asignaturas).toEqual([]);
  });
});
