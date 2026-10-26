import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from '@jest/globals';
import { BaseEntity } from '../../../../src/domain/entities/BaseEntity.js';

/**
 * Contrato común de las entidades de dominio:
 *  - solo se inicializan los campos recibidos (permite `attributes` parciales);
 *  - toPlainObject()/toJSON() devuelven exactamente esos campos;
 *  - los validadores de pertenencia a un catálogo (`isValidX`) aceptan todos los valores
 *    del catálogo y rechazan basura.
 */

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../src/domain/entities');
const constantes = await import('../../../../src/domain/constants/index.js');
const constantesInscripciones = await import('../../../../src/domain/constants/inscripciones.constants.js');
const constantesEvaluaciones = await import('../../../../src/domain/constants/evaluaciones.constants.js');
const constantesOferta = await import('../../../../src/domain/constants/oferta.constants.js');
const todasConstantes = { ...constantesOferta, ...constantesEvaluaciones, ...constantesInscripciones, ...constantes };

const archivos = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('.js') && !['index.js', 'BaseEntity.js'].includes(f))
  .sort();

const claveDe = (fuente) => {
  const claves = new Set();
  for (const m of fuente.matchAll(/hasOwnProperty\.call\(data,\s*'(\w+)'\)/g)) claves.add(m[1]);
  return [...claves];
};

const cargar = async (archivo) => {
  const mod = await import(path.join(dir, archivo));
  const Clase = mod[archivo.replace('.js', '')] ?? mod.default;
  return { Clase, fuente: fs.readFileSync(path.join(dir, archivo), 'utf8') };
};

describe('BaseEntity', () => {
  it('solo inicializa y serializa los campos recibidos', () => {
    expect(new BaseEntity({}).toPlainObject()).toEqual({});
    const e = new BaseEntity({ id: 1, active: true, createdBy: 3 });
    expect(e.toPlainObject()).toEqual({ id: 1, active: true, createdBy: 3 });
    expect(JSON.parse(JSON.stringify(e))).toEqual({ id: 1, active: true, createdBy: 3 });
  });

  it('serializa todas las columnas de auditoría', () => {
    const f = new Date('2026-01-01');
    const datos = { id: 1, active: false, createdAt: f, updatedAt: f, deletedAt: null, createdBy: 1, updatedBy: 2, deletedBy: 3 };
    expect(new BaseEntity(datos).toPlainObject()).toEqual(datos);
  });

  it('activate/deactivate/softDelete/restore mantienen coherentes active, deletedAt y deletedBy', () => {
    const e = new BaseEntity({ id: 1, active: true, deletedAt: null });
    expect(e.isActive()).toBe(true);
    e.deactivate();
    expect(e.isActive()).toBe(false);
    expect(e.updatedAt).toBeInstanceOf(Date);
    e.activate();
    expect(e.isActive()).toBe(true);
    e.softDelete(7);
    expect(e.isDeleted()).toBe(true);
    expect(e.deletedBy).toBe(7);
    expect(e.active).toBe(false);
    e.restore();
    expect(e.isDeleted()).toBe(false);
    expect(e.deletedBy).toBeNull();
    expect(e.active).toBe(true);
  });

  // Bug corregido: una entidad cargada sin `deletedAt` (attributes parciales) se reportaba como borrada
  // porque `undefined !== null`.
  it('una entidad sin deletedAt cargado no se reporta como eliminada', () => {
    expect(new BaseEntity({ id: 1 }).isDeleted()).toBe(false);
    expect(new BaseEntity({ id: 1, deletedAt: null }).isDeleted()).toBe(false);
    expect(new BaseEntity({ id: 1, deletedAt: new Date() }).isDeleted()).toBe(true);
  });
});

describe.each(archivos.map((a) => [a.replace('.js', ''), a]))('entidad %s', (_n, archivo) => {
  it('es una BaseEntity y no inicializa campos no recibidos', async () => {
    const { Clase } = await cargar(archivo);
    const vacia = new Clase({});
    expect(vacia).toBeInstanceOf(BaseEntity);
    expect(Object.keys(new Clase().toPlainObject?.() ?? {}).every((k) => typeof k === 'string')).toBe(true);
  });

  it('toPlainObject/toJSON conservan cada campo recibido', async () => {
    const { Clase, fuente } = await cargar(archivo);
    const claves = claveDe(fuente);
    const datos = Object.fromEntries(claves.map((k, i) => [k, `valor-${i}`]));
    const e = new Clase({ id: 5, ...datos });
    const plano = e.toPlainObject();
    expect(plano.id).toBe(5);
    for (const k of claves) {
      // Algunas entidades aceptan alias (p. ej. historial) y los exponen con su nombre canónico.
      if (Object.prototype.hasOwnProperty.call(e, k)) expect(plano[k]).toBe(e[k]);
    }
    expect(e.toJSON()).toEqual(plano);
    expect(() => JSON.stringify(e)).not.toThrow();
  });

  it('los validadores de catálogo aceptan todo el catálogo y rechazan basura', async () => {
    const { Clase, fuente } = await cargar(archivo);
    const reglas = [...fuente.matchAll(/(\w+)\(\)\s*\{[^}]*?return\s+(?:this\.\w+\s*&&\s*)?(\w+_VALUES)\.includes\(this\.(\w+)\)/gs)];
    for (const [, metodo, nombreConst, campo] of reglas) {
      const valores = todasConstantes[nombreConst];
      expect(Array.isArray(valores) && valores.length > 0).toBe(true);
      for (const v of valores) {
        expect(new Clase({ [campo]: v })[metodo]()).toBeTruthy();
      }
      expect(new Clase({ [campo]: '__no_existe__' })[metodo]()).toBeFalsy();
    }
  });
});
