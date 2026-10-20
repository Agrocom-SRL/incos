/**
 * Vistas SQL (database/03-views): todas deben existir y poder consultarse sobre el esquema
 * recién cargado, y toda vista nombrada en el código de src/ debe existir en la BD.
 */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { iniciarSistema, cerrarSistema, sequelize } from './helpers/sistema.js';

beforeAll(iniciarSistema);
afterAll(cerrarSistema);

const aqui = path.dirname(fileURLToPath(import.meta.url));
const RAIZ_BACKEND = path.resolve(aqui, '../..');
const DIR_VISTAS = path.join(RAIZ_BACKEND, 'database/03-views');
const DIR_SRC = path.join(RAIZ_BACKEND, 'src');

function listarJs(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return listarJs(p);
    return e.name.endsWith('.js') ? [p] : [];
  });
}

const vistasDefinidas = fs
  .readdirSync(DIR_VISTAS)
  .filter((f) => f.endsWith('.sql'))
  .flatMap((f) => {
    const sql = fs.readFileSync(path.join(DIR_VISTAS, f), 'utf8');
    return [...sql.matchAll(/CREATE\s+(?:OR\s+REPLACE\s+)?VIEW\s+`?([a-z0-9_]+)`?/gi)].map((m) => m[1]);
  });

// Vistas nombradas en src/ sin contar comentarios de documentación.
function vistasReferenciadasEnSrc() {
  const nombres = new Set();
  for (const archivo of listarJs(DIR_SRC)) {
    const codigo = fs
      .readFileSync(archivo, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1');
    for (const m of codigo.matchAll(/\bvista_[a-z0-9_]+/g)) nombres.add(m[0]);
  }
  return [...nombres].sort();
}

describe('Vistas SQL de database/03-views', () => {
  it('hay vistas definidas y ninguna está duplicada', () => {
    expect(vistasDefinidas.length).toBeGreaterThan(100);
    expect(new Set(vistasDefinidas).size).toBe(vistasDefinidas.length);
  });

  it('todas existen en la BD cargada', async () => {
    const filas = await sequelize.query(
      'SELECT table_name AS nombre FROM information_schema.views WHERE table_schema = DATABASE()',
      { type: sequelize.QueryTypes.SELECT }
    );
    const enBd = new Set(filas.map((f) => String(f.nombre ?? f.NOMBRE ?? f.TABLE_NAME).toLowerCase()));
    const faltantes = vistasDefinidas.filter((v) => !enBd.has(v.toLowerCase()));
    expect(faltantes).toEqual([]);
  });

  it('todas responden SELECT ... LIMIT 1 sin error', async () => {
    const fallos = [];
    for (const vista of vistasDefinidas) {
      try {
        await sequelize.query(`SELECT * FROM \`${vista}\` LIMIT 1`, {
          type: sequelize.QueryTypes.SELECT,
        });
      } catch (err) {
        fallos.push(`${vista}: ${err.original?.sqlMessage ?? err.message}`);
      }
    }
    expect(fallos).toEqual([]);
  }, 120000);

  it('toda vista usada por el código (repositorios, use cases) existe en la BD', async () => {
    const referenciadas = vistasReferenciadasEnSrc();
    expect(referenciadas.length).toBeGreaterThan(50);
    const definidas = new Set(vistasDefinidas);
    const sinDefinir = referenciadas.filter((v) => !definidas.has(v));
    expect(sinDefinir).toEqual([]);
  });
});
