import { describe, it, expect, jest } from '@jest/globals';
import { CrearSesionEspecialUseCase } from '../../../src/application/use-cases/academico/asistencia/CrearSesionEspecialUseCase.js';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';
import { crearDepsAcceso, crearLogger } from './asistenciaTestUtils.js';

describe('CrearSesionEspecialUseCase', () => {
  const periodos = [
    { numero_orden: 1, fecha_inicio: '2026-02-01', fecha_fin: '2026-04-30' },
    { numero_orden: 2, fecha_inicio: '2026-05-01', fecha_fin: '2026-07-31' },
  ];
  const crear = ({ existente = null, acceso = {}, periodosGestion = periodos } = {}) => {
    const deps = {
      ...crearDepsAcceso({
        ...acceso,
        calificacionContextoRepository: {
          obtenerPeriodosBimestresGestion: jest.fn().mockResolvedValue(periodosGestion),
          ...acceso.calificacionContextoRepository,
        },
      }),
      cuadernoRepository: { obtenerPeriodoAcademicoId: jest.fn().mockResolvedValue(88) },
      sesionClaseRepository: {
        obtenerSesionPorFecha: jest.fn().mockResolvedValue(existente),
        upsertSesion: jest.fn().mockResolvedValue({ id: 501 }),
      },
      logger: crearLogger(),
    };
    return { deps, useCase: new CrearSesionEspecialUseCase(deps) };
  };
  const body = { fecha: '2026-03-21', motivo: '  Taller de repaso ', horaInicio: '08:00', horaFin: '10:00' };

  it('crea la sesión especial resolviendo el periodo por fecha', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ usuarioId: 10, asignacionId: '20', body });
    expect(res).toEqual({
      sesionClaseId: 501,
      fechaClase: '2026-03-21',
      esSesionEspecial: true,
      motivo: 'Taller de repaso',
      periodoAcademicoId: 88,
    });
    expect(deps.cuadernoRepository.obtenerPeriodoAcademicoId).toHaveBeenCalledWith(3, 1);
    expect(deps.sesionClaseRepository.upsertSesion).toHaveBeenCalledWith(
      20,
      '2026-03-21',
      { esEspecial: true, motivo: 'Taller de repaso', periodoAcademicoId: 88, horaInicio: '08:00', horaFin: '10:00' },
      10,
    );
  });

  it('periodoAcademicoId queda null si la fecha no cae en ningún bimestre', async () => {
    const { useCase, deps } = crear();
    const res = await useCase.execute({ usuarioId: 10, asignacionId: 20, body: { ...body, fecha: '2026-12-01' } });
    expect(res.periodoAcademicoId).toBeNull();
    expect(deps.cuadernoRepository.obtenerPeriodoAcademicoId).not.toHaveBeenCalled();
    expect(deps.sesionClaseRepository.upsertSesion.mock.calls[0][2]).toMatchObject({ periodoAcademicoId: null });
  });

  it('horas opcionales se envían como null', async () => {
    const { useCase, deps } = crear();
    await useCase.execute({ usuarioId: 10, asignacionId: 20, body: { fecha: '2026-03-21', motivo: 'x' } });
    expect(deps.sesionClaseRepository.upsertSesion.mock.calls[0][2]).toMatchObject({ horaInicio: null, horaFin: null });
  });

  it('permite fecha futura', async () => {
    const { useCase } = crear();
    await expect(
      useCase.execute({ usuarioId: 10, asignacionId: 20, body: { fecha: '2999-01-01', motivo: 'x' } }),
    ).resolves.toMatchObject({ fechaClase: '2999-01-01' });
  });

  it('permite editar una sesión especial existente del mismo día', async () => {
    const { useCase, deps } = crear({ existente: { esEspecial: true } });
    await useCase.execute({ usuarioId: 10, asignacionId: 20, body });
    expect(deps.sesionClaseRepository.upsertSesion).toHaveBeenCalled();
  });

  it('lanza ConflictError si el día es de horario regular', async () => {
    const { useCase, deps } = crear({ existente: { esEspecial: false } });
    await expect(useCase.execute({ usuarioId: 10, asignacionId: 20, body })).rejects.toBeInstanceOf(ConflictError);
    expect(deps.sesionClaseRepository.upsertSesion).not.toHaveBeenCalled();
  });

  it.each([[undefined], [null], ['']])('rechaza fecha vacía (%p)', async (fecha) => {
    const { useCase, deps } = crear();
    await expect(useCase.execute({ usuarioId: 10, asignacionId: 20, body: { ...body, fecha } })).rejects.toBeInstanceOf(ValidationError);
    expect(deps.calificacionCoordinacionRepository.obtenerCursoPorAsignacion).not.toHaveBeenCalled();
  });

  it.each([[undefined], ['   '], [null]])('rechaza motivo vacío (%p)', async (motivo) => {
    const { useCase } = crear();
    await expect(useCase.execute({ usuarioId: 10, asignacionId: 20, body: { ...body, motivo } })).rejects.toBeInstanceOf(ValidationError);
  });

  it('rechaza body ausente', async () => {
    const { useCase } = crear();
    await expect(useCase.execute({ usuarioId: 10, asignacionId: 20 })).rejects.toBeInstanceOf(ValidationError);
  });

  it('lanza NotFoundError con asignacionId no numérico', async () => {
    const { useCase } = crear();
    await expect(useCase.execute({ usuarioId: 10, asignacionId: 'abc', body })).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lanza ForbiddenError sin acceso al curso', async () => {
    const { useCase, deps } = crear({ acceso: { teacherRepository: { findAll: jest.fn().mockResolvedValue([]), }, userRepository: { findById: jest.fn().mockResolvedValue(null) } } });
    await expect(useCase.execute({ usuarioId: 10, asignacionId: 20, body })).rejects.toBeInstanceOf(ForbiddenError);
    expect(deps.sesionClaseRepository.upsertSesion).not.toHaveBeenCalled();
  });
});
