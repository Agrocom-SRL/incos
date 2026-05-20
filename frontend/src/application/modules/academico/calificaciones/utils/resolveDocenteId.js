/**
 * Obtiene el docente_id del usuario autenticado cuando es cuenta DOCENTE.
 */
export function resolveDocenteIdFromUsuario(usuario) {
  if (!usuario) return null;
  const tipo = String(usuario.tipoReferencia ?? usuario.tipo_referencia ?? '').toUpperCase();
  const ref = usuario.referenciaId ?? usuario.referencia_id;
  const id = ref != null ? Number(ref) : NaN;
  if (tipo === 'DOCENTE' && Number.isFinite(id) && id > 0) return id;
  return null;
}
