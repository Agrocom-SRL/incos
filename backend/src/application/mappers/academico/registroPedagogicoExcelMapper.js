/**
 * Mapper de aplicación — arma el payload del Registro Pedagógico Bimestral (.xlsx)
 * a partir de las filas crudas de los repositorios.
 *
 * Concentra todo el formateo de presentación (nombres de evaluación con fecha,
 * sexo, paralelo, fecha de emisión) para que el use case quede delgado y la
 * implementación Excel reciba un payload ya normalizado.
 */

import { BimesterEvaluation } from '../../../domain/entities/BimesterEvaluation.js';
import { mapEvaluacionEntityToDto } from '../cuadernoEvaluacionMapper.js';

const BIMESTRE_ORDINAL = ['PRIMER', 'SEGUNDO', 'TERCER', 'CUARTO'];

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre'
];

const formatearFechaEmision = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  const dia = d.getDate();
  const mes = MESES[d.getMonth()] ?? '';
  const anio = d.getFullYear();
  return `Santa Cruz, ${dia} de ${mes} de ${anio}`;
};

const formatearNombreEvaluacion = (nombre, fecha) => {
  const base = String(nombre ?? '').trim();
  if (!fecha || base.match(/\d{1,2}\/\w{3}/i)) return base;
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  if (Number.isNaN(d.getTime())) return base;
  const dia = d.getDate();
  const mes = MESES[d.getMonth()]?.slice(0, 3) ?? '';
  return base ? `${base} - ${dia}/${mes}` : `${dia}/${mes}`;
};

const mapGeneroSexo = (genero) => {
  const g = String(genero ?? '').toUpperCase();
  if (g === 'FEMENINO') return 'F';
  if (g === 'MASCULINO') return 'M';
  if (g === 'OTRO') return 'O';
  return '';
};

const extraerParalelo = (paraleloNombre) => {
  const parts = String(paraleloNombre ?? '')
    .trim()
    .split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1] : String(paraleloNombre ?? '').trim();
};

const formatearGestion = (contexto) => {
  if (contexto?.gestion_anio != null) return String(contexto.gestion_anio);
  if (contexto?.gestion_nombre != null) return String(contexto.gestion_nombre);
  return '';
};

const redondearNota = (raw) =>
  raw != null && Number.isFinite(Number(raw)) ? Math.round(Number(raw)) : 0;

/** Redondeo que preserva null (ausencia de nota administrativa, distinto de un 0 real). */
const redondearOpcional = (raw) =>
  raw != null && Number.isFinite(Number(raw)) ? Math.round(Number(raw)) : null;

/**
 * @param {Object} params
 * @param {number} params.bimestreNum
 * @param {number} params.periodoId
 * @param {number} params.asignacionId
 * @param {Object} params.cursoRow - fila de vista de coordinación del curso.
 * @param {Object|null} params.docenteRow
 * @param {Object|null} params.contexto - contexto de gestión vigente.
 * @param {Array<Object>} params.filasEvaluaciones
 * @param {Array<Object>} params.filasEstudiantes
 * @param {Array<Object>} params.filasNotas
 * @param {Array<Object>} [params.filasResumen] - resumen del bimestre por estudiante;
 *   aporta habilitacion_teorico / habilitacion_practico (notas administrativas).
 * @param {{ cuotaTeorico:number, cuotaPractico:number, notaMinimaAprobacion:number }} [params.politica]
 *   Ponderación institucional vigente (cuotas y nota mínima de aprobación).
 * @param {Date} [params.fechaEmision]
 * @returns {Object} payload para IRegistroPedagogicoExcelGenerator.
 */
export const construirRegistroPedagogicoExcelPayload = ({
  bimestreNum,
  periodoId,
  asignacionId,
  cursoRow,
  docenteRow,
  contexto,
  filasEvaluaciones,
  filasEstudiantes,
  filasNotas,
  filasResumen,
  politica,
  fechaEmision = new Date()
}) => {
  const evaluaciones = (filasEvaluaciones ?? []).map((row) =>
    mapEvaluacionEntityToDto(
      new BimesterEvaluation({
        id: row.id,
        teacherAssignmentId: asignacionId,
        academicPeriodId: periodoId,
        evaluationTypeId: row.tipo_evaluacion_id,
        component: row.componente,
        evaluationName: row.nombre_evaluacion,
        points: row.puntos,
        date: row.fecha,
        gradesClosed: Boolean(row.notas_cerradas)
      })
    )
  );

  const practicas = evaluaciones.filter((e) => e.componente === 'PRACTICO');
  const teoricas = evaluaciones.filter((e) => e.componente !== 'PRACTICO');

  const notasMap = new Map();
  for (const row of filasNotas ?? []) {
    const key = `${Number(row.estudiante_id)}::${Number(row.evaluacion_id)}`;
    notasMap.set(key, row.nota != null ? Number(row.nota) : 0);
  }

  // Habilitaciones (notas administrativas) por estudiante: null = sin habilitación
  // en ese componente; un valor reemplaza la ponderación calculada del docente.
  const habilitacionMap = new Map();
  for (const row of filasResumen ?? []) {
    habilitacionMap.set(Number(row.estudiante_id), {
      teorico: redondearOpcional(row.habilitacion_teorico),
      practico: redondearOpcional(row.habilitacion_practico)
    });
  }

  const estudiantes = (filasEstudiantes ?? []).map((row, index) => {
    const estudianteId = Number(row.estudiante_id);
    const nombreCompleto = String(row.nombre_export ?? row.nombre ?? '').toUpperCase();
    const habilitacion = habilitacionMap.get(estudianteId) ?? {};

    const notasDe = (evals) =>
      evals.map((ev) => redondearNota(notasMap.get(`${estudianteId}::${ev.id}`)));

    return {
      nro: index + 1,
      nombre: nombreCompleto,
      sexo: mapGeneroSexo(row.genero),
      ci: row.ci ?? '',
      notas_practicas: notasDe(practicas),
      notas_teoricas: notasDe(teoricas),
      habilitacion_practico: habilitacion.practico ?? null,
      habilitacion_teorico: habilitacion.teorico ?? null
    };
  });

  const mapearEvaluacion = (ev) => ({
    nombre: formatearNombreEvaluacion(ev.nombre, ev.fecha),
    puntaje_maximo: ev.puntos != null ? Number(ev.puntos) : 0
  });

  const ponderacion = politica ?? {};

  return {
    carrera: cursoRow?.carrera_nombre ?? '',
    asignatura: cursoRow?.materia_nombre ?? '',
    codigo_asignatura: cursoRow?.materia_sigla ?? '',
    cuota_practico: Number(ponderacion.cuotaPractico ?? 70),
    cuota_teorico: Number(ponderacion.cuotaTeorico ?? 30),
    nota_aprobacion: Number(ponderacion.notaMinimaAprobacion ?? 61),
    docente: docenteRow?.docente_nombre ?? '',
    curso: cursoRow?.asignatura_periodo_nombre ?? '',
    paralelo: extraerParalelo(cursoRow?.paralelo_nombre),
    gestion: formatearGestion(contexto),
    bimestre: BIMESTRE_ORDINAL[bimestreNum - 1] ?? String(bimestreNum),
    fecha_emision: formatearFechaEmision(fechaEmision),
    evaluaciones_practicas: practicas.map(mapearEvaluacion),
    evaluaciones_teoricas: teoricas.map(mapearEvaluacion),
    estudiantes
  };
};

export default { construirRegistroPedagogicoExcelPayload };
