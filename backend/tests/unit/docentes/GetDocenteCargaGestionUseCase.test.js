import { describe, it, expect, jest } from '@jest/globals';
import { GetDocenteCargaGestionUseCase } from '../../../src/application/use-cases/docentes/GetDocenteCargaGestionUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('GetDocenteCargaGestionUseCase', () => {
  const crear = () => {
    const deps = {
      teacherRepository: {
        findCargaLimitesById: jest.fn().mockResolvedValue({ maxHorasSemana: 10, maxHorasMes: 40 }),
      },
      teacherAssignmentRepository: {
        findCargaDetalleByDocenteAndGestion: jest.fn().mockResolvedValue([
          { id: 1, ofertaCursoId: 5, asignatura: 'Mat', paralelo: 'A', horas: 4 },
          { id: 2, ofertaCursoId: 6, asignatura: 'Fis', paralelo: 'B', horas: '3' },
        ]),
      },
      managementRepository: { findById: jest.fn().mockResolvedValue({ id: 2 }) },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GetDocenteCargaGestionUseCase(deps) };
  };

  it('calcula carga semanal/mensual y disponibilidad', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ docenteId: '1', gestionId: '2' });

    expect(deps.teacherAssignmentRepository.findCargaDetalleByDocenteAndGestion)
      .toHaveBeenCalledWith(1, 2);
    expect(res).toMatchObject({
      docente_id: 1,
gestion_id: 2,
max_horas_semana: 10,
max_horas_mes: 40,
      carga_actual_semana: 7,
carga_actual_mes: 28,
disponible_semana: 3,
disponible_mes: 12,
      sobrecarga: false,
    });
    expect(res.asignaciones[0]).toEqual({
      id: 1, oferta_curso_id: 5, asignatura: 'Mat', paralelo: 'A', horas: 4,
    });
  });

  it('marca sobrecarga cuando supera el máximo semanal', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findCargaLimitesById.mockResolvedValue({ maxHorasSemana: 5, maxHorasMes: 100 });
    const res = await useCase.execute({ docenteId: 1, gestionId: 2 });
    expect(res.sobrecarga).toBe(true);
    expect(res.disponible_semana).toBe(0);
  });

  it.each([[0], ['abc'], [undefined], [-1]])('docenteId inválido (%p) lanza ValidationError', async (docenteId) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ docenteId, gestionId: 2 })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.managementRepository.findById).not.toHaveBeenCalled();
  });

  it.each([[0], ['abc'], [undefined], [-1]])('gestionId inválido (%p) lanza ValidationError', async (gestionId) => {
    const { useCase } = crear();
    await expect(useCase.execute({ docenteId: 1, gestionId })).rejects.toBeInstanceOf(ValidationError);
  });

  it('lanza NotFoundError si la gestión no existe', async () => {
    const { useCase, deps } = crear();
    deps.managementRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute({ docenteId: 1, gestionId: 2 })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lanza NotFoundError si el docente no existe', async () => {
    const { useCase, deps } = crear();
    deps.teacherRepository.findCargaLimitesById.mockResolvedValue(null);
    await expect(useCase.execute({ docenteId: 1, gestionId: 2 })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.teacherAssignmentRepository.findCargaDetalleByDocenteAndGestion).not.toHaveBeenCalled();
  });
});
