import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../../../domain/errors/AppError.js';
import { mapEvaluacionEntityToDto } from '../../mappers/cuadernoEvaluacionMapper.js';
import { assertCuadernoCursoAccess } from '../../utils/cuadernoCursoAccess.js';

export class UpdateEvaluacionCuadernoUseCase {
  constructor({
    calificacionRepository,
    cuadernoRepository,
    bimesterEvaluationRepository,
    evaluationTypeRepository,
    teacherRepository,
    authRepository,
    logger,
  }) {
    this.calificacionRepository = calificacionRepository;
    this.cuadernoRepository = cuadernoRepository;
    this.bimesterEvaluationRepository = bimesterEvaluationRepository;
    this.evaluationTypeRepository = evaluationTypeRepository;
    this.teacherRepository = teacherRepository;
    this.authRepository = authRepository;
    this.logger = logger;
  }

  async execute({ usuarioId, asignacionId, bimestre, evaluacionId, body }) {
    const bimestreNum = Number(bimestre);
    const evalId = Number(evaluacionId);

    const { bimestreVigente } = await assertCuadernoCursoAccess({
      calificacionRepository: this.calificacionRepository,
      teacherRepository: this.teacherRepository,
      authRepository: this.authRepository,
      usuarioId,
      asignacionId,
    });

    if (bimestreNum !== bimestreVigente) {
      throw new ForbiddenError('Solo podés editar evaluaciones del bimestre vigente.');
    }

    const existente = await this.cuadernoRepository.obtenerEvaluacionDeAsignacion(
      evalId,
      Number(asignacionId),
    );
    if (!existente) {
      throw new NotFoundError('Evaluación');
    }
    if (existente.notas_cerradas) {
      throw new ForbiddenError('Esta evaluación está cerrada y no se puede modificar.');
    }

    const patch = { id: evalId };
    if (body?.tipoEvaluacionId != null) {
      const tipoId = Number(body.tipoEvaluacionId);
      const tipo = await this.evaluationTypeRepository.findById(tipoId);
      if (!tipo) throw new ValidationError('Tipo de evaluación no encontrado');
      patch.evaluationTypeId = tipoId;
    }
    if (body?.nombre != null) {
      const nombre = String(body.nombre).trim();
      if (!nombre) throw new ValidationError('Nombre requerido');
      patch.evaluationName = nombre;
    }
    if (body?.componente != null) {
      if (body.componente !== 'TEORICO' && body.componente !== 'PRACTICO') {
        throw new ValidationError('Componente inválido');
      }
      patch.component = body.componente;
    }
    if (body?.peso != null) {
      const peso = Number(body.peso);
      if (!Number.isFinite(peso) || peso <= 0 || peso > 100) {
        throw new ValidationError('Peso inválido');
      }
      patch.weight = peso;
    }
    if ('fecha' in (body ?? {})) {
      patch.date = body.fecha ?? null;
    }

    const updated = await this.bimesterEvaluationRepository.update(evalId, patch, usuarioId);
    return mapEvaluacionEntityToDto(updated);
  }
}
