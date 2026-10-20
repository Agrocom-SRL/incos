import { describe, it, expect, jest } from '@jest/globals';
import { GetInscripcionVigenteUseCase } from '../../../src/application/use-cases/academico/licencias/GetInscripcionVigenteUseCase.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';
import { crearLicenseRepository, loggerLic } from './licenciasTestUtils.js';

describe('GetInscripcionVigenteUseCase', () => {
  it('devuelve la inscripción vigente del estudiante', async () => {
    const licenseRepository = crearLicenseRepository();
    const res = await new GetInscripcionVigenteUseCase({ licenseRepository, logger: loggerLic() }).execute({ estudianteId: 8 });
    expect(licenseRepository.findInscripcionVigenteByEstudiante).toHaveBeenCalledWith(8);
    expect(res).toEqual({ inscripcion: { id: 5 } });
  });

  it('devuelve inscripcion null si el estudiante no tiene una vigente', async () => {
    const licenseRepository = crearLicenseRepository({ findInscripcionVigenteByEstudiante: jest.fn().mockResolvedValue(null) });
    const res = await new GetInscripcionVigenteUseCase({ licenseRepository, logger: loggerLic() }).execute({ estudianteId: 8 });
    expect(res).toEqual({ inscripcion: null });
  });

  it.each([[undefined], [null], [0], ['']])('exige estudianteId (%p)', async (estudianteId) => {
    const licenseRepository = crearLicenseRepository();
    const useCase = new GetInscripcionVigenteUseCase({ licenseRepository, logger: loggerLic() });
    await expect(useCase.execute({ estudianteId })).rejects.toBeInstanceOf(ValidationError);
    expect(licenseRepository.findInscripcionVigenteByEstudiante).not.toHaveBeenCalled();
  });

  it('exige parámetros (sin argumentos)', async () => {
    const useCase = new GetInscripcionVigenteUseCase({ licenseRepository: crearLicenseRepository(), logger: loggerLic() });
    await expect(useCase.execute()).rejects.toBeInstanceOf(ValidationError);
  });
});
