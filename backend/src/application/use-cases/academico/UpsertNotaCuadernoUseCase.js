import {
  ForbiddenError,
  ValidationError,
} from '../../../domain/errors/AppError.js';
import { assertCuadernoCursoAccess } from '../../utils/cuadernoCursoAccess.js';
import { persistirNotaCuadernoCelda } from '../../utils/persistirNotaCuadernoCelda.js';

/**
 * PUT celda del cuaderno — carga perezosa en evaluaciones_notas.
 */
export class UpsertNotaCuadernoUseCase {
  constructor({
    calificacionCoordinacionRepository,
    calificacionContextoRepository,
    cuadernoRepository,
    teacherRepository,
    authRepository,
    logger,
  }) {
    this.calificacionCoordinacionRepository = calificacionCoordinacionRepository;
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.cuadernoRepository = cuadernoRepository;
    this.teacherRepository = teacherRepository;
    this.authRepository = authRepository;
    this.logger = logger;
  }

  async execute({ usuarioId, asignacionId, bimestre, body }) {
    const bimestreNum = Number(bimestre);
    if (!Number.isFinite(bimestreNum) || bimestreNum < 1 || bimestreNum > 4) {
      throw new ValidationError('Bimestre inválido');
    }

    const estudianteId = Number(body?.estudianteId);
    const evaluacionId = Number(body?.evaluacionId);
    if (!Number.isFinite(estudianteId) || estudianteId < 1) {
      throw new ValidationError('Estudiante requerido');
    }
    if (!Number.isFinite(evaluacionId) || evaluacionId < 1) {
      throw new ValidationError('Evaluación requerida');
    }

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
        'Solo podés cargar notas en el bimestre vigente de la gestión.',
      );
    }

    const resultado = await persistirNotaCuadernoCelda({
      cuadernoRepository: this.cuadernoRepository,
      asignacionId: Number(asignacionId),
      bimestreNum,
      gestionId,
      estudianteId,
      evaluacionId,
      notaRaw: body?.nota,
      usuarioId,
    });

    this.logger.info('[Calificaciones] Nota guardada', {
      asignacionId,
      bimestre: bimestreNum,
      estudianteId,
      evaluacionId,
      nota: resultado.nota,
    });

    return resultado;
  }
}
