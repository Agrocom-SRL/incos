import { describe, it, expect, jest } from '@jest/globals';
import { GetAulaByIdUseCase } from '../../../src/application/use-cases/configuracion/GetAulaByIdUseCase.js';

describe('GetAulaByIdUseCase', () => {
  const entity = { id: 3, code: 'A-1', name: 'Aula 1', category: 'AULA', capacity: 20, active: true };
  const crear = ({ aula = entity, rows = [], withRepo = true } = {}) => {
    const classroomRepository = { findById: jest.fn().mockResolvedValue(aula) };
    const aulasHorariosSemanaRepository = { findByAulaId: jest.fn().mockResolvedValue(rows) };
    const logger = { error: jest.fn() };
    return {
      classroomRepository,
      aulasHorariosSemanaRepository,
      logger,
      useCase: new GetAulaByIdUseCase({
        classroomRepository,
        aulasHorariosSemanaRepository: withRepo ? aulasHorariosSemanaRepository : undefined,
        logger,
      }),
    };
  };

  it('devuelve null si el aula no existe y no consulta horarios', async () => {
    const { useCase, aulasHorariosSemanaRepository } = crear({ aula: null });
    await expect(useCase.execute(1)).resolves.toBeNull();
    expect(aulasHorariosSemanaRepository.findByAulaId).not.toHaveBeenCalled();
  });

  it('devuelve el aula con paralelos únicos que la usan', async () => {
    const rows = [
      { paralelo_id: 1, paralelo_nombre: 'A', materia_nombre: 'M1', carrera_nombre: 'C', docente_nombre: 'D' },
      { paralelo_id: 1, paralelo_nombre: 'A', materia_nombre: 'M2', carrera_nombre: 'C', docente_nombre: 'D2' },
      { paralelo_id: 2, paralelo_nombre: 'B', materia_nombre: 'M3', carrera_nombre: 'C', docente_nombre: 'D' },
      { paralelo_id: null, paralelo_nombre: 'X' },
    ];
    const { useCase, classroomRepository, aulasHorariosSemanaRepository } = crear({ rows });
    const res = await useCase.execute(3);
    expect(classroomRepository.findById).toHaveBeenCalledWith(3, { paranoid: false });
    expect(aulasHorariosSemanaRepository.findByAulaId).toHaveBeenCalledWith(3);
    expect(res).toMatchObject({ id: 3, codigo: 'A-1', nombre: 'Aula 1', categoria: 'AULA', capacidad: 20 });
    expect(res.paralelosQueUsanAula).toEqual([
      { paraleloId: 1, paraleloNombre: 'A', materiaNombre: 'M1', carreraNombre: 'C', docenteNombre: 'D' },
      { paraleloId: 2, paraleloNombre: 'B', materiaNombre: 'M3', carreraNombre: 'C', docenteNombre: 'D' },
    ]);
  });

  it('devuelve lista vacía si no hay repositorio de horarios', async () => {
    const { useCase } = crear({ withRepo: false });
    const res = await useCase.execute(3);
    expect(res.paralelosQueUsanAula).toEqual([]);
  });

  it('si falla la consulta de horarios registra el error y devuelve lista vacía', async () => {
    const { useCase, aulasHorariosSemanaRepository, logger } = crear();
    aulasHorariosSemanaRepository.findByAulaId.mockRejectedValue(new Error('db'));
    const res = await useCase.execute(3);
    expect(res.paralelosQueUsanAula).toEqual([]);
    expect(logger.error).toHaveBeenCalledWith(
      'Error al obtener paralelos que usan el aula',
      { aulaId: 3, error: 'db' }
    );
  });
});
