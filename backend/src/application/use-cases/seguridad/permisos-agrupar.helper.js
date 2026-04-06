/**
 * Agrupa filas (permiso_codigo, accion) como en la vista de efectivos.
 */
export function agruparPermisosEfectivos(filas) {
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

/**
 * Agrupa filas planas de roles_permisos + permisos por dominio.
 */
export function agruparPermisosRolPorDominio(flatRows) {
  const porDominio = {};
  for (const row of flatRows) {
    const d = row.dominio;
    if (!porDominio[d]) {
      porDominio[d] = [];
    }
    let entry = porDominio[d].find((x) => x.permiso_id === row.permiso_id);
    if (!entry) {
      entry = {
        permiso_id: row.permiso_id,
        codigo: row.codigo,
        nombre: row.nombre,
        acciones: [],
      };
      porDominio[d].push(entry);
    }
    if (!entry.acciones.includes(row.accion)) {
      entry.acciones.push(row.accion);
    }
  }
  return porDominio;
}
