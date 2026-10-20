import { describe, it, expect, jest } from '@jest/globals';
import { GetLicenciaByIdUseCase } from '../../../src/application/use-cases/academico/licencias/GetLicenciaByIdUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';
import { crearLicenseRepository, loggerLic } from './licenciasTestUtils.js';

describe('GetLicenciaByIdUseCase', () => {
  it('devuelve el DTO con las claves del contrato del frontend', async () => {
    const licenseRepository = crearLicenseRepository();
    const res = await new GetLicenciaByIdUseCase({ licenseRepository, logger: loggerLic() }).execute({ id: 1 });
    expect(licenseRepository.findByIdWithStudentName).toHaveBeenCalledWith(1);
    expect(res).toEqual({
      licencia: {
        id: 1,
inscripcionId: 5,
estudianteNombre: 'Ana Perez',
codigoEstudiante: 'E1',
carreraNombre: 'Contaduría',
        carreraCodigo: 'CON',
periodoNombre: '1er año',
paraleloNombre: 'A',
fechaSolicitud: '2026-03-01',
        fechaInicio: '2026-03-02',
fechaFin: '2026-03-04',
totalDias: 3,
motivo: 'ENFERMEDAD',
        detalleMotivo: 'Gripe',
estado: 'PENDIENTE',
observacionesDecision: null,
      },
    });
  });

  it('completa con null los campos ausentes', async () => {
    const licenseRepository = crearLicenseRepository({ findByIdWithStudentName: jest.fn().mockResolvedValue({ id: 3 }) });
    const { licencia } = await new GetLicenciaByIdUseCase({ licenseRepository, logger: loggerLic() }).execute({ id: 3 });
    expect(licencia.id).toBe(3);
    expect(licencia.estudianteNombre).toBeNull();
    expect(licencia.totalDias).toBeNull();
  });

  it('lanza NotFoundError si no existe', async () => {
    const licenseRepository = crearLicenseRepository({ findByIdWithStudentName: jest.fn().mockResolvedValue(null) });
    await expect(new GetLicenciaByIdUseCase({ licenseRepository, logger: loggerLic() }).execute({ id: 99 })).rejects.toBeInstanceOf(NotFoundError);
  });
});
