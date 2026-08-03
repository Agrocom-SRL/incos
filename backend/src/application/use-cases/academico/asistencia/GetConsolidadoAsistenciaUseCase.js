/**
 * Consolidado % de asistencia por paralelo (página "Consolidado %" de ACA-ASI,
 * permiso `academico.asistencia.consolidado.ver` — reemplaza al retirado
 * `reportes.asistencia` del módulo REP disuelto).
 *
 * Lee la vista 169 en formato LARGO (una fila por estudiante × curso ×
 * bimestre) y la PIVOTA a matriz (patrón centralizador): columnas =
 * asignaturas del paralelo (identidad = oferta_curso_id), filas = estudiantes.
 * Cada celda lleva sesiones computadas, faltas no neutralizadas (AUSENTE = 1,
 * TARDANZA = 0.5, licencia APROBADA neutraliza) y % de asistencia — MISMAS
 * reglas que la nota de la actividad ASISTENCIA del cuaderno, para que el
 * número coincida en ambas pantallas.
 *
 * Con `bimestre` (1..4) devuelve ese bimestre; sin él, el ACUMULADO ANUAL
 * (suma de sesiones y faltas de los bimestres con registro).
 */

import { ValidationError } from '../../../../domain/errors/AppError.js';

const toNum = (value) => (value == null ? null : Number(value));

const pct = (sesiones, faltas) => {
  if (!sesiones || sesiones <= 0) return null;
  return Math.round(((100 * (sesiones - faltas)) / sesiones + Number.EPSILON) * 100) / 100;
};

export class GetConsolidadoAsistenciaUseCase {
  constructor({ asistenciaConsolidadoViewRepository, logger }) {
    if (!asistenciaConsolidadoViewRepository) {
      throw new Error('asistenciaConsolidadoViewRepository es requerido');
    }
    if (!logger) throw new Error('logger es requerido');
    this.asistenciaConsolidadoViewRepository = asistenciaConsolidadoViewRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number|string} params.paraleloGestionId
   * @param {number|string|null} [params.bimestre] - 1..4; null/omitido = anual.
   */
  async execute({ paraleloGestionId, bimestre = null }) {
    const pgId = Number(paraleloGestionId);
    if (!Number.isFinite(pgId) || pgId < 1) {
      throw new ValidationError('paraleloGestionId inválido');
    }
    let bimestreNum = null;
    if (bimestre != null && bimestre !== '') {
      bimestreNum = Number(bimestre);
      if (!Number.isFinite(bimestreNum) || bimestreNum < 1 || bimestreNum > 4) {
        throw new ValidationError('bimestre inválido (1..4)');
      }
    }

    const rows = await this.asistenciaConsolidadoViewRepository.listarFilasConsolidado({
      paraleloGestionId: pgId,
      bimestre: bimestreNum,
    });
    const safeRows = Array.isArray(rows) ? rows : [];

    const gestionId = safeRows[0]?.gestion_id != null ? Number(safeRows[0].gestion_id) : null;
    const gestionAnio = safeRows[0]?.gestion_anio != null ? Number(safeRows[0].gestion_anio) : null;

    const asignaturasMap = new Map(); // ofertaCursoId -> metadatos del curso
    const estudiantesMap = new Map(); // estudianteId -> { ..., celdas acumulables }

    for (const row of safeRows) {
      const ofertaCursoId = Number(row.oferta_curso_id);
      if (!asignaturasMap.has(ofertaCursoId)) {
        asignaturasMap.set(ofertaCursoId, {
          ofertaCursoId,
          asignacionDocenteId: toNum(row.asignacion_docente_id),
          sigla: row.asignatura_sigla ?? null,
          nombre: row.asignatura_nombre ?? null,
          orden: toNum(row.asignatura_orden),
          docenteNombre: row.docente_nombre ?? null,
          // Estado del registro (ABIERTO/CERRADO): solo tiene sentido por
          // bimestre; en el acumulado anual queda null.
          registroEstado: bimestreNum != null ? (row.registro_estado ?? null) : null,
        });
      }

      const estudianteId = Number(row.estudiante_id);
      if (!estudiantesMap.has(estudianteId)) {
        estudiantesMap.set(estudianteId, {
          estudianteId,
          codigo: row.estudiante_codigo ?? null,
          nombreCompleto: row.estudiante_nombre ?? '',
          asistencia: {},
        });
      }
      const estudiante = estudiantesMap.get(estudianteId);

      // Acumula por celda (con bimestre fijo llega UNA fila por celda; en el
      // acumulado anual llegan hasta 4 y se suman sesiones/faltas).
      const previa = estudiante.asistencia[ofertaCursoId] ?? {
        matriculaMateriaId: toNum(row.matricula_materia_id),
        sesiones: 0,
        faltas: 0,
        ausencias: 0,
        tardanzas: 0,
        licencias: 0,
        pctAsistencia: null,
      };
      previa.sesiones += Number(row.sesiones_computadas) || 0;
      previa.faltas += Number(row.faltas_no_neutralizadas) || 0;
      previa.ausencias += Number(row.ausencias) || 0;
      previa.tardanzas += Number(row.tardanzas) || 0;
      previa.licencias += Number(row.neutralizadas_licencia) || 0;
      previa.pctAsistencia = pct(previa.sesiones, previa.faltas);
      estudiante.asistencia[ofertaCursoId] = previa;
    }

    const asignaturas = Array.from(asignaturasMap.values()).sort((a, b) => {
      const oa = a.orden == null ? Number.POSITIVE_INFINITY : a.orden;
      const ob = b.orden == null ? Number.POSITIVE_INFINITY : b.orden;
      return oa - ob;
    });

    const estudiantes = Array.from(estudiantesMap.values())
      .map((est) => {
        // Promedio general ponderado por sesiones (no promedio simple de %).
        let sesiones = 0;
        let faltas = 0;
        for (const celda of Object.values(est.asistencia)) {
          sesiones += celda.sesiones;
          faltas += celda.faltas;
        }
        return { ...est, promedioPct: pct(sesiones, faltas) };
      })
      .sort((a, b) => String(a.nombreCompleto).localeCompare(String(b.nombreCompleto)));

    this.logger.info('[Asistencia] Consolidado % generado', {
      paraleloGestionId: pgId,
      bimestre: bimestreNum,
      asignaturas: asignaturas.length,
      estudiantes: estudiantes.length,
    });

    return {
      paraleloGestionId: pgId,
      gestionId,
      gestionAnio,
      bimestre: bimestreNum,
      asignaturas,
      estudiantes,
    };
  }
}

export default GetConsolidadoAsistenciaUseCase;
