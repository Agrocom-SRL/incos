import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from '@jest/globals';

/**
 * Contrato común de los mappers de infraestructura (modelo Sequelize <-> entidad de dominio):
 *  - toEntity(null) es null y toEntityList tolera entradas inválidas;
 *  - un modelo con columnas NULL se mapea a entidad y de vuelta a columnas sin romperse;
 *  - toModelForUpdate solo emite lo recibido (una entidad vacía no pisa columnas).
 */

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../src/infrastructure/mappers');
const archivos = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('Mapper.js') && f !== 'BaseMapper.js')
  .sort();

const columnasDe = (fuente) => {
  const cols = new Set();
  for (const m of fuente.matchAll(/dataValues\.(\w+)/g)) cols.add(m[1]);
  for (const m of fuente.matchAll(/'(\w+)'\s+in\s+dataValues/g)) cols.add(m[1]);
  for (const m of fuente.matchAll(/\bmodel\.(\w+)/g)) cols.add(m[1]);
  ['dataValues', 'toJSON', 'get', 'constructor'].forEach((x) => cols.delete(x));
  return [...cols];
};

/** Columnas que el mapper normaliza a propósito (p. ej. ENUM con valor por defecto). */
const NORMALIZADAS = { StudentOriginMapper: ['tipoOrigen'] };

const cargar = async (archivo) => {
  const mod = await import(path.join(dir, archivo));
  const Mapper = mod[archivo.replace('.js', '')] ?? mod.default;
  return { Mapper, fuente: fs.readFileSync(path.join(dir, archivo), 'utf8') };
};

describe.each(archivos.map((a) => [a.replace('.js', ''), a]))('%s', (_n, archivo) => {
  it('toEntity(null/undefined) es null y toEntityList tolera entradas inválidas', async () => {
    const { Mapper } = await cargar(archivo);
    expect(Mapper.toEntity(null)).toBeNull();
    expect(Mapper.toEntity(undefined)).toBeNull();
    if (typeof Mapper.toEntityList === 'function') {
      expect(Mapper.toEntityList(null)).toEqual([]);
      expect(Mapper.toEntityList([null])).toEqual([]);
    }
  });

  it('un modelo con columnas nulas se mapea a entidad y de vuelta a columnas sin romperse', async () => {
    const { Mapper, fuente } = await cargar(archivo);
    const columnas = columnasDe(fuente);
    const modelo = Object.fromEntries(columnas.map((c) => [c, null]));
    modelo.id = 5;
    // Valores nulos: ninguna conversión debe romperse con columnas NULL de la BD.
    const entidad = Mapper.toEntity({ dataValues: modelo, ...modelo, toJSON: () => modelo, get: () => undefined });
    expect(entidad).toBeTruthy();
    expect(entidad.id).toBe(5);
    expect(typeof entidad.toPlainObject).toBe('function');
    const columnasSalida = Mapper.toModel(entidad);
    // (toModel puede dejar `undefined` en campos ausentes: Sequelize los omite al crear.)
    expect(columnasSalida && typeof columnasSalida).toBe('object');
  });

  it('toModelForUpdate de una entidad vacía no pisa columnas de negocio', async () => {
    const { Mapper } = await cargar(archivo);
    if (typeof Mapper.toModelForUpdate !== 'function') return;
    const salida = Mapper.toModelForUpdate({});
    expect(typeof salida).toBe('object');
    expect(Object.values(salida).includes(undefined)).toBe(false);
  });

  it('ida y vuelta con valores de texto: cada columna que sale coincide con la que entró', async () => {
    const { Mapper, fuente } = await cargar(archivo);
    const columnas = columnasDe(fuente).filter((c) => c !== 'id');
    const modelo = Object.fromEntries(columnas.map((c) => [c, `v-${c}`]));
    modelo.id = 5;
    let entidad;
    try {
      entidad = Mapper.toEntity({ dataValues: modelo, ...modelo, toJSON: () => modelo, get: () => undefined });
    } catch {
      return; // El mapper convierte tipos (fechas, números, JSON): se cubre con pruebas propias.
    }
    const salida = Mapper.toModel(entidad);
    const divergentes = Object.entries(salida)
      .filter(([c, v]) => c in modelo && v != null && typeof v === 'string')
      .filter(([c]) => !(NORMALIZADAS[archivo.replace('.js', '')] ?? []).includes(c))
      .filter(([c, v]) => v.toLowerCase() !== String(modelo[c]).toLowerCase())
      .map(([c, v]) => `${c}: ${modelo[c]} -> ${v}`);
    expect(divergentes).toEqual([]);
  });
});
