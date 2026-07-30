/**
 * Mapper de presentación del módulo Libros de registro (schema 25, ACA).
 * Fila plana de vista/raw query (snake_case) → DTO de presentación (camelCase).
 * Contrato front↔back: las claves de los DTO son las que consume el frontend.
 */

/**
 * Nombre en orden institucional APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES
 * (regla transversal del sistema; espejo del buildFullName del frontend).
 * @param {Object} partes - { apellidoPaterno?, apellidoMaterno?, nombres? }
 * @returns {string}
 */
export function buildFullName({ apellidoPaterno, apellidoMaterno, nombres } = {}) {
  return [apellidoPaterno, apellidoMaterno, nombres]
    .map((parte) => (parte == null ? '' : String(parte).trim()))
    .filter(Boolean)
    .join(' ');
}

/**
 * Fila de la vista 175 → DTO de libro (listado y cabecera de ficha).
 * @param {Object} row
 * @returns {Object|null}
 */
export function toLibroDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    numeroLibro: row.numero_libro ?? null,
    carreraId: row.carrera_id ?? null,
    carreraNombre: row.carrera_nombre ?? null,
    carreraCodigo: row.carrera_codigo ?? null,
    carreraColorHex: row.carrera_color_hex ?? null,
    gestionId: row.gestion_id ?? null,
    gestionAnio: row.gestion_anio ?? null,
    gestionNombre: row.gestion_nombre ?? null,
    gestionVigente: row.gestion_vigente != null ? Boolean(row.gestion_vigente) : null,
    codigoRegistro: row.codigo_registro ?? null,
    folioInicial: row.folio_inicial ?? null,
    folioActual: row.folio_actual ?? null,
    folioFinal: row.folio_final ?? null,
    estado: row.estado ?? null,
    fechaApertura: row.fecha_apertura ?? null,
    fechaCierre: row.fecha_cierre ?? null,
    observaciones: row.observaciones ?? null,
    totalFolios: Number(row.total_folios ?? 0),
    foliosFirmados: Number(row.folios_firmados ?? 0),
    foliosAnulados: Number(row.folios_anulados ?? 0),
    maxNumeroFolio: row.max_numero_folio ?? null,
    paralelosConFolio: Number(row.paralelos_con_folio ?? 0),
    totalEstudiantes: Number(row.total_estudiantes ?? 0),
  };
}

/**
 * Fila de la vista 176 → DTO de folio (tabla de folios y cabecera de impresión).
 * @param {Object} row
 * @returns {Object|null}
 */
export function toFolioDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    libroId: row.libro_id ?? null,
    numeroLibro: row.numero_libro ?? null,
    codigoRegistro: row.codigo_registro ?? null,
    numeroFolio: row.numero_folio ?? null,
    paraleloGestionId: row.paralelo_gestion_id ?? null,
    ordenEnParalelo: row.orden_en_paralelo ?? null,
    estado: row.estado ?? null,
    fechaRegistro: row.fecha_registro ?? null,
    observaciones: row.observaciones ?? null,
    paraleloNombre: row.paralelo_nombre ?? null,
    turno: row.turno ?? null,
    periodoId: row.periodo_id ?? null,
    periodoNumero: row.periodo_numero ?? null,
    periodoNombre: row.periodo_nombre ?? null,
    carreraId: row.carrera_id ?? null,
    carreraNombre: row.carrera_nombre ?? null,
    carreraCodigo: row.carrera_codigo ?? null,
    gestionId: row.gestion_id ?? null,
    gestionAnio: row.gestion_anio ?? null,
    gestionNombre: row.gestion_nombre ?? null,
    totalEstudiantes: Number(row.total_estudiantes ?? 0),
    totalAprobados: Number(row.total_aprobados ?? 0),
    totalReprobados: Number(row.total_reprobados ?? 0),
    totalAbandonos: Number(row.total_abandonos ?? 0),
  };
}

/**
 * Fila de listarParalelosParaLibro (vista 127 + conteos) → DTO de paralelo
 * candidato del generador de folios.
 * @param {Object} row
 * @returns {Object|null}
 */
export function toParaleloLibroDTO(row) {
  if (!row) return null;
  const foliosVigentes = Number(row.folios_vigentes ?? 0);
  return {
    paraleloGestionId: row.paralelo_gestion_id,
    paraleloNombre: row.paralelo_nombre ?? null,
    turno: row.turno ?? null,
    paraleloEstado: row.paralelo_estado ?? null,
    periodoId: row.periodo_id ?? null,
    periodoNumero: row.periodo_numero ?? null,
    periodoNombre: row.periodo_nombre ?? null,
    carreraId: row.carrera_id ?? null,
    carreraNombre: row.carrera_nombre ?? null,
    gestionId: row.gestion_id ?? null,
    gestionAnio: row.gestion_anio ?? null,
    totalEstudiantes: Number(row.total_estudiantes ?? 0),
    foliosVigentes,
    generado: foliosVigentes > 0,
  };
}

/**
 * Fila de LibroRegistroRepository.listarEstudiantesFolio → DTO de fila de la
 * nómina del folio (sin celdas de notas; las agrega el use case desde la 135).
 * @param {Object} row
 * @returns {Object|null}
 */
export function toFolioEstudianteDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    folioId: row.folio_id ?? null,
    numeroOrden: row.numero_orden ?? null,
    estudianteId: row.estudiante_id ?? null,
    inscripcionId: row.inscripcion_id ?? null,
    codigoEstudiante: row.codigo_estudiante ?? null,
    ci: row.ci ?? null,
    expedicion: row.expedicion ?? null,
    nombreCompleto:
      row.nombre_completo ??
      buildFullName({
        apellidoPaterno: row.apellido_paterno,
        apellidoMaterno: row.apellido_materno,
        nombres: row.nombres,
      }),
    estadoAcademico: row.estado_academico ?? null,
    observaciones: row.observaciones ?? null,
  };
}

export default {
  buildFullName,
  toLibroDTO,
  toFolioDTO,
  toParaleloLibroDTO,
  toFolioEstudianteDTO,
};
