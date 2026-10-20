import { jest } from '@jest/globals';
import { CerrarBimestreGestionUseCase } from '../../../src/application/use-cases/academico/CerrarBimestreGestionUseCase.js';
import { UnprocessableEntityError } from '../../../src/domain/errors/AppError.js';

describe('CerrarBimestreGestionUseCase', () => {
  const crear = (cerrar = jest.fn().mockResolvedValue({ data: { cerrados: 8 } })) => {
    const deps = {
      gestionBimestresRepository: { cerrarBimestreGestion: cerrar },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new CerrarBimestreGestionUseCase(deps) };
  };

  it('cierra el bimestre y devuelve el resultado del repositorio', async () => {
    const { useCase, deps } = crear();
    const result = await useCase.execute({ numeroBimestre: 1, userId: 5 });

    expect(deps.gestionBimestresRepository.cerrarBimestreGestion).toHaveBeenCalledWith(1, 5);
    expect(result).toEqual({ data: { cerrados: 8 } });
    expect(deps.logger.info).toHaveBeenCalledWith(
      '[Calificaciones] Bimestre cerrado',
      { numeroBimestre: 1, cerrados: 8 },
    );
  });

  it('traduce CIERRE_BLOQUEADO conservando código y detalle de validación', async () => {
    const validacion = { puedeCerrar: false, bloqueantes: ['cuadernos abiertos'] };
    const error = Object.assign(new Error('Cierre bloqueado'), {
      code: 'CIERRE_BLOQUEADO',
      validacion,
    });
    const { useCase } = crear(jest.fn().mockRejectedValue(error));

    const promesa = useCase.execute({ numeroBimestre: 2, userId: 5 });
    await expect(promesa).rejects.toBeInstanceOf(UnprocessableEntityError);
    await expect(promesa).rejects.toMatchObject({ code: 'CIERRE_BLOQUEADO', validacion });
  });

  it('propaga otros errores sin transformarlos', async () => {
    const error = new Error('falla de BD');
    const { useCase, deps } = crear(jest.fn().mockRejectedValue(error));

    await expect(useCase.execute({ numeroBimestre: 2, userId: 5 })).rejects.toBe(error);
    expect(deps.logger.info).not.toHaveBeenCalled();
  });
});
