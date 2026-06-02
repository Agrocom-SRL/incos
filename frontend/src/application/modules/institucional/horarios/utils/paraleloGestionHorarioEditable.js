const BLOQUEADOS = new Set(['PUBLICADO', 'CERRADO']);

/** @param {string|null|undefined} estado */
export function isParaleloGestionHorarioEditable(estado) {
  const s = String(estado || '')
    .trim()
    .toUpperCase();
  return s.length > 0 && !BLOQUEADOS.has(s);
}

/** @param {string|null|undefined} estado */
export function mensajeParaleloGestionNoEditable(estado) {
  const s = String(estado || '')
    .trim()
    .toUpperCase();
  if (s === 'PUBLICADO') {
    return 'Este paralelo ya está PUBLICADO: no se pueden crear ni modificar bloques. Para editar el plan, el paralelo debe volver a OFERTADO (desde Oferta académica o coordinación, según el proceso vigente).';
  }
  if (s === 'CERRADO') {
    return 'Este paralelo está CERRADO: el plan semanal ya no admite cambios.';
  }
  return 'El paralelo en gestión no admite cambios en el plan semanal en su estado actual.';
}
