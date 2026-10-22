/**
 * Mapper de aplicación: CursoCapacitacion (módulo CAP)
 *
 * Convierte:
 * - Filas de la vista 155 (`vista_cursos_capacitacion_listado`, snake_case) →
 *   formato de presentación (camelCase) para el listado/ficha.
 * - Filas de la vista 154 (`vista_base_cursos_capacitacion_horarios`) →
 *   bloques horarios de la ficha.
 * - Entidades del repositorio CRUD → presentación (respuestas de crear/editar).
 *
 * El campo `estado` expuesto es SIEMPRE el estado EFECTIVO (ver
 * `resolveEstadoEfectivoCurso`), nunca el crudo de BD.
 */

import { resolveEstadoEfectivoCurso } from '../../use-cases/capacitacion/helpers/cursoEstadoEfectivo.js';
import { tienePagoCursoExterno } from '../../use-cases/capacitacion/helpers/cursoCapacitacionInput.js';

/**
 * Convierte una fila de la vista 155 a formato de presentación.
 * @param {Object|null} row - Fila cruda snake_case de la vista
 * @returns {Object|null}
 */
export function viewRowToPresentation(row) {
  if (!row) return null;

  return {
    id: row.id,
    titulo: row.titulo,
    descripcion: row.descripcion ?? null,
    tieneCosto: Boolean(Number(row.tiene_costo ?? 0)),
    cobraMatricula: Boolean(Number(row.cobra_matricula ?? 0)),
    costo: row.costo !== null && row.costo !== undefined ? Number(row.costo) : null,
    costoMatricula:
      row.costo_matricula !== null && row.costo_matricula !== undefined
        ? Number(row.costo_matricula)
        : 0,
    entidadCertificadora: row.entidad_certificadora ?? null,
    pagoCursoExterno: tienePagoCursoExterno(row.entidad_certificadora),
    modalidad: row.modalidad ?? null,
    nivel: row.nivel ?? null,
    dirigidoA: row.dirigido_a ?? null,
    duracion: row.duracion ?? null,
    gruposCount: Number(row.grupos_count ?? 0),
    aulasResumen: row.aulas_resumen ?? null,
    cupoMaximo: row.cupo_maximo,
    fechaInicio: row.fecha_inicio,
    fechaFin: row.fecha_fin ?? null,
    estado: resolveEstadoEfectivoCurso(row.estado, row.fecha_inicio, row.fecha_fin),
    inscritosCount: Number(row.inscritos_count ?? 0),
    cupoDisponible: Number(row.cupo_disponible ?? 0),
    horariosCount: Number(row.horarios_count ?? 0),
    horariosDetalle: row.horarios_detalle ?? null,
    activo: Boolean(row.activo),
    createdAt: row.created_at,
  };
}

/**
 * Convierte un array de filas de la vista 155 a presentación.
 * @param {Array<Object>} rows
 * @returns {Array<Object>}
 */
export function viewRowsToPresentation(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(viewRowToPresentation);
}

/**
 * Convierte una fila de la vista 154 (bloque horario) a presentación.
 * @param {Object|null} row - Fila cruda snake_case de la vista
 * @returns {Object|null}
 */
export function horarioRowToPresentation(row) {
  if (!row) return null;

  return {
    capacitacionHorarioId: row.capacitacion_horario_id,
    grupoId: row.grupo_id ?? null,
    grupoNombre: row.grupo_nombre ?? null,
    horarioId: row.horario_id,
    ordenSecuencia: row.orden_secuencia,
    horarioNombre: row.horario_nombre ?? null,
    dia: row.dia,
    diaAbreviado: row.dia_abreviado,
    diaOrden: row.dia_orden !== null && row.dia_orden !== undefined ? Number(row.dia_orden) : null,
    horaInicio: row.hora_inicio,
    horaFin: row.hora_fin,
    bloqueEtiqueta: row.bloque_etiqueta,
    etiqueta: row.bloque_etiqueta,
  };
}

/**
 * Convierte un array de filas de la vista 154 a presentación.
 * @param {Array<Object>} rows
 * @returns {Array<Object>}
 */
export function horarioRowsToPresentation(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(horarioRowToPresentation);
}

/**
 * Convierte una entidad del repositorio CRUD (objeto de dominio) a presentación.
 * Usada en respuestas de crear/editar/toggle (sin agregados de la vista).
 * @param {Object|null} entity
 * @returns {Object|null}
 */
export function entityToPresentation(entity) {
  if (!entity) return null;

  return {
    id: entity.id,
    titulo: entity.titulo,
    descripcion: entity.descripcion ?? null,
    tieneCosto: Boolean(entity.tieneCosto),
    cobraMatricula: Boolean(entity.cobraMatricula),
    costo: entity.costo !== null && entity.costo !== undefined ? Number(entity.costo) : null,
    costoMatricula:
      entity.costoMatricula !== null && entity.costoMatricula !== undefined
        ? Number(entity.costoMatricula)
        : 0,
    entidadCertificadora: entity.entidadCertificadora ?? null,
    pagoCursoExterno: tienePagoCursoExterno(entity.entidadCertificadora),
    modalidad: entity.modalidad ?? null,
    nivel: entity.nivel ?? null,
    dirigidoA: entity.dirigidoA ?? null,
    duracion: entity.duracion ?? null,
    cupoMaximo: entity.cupoMaximo,
    fechaInicio: entity.fechaInicio,
    fechaFin: entity.fechaFin ?? null,
    estado: resolveEstadoEfectivoCurso(entity.estado, entity.fechaInicio, entity.fechaFin),
    activo: entity.activo,
    createdAt: entity.createdAt,
  };
}

/**
 * Convierte un bloque (entidad de `capacitacion_horarios`) a presentación mínima
 * (respuestas de crear/editar el curso, sin datos del catálogo de horarios).
 * @param {Object|null} entity
 * @returns {Object|null}
 */
export function bloqueEntityToPresentation(entity) {
  if (!entity) return null;

  return {
    capacitacionHorarioId: entity.id,
    grupoId: entity.grupoId ?? null,
    horarioId: entity.horarioId,
    ordenSecuencia: entity.ordenSecuencia ?? 1,
  };
}

/**
 * Arma los grupos de un curso con sus horarios.
 * @param {Array<Object>} grupos - Entidades o filas camelCase (con `inscritosCount` opcional)
 * @param {Array<Object>} bloques - Bloques ya en presentación (con `grupoId`)
 * @returns {Array<Object>}
 */
export function gruposToPresentation(grupos, bloques) {
  if (!Array.isArray(grupos)) return [];
  return grupos.map((grupo) => ({
    id: grupo.id,
    nombre: grupo.nombre,
    cupoMaximo: grupo.cupoMaximo ?? null,
    aulaId: grupo.aulaId ?? null,
    aulaCodigo: grupo.aulaCodigo ?? null,
    aulaNombre: grupo.aulaNombre ?? null,
    orden: grupo.orden ?? 1,
    inscritosCount: Number(grupo.inscritosCount ?? 0),
    horarios: (bloques ?? []).filter((bloque) => bloque.grupoId === grupo.id),
  }));
}

/**
 * Grupos de un curso con sus horarios a partir de entidades del repositorio
 * (respuestas de crear/editar el curso).
 * @param {Array<Object>} grupos
 * @param {Array<Object>} bloques - Entidades de `capacitacion_horarios`
 * @returns {Array<Object>}
 */
export function gruposDeCursoToPresentation(grupos, bloques) {
  return gruposToPresentation(grupos, (bloques ?? []).map(bloqueEntityToPresentation));
}

/**
 * Convierte un requisito de inscripción del curso (entidad del repositorio) a presentación.
 * @param {Object|null} entity
 * @returns {Object|null}
 */
export function requisitoToPresentation(entity) {
  if (!entity) return null;

  return {
    id: entity.id,
    descripcion: entity.descripcion,
    obligatorio: Boolean(entity.obligatorio),
    acreditaPagoCurso: Boolean(entity.acreditaPagoCurso),
    orden: entity.orden ?? 1,
  };
}

/**
 * Requisito del curso que acredita el pago del costo del curso (depósito a la
 * entidad certificadora), o null si el curso no tiene.
 * @param {Array<Object>} requisitosPresentation - Requisitos ya en presentación
 * @returns {Object|null}
 */
export function requisitoAcreditaPagoCurso(requisitosPresentation) {
  return (requisitosPresentation ?? []).find((r) => r.acreditaPagoCurso) ?? null;
}

/**
 * Convierte un array de requisitos del curso a presentación.
 * @param {Array<Object>} entities
 * @returns {Array<Object>}
 */
export function requisitosToPresentation(entities) {
  if (!Array.isArray(entities)) return [];
  return entities.map(requisitoToPresentation);
}

/**
 * Convierte una fila de `capacitacion_horarios` ↔ `horarios` del catálogo
 * `tipo_horario='CAPACITACION'` (GET /cursos-capacitacion/horarios) a presentación.
 * @param {Object|null} row - Fila camelCase del repositorio
 * @returns {Object|null}
 */
export function horarioCatalogoToPresentation(row) {
  if (!row) return null;

  return {
    horarioId: row.horarioId,
    nombre: row.nombre ?? null,
    dia: row.dia ?? null,
    horaInicio: row.horaInicio ?? null,
    horaFin: row.horaFin ?? null,
    tipoHorario: row.tipoHorario ?? null,
    ocupado: Boolean(Number(row.ocupado ?? 0)),
    cursosEnUso: Number(row.cursosEnUso ?? 0),
  };
}

/**
 * Clase mapper para CursoCapacitacion (patrón del módulo)
 */
export class CursoCapacitacionMapper {
  static viewRowToPresentation(row) {
    return viewRowToPresentation(row);
  }

  static viewRowsToPresentation(rows) {
    return viewRowsToPresentation(rows);
  }

  static horarioRowToPresentation(row) {
    return horarioRowToPresentation(row);
  }

  static horarioRowsToPresentation(rows) {
    return horarioRowsToPresentation(rows);
  }

  static entityToPresentation(entity) {
    return entityToPresentation(entity);
  }

  static bloqueEntityToPresentation(entity) {
    return bloqueEntityToPresentation(entity);
  }

  static gruposDeCursoToPresentation(grupos, bloques) {
    return gruposDeCursoToPresentation(grupos, bloques);
  }

  static gruposToPresentation(grupos, bloques) {
    return gruposToPresentation(grupos, bloques);
  }

  static requisitoToPresentation(entity) {
    return requisitoToPresentation(entity);
  }

  static requisitosToPresentation(entities) {
    return requisitosToPresentation(entities);
  }

  static requisitoAcreditaPagoCurso(requisitosPresentation) {
    return requisitoAcreditaPagoCurso(requisitosPresentation);
  }

  static horarioCatalogoToPresentation(row) {
    return horarioCatalogoToPresentation(row);
  }
}
