import { describe, it, expect, jest } from '@jest/globals';
import { UpdateCarreraUseCase } from '../../../src/application/use-cases/configuracion/UpdateCarreraUseCase.js';
import { ConflictError, NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('UpdateCarreraUseCase', () => {
  const crear = ({ existing = { id: 3 }, conCodigo = null } = {}) => {
    const careerRepository = {
      findBy: jest.fn().mockResolvedValue(conCodigo),
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

  describe('código único', () => {
    it('rechaza con ConflictError un código ya usado por otra carrera y no actualiza', async () => {
      const { useCase, careerRepository } = crear({ conCodigo: { id: 8 } });
      await expect(useCase.execute(3, { codigo: ' SIS ' })).rejects.toBeInstanceOf(ConflictError);
      expect(careerRepository.findBy).toHaveBeenCalledWith({ code: 'SIS' }, { includeInactive: true });
      expect(careerRepository.update).not.toHaveBeenCalled();
    });

    it('acepta que la carrera conserve su propio código', async () => {
      const { useCase, careerRepository } = crear({ conCodigo: { id: 3 } });
      await useCase.execute(3, { codigo: 'SIS' });
      expect(careerRepository.update).toHaveBeenCalled();
    });

    it('lee el id desde una entidad con toPlainObject', async () => {
      const { useCase, careerRepository } = crear({ conCodigo: { toPlainObject: () => ({ id: 9 }) } });
      await expect(useCase.execute(3, { code: 'X' })).rejects.toBeInstanceOf(ConflictError);
      expect(careerRepository.update).not.toHaveBeenCalled();
    });

    it('sin código en el body no consulta duplicados', async () => {
      const { useCase, careerRepository } = crear();
      await useCase.execute(3, { nombre: 'N' });
      expect(careerRepository.findBy).not.toHaveBeenCalled();
    });
  });
});
