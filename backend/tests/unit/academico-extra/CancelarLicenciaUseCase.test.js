import { describe, it, expect, jest } from '@jest/globals';
import { CancelarLicenciaUseCase } from '../../../src/application/use-cases/academico/licencias/CancelarLicenciaUseCase.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';
import { crearLicenseRepository, loggerLic } from './licenciasTestUtils.js';

describe('CancelarLicenciaUseCase', () => {
  const licencia = (o = {}) => ({ id: 1, state: 'PENDIENTE', createdBy: 10, ...o });
  const crear = (lic = licencia()) => {
    const licenseRepository = crearLicenseRepository({ findById: jest.fn().mockResolvedValue(lic) });
    return { licenseRepository, useCase: new CancelarLicenciaUseCase({ licenseRepository, logger: loggerLic() }) };
  };
  const run = (useCase, o = {}) => useCase.execute({ usuarioId: 10, rolCodigo: 'SECA', id: 1, ...o });

  it.each(['PENDIENTE', 'APROBADA'])('staff cancela una licencia %s', async (state) => {
    const { useCase, licenseRepository } = crear(licencia({ state }));
    const res = await run(useCase);
    expect(licenseRepository.update).toHaveBeenCalledWith(1, { state: 'CANCELADA' }, 10);
    expect(res.licencia.id).toBe(1);
  });

  it('sin observación conserva la previa (no envía decisionObservations)', async () => {
    const { useCase, licenseRepository } = crear();
    await run(useCase);
    expect(licenseRepository.update.mock.calls[0][1]).not.toHaveProperty('decisionObservations');
  });

  it('con observación la guarda recortada; en blanco la limpia', async () => {
    const a = crear();
    await run(a.useCase, { observacionesDecision: '  Desiste ' });
    expect(a.licenseRepository.update.mock.calls[0][1]).toEqual({ state: 'CANCELADA', decisionObservations: 'Desiste' });
    const b = crear();
    await run(b.useCase, { observacionesDecision: '   ' });
    expect(b.licenseRepository.update.mock.calls[0][1]).toEqual({ state: 'CANCELADA', decisionObservations: null });
  });

  it.each(['RECHAZADA', 'CANCELADA'])('no cancela una licencia %s', async (state) => {
    const { useCase, licenseRepository } = crear(licencia({ state }));
    await expect(run(useCase)).rejects.toBeInstanceOf(ValidationError);
    expect(licenseRepository.update).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si la licencia no existe', async () => {
    const { useCase } = crear(null);
    await expect(run(useCase)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('DOCENTE cancela su propia licencia PENDIENTE (createdBy numérico o texto)', async () => {
    const { useCase, licenseRepository } = crear(licencia({ createdBy: '10' }));
    await run(useCase, { rolCodigo: 'DOCENTE' });
    expect(licenseRepository.update).toHaveBeenCalled();
  });

  it('DOCENTE no cancela la licencia de otro', async () => {
    const { useCase, licenseRepository } = crear(licencia({ createdBy: 77 }));
    await expect(run(useCase, { rolCodigo: 'DOCENTE' })).rejects.toBeInstanceOf(ForbiddenError);
    expect(licenseRepository.update).not.toHaveBeenCalled();
  });

  it('DOCENTE no cancela una licencia APROBADA propia', async () => {
    const { useCase, licenseRepository } = crear(licencia({ state: 'APROBADA' }));
    await expect(run(useCase, { rolCodigo: 'DOCENTE' })).rejects.toBeInstanceOf(ForbiddenError);
    expect(licenseRepository.update).not.toHaveBeenCalled();
  });
});
