import { describe, it, expect, jest } from '@jest/globals';
import { DecidirLicenciaUseCase } from '../../../src/application/use-cases/academico/licencias/DecidirLicenciaUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';
import { crearLicenseRepository, loggerLic } from './licenciasTestUtils.js';

describe('DecidirLicenciaUseCase', () => {
  const licencia = (o = {}) => ({ id: 1, state: 'PENDIENTE', enrollmentId: 5, totalDays: 3, ...o });
  const crear = ({ lic = licencia(), repo } = {}) => {
    const licenseRepository = crearLicenseRepository({ findById: jest.fn().mockResolvedValue(lic), ...repo });
    return { licenseRepository, useCase: new DecidirLicenciaUseCase({ licenseRepository, logger: loggerLic() }) };
  };

  it('aprueba una licencia pendiente (observación opcional)', async () => {
    const { useCase, licenseRepository } = crear();
    const res = await useCase.execute({ usuarioId: 10, id: 1, body: { decision: 'APROBAR' } });
    expect(licenseRepository.sumApprovedDaysByInscripcion).toHaveBeenCalledWith(5, { excludeId: 1 });
    expect(licenseRepository.update).toHaveBeenCalledWith(1, { state: 'APROBADA', decisionObservations: null }, 10);
    expect(res.licencia.id).toBe(1);
  });

  it('guarda la observación recortada al aprobar', async () => {
    const { useCase, licenseRepository } = crear();
    await useCase.execute({ usuarioId: 10, id: 1, body: { decision: 'APROBAR', observacionesDecision: '  Con certificado ' } });
    expect(licenseRepository.update.mock.calls[0][1]).toEqual({ state: 'APROBADA', decisionObservations: 'Con certificado' });
  });

  it('aprueba cuando justo alcanza el tope de 15 días', async () => {
    const { useCase, licenseRepository } = crear({ repo: { sumApprovedDaysByInscripcion: jest.fn().mockResolvedValue(12) } });
    await useCase.execute({ usuarioId: 10, id: 1, body: { decision: 'APROBAR' } });
    expect(licenseRepository.update).toHaveBeenCalled();
  });

  it('no aprueba si supera el tope de 15 días por gestión', async () => {
    const { useCase, licenseRepository } = crear({ repo: { sumApprovedDaysByInscripcion: jest.fn().mockResolvedValue(13) } });
    await expect(useCase.execute({ usuarioId: 10, id: 1, body: { decision: 'APROBAR' } })).rejects.toThrow(/tope de 15/);
    expect(licenseRepository.update).not.toHaveBeenCalled();
  });

  it('rechaza con motivo obligatorio y no consulta el tope', async () => {
    const { useCase, licenseRepository } = crear();
    await useCase.execute({ usuarioId: 10, id: 1, body: { decision: 'RECHAZAR', observacionesDecision: ' No justifica ' } });
    expect(licenseRepository.sumApprovedDaysByInscripcion).not.toHaveBeenCalled();
    expect(licenseRepository.update).toHaveBeenCalledWith(1, { state: 'RECHAZADA', decisionObservations: 'No justifica' }, 10);
  });

  it.each([[undefined], [null], ['   ']])('rechazar sin motivo (%p) falla', async (observacionesDecision) => {
    const { useCase, licenseRepository } = crear();
    await expect(
      useCase.execute({ usuarioId: 10, id: 1, body: { decision: 'RECHAZAR', observacionesDecision } }),
    ).rejects.toThrow(/motivo del rechazo/);
    expect(licenseRepository.update).not.toHaveBeenCalled();
  });

  it.each([[undefined], ['aprobar'], ['PENDIENTE'], ['']])('rechaza decisión inválida (%p) antes de consultar', async (decision) => {
    const { useCase, licenseRepository } = crear();
    await expect(useCase.execute({ usuarioId: 10, id: 1, body: { decision } })).rejects.toBeInstanceOf(ValidationError);
    expect(licenseRepository.findById).not.toHaveBeenCalled();
  });

  it('rechaza body ausente', async () => {
    const { useCase } = crear();
    await expect(useCase.execute({ usuarioId: 10, id: 1 })).rejects.toBeInstanceOf(ValidationError);
  });

  it('lanza NotFoundError si la licencia no existe', async () => {
    const { useCase } = crear({ lic: null });
    await expect(useCase.execute({ usuarioId: 10, id: 9, body: { decision: 'APROBAR' } })).rejects.toBeInstanceOf(NotFoundError);
  });

  it.each(['APROBADA', 'RECHAZADA', 'CANCELADA'])('no decide una licencia %s', async (state) => {
    const { useCase, licenseRepository } = crear({ lic: licencia({ state }) });
    await expect(useCase.execute({ usuarioId: 10, id: 1, body: { decision: 'APROBAR' } })).rejects.toThrow(/PENDIENTE/);
    expect(licenseRepository.update).not.toHaveBeenCalled();
  });
});
