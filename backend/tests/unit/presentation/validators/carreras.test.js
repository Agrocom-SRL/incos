import { describe, it, expect } from '@jest/globals';
import { createCarreraValidator, updateCarreraValidator } from '../../../../src/presentation/validators/configuracion/carreras.validator.js';
import { camposInvalidos } from '../_helpers/controllerHarness.js';

describe('carreras: codigo limitado a VARCHAR(20)', () => {
  it.each([
    ['createCarreraValidator', createCarreraValidator, { nombre: 'Sistemas' }],
    ['updateCarreraValidator', updateCarreraValidator, {}],
  ])('%s acepta hasta 20 caracteres y rechaza 21', async (_n, cadena, base) => {
    expect(await camposInvalidos(cadena, { body: { ...base, codigo: 'C'.repeat(20) } })).toEqual([]);
    expect(await camposInvalidos(cadena, { body: { ...base, codigo: 'C'.repeat(21) } })).toContain('codigo');
    expect(await camposInvalidos(cadena, { body: { ...base, codigo: 'C'.repeat(50) } })).toContain('codigo');
    expect(await camposInvalidos(cadena, { body: { ...base, codigo: 'C' } })).toContain('codigo');
  });

  it.each([[createCarreraValidator], [updateCarreraValidator]])('rechaza códigos y activo con tipos inválidos', async (cadena) => {
    const base = { nombre: 'Sistemas' };
    expect(await camposInvalidos(cadena, { body: { ...base, codigo: 123 } })).toContain('codigo');
    expect(await camposInvalidos(cadena, { body: { ...base, codigo: { $ne: '' } } })).toContain('codigo');
    expect(await camposInvalidos(cadena, { body: { ...base, activo: 'tal vez' } })).toContain('activo');
    expect(await camposInvalidos(cadena, { body: { ...base, activo: false } })).toEqual([]);
  });
});

describe('carreras: nombre', () => {
  it('create lo exige (2 a 255 caracteres)', async () => {
    expect(await camposInvalidos(createCarreraValidator, { body: {} })).toContain('nombre');
    expect(await camposInvalidos(createCarreraValidator, { body: { nombre: 'A' } })).toContain('nombre');
    expect(await camposInvalidos(createCarreraValidator, { body: { nombre: 'N'.repeat(255) } })).toEqual([]);
    expect(await camposInvalidos(createCarreraValidator, { body: { nombre: 'N'.repeat(256) } })).toContain('nombre');
  });

  it('update lo acepta ausente pero valida longitud y tipo', async () => {
    expect(await camposInvalidos(updateCarreraValidator, { body: {} })).toEqual([]);
    expect(await camposInvalidos(updateCarreraValidator, { body: { nombre: 'A' } })).toContain('nombre');
    expect(await camposInvalidos(updateCarreraValidator, { body: { nombre: 'N'.repeat(256) } })).toContain('nombre');
    expect(await camposInvalidos(updateCarreraValidator, { body: { nombre: { a: 1 } } })).toContain('nombre');
  });
});
