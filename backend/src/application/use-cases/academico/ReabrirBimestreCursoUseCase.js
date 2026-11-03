import { ForbiddenError, NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';

/** Permisos administrativos que habilitan reabrir (mismos que exige la ruta). */
const PERMISOS_REABRIR_BIMESTRE = [
  'academico.calificacion.gestion_bimestres',
  'academico.calificacion.bimestre.ajuste_admin',
];

/**
 * Reabre un bimestre del curso (estado REABIERTO) para permitir editar el cuaderno
 * de un bimestre cerrado. Reglas: solo personal administrativo (no el docente del
 * curso) y solo dentro de la gestión vigente.
 */
export class ReabrirBimestreCursoUseCase {
  constructor({
    calificacionCoordinacionRepository,
    calificacionContextoRepository,
    subjectEnrollmentBimesterRepository,
    teacherRepository,
    userRepository,
    authRepository,
    logger,
  }) {
    this.calificacionCoordinacionRepository = calificacionCoordinacionRepository;
    this.calificacionContextoRepository = calificacionContextoRepository;
    this.subjectEnrollmentBimesterRepository = subjectEnrollmentBimesterRepository;
    this.teacherRepository = teacherRepository;
    this.userRepository = userRepository;
    this.authRepository = authRepository;
    this.logger = logger;
  }

  async execute({ usuarioId, asignacionId, bimestreNum }) {
    const numero = Number(bimestreNum);
    if (!Number.isFinite(numero) || numero < 1 || numero > 4) {
      throw new ValidationError('Bimestre inválido');
    }

    const asignacionIdNum = Number(asignacionId);
    if (!Number.isFinite(asignacionIdNum) || asignacionIdNum < 1) {
      throw new NotFoundError('Asignación');
    }

    // Rol administrativo: el docente del curso NO puede reabrir su propio bimestre.
    let esAdministrativo = false;
    for (const codigo of PERMISOS_REABRIR_BIMESTRE) {
      if (await this.authRepository.tienePermiso(usuarioId, codigo, 'EDITAR')) {
        esAdministrativo = true;
        break;
      }
    }
    if (!esAdministrativo) {
      throw new ForbiddenError('Solo el personal administrativo puede reabrir un bimestre.');
    }

    const cursoRow = await this.calificacionCoordinacionRepository.obtenerCursoPorAsignacion(
      asignacionIdNum,
    );
    if (!cursoRow) {
      throw new NotFoundError('Curso');
    }

    // Solo dentro de una gestión vigente.
    const ctx = await this.calificacionContextoRepository.obtenerContextoVigente();
    if (!ctx?.gestion_id) {
      const err = new Error('No hay gestión académica vigente configurada');
      err.statusCode = 404;
      throw err;
    }
    const bimestreVigente = Number(ctx.bimestre_vigente) || 1;

    // Sin filas en bimestres_matricula el UPDATE de reabrir no afecta ninguna matrícula.
    await this.subjectEnrollmentBimesterRepository.asegurarBimestresMatriculaCurso(
      asignacionIdNum,
      bimestreVigente,
      usuarioId,
    );

    await this.subjectEnrollmentBimesterRepository.reabrirBimestreCurso(
      asignacionIdNum,
      numero,
      usuarioId,
    );

    const reabiertos = await this.subjectEnrollmentBimesterRepository.contarBimestreReabiertoCurso(
      asignacionIdNum,
      numero,
    );

    if (reabiertos === 0) {
      throw new ValidationError(
        'No se pudo reabrir el bimestre: no hay matrículas de bimestre en el curso. ' +
          'Verificá que haya estudiantes inscritos.',
      );
    }

    this.logger.info('[Calificaciones] Bimestre reabierto', {
      asignacionId,
      bimestre: numero,
      reabiertos,
    });

    return { bimestre: numero, reabierto: true, matriculasReabiertas: reabiertos };
  }
}
