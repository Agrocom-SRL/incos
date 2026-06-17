import { ValidationError, NotFoundError } from '../../../../domain/errors/AppError.js';
import { ESTADOS_LICENCIAS } from '../../../../domain/constants/licencias.constants.js';
import { toLicenciaDTO } from './licenciaDTO.js';

/** Tope de días de licencia por gestión (formulario INCOS, schema 17). */
const TOPE_DIAS_GESTION = 15;

const DECISIONES = { APROBAR: 'APROBAR', RECHAZAR: 'RECHAZAR' };

/**
 * Aprueba o rechaza una licencia PENDIENTE.
 * Permiso: academico.asistencia.licencia.aprobar · APROBAR.
 */
export class DecidirLicenciaUseCase {
  constructor({ licenseRepository, logger }) {
    this.licenseRepository = licenseRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number} params.usuarioId
   * @param {number} params.id
   * @param {Object} params.body - { decision, motivoRechazo?, observacionesDecision? }
   * @returns {Promise<{licencia: Object}>}
   */
  async execute({ usuarioId, id, body = {} }) {
    const { decision, motivoRechazo, observacionesDecision } = body;

    if (!decision || !Object.values(DECISIONES).includes(decision)) {
      throw new ValidationError('Decisión inválida (APROBAR o RECHAZAR)');
    }

    const licencia = await this.licenseRepository.findById(id);
    if (!licencia) {
      throw new NotFoundError('Licencia');
    }
    if (licencia.state !== ESTADOS_LICENCIAS.PENDIENTE) {
      throw new ValidationError('Solo se pueden decidir licencias en estado PENDIENTE');
    }

    if (decision === DECISIONES.APROBAR) {
      const diasAprobados = await this.licenseRepository.sumApprovedDaysByInscripcion(
        licencia.enrollmentId,
        { excludeId: id },
      );
      if (diasAprobados + (licencia.totalDays ?? 0) > TOPE_DIAS_GESTION) {
        throw new ValidationError(
          `Aprobar supera el tope de ${TOPE_DIAS_GESTION} días por gestión (aprobados: ${diasAprobados})`,
        );
      }
    } else if (!motivoRechazo || !String(motivoRechazo).trim()) {
      throw new ValidationError('El motivo de rechazo es obligatorio');
    }

    const nuevoEstado =
      decision === DECISIONES.APROBAR ? ESTADOS_LICENCIAS.APROBADA : ESTADOS_LICENCIAS.RECHAZADA;

    await this.licenseRepository.update(
      id,
      {
        state: nuevoEstado,
        rejectionReason:
          decision === DECISIONES.RECHAZAR ? String(motivoRechazo).trim() : null,
        decisionObservations: observacionesDecision
          ? String(observacionesDecision).trim()
          : null,
      },
      usuarioId,
    );

    this.logger?.info('[Licencias] Decisión aplicada', { id, decision, nuevoEstado });

    const row = await this.licenseRepository.findByIdWithStudentName(id);
    return { licencia: toLicenciaDTO(row) };
  }
}

export default DecidirLicenciaUseCase;
