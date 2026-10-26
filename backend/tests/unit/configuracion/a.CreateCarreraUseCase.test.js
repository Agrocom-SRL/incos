import { describe, it, expect, jest } from '@jest/globals';
import { CreateCarreraUseCase } from '../../../src/application/use-cases/configuracion/CreateCarreraUseCase.js';
import { ConflictError, ValidationError } from '../../../src/domain/errors/AppError.js';

describe('CreateCarreraUseCase', () => {
  const crear = () => {
    const careerRepository = {
      create: jest.fn().mockResolvedValue({ id: 11 }),
      findBy: jest.fn().mockResolvedValue(null),
    };
    const logger = { info: jest.fn() };
    return { careerRepository, logger, useCase: new CreateCarreraUseCase({ careerRepository, logger }) };
  };

  it('crea la carrera con claves en español', async () => {
    const { useCase, careerRepository, logger } = crear();
    const res = await useCase.execute(
      {
        codigo: 'SIS',
        nombre: 'Sistemas',
        descripcion: 'd',
        area_formacion: 'TI',
        titulo_otorgado: 'Técnico',
        color_hex: '#fff',
        imagen_ruta: '/a.png',
        activo: false,
      },
      6
    );
    expect(res).toEqual({ carrera: { id: 11 } });
    expect(careerRepository.create).toHaveBeenCalledWith(
      {
        code: 'SIS',
        name: 'Sistemas',
        description: 'd',
        trainingArea: 'TI',
        grantedTitle: 'Técnico',
        colorHex: '#fff',
        imagePath: '/a.png',
        active: false,
      },
      6
    );
    expect(logger.info).toHaveBeenCalledWith('Carrera creada', { id: 11 });
  });

  it('acepta camelCase y activo=true por defecto', async () => {
    const { useCase, careerRepository } = crear();
    await useCase.execute({ nombre: 'X', areaFormacion: 'A', tituloOtorgado: 'T', colorHex: '#000', imagenRuta: '/i' });
    expect(careerRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        trainingArea: 'A',
        grantedTitle: 'T',
        colorHex: '#000',
        imagePath: '/i',
        active: true,
      }),
      null
    );
  });

  it('rechaza si falta nombre (incluido body vacío o null)', async () => {
    const { useCase, careerRepository } = crear();
    await expect(useCase.execute({})).rejects.toBeInstanceOf(ValidationError);
    await expect(useCase.execute(null)).rejects.toBeInstanceOf(ValidationError);
    expect(careerRepository.create).not.toHaveBeenCalled();
  });

  it('rechaza un código ya usado por otra carrera (409) sin crear nada', async () => {
    const { useCase, careerRepository } = crear();
    careerRepository.findBy.mockResolvedValue({ id: 2, code: 'SIS' });
    await expect(useCase.execute({ codigo: ' SIS ', nombre: 'Otra' })).rejects.toBeInstanceOf(ConflictError);
    expect(careerRepository.findBy).toHaveBeenCalledWith({ code: 'SIS' }, { includeInactive: true });
    expect(careerRepository.create).not.toHaveBeenCalled();
  });

  it('sin código no consulta duplicados', async () => {
    const { useCase, careerRepository } = crear();
    await useCase.execute({ nombre: 'Sin código' });
    expect(careerRepository.findBy).not.toHaveBeenCalled();
  });
});
