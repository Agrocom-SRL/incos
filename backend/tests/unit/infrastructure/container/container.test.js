import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from '@jest/globals';
import { Container } from '../../../../src/infrastructure/container/Container.js';
import {
  registerComponent,
  registerRepository,
  registerService,
} from '../../../../src/infrastructure/container/utils/container.helpers.js';
import container, { buildContainer } from '../../../../src/infrastructure/container/index.js';
import * as tokens from '../../../../src/infrastructure/container/tokens/index.js';

describe('Container', () => {
  it('registra, resuelve como singleton y reporta has()', () => {
    const c = new Container();
    let n = 0;
    c.register('a', () => ({ n: ++n }));
    expect(c.has('a')).toBe(true);
    expect(c.has('b')).toBe(false);
    expect(c.has('')).toBe(false);
    expect(c.has(null)).toBe(false);
    const x = c.resolve('a');
    expect(c.resolve('a')).toBe(x);
    expect(n).toBe(1);
  });

  it('las fábricas reciben el contenedor (dependencias entre tokens)', () => {
    const c = new Container();
    c.register('dep', () => 'D');
    c.register('uso', (cc) => `usa-${cc.resolve('dep')}`);
    expect(c.resolve('uso')).toBe('usa-D');
  });

  it('rechaza tokens inválidos, fábricas no función y registros duplicados', () => {
    const c = new Container();
    expect(() => c.register('', () => 1)).toThrow('Token inválido');
    expect(() => c.register(5, () => 1)).toThrow('Token inválido');
    expect(() => c.register('a', 'no-fn')).toThrow('Factory debe ser una función');
    c.register('a', () => 1);
    expect(() => c.register('a', () => 2)).toThrow('Token ya registrado');
  });

  it('resolver un token inexistente lanza un error descriptivo', () => {
    expect(() => new Container().resolve('nada')).toThrow('Provider no encontrado: "nada"');
  });

  it('helpers: registerComponent no duplica; registerRepository instancia la clase; registerService acepta instancia o fábrica', () => {
    const c = new Container();
    class Repo {}
    registerRepository(c, 'repo', Repo);
    registerComponent(c, 'repo', () => 'otro');
    expect(c.resolve('repo')).toBeInstanceOf(Repo);
    const inst = { s: 1 };
    registerService(c, 'svc1', inst);
    registerService(c, 'svc2', () => inst);
    expect(c.resolve('svc1')).toBe(inst);
    expect(c.resolve('svc2')).toBe(inst);
  });
});

describe('contenedor de la aplicación', () => {
  it('cada módulo resuelve todas sus dependencias: todo proveedor registrado se instancia sin error', () => {
    const fallos = [];
    for (const token of [...container.providers.keys()]) {
      try {
        const instancia = container.resolve(token);
        if (instancia === undefined) fallos.push(`${token}: resolvió undefined`);
      } catch (e) {
        fallos.push(`${token}: ${e.message}`);
      }
    }
    expect(fallos).toEqual([]);
  });

  it('todo `resolve(GRUPO_TOKENS.clave)` del código apunta a una clave existente con proveedor registrado', () => {
    const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../src');
    const archivos = [];
    const recorrer = (d) => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const full = path.join(d, e.name);
        if (e.isDirectory()) recorrer(full);
        else if (e.name.endsWith('.js')) archivos.push(full);
      }
    };
    recorrer(raiz);
    const rotos = [];
    let revisados = 0;
    for (const archivo of archivos) {
      const fuente = fs.readFileSync(archivo, 'utf8').replace(/\/\/.*$/gm, '');
      for (const [, grupo, clave] of fuente.matchAll(/\.resolve\(\s*([A-Z_]+_TOKENS)\.(\w+)\s*\)/g)) {
        revisados += 1;
        const valor = tokens[grupo]?.[clave];
        if (typeof valor !== 'string') rotos.push(`${path.relative(raiz, archivo)}: ${grupo}.${clave} no existe`);
        else if (!container.has(valor)) rotos.push(`${path.relative(raiz, archivo)}: ${grupo}.${clave} (${valor}) sin proveedor`);
      }
    }
    expect(revisados).toBeGreaterThan(500);
    expect(rotos).toEqual([]);
  });

  it('no hay dos claves de token distintas con el mismo valor dentro de un grupo', () => {
    const repetidos = [];
    for (const [grupo, mapa] of Object.entries(tokens)) {
      if (!mapa || typeof mapa !== 'object') continue;
      const vistos = new Map();
      for (const [clave, valor] of Object.entries(mapa)) {
        if (typeof valor !== 'string') continue;
        if (vistos.has(valor)) repetidos.push(`${grupo}: ${vistos.get(valor)} y ${clave} -> ${valor}`);
        vistos.set(valor, clave);
      }
    }
    expect(repetidos).toEqual([]);
  });

  it('buildContainer produce un contenedor independiente con los mismos proveedores', () => {
    const otro = buildContainer();
    expect(otro).not.toBe(container);
    expect([...otro.providers.keys()].sort()).toEqual([...container.providers.keys()].sort());
  });
});
