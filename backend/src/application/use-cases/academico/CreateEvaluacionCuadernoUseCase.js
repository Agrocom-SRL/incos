import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../../../domain/errors/AppError.js';
import { BimesterEvaluation } from '../../../domain/entities/BimesterEvaluation.js';
import { mapEvaluacionEntityToDto } from '../../mappers/cuadernoEvaluacionMapper.js';
import { assertCuadernoCursoAccess } from '../../utils/cuadernoCursoAccess.js';
import { cargarCuotasPoliticaGestion } from '../../utils/obtenerCuotasDesdePolitica.js';
import { validarPuntosActividadEnCuota } from '../../utils/validarPuntosEvaluacion.js';

/**
 * POST evaluación del cuaderno bimestral.
 */
export class CreateEvaluacionCuadernoUseCase {
  constructor({
    calificacionCoordinacionRepository,
    calificacionContextoRepository,
    cuadernoRepository,
    bimesterEvaluationRepository,
    evaluationTypeRepository,
    evaluationConfigurationRepository,
    teacherRepository,
    authRepository,
    logger,
  }) {
    this.calificacionCoordinacionRepository = calificacionCoordinacionRepository;
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.cuadernoRepository = cuadernoRepository;
    this.bimesterEvaluationRepository = bimesterEvaluationRepository;
    this.evaluationTypeRepository = evaluationTypeRepository;
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
        'Solo podés crear evaluaciones en el bimestre vigente de la gestión.',
      );
    }

    const periodoId = await this.cuadernoRepository.obtenerPeriodoAcademicoId(
      gestionId,
      bimestreNum,
    );
    if (!periodoId) {
      throw new NotFoundError('Periodo académico del bimestre');
    }

    const tipoId = Number(body?.tipoEvaluacionId);
    if (!Number.isFinite(tipoId) || tipoId < 1) {
      throw new ValidationError('Tipo de evaluación requerido');
    }

    const tipo = await this.evaluationTypeRepository.findById(tipoId);
    if (!tipo) {
      throw new ValidationError('Tipo de evaluación no encontrado');
    }
    const nombre = String(body?.nombre ?? '').trim();
    if (!nombre) {
      throw new ValidationError('Nombre descriptivo requerido');
    }

    const componente = body?.componente;
    if (componente !== 'TEORICO' && componente !== 'PRACTICO') {
      throw new ValidationError('Componente inválido');
    }

    const cuotas = await cargarCuotasPoliticaGestion({
      calificacionContextoRepository: this.calificacionContextoRepository,
      evaluationConfigurationRepository: this.evaluationConfigurationRepository,
      gestionId,
    });

    const existentes = await this.cuadernoRepository.listarEvaluaciones(
      Number(asignacionId),
      periodoId,
    );

    const puntos = validarPuntosActividadEnCuota({
      evaluaciones: existentes.map((e) => ({
        id: e.id,
        componente: e.componente,
        puntos: e.puntos,
      })),
      componente,
      puntos: body?.puntos,
      cuotas,
    });

    const entity = new BimesterEvaluation({
      teacherAssignmentId: Number(asignacionId),
      academicPeriodId: periodoId,
      evaluationTypeId: tipoId,
      component: componente,
      evaluationName: nombre,
      points: puntos,
      date: body?.fecha ?? null,
      gradesClosed: false,
    });

    const created = await this.bimesterEvaluationRepository.create(entity, usuarioId);
    const dto = mapEvaluacionEntityToDto(created);

    this.logger.info('[Calificaciones] Evaluación creada', {
      asignacionId,
      bimestre: bimestreNum,
      evaluacionId: dto.id,
    });

    return dto;
  }
}
