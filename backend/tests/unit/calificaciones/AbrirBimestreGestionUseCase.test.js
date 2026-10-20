import { jest } from '@jest/globals';
import { AbrirBimestreGestionUseCase } from '../../../src/application/use-cases/academico/AbrirBimestreGestionUseCase.js';
import { UnprocessableEntityError } from '../../../src/domain/errors/AppError.js';

describe('AbrirBimestreGestionUseCase', () => {
  const crear = (abrir = jest.fn().mockResolvedValue({ data: { abiertos: 12 } })) => {
    const deps = {
      gestionBimestresRepository: { abrirBimestreGestion: abrir },
      logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    };
    return { deps, useCase: new AbrirBimestreGestionUseCase(deps) };
  };

  it('abre el bimestre y devuelve el resultado del repositorio', async () => {
    const { useCase, deps } = crear();
    const result = await useCase.execute({ numeroBimestre: 2, userId: 9 });

    expect(deps.gestionBimestresRepository.abrirBimestreGestion).toHaveBeenCalledWith(2, 9);
    expect(result).toEqual({ data: { abiertos: 12 } });
    expect(deps.logger.info).toHaveBeenCalledWith(
      '[Calificaciones] Bimestre abierto',
      { numeroBimestre: 2, abiertos: 12 },
    );
  });

  it('traduce BIMESTRE_FUTURO a UnprocessableEntityError conservando el código', async () => {
    const error = Object.assign(new Error('Bimestre aún no inicia'), { code: 'BIMESTRE_FUTURO' });
    const { useCase } = crear(jest.fn().mockRejectedValue(error));

    const promesa = useCase.execute({ numeroBimestre: 4, userId: 1 });
    await expect(promesa).rejects.toBeInstanceOf(UnprocessableEntityError);
    await expect(promesa).rejects.toMatchObject({
      code: 'BIMESTRE_FUTURO',
      message: 'Bimestre aún no inicia',
    });
  });

  it('propaga cualquier otro error sin transformarlo', async () => {
    const error = new Error('falla de BD');
    const { useCase, deps } = crear(jest.fn().mockRejectedValue(error));

    await expect(useCase.execute({ numeroBimestre: 1, userId: 1 })).rejects.toBe(error);
    expect(deps.logger.info).not.toHaveBeenCalled();
  });
});
