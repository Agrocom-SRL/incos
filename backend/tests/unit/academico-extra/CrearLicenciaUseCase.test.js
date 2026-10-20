import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { CrearLicenciaUseCase } from '../../../src/application/use-cases/academico/licencias/CrearLicenciaUseCase.js';
import { NotFoundError, ValidationError } from '../../../src/domain/errors/AppError.js';
import { crearLicenseRepository, loggerLic } from './licenciasTestUtils.js';

describe('CrearLicenciaUseCase', () => {
  const body = (o = {}) => ({
    inscripcionId: 5, fechaInicio: '2026-03-02', fechaFin: '2026-03-04', motivo: 'ENFERMEDAD', detalleMotivo: '  Gripe  ', ...o,
  });
  const crear = (repoOverrides) => {
    const licenseRepository = crearLicenseRepository(repoOverrides);
    return { licenseRepository, useCase: new CrearLicenciaUseCase({ licenseRepository, logger: loggerLic() }) };
  };

  beforeEach(() => jest.useFakeTimers({ now: new Date('2026-03-01T12:00:00Z') }));
  afterEach(() => jest.useRealTimers());

  it('crea la licencia PENDIENTE con días inclusivos y devuelve el DTO', async () => {
    const { useCase, licenseRepository } = crear();
    const res = await useCase.execute({ usuarioId: 10, body: body() });
    expect(licenseRepository.getInscripcionInfo).toHaveBeenCalledWith(5);
    expect(licenseRepository.sumApprovedDaysByInscripcion).toHaveBeenCalledWith(5);
    expect(licenseRepository.create).toHaveBeenCalledWith(
      {
        enrollmentId: 5,
requestDate: '2026-03-01',
startDate: '2026-03-02',
endDate: '2026-03-04',
        totalDays: 3,
reason: 'ENFERMEDAD',
reasonDetail: 'Gripe',
state: 'PENDIENTE',
      },
      10,
    );
    expect(licenseRepository.findByIdWithStudentName).toHaveBeenCalledWith(1);
    expect(res.licencia).toMatchObject({ id: 1, estudianteNombre: 'Ana Perez', estado: 'PENDIENTE', totalDias: 3 });
  });

  it('una licencia de un solo día cuenta 1 día', async () => {
    const { useCase, licenseRepository } = crear();
    await useCase.execute({ usuarioId: 10, body: body({ fechaFin: '2026-03-02' }) });
    expect(licenseRepository.create.mock.calls[0][0].totalDays).toBe(1);
  });

  it('acepta exactamente 15 días en total', async () => {
    const { useCase, licenseRepository } = crear({ sumApprovedDaysByInscripcion: jest.fn().mockResolvedValue(12) });
    await useCase.execute({ usuarioId: 10, body: body() });
    expect(licenseRepository.create).toHaveBeenCalled();
  });

  it('rechaza una licencia de más de 15 días', async () => {
    const { useCase, licenseRepository } = crear();
    await expect(useCase.execute({ usuarioId: 10, body: body({ fechaFin: '2026-03-17' }) })).rejects.toThrow(/no puede superar 15/);
    expect(licenseRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza si con los días ya aprobados supera el tope de 15', async () => {
    const { useCase, licenseRepository } = crear({ sumApprovedDaysByInscripcion: jest.fn().mockResolvedValue(13) });
    await expect(useCase.execute({ usuarioId: 10, body: body() })).rejects.toThrow(/Supera el tope de 15/);
    expect(licenseRepository.create).not.toHaveBeenCalled();
  });

  it('lanza NotFoundError si la inscripción no existe', async () => {
    const { useCase, licenseRepository } = crear({ getInscripcionInfo: jest.fn().mockResolvedValue(null) });
    await expect(useCase.execute({ usuarioId: 10, body: body() })).rejects.toBeInstanceOf(NotFoundError);
    expect(licenseRepository.create).not.toHaveBeenCalled();
  });

  it.each([
    ['sin inscripción', { inscripcionId: undefined }],
    ['inscripción 0', { inscripcionId: 0 }],
    ['sin fechaInicio', { fechaInicio: undefined }],
    ['sin fechaFin', { fechaFin: '' }],
    ['fin anterior al inicio', { fechaFin: '2026-03-01' }],
    ['sin motivo', { motivo: undefined }],
    ['motivo fuera del catálogo', { motivo: 'VACACIONES' }],
    ['sin detalle', { detalleMotivo: undefined }],
    ['detalle en blanco', { detalleMotivo: '   ' }],
  ])('rechaza entrada inválida: %s', async (_n, o) => {
    const { useCase, licenseRepository } = crear();
    await expect(useCase.execute({ usuarioId: 10, body: body(o) })).rejects.toBeInstanceOf(ValidationError);
    expect(licenseRepository.getInscripcionInfo).not.toHaveBeenCalled();
    expect(licenseRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza body ausente', async () => {
    const { useCase } = crear();
    await expect(useCase.execute({ usuarioId: 10 })).rejects.toBeInstanceOf(ValidationError);
  });
});
