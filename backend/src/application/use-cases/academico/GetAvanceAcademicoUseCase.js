/**
 * Avance académico por estudiante × plan (ítem ACA `/academico/avance`,
 * permiso `academico.avance` — reemplaza al retirado
 * `reportes.avance_academico` del módulo REP disuelto).
 *
 * Lee la vista 171 (numerador sobre el MISMO universo del transcript 141 +
 * denominador de asignaturas_plan) y deriva el % de avance en aplicación:
 *   pctAvance = 100 × materiasAvanzadas / totalAsignaturasPlan.
 *
 * Alcance self (anti-IDOR, patrón portal): si el usuario autenticado tiene
 * vínculo de ESTUDIANTE, el listado se acota EN SERVIDOR a su propia fila
 * ("Mi avance", labelByRole de la ruta); staff/docentes ven el listado
 * completo (filtro opcional por carrera).
 *
 * dataFieldName: 'avance' (el frontend lo consume como dataKey).
 */

import { tryResolveEstudianteIdForUsuario } from '../../utils/resolveEstudianteIdForUsuario.js';

const toNum = (value) => (value == null ? null : Number(value));

const round2 = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export class GetAvanceAcademicoUseCase {
  constructor({ avanceAcademicoViewRepository, studentRepository, userRepository, logger }) {
    if (!avanceAcademicoViewRepository) {
      throw new Error('avanceAcademicoViewRepository es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.avanceAcademicoViewRepository = avanceAcademicoViewRepository;
    this.studentRepository = studentRepository;
    this.userRepository = userRepository;
    this.logger = logger;
    // Nombre del campo en la respuesta final de la API (dataKey del frontend).
    this.dataFieldName = 'avance';
  }

  /**
   * @param {Object} params
   * @param {number|string|null} [params.carreraId]
   * @param {number|null} [params.usuarioId] - Usuario autenticado (para alcance self).
   */
  async execute({ carreraId = null, usuarioId = null } = {}) {
    const carreraNum =
      carreraId != null && carreraId !== '' && Number.isFinite(Number(carreraId))
        ? Number(carreraId)
        : null;

    // Alcance self: derivado SIEMPRE en servidor (nunca de ids del cliente).
    let estudianteIdSelf = null;
    if (usuarioId != null && this.studentRepository && this.userRepository) {
      estudianteIdSelf = await tryResolveEstudianteIdForUsuario({
        studentRepository: this.studentRepository,
        userRepository: this.userRepository,
        usuarioId,
      });
    }

    const rows = await this.avanceAcademicoViewRepository.listarAvance({
      carreraId: carreraNum,
      estudianteId: estudianteIdSelf,
    });
    const safeRows = Array.isArray(rows) ? rows : [];

    const avance = safeRows.map((row) => {
      const totalAsignaturasPlan = toNum(row.total_asignaturas_plan) ?? 0;
      const materiasAvanzadas = toNum(row.materias_avanzadas) ?? 0;
      return {
        estudianteId: toNum(row.estudiante_id),
        codigo: row.codigo_estudiante ?? null,
        nombreCompleto: row.nombre_completo ?? '',
        carreraId: toNum(row.carrera_id),
        carreraCodigo: row.carrera_codigo ?? null,
        carreraNombre: row.carrera_nombre ?? null,
        carreraColorHex: row.carrera_color_hex ?? null,
        planEstudioId: toNum(row.plan_estudio_id),
        planNombre: row.plan_nombre ?? null,
        planDuracionAnios: toNum(row.plan_duracion_anios),
        totalAsignaturasPlan,
        materiasAprobadas: toNum(row.materias_aprobadas) ?? 0,
        materiasConvalidadas: toNum(row.materias_convalidadas) ?? 0,
        materiasAvanzadas,
        materiasRegistradas: toNum(row.materias_registradas) ?? 0,
        pctAvance:
          totalAsignaturasPlan > 0
            ? round2((100 * materiasAvanzadas) / totalAsignaturasPlan)
            : null,
        primeraGestionAnio: toNum(row.primera_gestion_anio),
        ultimaGestionAnio: toNum(row.ultima_gestion_anio),
        promedioHistorial: toNum(row.promedio_historial),
      };
    });

    const conPct = avance.filter((fila) => fila.pctAvance != null);
    const resumen = {
      totalEstudiantes: avance.length,
      promedioPctAvance:
        conPct.length > 0
          ? round2(conPct.reduce((acc, fila) => acc + fila.pctAvance, 0) / conPct.length)
          : null,
    };

    this.logger.info('[Académico] Avance académico listado', {
      carreraId: carreraNum,
      alcance: estudianteIdSelf != null ? 'PROPIO' : 'GLOBAL',
      filas: avance.length,
    });

    return {
      [this.dataFieldName]: avance,
      resumen,
      alcance: estudianteIdSelf != null ? 'PROPIO' : 'GLOBAL',
    };
  }
}

export default GetAvanceAcademicoUseCase;
