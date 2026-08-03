/**
 * Mapper de aplicación: ActaDefensa (módulo TIT · titulación, extensión 2026-08-01)
 *
 * El repositorio (`ActaDefensaRepository`) ya devuelve entidades camelCase
 * (no vistas SQL crudas): este mapper solo da forma de presentación —
 * agrega `numeroActaFormateado` (padding a 3 dígitos, foliado rojo del acta
 * física) y ordena el tribunal por `orden`.
 */

/**
 * @param {number|null} numeroActa
 * @returns {string|null}
 */
export function formatNumeroActa(numeroActa) {
  if (numeroActa === null || numeroActa === undefined) return null;
  return String(numeroActa).padStart(3, '0');
}

/**
 * @param {Object|null} acta - Entidad de `actas_defensa` con `tribunal` anidado
 * @returns {Object|null}
 */
export function actaDefensaToPresentation(acta) {
  if (!acta) return null;
  const tribunal = Array.isArray(acta.tribunal)
    ? [...acta.tribunal].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    : [];
  return {
    id: acta.id,
    proyectoGradoId: acta.proyectoGradoId,
    estudianteId: acta.estudianteId,
    gestionId: acta.gestionId,
    numeroActa: acta.numeroActa,
    numeroActaFormateado: formatNumeroActa(acta.numeroActa),
    fechaDefensa: acta.fechaDefensa,
    horaInicio: acta.horaInicio,
    horaConclusion: acta.horaConclusion,
    calificacionFinal: acta.calificacionFinal,
    resultado: acta.resultado,
    observaciones: acta.observaciones,
    estado: acta.estado,
    tribunal: tribunal.map((miembro) => ({
      id: miembro.id,
      orden: miembro.orden,
      docenteId: miembro.docenteId,
      nombreCompleto: miembro.nombreCompleto,
      cargo: miembro.cargo,
    })),
  };
}

/**
 * @param {Array<Object>} actas
 * @returns {Array<Object>}
 */
export function actasDefensaToPresentation(actas) {
  if (!Array.isArray(actas)) return [];
  return actas.map(actaDefensaToPresentation);
}

export class ActaDefensaMapper {
  static toDetail(acta) {
    return actaDefensaToPresentation(acta);
  }

  static toList(actas) {
    return actasDefensaToPresentation(actas);
  }

  static formatNumeroActa(numeroActa) {
    return formatNumeroActa(numeroActa);
  }
}
