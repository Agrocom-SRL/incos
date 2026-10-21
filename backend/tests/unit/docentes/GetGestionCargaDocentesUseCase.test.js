import { describe, it, expect, jest } from '@jest/globals';
import { GetGestionCargaDocentesUseCase } from '../../../src/application/use-cases/docentes/GetGestionCargaDocentesUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('GetGestionCargaDocentesUseCase', () => {
  const crear = () => {
    const deps = {
      managementRepository: { findById: jest.fn().mockResolvedValue({ id: 2 }) },
      teacherAssignmentRepository: {
        findCargaResumenByGestion: jest.fn().mockResolvedValue([
          { docenteId: 1, nombre: 'Ana', colorHex: '#E6194B', maxSemana: 10, cargaSemana: 12 },
          { docenteId: 2, nombre: 'Luis', colorHex: null, maxSemana: 20, cargaSemana: 5 },
        ]),
      },
      courseOfferRepository: {
        findCoberturaTotalesByGestionId: jest.fn().mockResolvedValue({ cursosTotal: 8, cursosConDocente: 6 }),
      },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GetGestionCargaDocentesUseCase(deps) };
  };

  it('arma totales, ratio por docente y cobertura', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute('2');

    expect(deps.teacherAssignmentRepository.findCargaResumenByGestion).toHaveBeenCalledWith(2);
    expect(deps.courseOfferRepository.findCoberturaTotalesByGestionId).toHaveBeenCalledWith(2);
    expect(res.totales).toEqual({
      docentes_activos: 2, horas_total_semana: 17, docentes_sobrecargados: 1, cobertura: 75,
    });
    expect(res.docentes[0]).toMatchObject({ docente_id: 1, ratio: 1.2, color_hex: '#E6194B' });
    expect(res.docentes[1]).toMatchObject({ ratio: 0.25, color_hex: null });
  });

  it('sin cursos la cobertura es 0', async () => {
    const { useCase, deps } = crear();
    deps.courseOfferRepository.findCoberturaTotalesByGestionId.mockResolvedValue({});
    const res = await useCase.execute(2);
    expect(res.totales.cobertura).toBe(0);
  });

  it.each([[0], [-1], ['abc'], [undefined]])('id inválido (%p) lanza NotFoundError', async (id) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute(id)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.managementRepository.findById).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si la gestión no existe', async () => {
    const { useCase, deps } = crear();
    deps.managementRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(2)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.teacherAssignmentRepository.findCargaResumenByGestion).not.toHaveBeenCalled();
  });
});
