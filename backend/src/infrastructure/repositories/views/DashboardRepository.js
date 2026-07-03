import { sequelize } from '../../database/sequelize.js';
import { DASHBOARD_QUERY_TARGETS } from '../../constants/dashboardQuery.targets.js';
import { IDashboardRepository } from '../../../domain/interfaces/repositories/IDashboardRepository.js';

const {
  vistaActividadesRecientes,
  vistaDocentePanel,
  vistaEstudiantePanel,
  tablaEstudiantes,
  vistaEstudianteCarreraReciente,
  vistaEstudianteAporteSaldoResumen,
  vistaCalificacionEstudianteMatriculaCurso,
  vistaAsignacionDocenteDetalle,
  tablaCarreras,
  tablaSesiones,
  tablaPagoCuotas,
  tablaPagoAporte,
  tablaInscripciones,
  tablaEstudiantesDatosAcademicos,
  tablaGestiones,
  tablaEstudiantesBecas,
  tablaBecasDescuentos,
  vistaDocenteCargaPorGestion,
  vistaDocenteCursoBloquesHorario,
} = DASHBOARD_QUERY_TARGETS;

/**
 * Consultas agregadas para el resumen del panel principal (dashboard).
 * Repositorio de SOLO LECTURA sobre vistas (arquetipo views/).
 */
export class DashboardRepository extends IDashboardRepository {
  /**
   * Actividades recientes: prioriza las de la fecha de hoy y luego por ocurrido_en descendente.
   *
   * @param {number} limit - Máximo de filas (1–100)
   * @returns {Promise<Array<Record<string, unknown>>>}
   */
  async findActividadesRecientes(limit = 12) {
    const lim = Math.min(100, Math.max(1, parseInt(limit, 10) || 12));
    const query = `
      SELECT
        artefacto_tipo,
        artefacto_id,
        link_path,
        titulo,
        detalle,
        avatar_seed,
        ocurrido_en
      FROM ${vistaActividadesRecientes}
      ORDER BY (DATE(ocurrido_en) = CURDATE()) DESC, ocurrido_en DESC
      LIMIT ?
    `;
    return sequelize.query(query, {
      replacements: [lim],
      type: sequelize.QueryTypes.SELECT,
    });
  }

  /**
   * Estudiantes registrados (fila creada) hoy y en el mes calendario actual.
   *
   * @returns {Promise<{ hoy: number, mes: number }>}
   */
  async countEstudiantesRegistradosHoyYMes() {
    const query = `
      SELECT
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) AS hoy,
        SUM(
          CASE
            WHEN YEAR(created_at) = YEAR(CURDATE())
             AND MONTH(created_at) = MONTH(CURDATE())
            THEN 1 ELSE 0
          END
        ) AS mes
      FROM ${tablaEstudiantes}
      WHERE deleted_at IS NULL
        AND activo = TRUE
    `;
    const rows = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    const row = rows[0] || {};
    return {
      hoy: Number(row.hoy ?? 0),
      mes: Number(row.mes ?? 0),
    };
  }

  /**
   * Docentes activos más recientemente registrados.
   *
   * @param {number} limit
   * @returns {Promise<Array<Record<string, unknown>>>}
   */
  async findDocentesRecientes(limit = 10) {
    const lim = Math.min(30, Math.max(1, parseInt(limit, 10) || 10));
    const query = `
      SELECT
        id,
        nombre_completo,
        titulo_profesional,
        avatar_seed
      FROM ${vistaDocentePanel}
      ORDER BY created_at DESC
      LIMIT ?
    `;
    return sequelize.query(query, {
      replacements: [lim],
      type: sequelize.QueryTypes.SELECT,
    });
  }

  /**
   * Estudiantes activos más recientemente registrados.
   *
   * @param {number} limit
   * @returns {Promise<Array<Record<string, unknown>>>}
   */
  /**
   * Carreras activas para vista previa del panel (solo lectura; sin ABM).
   * Expuesto vía GET /dashboard/resumen bajo `sistema.catalogo.referencia`.
   *
   * @param {number} limit
   * @returns {Promise<Array<Record<string, unknown>>>}
   */
  async findCarrerasDestacadas(limit = 10) {
    const lim = Math.min(20, Math.max(1, parseInt(limit, 10) || 10));
    const query = `
      SELECT
        id,
        codigo,
        nombre,
        color_hex,
        imagen_ruta
      FROM carreras
      WHERE deleted_at IS NULL
        AND activo = TRUE
      ORDER BY nombre ASC
      LIMIT ?
    `;
    return sequelize.query(query, {
      replacements: [lim],
      type: sequelize.QueryTypes.SELECT,
    });
  }

  async findEstudiantesRecientes(limit = 10) {
    const lim = Math.min(30, Math.max(1, parseInt(limit, 10) || 10));
    const query = `
      SELECT
        id,
        nombre_completo,
        codigo_estudiante,
        avatar_seed
      FROM ${vistaEstudiantePanel}
      ORDER BY created_at DESC
      LIMIT ?
    `;
    return sequelize.query(query, {
      replacements: [lim],
      type: sequelize.QueryTypes.SELECT,
    });
  }

  // ============================================================================
  // Portal del estudiante: GET /dashboard/mi-resumen
  // El estudiante se resuelve SIEMPRE en servidor (anti-IDOR). Estos métodos
  // reciben el estudianteId/usuarioId ya resuelto desde el use case.
  // ============================================================================

  /**
   * Identidad mínima del estudiante de la sesión (torso de la tabla estudiantes).
   * nombre legible en orden institucional APELLIDOS NOMBRES.
   *
   * @param {number} estudianteId
   * @returns {Promise<{ nombre: string, codigo: string }>}
   */
  async findEstudianteResumen(estudianteId) {
    const query = `
      SELECT
        TRIM(CONCAT_WS(' ', e.apellido_paterno, e.apellido_materno, e.nombres)) AS nombre,
        e.codigo_estudiante AS codigo
      FROM ${tablaEstudiantes} e
      WHERE e.id = ?
        AND e.deleted_at IS NULL
      LIMIT 1
    `;
    const rows = await sequelize.query(query, {
      replacements: [estudianteId],
      type: sequelize.QueryTypes.SELECT,
    });
    const row = rows[0] || {};
    return {
      nombre: row.nombre ?? '',
      codigo: row.codigo ?? '',
    };
  }

  /**
   * Carrera de la inscripción más reciente del estudiante (vista 38) enriquecida
   * con id e imagen desde la tabla `carreras` (join por código).
   *
   * @param {number} estudianteId
   * @returns {Promise<{ id, codigo, nombre, color_hex, imagen_ruta }|null>}
   */
  async findCarreraDeEstudiante(estudianteId) {
    const query = `
      SELECT
        c.id,
        c.codigo,
        c.nombre,
        c.color_hex,
        c.imagen_ruta
      FROM ${vistaEstudianteCarreraReciente} vc
      INNER JOIN ${tablaCarreras} c
        ON c.codigo = vc.carrera_codigo
        AND c.deleted_at IS NULL
      WHERE vc.estudiante_id = ?
      LIMIT 1
    `;
    const rows = await sequelize.query(query, {
      replacements: [estudianteId],
      type: sequelize.QueryTypes.SELECT,
    });
    return rows[0] ?? null;
  }

  /**
   * Docentes de las asignaturas de la inscripción vigente del estudiante.
   * Une matrícula del estudiante (vista 110) con el detalle de asignación (vista 130),
   * un registro por docente (DISTINCT por docente_id, materias agregadas).
   *
   * @param {number} estudianteId
   * @param {number} limit
   * @returns {Promise<Array<{ id, nombre_completo, titulo_profesional, avatar_seed }>>}
   */
  async findDocentesDeEstudiante(estudianteId, limit = 10) {
    const lim = Math.min(30, Math.max(1, parseInt(limit, 10) || 10));
    const query = `
      SELECT
        vad.docente_id AS id,
        TRIM(CONCAT_WS(' ',
          vad.docente_apellido_paterno,
          vad.docente_apellido_materno,
          vad.docente_nombres
        )) AS nombre_completo,
        GROUP_CONCAT(
          DISTINCT COALESCE(vad.materia_sigla, vad.materia_nombre)
          ORDER BY COALESCE(vad.materia_sigla, vad.materia_nombre)
          SEPARATOR ', '
        ) AS titulo_profesional,
        CONCAT('DOCENTE-', vad.docente_id) AS avatar_seed
      FROM ${vistaCalificacionEstudianteMatriculaCurso} vc
      INNER JOIN ${vistaAsignacionDocenteDetalle} vad
        ON vad.id = vc.asignacion_docente_id
      WHERE vc.estudiante_id = ?
        AND vad.docente_id IS NOT NULL
      GROUP BY
        vad.docente_id,
        vad.docente_apellido_paterno,
        vad.docente_apellido_materno,
        vad.docente_nombres
      ORDER BY nombre_completo ASC
      LIMIT ?
    `;
    return sequelize.query(query, {
      replacements: [estudianteId, lim],
      type: sequelize.QueryTypes.SELECT,
    });
  }

  /**
   * Feed PROPIO del estudiante (no el global admin): sus pagos, su matrícula y su
   * beca, normalizados al shape de actividad (artefacto_tipo, artefacto_id,
   * link_path, titulo, detalle, avatar_seed, ocurrido_en) y ordenados DESC.
   *
   * @param {number} estudianteId
   * @param {number} limit
   * @returns {Promise<Array<Record<string, unknown>>>}
   */
  async findActividadesDeEstudiante(estudianteId, limit = 10) {
    const lim = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const query = `
      SELECT * FROM (
        SELECT
          'PAGO' AS artefacto_tipo,
          pc.id AS artefacto_id,
          '/matricula/aportes/listar' AS link_path,
          'Pago de aporte' AS titulo,
          CONCAT('Bs ', FORMAT(pc.monto, 0), ' · recibo ', pc.numero_recibo) AS detalle,
          CONCAT('PAGO-', pc.id) AS avatar_seed,
          CAST(pc.fecha_pago AS DATETIME) AS ocurrido_en
        FROM ${tablaPagoCuotas} pc
        INNER JOIN ${tablaPagoAporte} pa
          ON pa.id = pc.pago_aporte_id
          AND pa.deleted_at IS NULL
        WHERE pa.estudiante_id = ?
          AND pc.deleted_at IS NULL
          AND pc.activo = TRUE

        UNION ALL

        SELECT
          'MATRICULA' AS artefacto_tipo,
          ins.id AS artefacto_id,
          '/perfil' AS link_path,
          'Matrícula' AS titulo,
          NULLIF(CONCAT_WS(' · ', g.nombre, c.nombre), '') AS detalle,
          CONCAT('MATRICULA-', ins.id) AS avatar_seed,
          CAST(ins.created_at AS DATETIME) AS ocurrido_en
        FROM ${tablaInscripciones} ins
        INNER JOIN ${tablaEstudiantesDatosAcademicos} eda
          ON eda.id = ins.datos_academicos_id
          AND eda.deleted_at IS NULL
        LEFT JOIN ${tablaGestiones} g
          ON g.id = ins.gestion_id
          AND g.deleted_at IS NULL
        LEFT JOIN ${tablaCarreras} c
          ON c.id = eda.carrera_id
          AND c.deleted_at IS NULL
        WHERE eda.estudiante_id = ?
          AND ins.deleted_at IS NULL
          AND ins.activo = TRUE

        UNION ALL

        SELECT
          'BECA' AS artefacto_tipo,
          eb.id AS artefacto_id,
          '/perfil' AS link_path,
          'Beca asignada' AS titulo,
          NULLIF(CONCAT_WS(' · ', COALESCE(bd.nombre, 'Beca'), eb.estado), '') AS detalle,
          CONCAT('BECA-', eb.id) AS avatar_seed,
          CAST(eb.created_at AS DATETIME) AS ocurrido_en
        FROM ${tablaEstudiantesBecas} eb
        LEFT JOIN ${tablaBecasDescuentos} bd
          ON bd.id = eb.beca_descuento_id
          AND bd.deleted_at IS NULL
        WHERE eb.estudiante_id = ?
          AND eb.deleted_at IS NULL
          AND eb.activo = TRUE
      ) feed
      ORDER BY ocurrido_en DESC
      LIMIT ?
    `;
    return sequelize.query(query, {
      replacements: [estudianteId, estudianteId, estudianteId, lim],
      type: sequelize.QueryTypes.SELECT,
    });
  }

  /**
   * Sesiones del usuario de la sesión registradas hoy y en el mes calendario actual.
   * Mismo patrón que countEstudiantesRegistradosHoyYMes pero filtrado por usuario_id.
   *
   * @param {number} usuarioId
   * @returns {Promise<{ hoy: number, mes: number }>}
   */
  async countSesionesUsuarioHoyYMes(usuarioId) {
    const query = `
      SELECT
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) AS hoy,
        SUM(
          CASE
            WHEN YEAR(created_at) = YEAR(CURDATE())
             AND MONTH(created_at) = MONTH(CURDATE())
            THEN 1 ELSE 0
          END
        ) AS mes
      FROM ${tablaSesiones}
      WHERE usuario_id = ?
        AND deleted_at IS NULL
    `;
    const rows = await sequelize.query(query, {
      replacements: [usuarioId],
      type: sequelize.QueryTypes.SELECT,
    });
    const row = rows[0] || {};
    return {
      hoy: Number(row.hoy ?? 0),
      mes: Number(row.mes ?? 0),
    };
  }

  /**
   * Saldo de aportes pendiente del estudiante de la sesión (vista 37, agregado por
   * estudiante). Si el estudiante no tiene fila en la vista, devuelve 0.
   *
   * @param {number} estudianteId
   * @returns {Promise<number>} saldo_pendiente_total del estudiante (0 si no hay fila)
   */
  async findSaldoPendienteEstudiante(estudianteId) {
    const query = `
      SELECT
        COALESCE(sr.saldo_pendiente_total, 0) AS saldo_pendiente_total
      FROM ${vistaEstudianteAporteSaldoResumen} sr
      WHERE sr.estudiante_id = ?
      LIMIT 1
    `;
    const rows = await sequelize.query(query, {
      replacements: [estudianteId],
      type: sequelize.QueryTypes.SELECT,
    });
    const row = rows[0] || {};
    return Number(row.saldo_pendiente_total ?? 0);
  }

  // ============================================================================
  // Portal del rol docente: GET /dashboard/mi-resumen-docente
  // El docente se resuelve SIEMPRE en servidor (anti-IDOR). Estos métodos
  // reciben el docenteId y el contexto de gestión ya resueltos desde el use case.
  // ============================================================================

  /**
   * Carga académica del docente en la gestión indicada (vista 53,
   * `vista_docente_carga_por_gestion`). La vista trae una fila por gestión + plan
   * habilitado, por eso se agrega con SUM.
   *
   * Mapeo vista → contrato del panel:
   * - num_asignaciones_vigentes → total_asignaciones (el panel refleja la carga
   *   ACTUAL: asignaciones vigentes de la gestión, no las históricas/no vigentes)
   * - horas_semanales_vigentes  → horas_semanales (SUM de COALESCE(carga_horaria, horas_plan))
   *
   * @param {number} docenteId
   * @param {number} gestionAnio - Año de la gestión vigente (contexto de calificaciones)
   * @returns {Promise<{ total_asignaciones: number, horas_semanales: number }>}
   */
  async findCargaDocenteGestion(docenteId, gestionAnio) {
    const query = `
      SELECT
        COALESCE(SUM(num_asignaciones_vigentes), 0) AS total_asignaciones,
        COALESCE(SUM(horas_semanales_vigentes), 0) AS horas_semanales
      FROM ${vistaDocenteCargaPorGestion}
      WHERE docente_id = ?
        AND gestion_anio = ?
    `;
    const rows = await sequelize.query(query, {
      replacements: [docenteId, gestionAnio],
      type: sequelize.QueryTypes.SELECT,
    });
    const row = rows[0] || {};
    return {
      total_asignaciones: Number(row.total_asignaciones ?? 0),
      horas_semanales: Number(row.horas_semanales ?? 0),
    };
  }

  /**
   * Bloques de horario del docente en la gestión vigente (vista 128,
   * `vista_base_docente_curso_bloques_horario`), ordenados por día y hora.
   *
   * Columnas recortadas al contrato del panel (el use case las pasa a camelCase):
   * - hora_inicio / hora_fin se normalizan a HH:MM con TIME_FORMAT.
   * - aula = COALESCE(aula_codigo, aula_nombre): la vista expone el aula del
   *   paralelo; si el paralelo no tiene aula asignada, queda NULL (el contrato
   *   admite aula null; NO se toca la vista).
   *
   * @param {number} docenteId
   * @param {number} gestionId - Gestión vigente (contexto de calificaciones)
   * @returns {Promise<Array<Record<string, unknown>>>}
   */
  async findHorarioBloquesDocenteGestion(docenteId, gestionId) {
    const query = `
      SELECT
        dia,
        TIME_FORMAT(hora_inicio, '%H:%i') AS hora_inicio,
        TIME_FORMAT(hora_fin, '%H:%i') AS hora_fin,
        materia_sigla,
        materia_nombre,
        paralelo_nombre,
        COALESCE(aula_codigo, aula_nombre) AS aula,
        curso_color_hex
      FROM ${vistaDocenteCursoBloquesHorario}
      WHERE docente_id = ?
        AND gestion_id = ?
      ORDER BY
        FIELD(dia, 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'),
        hora_inicio ASC
    `;
    return sequelize.query(query, {
      replacements: [docenteId, gestionId],
      type: sequelize.QueryTypes.SELECT,
    });
  }
}
