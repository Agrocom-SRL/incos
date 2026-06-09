import { ForbiddenError, NotFoundError } from '../../../domain/errors/AppError.js';
import { BimesterEvaluation } from '../../../domain/entities/BimesterEvaluation.js';
import { mapEvaluacionEntityToDto } from '../../mappers/cuadernoEvaluacionMapper.js';
import { assertCuadernoCursoAccess } from '../../utils/cuadernoCursoAccess.js';
import { RegistroPedagogicoExcelBuilder } from '../../../infrastructure/external/excel/RegistroPedagogicoExcelBuilder.js';
import { IncosPDFBase } from '../../../infrastructure/external/pdf/IncosPDFBase.js';

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
  'diciembre',
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

const sanitizarFilePart = (value) =>
  String(value ?? '')
    .replace(/[^\dA-Za-z._-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 40) || 'export';

/**
 * Exporta Registro Pedagógico Bimestral (.xlsx) para bimestre cerrado.
 */
export class ExportRegistroPedagogicoBimestreUseCase {
  constructor({
    calificacionCoordinacionRepository,
    calificacionContextoRepository,
    cuadernoRepository,
    teacherRepository,
    userRepository,
    authRepository,
    logger,
  }) {
    this.calificacionCoordinacionRepository = calificacionCoordinacionRepository;
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.cuadernoRepository = cuadernoRepository;
    this.teacherRepository = teacherRepository;
    this.userRepository = userRepository;
    this.authRepository = authRepository;
    this.logger = logger;
  }

  /**
   * @param {{ usuarioId: number, asignacionId: number|string, bimestre: number|string }} input
   * @returns {Promise<{ buffer: Buffer, fileName: string, mimeType: string }>}
   */
  async execute({ usuarioId, asignacionId, bimestre }) {
    const bimestreNum = Number(bimestre);
    if (!Number.isFinite(bimestreNum) || bimestreNum < 1 || bimestreNum > 4) {
      throw new NotFoundError('Bimestre');
    }

    const asignacionIdNum = Number(asignacionId);
    const { bimestreVigente, gestionId } = await assertCuadernoCursoAccess({
      calificacionCoordinacionRepository: this.calificacionCoordinacionRepository,
      calificacionContextoRepository: this.calificacionContextoRepository,
      teacherRepository: this.teacherRepository,
      userRepository: this.userRepository,
      authRepository: this.authRepository,
      usuarioId,
      asignacionId: asignacionIdNum,
    });

    const periodos = await this.calificacionContextoRepository.obtenerPeriodosBimestresGestion(gestionId);
    const periodoMeta = (periodos ?? []).find((p) => Number(p.numero_orden) === bimestreNum);
    const estadoCalendario = periodoMeta?.estado_calendario ?? 'futuro';
    const cerrado = estadoCalendario === 'cerrado' || bimestreNum < bimestreVigente;

    if (!cerrado) {
      throw new ForbiddenError(
        'El registro pedagógico solo está disponible para bimestres cerrados.',
      );
    }

    const periodoId = await this.cuadernoRepository.obtenerPeriodoAcademicoId(gestionId, bimestreNum);
    if (!periodoId) {
      throw new NotFoundError('Periodo académico del bimestre');
    }

    const ctx = await this.calificacionContextoRepository.obtenerContextoVigente();
    const cursoRow =
      await this.calificacionCoordinacionRepository.obtenerCursoPorAsignacion(asignacionIdNum);
    if (!cursoRow) {
      throw new NotFoundError('Curso');
    }

    const docenteRow = await this.calificacionCoordinacionRepository.obtenerDocenteCalificaciones(
      Number(cursoRow.docente_id),
    );

    const [filasEval, filasEst, filasNotas] = await Promise.all([
      this.cuadernoRepository.listarEvaluaciones(asignacionIdNum, periodoId),
      this.cuadernoRepository.listarEstudiantesExportRegistroPedagogico(asignacionIdNum),
      this.cuadernoRepository.listarTodasNotasBimestreCuaderno(asignacionIdNum, bimestreNum),
    ]);

    const evaluaciones = filasEval.map((row) =>
      mapEvaluacionEntityToDto(
        new BimesterEvaluation({
          id: row.id,
          teacherAssignmentId: asignacionIdNum,
          academicPeriodId: periodoId,
          evaluationTypeId: row.tipo_evaluacion_id,
          component: row.componente,
          evaluationName: row.nombre_evaluacion,
          points: row.puntos,
          date: row.fecha,
          gradesClosed: Boolean(row.notas_cerradas),
        }),
      ),
    );

    const practicas = evaluaciones.filter((e) => e.componente === 'PRACTICO');
    const teoricas = evaluaciones.filter((e) => e.componente !== 'PRACTICO');

    const notasMap = new Map();
    for (const row of filasNotas) {
      const key = `${Number(row.estudiante_id)}::${Number(row.evaluacion_id)}`;
      notasMap.set(key, row.nota != null ? Number(row.nota) : 0);
    }

    const estudiantes = filasEst.map((row, index) => {
      const estudianteId = Number(row.estudiante_id);
      const nombreCompleto = String(row.nombre_export ?? row.nombre ?? '').toUpperCase();

      const notasPracticas = practicas.map((ev) => {
        const key = `${estudianteId}::${ev.id}`;
        const raw = notasMap.get(key);
        return raw != null && Number.isFinite(Number(raw)) ? Math.round(Number(raw)) : 0;
      });

      const notasTeoricas = teoricas.map((ev) => {
        const key = `${estudianteId}::${ev.id}`;
        const raw = notasMap.get(key);
        return raw != null && Number.isFinite(Number(raw)) ? Math.round(Number(raw)) : 0;
      });

      return {
        nro: index + 1,
        nombre: nombreCompleto,
        sexo: mapGeneroSexo(row.genero),
        ci: row.ci ?? '',
        notas_practicas: notasPracticas,
        notas_teoricas: notasTeoricas,
      };
    });

    const payload = {
      institucion: IncosPDFBase?.INSTITUTE?.name ?? 'INCOS SANTA CRUZ',
      carrera: cursoRow.carrera_nombre ?? '',
      asignatura: cursoRow.materia_nombre ?? '',
      codigo_asignatura: cursoRow.materia_sigla ?? '',
      docente: docenteRow?.docente_nombre ?? '',
      curso: cursoRow.asignatura_periodo_nombre ?? '',
      paralelo: extraerParalelo(cursoRow.paralelo_nombre),
      gestion:
        ctx?.gestion_anio != null
          ? String(ctx.gestion_anio)
          : ctx?.gestion_nombre != null
            ? String(ctx.gestion_nombre)
            : '',
      bimestre: BIMESTRE_ORDINAL[bimestreNum - 1] ?? String(bimestreNum),
      fecha_emision: formatearFechaEmision(),
      evaluaciones_practicas: practicas.map((ev) => ({
        nombre: formatearNombreEvaluacion(ev.nombre, ev.fecha),
        puntaje_maximo: ev.puntos != null ? Number(ev.puntos) : 0,
      })),
      evaluaciones_teoricas: teoricas.map((ev) => ({
        nombre: formatearNombreEvaluacion(ev.nombre, ev.fecha),
        puntaje_maximo: ev.puntos != null ? Number(ev.puntos) : 0,
      })),
      estudiantes,
    };

    const buffer = await RegistroPedagogicoExcelBuilder.generar(payload);
    const safeCodigo = sanitizarFilePart(payload.codigo_asignatura);
    const safeBimestre = sanitizarFilePart(payload.bimestre);
    const safeGestion = sanitizarFilePart(payload.gestion);
    const fileName = `registro_pedagogico_${safeCodigo}_${safeBimestre}_${safeGestion}.xlsx`;

    this.logger.info('[Calificaciones] Registro pedagógico exportado', {
      asignacionId: asignacionIdNum,
      bimestre: bimestreNum,
      estudiantes: estudiantes.length,
      fileName,
    });

    return {
      buffer: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer),
      fileName,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }
}
