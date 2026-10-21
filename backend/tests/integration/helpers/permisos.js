/**
 * Vocabulario y consultas de permisos compartidas por las pruebas de integración.
 */
import { sequelize } from './sistema.js';

/** Acciones válidas (permiso_acciones.accion). `VER` está deprecado. */
export const ACCIONES_VALIDAS = [
  'LISTAR',
  'DETALLE',
  'CREAR',
  'EDITAR',
  'ELIMINAR',
  'ACTIVAR',
  'APROBAR',
  'EXPORTAR',
  'GENERAR_PDF',
];

/** Aplana `permisos` ([{codigo, acciones[]}]) a un Set de "codigo|ACCION". */
export function aSetDePares(permisos) {
  const pares = new Set();
  for (const { codigo, acciones } of permisos) {
    for (const accion of acciones) pares.add(`${codigo}|${accion}`);
  }
  return pares;
}

export function tiene(permisos, codigo, accion) {
  return aSetDePares(permisos).has(`${codigo}|${accion}`);
}

/** Rutas de menú (sidebar) que un conjunto de permisos habilita: permisos con LISTAR y ruta_sidebar. */
export async function rutasDeMenu(permisos) {
  const codigos = permisos.filter((p) => p.acciones.includes('LISTAR')).map((p) => p.codigo);
  if (codigos.length === 0) return [];
  const filas = await sequelize.query(
    `SELECT DISTINCT ruta_sidebar FROM permisos
      WHERE codigo IN (:codigos) AND ruta_sidebar IS NOT NULL
        AND activo = TRUE AND deleted_at IS NULL`,
    { replacements: { codigos }, type: sequelize.QueryTypes.SELECT }
  );
  return filas.map((f) => f.ruta_sidebar);
}
