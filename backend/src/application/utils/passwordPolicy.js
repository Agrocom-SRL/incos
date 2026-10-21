import { UnprocessableEntityError } from '../../domain/errors/AppError.js';

export const PASSWORD_MIN_CARACTERES = 8;
/** bcrypt ignora todo lo que pasa de 72 bytes: dos claves iguales en esos 72 serían la misma. */
export const PASSWORD_MAX_BYTES = 72;

/**
 * Valida una contraseña nueva antes de hashearla.
 * Rechaza: vacía o solo espacios, menos de 8 caracteres y más de 72 bytes (UTF-8).
 *
 * @param {*} valor
 * @param {string} [campo] nombre del campo en el detalle del error
 * @throws {UnprocessableEntityError}
 */
export function validarPasswordNueva(valor, campo = 'password') {
  const texto = valor == null ? '' : String(valor);
  let mensaje = null;
  if (texto.trim() === '' || texto.length < PASSWORD_MIN_CARACTERES) {
    mensaje = `${campo} debe tener al menos ${PASSWORD_MIN_CARACTERES} caracteres`;
  } else if (Buffer.byteLength(texto, 'utf8') > PASSWORD_MAX_BYTES) {
    mensaje = `${campo} no puede superar ${PASSWORD_MAX_BYTES} bytes (máximo soportado por bcrypt)`;
  }
  if (mensaje) {
    throw new UnprocessableEntityError('Los datos proporcionados son inválidos', [
      { field: campo, message: mensaje },
    ]);
  }
}
