import { describe, it, expect } from '@jest/globals';
import { validarPasswordNueva } from '../../../src/application/utils/passwordPolicy.js';
import { UnprocessableEntityError } from '../../../src/domain/errors/AppError.js';

describe('validarPasswordNueva', () => {
  it.each([['12345678'], ['clave-segura-1'], ['a'.repeat(72)], ['  espacios  bien  ']])('acepta %p', (clave) => {
    expect(() => validarPasswordNueva(clave)).not.toThrow();
  });

  it.each([[undefined], [null], [''], ['1234567'], ['        '], ['   ']])('rechaza %p (vacía, corta o solo espacios)', (clave) => {
    expect(() => validarPasswordNueva(clave)).toThrow(UnprocessableEntityError);
  });

  it('rechaza más de 72 bytes aunque tenga menos de 72 caracteres (UTF-8 multibyte)', () => {
    const clave = 'ñ'.repeat(40); // 40 caracteres, 80 bytes
    expect(clave.length).toBeLessThan(72);
    expect(() => validarPasswordNueva(clave)).toThrow(UnprocessableEntityError);
  });

  it('acepta exactamente 72 bytes y rechaza 73', () => {
    expect(() => validarPasswordNueva('a'.repeat(72))).not.toThrow();
    expect(() => validarPasswordNueva('a'.repeat(73))).toThrow(UnprocessableEntityError);
  });

  it('el detalle del error nombra el campo recibido', () => {
    try {
      validarPasswordNueva('corta', 'password_nuevo');
    } catch (e) {
      expect(e.details[0].field).toBe('password_nuevo');
    }
    expect.assertions(1);
  });
});
