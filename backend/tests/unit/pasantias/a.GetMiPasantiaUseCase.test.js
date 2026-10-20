import { describe, it, expect, jest } from '@jest/globals';
import { GetMiPasantiaUseCase } from '../../../src/application/use-cases/pasantias/GetMiPasantiaUseCase.js';
import { ForbiddenError } from '../../../src/domain/errors/AppError.js';

describe('GetMiPasantiaUseCase', () => {
  const crear = ({ rows = [], detalle = null } = {}) => {
    const deps = {
      pasantiaViewRepository: {
        findListado: jest.fn().mockResolvedValue({ rows, total: rows.length }),
        findListadoById: jest.fn().mockResolvedValue(detalle),
      },
      pasantiaInformeRepository: {
        findByPasantiaId: jest.fn().mockResolvedValue([{ id: 1, rutaArchivo: '/x.pdf', tipo: 'A' }]),
      },
      pasantiaSeguimientoRepository: {
        findByPasantiaId: jest.fn().mockResolvedValue([{ id: 2, rutaArchivo: '/y.pdf', nota: 'n' }]),
      },
      studentRepository: {
        findAll: jest.fn().mockResolvedValue({ students: [{ id: 11 }] }),
        findById: jest.fn(),
      },
      userRepository: { findById: jest.fn() },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new GetMiPasantiaUseCase(deps) };
  };

  it('prefiere el trámite vigente sobre uno más reciente cerrado', async () => {
    const rows = [
      { pasantia_id: 1, estado: 'FINALIZADA' },
      { pasantia_id: 2, estado: 'EN_CURSO' },
    ];
    const { useCase, deps } = crear({ rows, detalle: { pasantia_id: 2, estado: 'EN_CURSO' } });

    const result = await useCase.execute({ usuarioId: 50 });

    expect(deps.studentRepository.findAll).toHaveBeenCalledWith({ userId: 50 });
    expect(deps.pasantiaViewRepository.findListado).toHaveBeenCalledWith(
      { estudianteId: 11 },
      1,
      100
    );
    expect(deps.pasantiaViewRepository.findListadoById).toHaveBeenCalledWith(2);
    expect(deps.pasantiaInformeRepository.findByPasantiaId).toHaveBeenCalledWith(2);
    expect(deps.pasantiaSeguimientoRepository.findByPasantiaId).toHaveBeenCalledWith(2);
    expect(result.pasantia).toMatchObject({ id: 2, estado: 'EN_CURSO' });
    expect(result.estudianteId).toBe(11);
  });

  it('sin vigente elige el primero (más reciente)', async () => {
    const rows = [
      { pasantia_id: 8, estado: 'CONVALIDADA' },
      { pasantia_id: 7, estado: 'RECHAZADA' },
    ];
    const { useCase } = crear({ rows });
    const result = await useCase.execute({ usuarioId: 50 });
    expect(result.pasantia.id).toBe(8);
  });

  it('no expone rutaArchivo en informes ni seguimientos', async () => {
    const { useCase } = crear({ rows: [{ pasantia_id: 1, estado: 'SOLICITADA' }] });
    const result = await useCase.execute({ usuarioId: 50 });

    expect(result.informes).toEqual([{ id: 1, tipo: 'A' }]);
    expect(result.seguimientos).toEqual([{ id: 2, nota: 'n' }]);
  });

  it('sin trámites devuelve estado vacío y no consulta satélites', async () => {
    const { useCase, deps } = crear({ rows: [] });
    const result = await useCase.execute({ usuarioId: 50 });

    expect(result).toEqual({ pasantia: null, informes: [], seguimientos: [], estudianteId: 11 });
    expect(deps.pasantiaInformeRepository.findByPasantiaId).not.toHaveBeenCalled();
  });

  it('estudiante sin vínculo lanza ForbiddenError', async () => {
    const { useCase, deps } = crear();
    deps.studentRepository.findAll.mockResolvedValue({ students: [] });
    deps.userRepository.findById.mockResolvedValue({ referenceType: 'DOCENTE', referenceId: 3 });

    await expect(useCase.execute({ usuarioId: 50 })).rejects.toBeInstanceOf(ForbiddenError);
    expect(deps.pasantiaViewRepository.findListado).not.toHaveBeenCalled();
  });

  it('resuelve el estudiante por referencia polimórfica como fallback', async () => {
    const { useCase, deps } = crear();
    deps.studentRepository.findAll.mockResolvedValue({ students: [] });
    deps.userRepository.findById.mockResolvedValue({ referenceType: 'ESTUDIANTE', referenceId: 22 });
    deps.studentRepository.findById.mockResolvedValue({ id: 22 });

    const result = await useCase.execute({ usuarioId: 50 });

    expect(result.estudianteId).toBe(22);
    expect(deps.pasantiaViewRepository.findListado).toHaveBeenCalledWith(
      { estudianteId: 22 },
      1,
      100
    );
  });
});
