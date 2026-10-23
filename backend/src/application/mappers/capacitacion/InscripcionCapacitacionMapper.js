/**
 * Mapper de aplicación: InscripcionCapacitacion (módulo CAP)
 *
 * Convierte las filas crudas del listado/ficha (inscripción + participante +
 * curso + total pagado + compromiso, snake_case) a formato de presentación
 * (camelCase). El estado de pago (`estadoPago`) y el monto objetivo
 * (`montoObligatorio`) vienen PERSISTIDOS de `capacitacion_inscritos`, no se
 * derivan aquí (ver reglas de negocio del módulo CAP).
 */

import { aCentavos, deCentavos } from '../../use-cases/capacitacion/helpers/estadoInscripcion.js';

/**
 * Nombre completo en orden APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES.
 * @param {Object} row
 * @returns {string}
 */
function buildNombreCompleto(row) {
  return [
    row.participante_apellido_paterno,
    row.participante_apellido_materno,
    row.participante_nombres,
  ]
    .filter((parte) => parte && String(parte).trim() !== '')
    .join(' ');
}

/**
 * Convierte una fila cruda del listado a formato de presentación.
 * @param {Object|null} row
 * @returns {Object|null}
 */
export function rowToPresentation(row) {
  if (!row) return null;

  const costo = row.costo !== null && row.costo !== undefined ? Number(row.costo) : 0;
  const montoObligatorio =
    row.monto_obligatorio !== null && row.monto_obligatorio !== undefined
      ? Number(row.monto_obligatorio)
      : 0;
  const montoMatricula = Number(row.monto_matricula ?? 0);
  const pagadoCurso = Number(row.pagado_curso ?? 0);
  const pagadoMatricula = Number(row.pagado_matricula ?? 0);
  const totalPagado = Number(row.total_pagado ?? pagadoCurso + pagadoMatricula);
  // Costo del curso EXTERNO (curso con entidad certificadora): no se registra como pago en el
  // sistema; lo acredita el requisito `acredita_pago_curso` (fotocopia del depósito).
  const pagoCursoExterno = Boolean(Number(row.pago_curso_externo ?? 0));
  const requisitoAcreditaId = pagoCursoExterno ? (row.requisito_acredita_id ?? null) : null;
  const requisitoAcreditaEntregado =
    requisitoAcreditaId !== null && Boolean(Number(row.requisito_acredita_entregado ?? 0));
  let saldoCurso = deCentavos(Math.max(0, aCentavos(montoObligatorio) - aCentavos(pagadoCurso)));
  if (pagoCursoExterno) saldoCurso = requisitoAcreditaEntregado ? 0 : montoObligatorio;
  const saldoMatricula = deCentavos(
    Math.max(0, aCentavos(montoMatricula) - aCentavos(pagadoMatricula))
  );

  return {
    id: row.id,
    fechaInscripcion: row.fecha_inscripcion,
    estado: row.estado,
    activo: Boolean(row.activo),
    participanteId: row.participante_id,
    participanteCi: row.participante_ci,
    participanteExpedicion: row.participante_expedicion ?? null,
    participanteNombres: row.participante_nombres,
    participanteApellidoPaterno: row.participante_apellido_paterno ?? null,
    participanteApellidoMaterno: row.participante_apellido_materno ?? null,
    participanteNombreCompleto: buildNombreCompleto(row),
    participanteCelular: row.participante_celular ?? null,
    participanteEmail: row.participante_email ?? null,
    capacitacionId: row.capacitacion_id,
    capacitacionTitulo: row.capacitacion_titulo,
    capacitacionEdicion: row.capacitacion_edicion ?? null,
    capacitacionEstado: row.capacitacion_estado,
    capacitacionModalidad: row.capacitacion_modalidad ?? null,
    capacitacionEntidadCertificadora: row.capacitacion_entidad_certificadora ?? null,
    capacitacionFechaInicio: row.capacitacion_fecha_inicio,
    capacitacionFechaFin: row.capacitacion_fecha_fin ?? null,
    capacitacionGrupoId: row.capacitacion_grupo_id ?? null,
    grupoNombre: row.grupo_nombre ?? null,
    grupoHorariosEtiqueta: row.grupo_horarios ?? null,
    costo,
    montoObligatorio,
    montoMatricula,
    totalPagado,
    totalPagadoCurso: pagadoCurso,
    totalPagadoMatricula: pagadoMatricula,
    saldoCurso,
    saldoMatricula,
    // Saldo total pendiente DE COBRO del instituto: matrícula (+ curso solo si no es externo)
    saldo: deCentavos(aCentavos(saldoMatricula) + (pagoCursoExterno ? 0 : aCentavos(saldoCurso))),
    pagoCursoExterno,
    requisitoAcreditaPagoCurso:
      requisitoAcreditaId === null
        ? null
        : {
            requisitoId: requisitoAcreditaId,
            descripcion: row.requisito_acredita_descripcion ?? null,
            entregado: requisitoAcreditaEntregado,
          },
    estadoPago: row.estado_pago,
    estadoPagoCurso: row.estado_pago_curso ?? null,
    estadoPagoMatricula: row.estado_pago_matricula ?? null,
    requisitosPendientes: Number(row.requisitos_pendientes ?? 0),
    pagosCount: Number(row.pagos_count ?? 0),
    compromisoId: row.compromiso_id ?? null,
    fechaCompromiso: row.compromiso_fecha ?? null,
    compromisoEstado: row.compromiso_estado ?? null,
    compromisoObservacion: row.compromiso_observacion ?? null,
    createdAt: row.created_at,
  };
}

/**
 * Convierte una fila del checklist de requisitos de una inscripción a presentación.
 * @param {Object|null} row
 * @returns {Object|null}
 */
export function requisitoRowToPresentation(row) {
  if (!row) return null;

  return {
    requisitoId: row.requisito_id,
    descripcion: row.descripcion,
    obligatorio: Boolean(Number(row.obligatorio)),
    acreditaPagoCurso: Boolean(Number(row.acredita_pago_curso ?? 0)),
    orden: row.orden ?? null,
    entregado: Boolean(Number(row.entregado)),
    fechaEntrega: row.fecha_entrega ?? null,
    observacion: row.observacion ?? null,
  };
}

/**
 * Convierte el checklist de requisitos de una inscripción a presentación.
 * @param {Array<Object>} rows
 * @returns {Array<Object>}
 */
export function requisitoRowsToPresentation(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(requisitoRowToPresentation);
}

/**
 * Convierte un array de filas crudas del listado a presentación.
 * @param {Array<Object>} rows
 * @returns {Array<Object>}
 */
export function rowsToPresentation(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(rowToPresentation);
}

/**
 * Convierte una entidad del repositorio CRUD (objeto de dominio) a
 * presentación mínima (respuestas de crear/eliminar).
 * @param {Object|null} entity
 * @returns {Object|null}
 */
export function entityToPresentation(entity) {
  if (!entity) return null;

  return {
    id: entity.id,
    participanteId: entity.participanteId,
    capacitacionId: entity.capacitacionId,
    fechaInscripcion: entity.fechaInscripcion,
    estado: entity.estado,
    montoObligatorio: entity.montoObligatorio ?? null,
    montoMatricula: entity.montoMatricula ?? 0,
    estadoPago: entity.estadoPago ?? null,
    estadoPagoCurso: entity.estadoPagoCurso ?? null,
    estadoPagoMatricula: entity.estadoPagoMatricula ?? null,
    capacitacionGrupoId: entity.capacitacionGrupoId ?? null,
    activo: entity.activo,
    createdAt: entity.createdAt,
  };
}

/**
 * Clase mapper para InscripcionCapacitacion (patrón del módulo)
 */
export class InscripcionCapacitacionMapper {
  static rowToPresentation(row) {
    return rowToPresentation(row);
  }

  static rowsToPresentation(rows) {
    return rowsToPresentation(rows);
  }

  static entityToPresentation(entity) {
    return entityToPresentation(entity);
  }

  static requisitoRowToPresentation(row) {
    return requisitoRowToPresentation(row);
  }

  static requisitoRowsToPresentation(rows) {
    return requisitoRowsToPresentation(rows);
  }
}
