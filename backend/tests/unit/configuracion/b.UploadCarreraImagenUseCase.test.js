import { describe, it, expect, jest } from '@jest/globals';
import { UploadCarreraImagenUseCase } from '../../../src/application/use-cases/configuracion/UploadCarreraImagenUseCase.js';
import { ValidationError } from '../../../src/domain/errors/AppError.js';

describe('UploadCarreraImagenUseCase', () => {
  const crear = () => {
    const logger = { info: jest.fn() };
    return { logger, useCase: new UploadCarreraImagenUseCase({ logger }) };
  };

  it('devuelve la ruta pública de la imagen y registra el log', () => {
    const { useCase, logger } = crear();
    const res = useCase.execute({ codigo: 'SIS', file: { filename: 'sis-1.png' } });
    expect(res).toEqual({ imagenRuta: '/uploads/carreras/sis-1.png' });
    expect(logger.info).toHaveBeenCalledWith(expect.any(String), { codigo: 'SIS', imagenRuta: '/uploads/carreras/sis-1.png' });
  });

  it.each([[undefined], [null], [''], ['   '], [123]])('rechaza codigo inválido %p', (codigo) => {
    const { useCase, logger } = crear();
    expect(() => useCase.execute({ codigo, file: { filename: 'a.png' } })).toThrow();
    expect(logger.info).not.toHaveBeenCalled();
  });

  it.each([[undefined], [null], [{}], [{ filename: '' }]])('rechaza archivo ausente %p con ValidationError', (file) => {
    const { useCase, logger } = crear();
    expect(() => useCase.execute({ codigo: 'SIS', file })).toThrow(ValidationError);
    expect(logger.info).not.toHaveBeenCalled();
  });
});
