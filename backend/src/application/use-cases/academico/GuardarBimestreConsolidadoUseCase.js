import { ForbiddenError, ValidationError } from '../../../domain/errors/AppError.js';
import { assertCuadernoCursoAccess } from '../../utils/cuadernoCursoAccess.js';
import { cargarCuotasPoliticaGestion } from '../../utils/obtenerCuotasDesdePolitica.js';
import { recalcularNotaFinalMatriculaCurso } from '../../utils/recalcularNotaFinalMatriculaCurso.js';

const redondear = (v) => Math.round(Number(v) * 100) / 100;

/**
 * Sobrescribe nota_teorico / nota_practico / nota_bimestre en bimestre cerrado (carga administrativa).
 */
export class GuardarBimestreConsolidadoUseCase {
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

    const { cuotaTeorico, cuotaPractico } = await cargarCuotasPoliticaGestion({
      calificacionContextoRepository: this.calificacionContextoRepository,
      evaluationConfigurationRepository: this.evaluationConfigurationRepository,
      gestionId,
    });

    await this.cuadernoRepository.asegurarBimestresMatriculaCurso(
      Number(asignacionId),
      bimestreNum,
      usuarioId,
    );

    let guardadas = 0;

    for (const item of filas) {
      const estudianteId = Number(item?.estudianteId);
      if (!Number.isFinite(estudianteId) || estudianteId < 1) continue;

      const teorico = item.teorico != null ? redondear(item.teorico) : 0;
      const practico = item.practico != null ? redondear(item.practico) : 0;

      if (teorico < 0 || teorico > cuotaTeorico || practico < 0 || practico > cuotaPractico) {
        throw new ValidationError(
          `Puntos fuera de cuota (teórico ≤ ${cuotaTeorico}, práctico ≤ ${cuotaPractico}).`,
        );
      }

      const bmId = await this.cuadernoRepository.asegurarBimestreMatriculaId(
        Number(asignacionId),
        estudianteId,
        bimestreNum,
        usuarioId,
      );
      if (!bmId) continue;

      const notaBim = redondear(teorico + practico);

      await this.cuadernoRepository.actualizarComponentesBimestreMatricula(
        bmId,
        { teorico, practico, bimestre: notaBim },
        usuarioId,
      );
      guardadas += 1;
    }

    await recalcularNotaFinalMatriculaCurso(
      this.cuadernoRepository,
      Number(asignacionId),
      usuarioId,
    );

    this.logger.info('[Calificaciones] Guardado bimestre consolidado', {
      asignacionId,
      bimestre: bimestreNum,
      guardadas,
    });

    return { guardadas };
  }
}
