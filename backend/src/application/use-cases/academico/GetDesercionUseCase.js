/**
 * Deserción estudiantil — métrica institucional de abandono (pestaña Deserción
 * de `/academico/avance`, permiso `academico.desercion` — reemplaza al
 * retirado `reportes.desercion` del módulo REP disuelto).
 *
 * Grano ANUAL por estados consolidados ABANDONO/RETIRADO de matriculas_materia
 * (vistas 172/173). NO es el riesgo pedagógico por notas del módulo TUT
 * (156/157): aquí se mide el abandono CONSUMADO, histórico por gestión.
 *
 * Respuesta (dataKeys del frontend):
 *   - carreras:   agregado carrera × gestión (stat-cards / tabla resumen).
 *   - desertores: detalle (una fila por matrícula en ABANDONO/RETIRADO).
 *   - resumen:    totales globales del universo filtrado.
 */

import { ValidationError } from '../../../domain/errors/AppError.js';

const toNum = (value) => (value == null ? null : Number(value));

const round2 = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const parseOptionalId = (value, label) => {
  if (value == null || value === '') return null;
  const num = Number(value);
  if (!Number.isFinite(num) || num < 1) {
    throw new ValidationError(`${label} inválido`);
  }
  return num;
};

export class GetDesercionUseCase {
  constructor({ desercionViewRepository, logger }) {
    if (!desercionViewRepository) {
      throw new Error('desercionViewRepository es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.desercionViewRepository = desercionViewRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number|string|null} [params.gestionId] - null = todas las gestiones.
   * @param {number|string|null} [params.carreraId] - null = todas las carreras.
   */
  async execute({ gestionId = null, carreraId = null } = {}) {
    const gestionNum = parseOptionalId(gestionId, 'gestionId');
    const carreraNum = parseOptionalId(carreraId, 'carreraId');

    const [resumenRows, desertorRows] = await Promise.all([
      this.desercionViewRepository.listarResumenCarreraGestion({
        gestionId: gestionNum,
        carreraId: carreraNum,
      }),
      this.desercionViewRepository.listarDesertores({
        gestionId: gestionNum,
        carreraId: carreraNum,
      }),
    ]);

    const carreras = (Array.isArray(resumenRows) ? resumenRows : []).map((row) => ({
      gestionId: toNum(row.gestion_id),
      gestionAnio: toNum(row.gestion_anio),
      gestionNombre: row.gestion_nombre ?? null,
      carreraId: toNum(row.carrera_id),
      carreraCodigo: row.carrera_codigo ?? null,
      carreraNombre: row.carrera_nombre ?? null,
      carreraColorHex: row.carrera_color_hex ?? null,
      totalMatriculasMateria: toNum(row.total_matriculas_materia) ?? 0,
      matriculasDesercion: toNum(row.matriculas_desercion) ?? 0,
      matriculasAbandono: toNum(row.matriculas_abandono) ?? 0,
      matriculasRetiro: toNum(row.matriculas_retiro) ?? 0,
      totalEstudiantes: toNum(row.total_estudiantes) ?? 0,
      estudiantesDesercion: toNum(row.estudiantes_desercion) ?? 0,
      pctEstudiantesDesercion: toNum(row.pct_estudiantes_desercion),
    }));

    const desertores = (Array.isArray(desertorRows) ? desertorRows : []).map((row) => ({
      gestionId: toNum(row.gestion_id),
      gestionAnio: toNum(row.gestion_anio),
      gestionNombre: row.gestion_nombre ?? null,
      carreraId: toNum(row.carrera_id),
      carreraCodigo: row.carrera_codigo ?? null,
      carreraNombre: row.carrera_nombre ?? null,
      carreraColorHex: row.carrera_color_hex ?? null,
      estudianteId: toNum(row.estudiante_id),
      codigo: row.codigo_estudiante ?? null,
      nombreCompleto: row.nombre_completo ?? '',
      matriculaMateriaId: toNum(row.matricula_materia_id),
      asignaturaSigla: row.asignatura_sigla ?? null,
      asignaturaNombre: row.asignatura_nombre ?? null,
      periodoNumero: toNum(row.periodo_numero),
      periodoNombre: row.periodo_nombre ?? null,
      estado: row.estado ?? null,
    }));

    // Totales globales sumando el agregado por carrera × gestión (en la práctica
    // un estudiante pertenece a UNA carrera por gestión: sin doble conteo).
    const resumen = carreras.reduce(
      (acc, fila) => {
        acc.totalMatriculasMateria += fila.totalMatriculasMateria;
        acc.matriculasAbandono += fila.matriculasAbandono;
        acc.matriculasRetiro += fila.matriculasRetiro;
        acc.totalEstudiantes += fila.totalEstudiantes;
        acc.estudiantesDesercion += fila.estudiantesDesercion;
        return acc;
      },
      {
        totalMatriculasMateria: 0,
        matriculasAbandono: 0,
        matriculasRetiro: 0,
        totalEstudiantes: 0,
        estudiantesDesercion: 0,
        pctEstudiantesDesercion: null,
      },
    );
    resumen.pctEstudiantesDesercion =
      resumen.totalEstudiantes > 0
        ? round2((100 * resumen.estudiantesDesercion) / resumen.totalEstudiantes)
        : null;

    this.logger.info('[Académico] Deserción listada', {
      gestionId: gestionNum,
      carreraId: carreraNum,
      carreras: carreras.length,
      desertores: desertores.length,
    });

    return { gestionId: gestionNum, carreraId: carreraNum, carreras, desertores, resumen };
  }
}

export default GetDesercionUseCase;
