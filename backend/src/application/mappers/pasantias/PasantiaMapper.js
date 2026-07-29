/**
 * Mapper de aplicación: Pasantia (módulo TUT · pasantías)
 *
 * Convierte filas crudas (snake_case) de las vistas 167 (listado) y 168
 * (detalle) al formato de presentación camelCase. Los nombres de personas ya
 * vienen armados desde las vistas en orden institucional
 * (APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES).
 *
 * Las entidades de los repositorios CRUD (PasantiaRepository.toEntity y
 * hermanos) ya son camelCase y se exponen tal cual en crear/editar.
 */

/**
 * Fila de la vista 167 (listado de pasantías) → presentación.
 * @param {Object|null} row
 * @returns {Object|null}
 */
export function listadoRowToPresentation(row) {
  if (!row) return null;
  return {
    id: row.pasantia_id,
    tipo: row.tipo,
    estado: row.estado,
    fechaInicio: row.fecha_inicio ?? null,
    fechaFinalizacion: row.fecha_finalizacion ?? null,
    horasRequeridas:
      row.horas_requeridas !== null && row.horas_requeridas !== undefined
        ? Number(row.horas_requeridas)
        : null,
    horasCumplidas:
      row.horas_cumplidas !== null && row.horas_cumplidas !== undefined
        ? Number(row.horas_cumplidas)
        : null,
    carreraId: row.carrera_id ?? null,
    carreraCodigo: row.carrera_codigo ?? null,
    carreraNombre: row.carrera_nombre ?? null,
    gestionId: row.gestion_id ?? null,
    gestionCodigo: row.gestion_codigo ?? null,
    gestionNombre: row.gestion_nombre ?? null,
    gestionAnio: row.gestion_anio ?? null,
    estudianteId: row.estudiante_id ?? null,
    codigoEstudiante: row.codigo_estudiante ?? null,
    estudianteCi: row.estudiante_ci ?? null,
    estudianteExpedicion: row.estudiante_expedicion ?? null,
    estudianteApellidoPaterno: row.estudiante_apellido_paterno ?? null,
    estudianteApellidoMaterno: row.estudiante_apellido_materno ?? null,
    estudianteNombres: row.estudiante_nombres ?? null,
    estudianteNombre: row.estudiante_nombre ?? null,
    empresaId: row.empresa_id ?? null,
    empresaNombre: row.empresa_nombre ?? null,
    docenteSupervisorId: row.docente_supervisor_id ?? null,
    docenteSupervisorApellidoPaterno: row.docente_supervisor_apellido_paterno ?? null,
    docenteSupervisorApellidoMaterno: row.docente_supervisor_apellido_materno ?? null,
    docenteSupervisorNombres: row.docente_supervisor_nombres ?? null,
    docenteSupervisorNombre: row.docente_supervisor_nombre ?? null,
  };
}

/**
 * Filas de la vista 167 → presentación.
 * @param {Array<Object>} rows
 * @returns {Array<Object>}
 */
export function listadoRowsToPresentation(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(listadoRowToPresentation);
}

/**
 * Fila de la vista 168 (ficha de pasantía) → presentación.
 * Superconjunto del listado: puesto, contrato, responsable, contacto de la
 * empresa y agregados de satélites.
 * @param {Object|null} row
 * @returns {Object|null}
 */
export function detalleRowToPresentation(row) {
  if (!row) return null;
  return {
    ...listadoRowToPresentation(row),
    areaDepartamento: row.area_departamento ?? null,
    cargoPuesto: row.cargo_puesto ?? null,
    funciones: row.funciones ?? null,
    tipoContrato: row.tipo_contrato ?? null,
    tipoContratoDetalle: row.tipo_contrato_detalle ?? null,
    responsableEmpresa: row.responsable_empresa ?? null,
    cargoResponsable: row.cargo_responsable ?? null,
    telefonoResponsable: row.telefono_responsable ?? null,
    observaciones: row.observaciones ?? null,
    createdAt: row.created_at ?? null,
    estudianteCelular: row.estudiante_celular ?? null,
    empresaTipoSocietario: row.empresa_tipo_societario ?? null,
    empresaNit: row.empresa_nit ?? null,
    empresaEnFuncionamiento:
      row.empresa_en_funcionamiento === null || row.empresa_en_funcionamiento === undefined
        ? null
        : Boolean(row.empresa_en_funcionamiento),
    empresaDireccion: row.empresa_direccion ?? null,
    empresaTelefono: row.empresa_telefono ?? null,
    empresaSectorActividad: row.empresa_sector_actividad ?? null,
    totalInformes: Number(row.total_informes ?? 0),
    totalSeguimientos: Number(row.total_seguimientos ?? 0),
    ultimoSeguimientoFecha: row.ultimo_seguimiento_fecha ?? null,
    ultimoSeguimientoNivelDesempeno: row.ultimo_seguimiento_nivel_desempeno ?? null,
  };
}

/**
 * Clase mapper para Pasantia (patrón del módulo)
 */
export class PasantiaMapper {
  static listadoRowToPresentation(row) {
    return listadoRowToPresentation(row);
  }

  static listadoRowsToPresentation(rows) {
    return listadoRowsToPresentation(rows);
  }

  static detalleRowToPresentation(row) {
    return detalleRowToPresentation(row);
  }
}
