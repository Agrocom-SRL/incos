import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from '@jest/globals';
import { listarArchivosRepositorio } from '../../infrastructure/repositories/_harness.js';

const base = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../src/domain/interfaces');

const listar = (sub) =>
  fs
    .readdirSync(path.join(base, sub))
    .filter((f) => f.endsWith('.js'))
    .sort()
    .map((f) => path.join(base, sub, f));

const clasesDe = async (archivo) => {
  const mod = await import(archivo);
  return Object.values(mod).filter((v) => typeof v === 'function' && /^class\s/.test(Function.prototype.toString.call(v)));
};

const metodosPropios = (Clase) =>
  Object.getOwnPropertyNames(Clase.prototype).filter(
    (n) => n !== 'constructor' && typeof Object.getOwnPropertyDescriptor(Clase.prototype, n).value === 'function'
  );

const esInterfaz = (Clase) => /^I[A-Z]/.test(Clase.name);

const ARGS = [1, { a: 1 }, 2, 3];

/**
 * Repositorios que extienden IRepository pero solo exponen consultas propias (no usan el CRUD genérico).
 * SesionClaseRepository: ninguna capa llama findById/create/... sobre él.
 */
const SIN_CRUD_GENERICO = new Set(['SesionClaseRepository']);

/** Ejecuta el método y devuelve el error (síncrono o por rechazo) o null. */
const errorDe = async (fn) => {
  try {
    await fn();
    return null;
  } catch (e) {
    return e;
  }
};

describe.each([['repositories'], ['services']])('interfaces de dominio: %s', (sub) => {
  const archivos = listar(sub);

  it.each(archivos.map((a) => [path.basename(a), a]))('%s: sus métodos abstractos fallan con "must be implemented"', async (_n, archivo) => {
    const clases = (await clasesDe(archivo)).filter(esInterfaz);
    expect(clases.length).toBeGreaterThan(0);
    for (const Clase of clases) {
      const instancia = new Clase();
      for (const metodo of metodosPropios(Clase)) {
        const error = await errorDe(() => instancia[metodo](...ARGS));
        // Los métodos concretos de una interfaz (helpers) pueden no lanzar; los abstractos lanzan.
        if (error) expect(error.message).toMatch(/implement/i);
      }
    }
  });
});

describe('contrato repositorio concreto vs interfaz', () => {
  it('cada repositorio implementa (no hereda como abstracto) los métodos de su interfaz', async () => {
    const huecos = [];
    for (const archivo of listarArchivosRepositorio()) {
      for (const Clase of await clasesDe(archivo)) {
        if (esInterfaz(Clase) || SIN_CRUD_GENERICO.has(Clase.name)) continue;
        const padres = [];
        for (let p = Object.getPrototypeOf(Clase); p && p.name; p = Object.getPrototypeOf(p)) padres.push(p);
        const interfaces = padres.filter(esInterfaz);
        const metodosInterfaz = new Set(interfaces.flatMap(metodosPropios));
        for (const metodo of metodosInterfaz) {
          // Método resuelto en la cadena: si el primero que lo define es una interfaz, está sin implementar.
          let dueño = Clase;
          while (dueño && !Object.prototype.hasOwnProperty.call(dueño.prototype, metodo)) dueño = Object.getPrototypeOf(dueño);
          if (dueño && esInterfaz(dueño)) huecos.push(`${Clase.name}.${metodo} (de ${dueño.name})`);
        }
      }
    }
    expect(huecos).toEqual([]);
  });
});
