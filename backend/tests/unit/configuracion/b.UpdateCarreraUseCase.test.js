import { describe, it, expect, jest } from '@jest/globals';
import { UpdateCarreraUseCase } from '../../../src/application/use-cases/configuracion/UpdateCarreraUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('UpdateCarreraUseCase', () => {
  const crear = ({ existing = { id: 3 } } = {}) => {
    const careerRepository = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue({ id: 3, marca: 'ok' }),
    };
    const logger = { info: jest.fn() };
    return { careerRepository, logger, useCase: new UpdateCarreraUseCase({ careerRepository, logger }) };
  };

  it('mapea el body en español al patch del repositorio y devuelve { carrera }', async () => {
    const { useCase, careerRepository } = crear();
    const res = await useCase.execute(3, { codigo: 'SIS', nombre: 'Sistemas', descripcion: 'd', area_formacion: 'TI', titulo_otorgado: 'Tec', color_hex: '#fff', imagen_ruta: '/x.png', activo: true }, 9);
    expect(careerRepository.findById).toHaveBeenCalledWith(3);
    expect(careerRepository.update).toHaveBeenCalledWith(3, { code: 'SIS', name: 'Sistemas', description: 'd', trainingArea: 'TI', grantedTitle: 'Tec', colorHex: '#fff', imagePath: '/x.png', active: true }, 9);
    expect(res).toEqual({ carrera: { id: 3, marca: 'ok' } });
  });

  it('acepta alias alternativos del body', async () => {
    const { useCase, careerRepository } = crear();
    await useCase.execute(3, { code: 'C', name: 'N', areaFormacion: 'A', tituloOtorgado: 'T', colorHex: '#000', imagenRuta: '/r', active: false }, null);
    expect(careerRepository.update).toHaveBeenCalledWith(3, { code: 'C', name: 'N', description: undefined, trainingArea: 'A', grantedTitle: 'T', colorHex: '#000', imagePath: '/r', active: false }, null);
  });

  it('con body vacío envía todos los campos undefined (no pisa nada)', async () => {
    const { useCase, careerRepository } = crear();
    await useCase.execute(3);
    const patch = careerRepository.update.mock.calls[0][1];
    expect(Object.values(patch).every((v) => v === undefined)).toBe(true);
  });

  it('lanza NotFoundError si no existe y no actualiza', async () => {
    const { useCase, careerRepository } = crear({ existing: null });
    await expect(useCase.execute(99, {})).rejects.toBeInstanceOf(NotFoundError);
    expect(careerRepository.update).not.toHaveBeenCalled();
  });

  it('propaga el error del repositorio', async () => {
    const { useCase, careerRepository } = crear();
    careerRepository.update.mockRejectedValue(new Error('db'));
    await expect(useCase.execute(3, {})).rejects.toThrow('db');
  });
});
