import { describe, it, expect, jest } from '@jest/globals';
import { EliminarSesionEspecialUseCase } from '../../../src/application/use-cases/academico/asistencia/EliminarSesionEspecialUseCase.js';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';
import { crearDepsAcceso, crearLogger } from './asistenciaTestUtils.js';

describe('EliminarSesionEspecialUseCase', () => {
  const crear = ({ sesion = { esEspecial: true }, celdas = [], acceso } = {}) => {
    const deps = {
      ...crearDepsAcceso(acceso),
      sesionClaseRepository: {
        obtenerSesionPorFecha: jest.fn().mockResolvedValue(sesion),
        eliminarSesionEspecial: jest.fn().mockResolvedValue({ eliminada: true }),
      },
      asistenciaPlanillaViewRepository: { listarCeldasPlanilla: jest.fn().mockResolvedValue(celdas) },
      logger: crearLogger(),
    };
    return { deps, useCase: new EliminarSesionEspecialUseCase(deps) };
  };

  it('elimina una sesión especial sin asistencia', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ usuarioId: 10, asignacionId: '20', fecha: '2026-03-21T00:00:00.000Z' });
    expect(res).toEqual({ fechaClase: '2026-03-21', eliminada: true });
    expect(deps.sesionClaseRepository.obtenerSesionPorFecha).toHaveBeenCalledWith(20, '2026-03-21');
    expect(deps.asistenciaPlanillaViewRepository.listarCeldasPlanilla).toHaveBeenCalledWith(20, '2026-03-21', '2026-03-21');
    expect(deps.sesionClaseRepository.eliminarSesionEspecial).toHaveBeenCalledWith(20, '2026-03-21', 10);
  });

  it.each([[undefined], [null], ['']])('rechaza fecha vacía (%p)', async (fecha) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ usuarioId: 10, asignacionId: 20, fecha })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.sesionClaseRepository.eliminarSesionEspecial).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si no hay sesión ese día', async () => {
    const { useCase } = crear({ sesion: null });
    await expect(useCase.execute({ usuarioId: 10, asignacionId: 20, fecha: '2026-03-21' })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lanza NotFoundError si la sesión es de horario regular (no especial)', async () => {
    const { useCase, deps } = crear({ sesion: { esEspecial: false } });
    await expect(useCase.execute({ usuarioId: 10, asignacionId: 20, fecha: '2026-03-21' })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.sesionClaseRepository.eliminarSesionEspecial).not.toHaveBeenCalled();
  });

  it('lanza ConflictError si ya hay asistencia registrada', async () => {
    const { useCase, deps } = crear({ celdas: [{ matricula_materia_id: 1 }] });
    await expect(useCase.execute({ usuarioId: 10, asignacionId: 20, fecha: '2026-03-21' })).rejects.toBeInstanceOf(ConflictError);
    expect(deps.sesionClaseRepository.eliminarSesionEspecial).not.toHaveBeenCalled();
  });

  it('tolera listarCeldasPlanilla devolviendo null', async () => {
    const { useCase } = crear({ celdas: null });
    await expect(useCase.execute({ usuarioId: 10, asignacionId: 20, fecha: '2026-03-21' })).resolves.toMatchObject({ eliminada: true });
  });

  it('lanza NotFoundError con asignacionId no numérico', async () => {
    const { useCase } = crear();
    await expect(useCase.execute({ usuarioId: 10, asignacionId: 'abc', fecha: '2026-03-21' })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lanza ForbiddenError sin acceso', async () => {
    const { useCase, deps } = crear({ acceso: { teacherRepository: { findAll: jest.fn().mockResolvedValue([{ id: 99 }]) } } });
    await expect(useCase.execute({ usuarioId: 10, asignacionId: 20, fecha: '2026-03-21' })).rejects.toBeInstanceOf(ForbiddenError);
    expect(deps.sesionClaseRepository.eliminarSesionEspecial).not.toHaveBeenCalled();
  });
});
