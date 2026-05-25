import { ForbiddenError, ValidationError } from '../../../domain/errors/AppError.js';
import { assertCuadernoCursoAccess } from '../../utils/cuadernoCursoAccess.js';
import { cargarCuotasPoliticaGestion } from '../../utils/obtenerCuotasDesdePolitica.js';
import { persistirNotaCuadernoCelda } from '../../utils/persistirNotaCuadernoCelda.js';
import { recalcularNotasBimestreCurso } from '../../utils/recalcularNotasBimestreCurso.js';
import { recalcularNotaFinalMatriculaCurso } from '../../utils/recalcularNotaFinalMatriculaCurso.js';

/**
 * Guarda notas del cuaderno (lote) y recalcula bimestre + nota_final.
 */
export class GuardarNotasCuadernoBimestreUseCase {
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

    const notasEntrada = Array.isArray(body?.notas) ? body.notas : [];

    const { bimestreVigente, gestionId } = await assertCuadernoCursoAccess({
      calificacionCoordinacionRepository: this.calificacionCoordinacionRepository,
      calificacionContextoRepository: this.calificacionContextoRepository,
      teacherRepository: this.teacherRepository,
      authRepository: this.authRepository,
      usuarioId,
      asignacionId,
    });

    if (bimestreNum !== bimestreVigente) {
      throw new ForbiddenError(
        'Solo podés guardar notas en el bimestre vigente de la gestión.',
      );
    }

    await this.cuadernoRepository.asegurarBimestresMatriculaCurso(
      Number(asignacionId),
      bimestreVigente,
      usuarioId,
    );

    const guardadas = [];
    for (const item of notasEntrada) {
      const estudianteId = Number(item?.estudianteId);
      const evaluacionId = Number(item?.evaluacionId);
      if (!Number.isFinite(estudianteId) || estudianteId < 1) {
        throw new ValidationError('Estudiante inválido en el lote');
      }
      if (!Number.isFinite(evaluacionId) || evaluacionId < 1) {
        throw new ValidationError('Evaluación inválida en el lote');
      }

      const dto = await persistirNotaCuadernoCelda({
        cuadernoRepository: this.cuadernoRepository,
        asignacionId: Number(asignacionId),
        bimestreNum,
        gestionId,
        estudianteId,
        evaluacionId,
        notaRaw: item?.nota,
        usuarioId,
      });
      guardadas.push(dto);
    }

    const { cuotaTeorico, cuotaPractico, pesosBimestres } = await cargarCuotasPoliticaGestion({
      calificacionContextoRepository: this.calificacionContextoRepository,
      evaluationConfigurationRepository: this.evaluationConfigurationRepository,
      gestionId,
    });

    const recalculoBimestre = await recalcularNotasBimestreCurso({
      cuadernoRepository: this.cuadernoRepository,
      asignacionId: Number(asignacionId),
      bimestreNumero: bimestreNum,
      cuotaTeorico,
      cuotaPractico,
      usuarioId,
    });

    const recalculoFinal = await recalcularNotaFinalMatriculaCurso({
      cuadernoRepository: this.cuadernoRepository,
      asignacionId: Number(asignacionId),
      pesosBimestres,
      usuarioId,
    });

    this.logger.info('[Calificaciones] Cuaderno guardado y recalculado', {
      asignacionId,
      bimestre: bimestreNum,
      notasGuardadas: guardadas.length,
      ...recalculoBimestre,
      ...recalculoFinal,
    });

    return {
      notas: guardadas,
      notasGuardadas: guardadas.length,
      ...recalculoBimestre,
      ...recalculoFinal,
    };
  }
}
