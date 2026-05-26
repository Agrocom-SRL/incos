import { ForbiddenError, NotFoundError } from '../../../domain/errors/AppError.js';
import { BimesterEvaluation } from '../../../domain/entities/BimesterEvaluation.js';
import {
  mapEvaluacionEntityToDto,
} from '../../mappers/cuadernoEvaluacionMapper.js';
import { assertCuadernoCursoAccess } from '../../utils/cuadernoCursoAccess.js';
import { cargarCuotasPoliticaGestion } from '../../utils/obtenerCuotasDesdePolitica.js';
import { calcularComponentesEstudiante } from '../../utils/calcularResumenBimestreConCeros.js';
import { resolverComponentesBimestreConsolidado } from '../../utils/resolverComponentesBimestreConsolidado.js';
import { calcularNotaBimestre } from '../../utils/cuadernoNotasCalculo.js';

const redondear = (v) => (v == null ? null : Math.round(Number(v) * 100) / 100);

const formatearFecha = (v) => {
  if (v == null || v === '') return null;
  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/**
 * GET bimestre consolidado (cerrado): resumen teórico / práctico / total por estudiante.
 */
export class GetBimestreConsolidadoUseCase {
  constructor({
    calificacionCoordinacionRepository,
    calificacionContextoRepository,
    cuadernoRepository,
    evaluationConfigurationRepository,
    teacherRepository,
    authRepository,
    logger,
  }) {
    this.calificacionCoordinacionRepository = calificacionCoordinacionRepository;
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.cuadernoRepository = cuadernoRepository;
    this.evaluationConfigurationRepository = evaluationConfigurationRepository;
    this.teacherRepository = teacherRepository;
    this.authRepository = authRepository;
    this.logger = logger;
  }

  async execute({ usuarioId, asignacionId, bimestre }) {
    const bimestreNum = Number(bimestre);
    if (!Number.isFinite(bimestreNum) || bimestreNum < 1 || bimestreNum > 4) {
      throw new NotFoundError('Bimestre');
    }

    const { bimestreVigente, gestionId } = await assertCuadernoCursoAccess({
      calificacionCoordinacionRepository: this.calificacionCoordinacionRepository,
      calificacionContextoRepository: this.calificacionContextoRepository,
      teacherRepository: this.teacherRepository,
      authRepository: this.authRepository,
      usuarioId,
      asignacionId,
    });

    const periodos = await this.calificacionContextoRepository.obtenerPeriodosBimestresGestion(gestionId);
    const periodoMeta = (periodos ?? []).find((p) => Number(p.numero_orden) === bimestreNum);
    const estadoCalendario = periodoMeta?.estado_calendario ?? 'futuro';
    const cerrado = estadoCalendario === 'cerrado' || bimestreNum < bimestreVigente;

    if (!cerrado) {
      throw new ForbiddenError(
        'El consolidado del bimestre solo está disponible para bimestres cerrados.',
      );
    }

    const periodoId = await this.cuadernoRepository.obtenerPeriodoAcademicoId(
      gestionId,
      bimestreNum,
    );
    if (!periodoId) {
      throw new NotFoundError('Periodo académico del bimestre');
    }

    const { cuotaTeorico, cuotaPractico } = await cargarCuotasPoliticaGestion({
      calificacionContextoRepository: this.calificacionContextoRepository,
      evaluationConfigurationRepository: this.evaluationConfigurationRepository,
      gestionId,
    });

    const [filasEval, filasEst, filasNotas] = await Promise.all([
      this.cuadernoRepository.listarEvaluaciones(Number(asignacionId), periodoId),
      this.cuadernoRepository.listarEstudiantesResumenBimestre(
        Number(asignacionId),
        bimestreNum,
      ),
      this.cuadernoRepository.listarTodasNotasBimestreCuaderno(
        Number(asignacionId),
        bimestreNum,
      ),
    ]);

    const evaluaciones = filasEval.map((row) =>
      mapEvaluacionEntityToDto(
        new BimesterEvaluation({
          id: row.id,
          teacherAssignmentId: Number(asignacionId),
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

    const evaluacionesDto = evaluaciones.map((e) => ({
      id: e.id,
      nombre: e.nombre,
      componente: e.componente,
      puntos: e.puntos,
    }));

    const notasMap = new Map();
    for (const row of filasNotas) {
      const key = `${Number(row.estudiante_id)}::${Number(row.evaluacion_id)}`;
      notasMap.set(key, row.nota != null ? Number(row.nota) : null);
    }

    const estudiantes = filasEst.map((row, index) => {
      const estudianteId = Number(row.estudiante_id);
      const calculado = calcularComponentesEstudiante(
        evaluacionesDto,
        notasMap,
        estudianteId,
      );

      const resuelto = resolverComponentesBimestreConsolidado({
        habilitacionTeorico: row.habilitacion_teorico,
        habilitacionPractico: row.habilitacion_practico,
        notaTeorico: row.nota_teorico,
        notaPractico: row.nota_practico,
        notaBimestre: row.nota_bimestre,
        calculado,
      });

      const sumaCalculada =
        calcularNotaBimestre(resuelto.notaTeorico, resuelto.notaPractico) ??
        calcularNotaBimestre(resuelto.calculadoTeorico, resuelto.calculadoPractico);
      const tieneAjusteAdmin =
        resuelto.habilitacionTeorico != null || resuelto.habilitacionPractico != null;

      return {
        id: estudianteId,
        nro: index + 1,
        codigo: row.codigo ?? '',
        nombre: row.nombre ?? '',
        bimestreMatriculaId:
          row.bimestre_matricula_id != null ? Number(row.bimestre_matricula_id) : null,
        teorico: resuelto.teorico,
        practico: resuelto.practico,
        total: resuelto.total,
        totalCalculado: sumaCalculada,
        tieneAjusteAdmin,
        fechaHabilitacion: formatearFecha(row.fecha_habilitacion),
        habilitacionTeorico: resuelto.habilitacionTeorico,
        habilitacionPractico: resuelto.habilitacionPractico,
        notaTeorico: resuelto.notaTeorico,
        notaPractico: resuelto.notaPractico,
        calculadoTeorico: resuelto.calculadoTeorico,
        calculadoPractico: resuelto.calculadoPractico,
        fuenteTeorico: resuelto.fuenteTeorico,
        fuentePractico: resuelto.fuentePractico,
        estadoBimestre: row.estado_bimestre ?? null,
      };
    });

    estudiantes.sort((a, b) =>
      String(a.nombre ?? '').localeCompare(String(b.nombre ?? ''), 'es', { sensitivity: 'base' }),
    );
    estudiantes.forEach((e, i) => {
      e.nro = i + 1;
    });

    this.logger.info('[Calificaciones] Bimestre consolidado', {
      asignacionId,
      bimestre: bimestreNum,
      estudiantes: estudiantes.length,
      evaluaciones: evaluacionesDto.length,
    });

    return {
      bimestre: bimestreNum,
      cerrado: true,
      estadoCalendario,
      periodo: {
        nombre: periodoMeta?.nombre ?? null,
        fechaInicio: formatearFecha(periodoMeta?.fecha_inicio),
        fechaFin: formatearFecha(periodoMeta?.fecha_fin),
      },
      cuotaTeorico,
      cuotaPractico,
      evaluaciones: evaluacionesDto,
      estudiantes,
    };
  }
}
