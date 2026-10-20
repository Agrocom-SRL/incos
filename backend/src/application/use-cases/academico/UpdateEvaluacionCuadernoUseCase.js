import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../../../domain/errors/AppError.js';
import { TIPO_EVALUACION_ASISTENCIA } from '../../../domain/constants/evaluaciones.constants.js';
import { mapEvaluacionEntityToDto } from '../../mappers/cuadernoEvaluacionMapper.js';
import { assertCuadernoCursoAccess } from '../../utils/cuadernoCursoAccess.js';
import { cargarCuotasPoliticaGestion } from '../../utils/obtenerCuotasDesdePolitica.js';
import { validarPuntosActividadEnCuota } from '../../utils/validarPuntosEvaluacion.js';

export class UpdateEvaluacionCuadernoUseCase {
  constructor({
    calificacionCoordinacionRepository,
    calificacionContextoRepository,
    cuadernoRepository,
    subjectEnrollmentBimesterRepository,
    bimesterEvaluationRepository,
    evaluationTypeRepository,
    evaluationConfigurationRepository,
    teacherRepository,
    userRepository,
    authRepository,
    logger,
  }) {
    this.calificacionCoordinacionRepository = calificacionCoordinacionRepository;
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.cuadernoRepository = cuadernoRepository;
    this.subjectEnrollmentBimesterRepository = subjectEnrollmentBimesterRepository;
    this.bimesterEvaluationRepository = bimesterEvaluationRepository;
    this.evaluationTypeRepository = evaluationTypeRepository;
    this.evaluationConfigurationRepository = evaluationConfigurationRepository;
    this.teacherRepository = teacherRepository;
    this.userRepository = userRepository;
    this.authRepository = authRepository;
    this.logger = logger;
  }

  async execute({ usuarioId, asignacionId, bimestre, evaluacionId, body }) {
    const bimestreNum = Number(bimestre);
    const evalId = Number(evaluacionId);

    const { bimestreVigente, gestionId } = await assertCuadernoCursoAccess({
      calificacionCoordinacionRepository: this.calificacionCoordinacionRepository,
      calificacionContextoRepository: this.calificacionContextoRepository,
      teacherRepository: this.teacherRepository,
      userRepository: this.userRepository,
      authRepository: this.authRepository,
      usuarioId,
      asignacionId,
    });

    const reabierto =
      (await this.subjectEnrollmentBimesterRepository.contarBimestreReabiertoCurso(
        Number(asignacionId),
        bimestreNum,
      )) > 0;

    if (bimestreNum !== bimestreVigente && !reabierto) {
      throw new ForbiddenError('Solo puede editar evaluaciones del bimestre vigente o reabierto.');
    }

    const existente = await this.cuadernoRepository.obtenerEvaluacionDeAsignacion(
      evalId,
      Number(asignacionId),
    );
    if (!existente) {
      throw new NotFoundError('Evaluación');
    }
    const periodoId = await this.cuadernoRepository.obtenerPeriodoAcademicoId(gestionId, bimestreNum);
    if (!periodoId || Number(existente.periodo_academico_id) !== Number(periodoId)) {
      throw new NotFoundError('Evaluación');
    }
    if (existente.notas_cerradas && !reabierto) {
      throw new ForbiddenError('Esta evaluación está cerrada y no se puede modificar.');
    }

    const patch = { id: evalId };
    if (body?.tipoEvaluacionId != null) {
      const tipoId = Number(body.tipoEvaluacionId);
      const tipo = await this.evaluationTypeRepository.findById(tipoId);
      if (!tipo) throw new ValidationError('Tipo de evaluación no encontrado');
      patch.evaluationTypeId = tipoId;
    }

    // Asistencia: una sola columna por bimestre, siempre PRACTICO (la nota la calcula el sistema).
    // Su peso en el promedio lo define cada docente con los puntos de la actividad.
    const tipoFinal = patch.evaluationTypeId
      ? await this.evaluationTypeRepository.findById(patch.evaluationTypeId)
      : await this.evaluationTypeRepository.findById(existente.tipo_evaluacion_id);
    const esAsistencia = tipoFinal?.code === TIPO_EVALUACION_ASISTENCIA;
    if (esAsistencia) {
      if (body?.componente != null && body.componente !== 'PRACTICO') {
        throw new ValidationError('La asistencia siempre es del componente práctico.');
      }
      if (patch.evaluationTypeId) {
        const columnas = await this.cuadernoRepository.listarColumnasAsistenciaBimestre(
          Number(asignacionId),
          gestionId,
          bimestreNum
        );
        if ((columnas ?? []).some((c) => Number(c.evaluacionId) !== evalId)) {
          throw new ValidationError(
            'Ya existe una actividad de asistencia en este bimestre. Solo se permite una.'
          );
        }
      }
      patch.component = 'PRACTICO';
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
    if ('fecha' in (body ?? {})) {
      patch.date = body.fecha ?? null;
    }

    const componenteFinal = patch.component ?? existente.componente;
    const puntosEntrada = body?.puntos != null ? body.puntos : existente.puntos;

    if (body?.puntos != null || body?.componente != null) {
      const cuotas = await cargarCuotasPoliticaGestion({
      calificacionContextoRepository: this.calificacionContextoRepository,
      evaluationConfigurationRepository: this.evaluationConfigurationRepository,
      gestionId,
    });

      const existentes = await this.cuadernoRepository.listarEvaluaciones(
        Number(asignacionId),
        existente.periodo_academico_id,
      );

      patch.points = validarPuntosActividadEnCuota({
        evaluaciones: existentes.map((e) => ({
          id: e.id,
          componente: e.componente,
          puntos: e.puntos,
        })),
        componente: componenteFinal,
        puntos: puntosEntrada,
        evaluacionIdExcluir: evalId,
        cuotas,
      });
    }

    const updated = await this.bimesterEvaluationRepository.update(evalId, patch, usuarioId);
    return mapEvaluacionEntityToDto(updated);
  }
}
