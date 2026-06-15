/**
 * Agrupa filas de vista permisos efectivos en { codigo, acciones[] }.
 * Compartido por MeUseCase y LoginUseCase.
 */

export function mapPermisosEfectivos(filas = []) {
  const mapa = {};
  for (const row of filas) {
    const codigo = row.permiso_codigo;
    const accion = row.accion;
    if (!mapa[codigo]) {
      mapa[codigo] = [];
    }
    mapa[codigo].push(accion);
  }
  return Object.entries(mapa).map(([codigo, acciones]) => ({
    codigo,
    acciones,
  }));
}
