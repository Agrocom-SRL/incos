import { jest } from '@jest/globals';
import { GetCarreraByIdUseCase } from '../../../src/application/use-cases/configuracion/GetCarreraByIdUseCase.js';

const fila = (extra) => ({
  plan_estudio_id: 1,
  nombre_plan: 'Plan 2024',
  plan_vigente: 1,
  materia_id: 10,
  materia_sigla: 'MAT-101',
  materia_nombre: 'Matemática',
  horas_semanales: 4,
  creditos: 5,
  cantidad_prerrequisitos: 0,
  ...extra,
});

describe('GetCarreraByIdUseCase', () => {
  const crear = ({ entity, rows }) => {
    const careerRepository = {
      findById: jest.fn().mockResolvedValue(entity),
      findAsignaturasMatrizByCarreraId: jest.fn().mockResolvedValue(rows),
    };
    return { careerRepository, useCase: new GetCarreraByIdUseCase({ careerRepository, logger: {} }) };
  };

  it('devuelve null si la carrera no existe y no consulta la matriz', async () => {
    const { useCase, careerRepository } = crear({ entity: null });
    await expect(useCase.execute(7)).resolves.toBeNull();
    expect(careerRepository.findById).toHaveBeenCalledWith(7, { paranoid: false });
    expect(careerRepository.findAsignaturasMatrizByCarreraId).not.toHaveBeenCalled();
  });

  it('agrupa materias por periodo y ordena por número de periodo', async () => {
    const { useCase } = crear({
      entity: { id: 3, code: 'SIS', name: 'Sistemas' },
      rows: [
        fila({ periodo_id: 2, periodo_numero: 2, periodo_nombre: 'Segundo', asignatura_plan_id: 21 }),
        fila({ periodo_id: 1, periodo_numero: 1, periodo_nombre: 'Primero', asignatura_plan_id: 11 }),
        fila({
          periodo_id: 1, periodo_numero: 1, periodo_nombre: 'Primero', asignatura_plan_id: 12,
          cantidad_prerrequisitos: '2',
        }),
      ],
    });

    const { carrera, periodos } = await useCase.execute(3);

    expect(carrera).toMatchObject({ id: 3, codigo: 'SIS', nombre: 'Sistemas' });
    expect(periodos.map((p) => p.periodo_numero)).toEqual([1, 2]);
    expect(periodos[0].materias).toHaveLength(2);
    expect(periodos[0].materias[1]).toMatchObject({
      cantidad_prerrequisitos: 2,
      tiene_prerrequisitos: true,
      plan_vigente: true,
    });
    expect(periodos[0].materias[0].tiene_prerrequisitos).toBe(false);
  });

  it('agrupa las filas sin periodo por plan', async () => {
    const { useCase } = crear({
      entity: { id: 3, code: 'X', name: 'X' },
      rows: [
        fila({ periodo_id: null, plan_estudio_id: 1, asignatura_plan_id: 1 }),
        fila({ periodo_id: null, plan_estudio_id: 2, asignatura_plan_id: 2 }),
      ],
    });
    const { periodos } = await useCase.execute(3);
    expect(periodos).toHaveLength(2);
  });

  it('tolera una matriz vacía', async () => {
    const { useCase } = crear({ entity: { id: 3, code: 'X', name: 'X' }, rows: undefined });
    const res = await useCase.execute(3);
    expect(res.periodos).toEqual([]);
  });
});
