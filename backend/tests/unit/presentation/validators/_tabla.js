import { describe, it, expect } from '@jest/globals';
import { camposInvalidos } from '../_helpers/controllerHarness.js';

/** Cargas típicas de ataque: deben fallar en cualquier campo numérico, fecha o enumerado. */
export const MALICIOSOS = [
  '1 OR 1=1',
  "'; DROP TABLE usuarios;--",
  '<script>alert(1)</script>',
  { $gt: '' },
  [['a', 'b']], // anidado: it.each no lo expande como argumentos
  '../../etc/passwd',
];

const entrada = (ubicacion, datos) => ({ [ubicacion]: datos });

/** it.each que no falla cuando la tabla está vacía. */
const cada = (tabla, titulo, fn) => {
  if (tabla.length) it.each(tabla)(titulo, fn);
};

const corto = (valor) => String(JSON.stringify(valor) ?? 'undefined').slice(0, 40);

/**
 * Prueba un validator con tablas de casos.
 *
 * @param {string} nombre
 * @param {Array} cadena - validators de express-validator
 * @param {Object} cfg
 * @param {'body'|'query'|'params'} [cfg.en='body']
 * @param {Object} cfg.valido - payload base válido
 * @param {Object[]} [cfg.tambienValidos] - variantes que se fusionan sobre `valido` y deben pasar
 * @param {string[]} [cfg.requeridos] - campos que, al quitarlos, deben fallar
 * @param {Array<[string, *]>} [cfg.invalidos] - [campo, valor] que deben fallar (se fusiona sobre `valido`)
 * @param {string[]} [cfg.maliciosos] - campos que deben rechazar todos los MALICIOSOS
 * @param {Array<[string, *]>} [cfg.limitesOk] - [campo, valor] en el límite que deben pasar
 */
export const probarValidator = (nombre, cadena, cfg) => {
  const { en = 'body', valido, tambienValidos = [], requeridos = [], invalidos = [], maliciosos = [], limitesOk = [] } = cfg;
  describe(nombre, () => {
    it('acepta el payload válido', async () => {
      expect(await camposInvalidos(cadena, entrada(en, valido))).toEqual([]);
    });

    cada(tambienValidos.map((v, i) => [i, v]), 'acepta la variante válida #%i', async (_i, variante) => {
      expect(await camposInvalidos(cadena, entrada(en, { ...valido, ...variante }))).toEqual([]);
    });

    cada(limitesOk.map(([c, v]) => [c, corto(v), v]), 'acepta el límite %s=%s', async (campo, _txt, valor) => {
      expect(await camposInvalidos(cadena, entrada(en, { ...valido, [campo]: valor }))).toEqual([]);
    });

    cada(requeridos.map((c) => [c]), 'rechaza si falta %s', async (campo) => {
      const { [campo]: _quitado, ...resto } = valido;
      expect(await camposInvalidos(cadena, entrada(en, resto))).toContain(campo);
    });

    cada(invalidos.map(([c, v]) => [c, corto(v), v]), 'rechaza %s=%s', async (campo, _txt, valor) => {
      expect(await camposInvalidos(cadena, entrada(en, { ...valido, [campo]: valor }))).toContain(campo);
    });

    cada(
      maliciosos.flatMap((c) => MALICIOSOS.map((m) => [c, corto(m), m])),
      'rechaza payload malicioso en %s: %s',
      async (campo, _txt, valor) => {
        expect(await camposInvalidos(cadena, entrada(en, { ...valido, [campo]: valor }))).toContain(campo);
      },
    );
  });
};
