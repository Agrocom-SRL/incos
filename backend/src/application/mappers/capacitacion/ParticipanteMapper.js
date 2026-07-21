/**
 * Mapper de aplicación: Participante (módulo CAP)
 *
 * Convierte entidades de dominio (objeto plano del repositorio) a formato de
 * presentación (API). Incluye `nombreCompleto` en el orden estándar del
 * sistema: APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES.
 */

/**
 * Nombre completo en orden APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES.
 * @param {Object} entity
 * @returns {string}
 */
function buildNombreCompleto(entity) {
  return [entity.apellidoPaterno, entity.apellidoMaterno, entity.nombres]
    .filter((parte) => parte && String(parte).trim() !== '')
    .join(' ');
}

/**
 * Convierte una entidad Participante a formato de presentación.
 * @param {Object|null} entity
 * @returns {Object|null}
 */
export function entityToPresentation(entity) {
  if (!entity) return null;

  return {
    id: entity.id,
    ci: entity.ci,
    expedicion: entity.expedicion ?? null,
    nombres: entity.nombres,
    apellidoPaterno: entity.apellidoPaterno ?? null,
    apellidoMaterno: entity.apellidoMaterno ?? null,
    nombreCompleto: buildNombreCompleto(entity),
    celular: entity.celular,
    email: entity.email ?? null,
    activo: entity.activo,
    createdAt: entity.createdAt,
    // Inscripción vigente más reciente (estado='INSCRITO', activa, no eliminada); `null` si no tiene.
    cursoActualId: entity.cursoActualId ?? null,
    cursoActualTitulo: entity.cursoActualTitulo ?? null,
  };
}

/**
 * Convierte un array de entidades Participante a presentación.
 * @param {Array<Object>} entities
 * @returns {Array<Object>}
 */
export function entitiesToPresentation(entities) {
  if (!Array.isArray(entities)) return [];
  return entities.map(entityToPresentation);
}

/**
 * Clase mapper para Participante (patrón del módulo)
 */
export class ParticipanteMapper {
  static entityToPresentation(entity) {
    return entityToPresentation(entity);
  }

  static entitiesToPresentation(entities) {
    return entitiesToPresentation(entities);
  }
}
