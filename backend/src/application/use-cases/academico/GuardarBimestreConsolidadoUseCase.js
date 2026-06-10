import { ForbiddenError, ValidationError } from '../../../domain/errors/AppError.js';
import { assertCuadernoCursoAccess } from '../../utils/cuadernoCursoAccess.js';
import { cargarCuotasPoliticaGestion } from '../../utils/obtenerCuotasDesdePolitica.js';
import { recalcularNotaFinalMatriculaCurso } from '../../utils/recalcularNotaFinalMatriculaCurso.js';
import { calcularNotaBimestreCerrada } from '../../utils/resolverComponentesBimestreConsolidado.js';

const redondear = (v) => Math.round(Number(v) * 100) / 100;

/**
 * Carga administrativa rápida en bimestre cerrado: persiste habilitacion_teorico / habilitacion_practico
 * y recalcula nota_bimestre con componentes efectivos (habilitación reemplaza nota de cuaderno).
 */
export class GuardarBimestreConsolidadoUseCase {
  constructor({
    calificacionCoordinacionRepository,
    calificacionContextoRepository,
    cuadernoRepository,
    subjectEnrollmentRepository,
    subjectEnrollmentBimesterRepository,
    evaluationConfigurationRepository,
    teacherRepository,
    userRepository,
    authRepository,
    logger,
  }) {
    this.calificacionCoordinacionRepository = calificacionCoordinacionRepository;
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.cuadernoRepository = cuadernoRepository;
    this.subjectEnrollmentRepository = subjectEnrollmentRepository;
    this.subjectEnrollmentBimesterRepository = subjectEnrollmentBimesterRepository;
    this.evaluationConfigurationRepository = evaluationConfigurationRepository;
    this.teacherRepository = teacherRepository;
    this.userRepository = userRepository;
    this.authRepository = authRepository;
    this.logger = logger;
  }

  async execute({ usuarioId, asignacionId, bimestre, body }) {
    const bimestreNum = Number(bimestre);
    if (!Number.isFinite(bimestreNum) || bimestreNum < 1 || bimestreNum > 4) {
      throw new ValidationError('Bimestre inválido');
    }

    const filas = Array.isArray(body?.filas) ? body.filas : [];

    const { bimestreVigente, gestionId } = await assertCuadernoCursoAccess({
      calificacionCoordinacionRepository: this.calificacionCoordinacionRepository,
      calificacionContextoRepository: this.calificacionContextoRepository,
      teacherRepository: this.teacherRepository,
      userRepository: this.userRepository,
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
        'Solo se pueden sobrescribir notas de bimestres cerrados.',
      );
    }

    const { cuotaTeorico, cuotaPractico, pesosBimestres } = await cargarCuotasPoliticaGestion({
      calificacionContextoRepository: this.calificacionContextoRepository,
      evaluationConfigurationRepository: this.evaluationConfigurationRepository,
      gestionId,
    });

    await this.subjectEnrollmentBimesterRepository.asegurarBimestresMatriculaCurso(
      Number(asignacionId),
      bimestreNum,
      usuarioId,
    );

    let guardadas = 0;

    for (const item of filas) {
      const estudianteId = Number(item?.estudianteId);
      if (!Number.isFinite(estudianteId) || estudianteId < 1) continue;

      const tieneTeorico = Object.prototype.hasOwnProperty.call(item, 'teorico');
      const tienePractico = Object.prototype.hasOwnProperty.call(item, 'practico');
      if (!tieneTeorico && !tienePractico) continue;

      const teoricoEntrada = tieneTeorico ? redondear(item.teorico) : undefined;
      const practicoEntrada = tienePractico ? redondear(item.practico) : undefined;

      if (
        (teoricoEntrada != null && (teoricoEntrada < 0 || teoricoEntrada > cuotaTeorico)) ||
        (practicoEntrada != null && (practicoEntrada < 0 || practicoEntrada > cuotaPractico))
      ) {
        throw new ValidationError(
          `Puntos fuera de cuota (teórico ≤ ${cuotaTeorico}, práctico ≤ ${cuotaPractico}).`,
        );
      }

      const bmId = await this.subjectEnrollmentBimesterRepository.asegurarBimestreMatriculaId(
        Number(asignacionId),
        estudianteId,
        bimestreNum,
        usuarioId,
      );
      if (!bmId) continue;

      const actual = await this.subjectEnrollmentBimesterRepository.obtenerBimestreMatriculaPorId(bmId);
      const habTeorico = tieneTeorico ? teoricoEntrada : actual?.habilitacion_teorico ?? null;
      const habPractico = tienePractico ? practicoEntrada : actual?.habilitacion_practico ?? null;

      const notaBim = calcularNotaBimestreCerrada({
        habilitacionTeorico: habTeorico,
        habilitacionPractico: habPractico,
        notaTeorico: actual?.nota_teorico,
        notaPractico: actual?.nota_practico,
      });

      await this.subjectEnrollmentBimesterRepository.actualizarHabilitacionBimestreMatricula(
        bmId,
        {
          habilitacionTeorico: habTeorico,
          habilitacionPractico: habPractico,
          notaBimestre: notaBim,
          fechaHabilitacion: new Date().toISOString().slice(0, 10),
        },
        usuarioId,
      );
      guardadas += 1;
    }

    const recalculoFinal = await recalcularNotaFinalMatriculaCurso({
      cuadernoRepository: this.cuadernoRepository,
      subjectEnrollmentRepository: this.subjectEnrollmentRepository,
      asignacionId: Number(asignacionId),
      pesosBimestres,
      usuarioId,
    });

    this.logger.info('[Calificaciones] Guardado habilitación bimestre consolidado', {
      asignacionId,
      bimestre: bimestreNum,
      guardadas,
      ...recalculoFinal,
    });

    return { guardadas, ...recalculoFinal };
  }
}
