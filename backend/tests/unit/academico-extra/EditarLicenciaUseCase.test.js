import { describe, it, expect, jest } from '@jest/globals';
import { EditarLicenciaUseCase } from '../../../src/application/use-cases/academico/licencias/EditarLicenciaUseCase.js';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';
import { crearLicenseRepository, loggerLic } from './licenciasTestUtils.js';

describe('EditarLicenciaUseCase', () => {
  const body = (o = {}) => ({
    fechaInicio: '2026-03-02', fechaFin: '2026-03-06', motivo: 'FAMILIAR', detalleMotivo: ' Viaje familiar ', ...o,
  });
  const licencia = (o = {}) => ({ id: 1, state: 'PENDIENTE', createdBy: 10, enrollmentId: 5, totalDays: 3, ...o });
  const crear = ({ lic = licencia(), repo } = {}) => {
    const licenseRepository = crearLicenseRepository({ findById: jest.fn().mockResolvedValue(lic), ...repo });
    return { licenseRepository, useCase: new EditarLicenciaUseCase({ licenseRepository, logger: loggerLic() }) };
  };
  const run = (useCase, o = {}) => useCase.execute({ usuarioId: 10, rolCodigo: 'SECA', id: 1, body: body(), ...o });

  it('actualiza motivo, rango y total de días excluyendo la propia licencia del tope', async () => {
    const { useCase, licenseRepository } = crear();
    const res = await run(useCase);
    expect(licenseRepository.sumApprovedDaysByInscripcion).toHaveBeenCalledWith(5, { excludeId: 1 });
    expect(licenseRepository.update).toHaveBeenCalledWith(
      1,
      { startDate: '2026-03-02', endDate: '2026-03-06', totalDays: 5, reason: 'FAMILIAR', reasonDetail: 'Viaje familiar' },
      10,
    );
    expect(res.licencia).toMatchObject({ id: 1 });
  });

  it('lanza NotFoundError si la licencia no existe', async () => {
    const { useCase, licenseRepository } = crear({ lic: null });
    await expect(run(useCase)).rejects.toBeInstanceOf(NotFoundError);
    expect(licenseRepository.update).not.toHaveBeenCalled();
  });

  it.each(['APROBADA', 'RECHAZADA', 'CANCELADA'])('staff no puede editar una licencia %s', async (state) => {
    const { useCase, licenseRepository } = crear({ lic: licencia({ state }) });
    await expect(run(useCase)).rejects.toBeInstanceOf(ValidationError);
    expect(licenseRepository.update).not.toHaveBeenCalled();
  });

  it('DOCENTE puede editar su propia licencia PENDIENTE', async () => {
    const { useCase, licenseRepository } = crear();
    await run(useCase, { rolCodigo: 'DOCENTE' });
    expect(licenseRepository.update).toHaveBeenCalled();
  });

  it('DOCENTE no puede editar la licencia de otro usuario', async () => {
    const { useCase, licenseRepository } = crear({ lic: licencia({ createdBy: 99 }) });
    await expect(run(useCase, { rolCodigo: 'DOCENTE' })).rejects.toBeInstanceOf(ForbiddenError);
    expect(licenseRepository.update).not.toHaveBeenCalled();
  });

  it('DOCENTE no puede editar una licencia que ya no está PENDIENTE (403, no 400)', async () => {
    const { useCase } = crear({ lic: licencia({ state: 'APROBADA' }) });
    await expect(run(useCase, { rolCodigo: 'DOCENTE' })).rejects.toBeInstanceOf(ForbiddenError);
  });

  it.each([
    ['sin fechaInicio', { fechaInicio: undefined }],
    ['sin fechaFin', { fechaFin: undefined }],
    ['fin anterior al inicio', { fechaFin: '2026-03-01' }],
    ['motivo fuera del catálogo', { motivo: 'X' }],
    ['sin motivo', { motivo: undefined }],
    ['detalle vacío', { detalleMotivo: '  ' }],
    ['más de 15 días', { fechaFin: '2026-03-30' }],
  ])('rechaza entrada inválida: %s', async (_n, o) => {
    const { useCase, licenseRepository } = crear();
    await expect(run(useCase, { body: body(o) })).rejects.toBeInstanceOf(ValidationError);
    expect(licenseRepository.update).not.toHaveBeenCalled();
  });

  it('rechaza si junto a los días aprobados supera 15', async () => {
    const { useCase, licenseRepository } = crear({ repo: { sumApprovedDaysByInscripcion: jest.fn().mockResolvedValue(11) } });
    await expect(run(useCase)).rejects.toThrow(/Supera el tope de 15/);
    expect(licenseRepository.update).not.toHaveBeenCalled();
  });

  it('acepta justo 15 días aprobados + editados', async () => {
    const { useCase, licenseRepository } = crear({ repo: { sumApprovedDaysByInscripcion: jest.fn().mockResolvedValue(10) } });
    await run(useCase);
    expect(licenseRepository.update).toHaveBeenCalled();
  });

  it('rechaza body ausente', async () => {
    const { useCase } = crear();
    await expect(useCase.execute({ usuarioId: 10, id: 1 })).rejects.toBeInstanceOf(ValidationError);
  });

  it.each([['abc'], ['2026-02-31']])('rechaza fechas no parseables (%p) con ValidationError', async (fecha) => {
    const { useCase, licenseRepository } = crear();
    await expect(run(useCase, { body: body({ fechaInicio: fecha }) })).rejects.toBeInstanceOf(ValidationError);
    await expect(run(useCase, { body: body({ fechaFin: fecha }) })).rejects.toBeInstanceOf(ValidationError);
    expect(licenseRepository.update).not.toHaveBeenCalled();
  });
});
