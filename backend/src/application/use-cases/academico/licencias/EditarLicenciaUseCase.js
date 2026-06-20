import { ValidationError, NotFoundError } from '../../../../domain/errors/AppError.js';
import {
  MOTIVOS_LICENCIAS_VALUES,
  ESTADOS_LICENCIAS,
} from '../../../../domain/constants/licencias.constants.js';
import { toLicenciaDTO } from './licenciaDTO.js';

/** Tope de días de licencia por gestión (formulario INCOS, schema 17). */
const TOPE_DIAS_GESTION = 15;

/**
 * Días calendario inclusivos entre dos fechas ISO (YYYY-MM-DD).
 * @param {string} inicio
 * @param {string} fin
 * @returns {number}
 */
function diasInclusivos(inicio, fin) {
  const start = new Date(`${inicio}T00:00:00`);
  const end = new Date(`${fin}T00:00:00`);
  const ms = end.getTime() - start.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Edita una solicitud de licencia (motivo, detalle y rango de fechas). Solo se editan
 * licencias en estado PENDIENTE: una vez decidida (APROBADA/RECHAZADA) o CANCELADA no
 * cambia. No se cambia la inscripción del estudiante. Recalcula totalDias y revalida el
 * tope de 15 días por gestión.
 * Permiso: academico.asistencia.licencia.crear · EDITAR.
 */
export class EditarLicenciaUseCase {
  constructor({ licenseRepository, logger }) {
    this.licenseRepository = licenseRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number} params.usuarioId
   * @param {number} params.id
   * @param {Object} params.body - { fechaInicio, fechaFin, motivo, detalleMotivo }
   * @returns {Promise<{licencia: Object}>}
   */
  async execute({ usuarioId, id, body = {} }) {
    const { fechaInicio, fechaFin, motivo, detalleMotivo } = body;

    const licencia = await this.licenseRepository.findById(id);
    if (!licencia) {
      throw new NotFoundError('Licencia');
    }
    if (licencia.state !== ESTADOS_LICENCIAS.PENDIENTE) {
      throw new ValidationError('Solo se pueden editar licencias en estado PENDIENTE');
    }

    if (!fechaInicio || !fechaFin) {
      throw new ValidationError('El rango de fechas es obligatorio');
    }
    if (new Date(`${fechaFin}T00:00:00`) < new Date(`${fechaInicio}T00:00:00`)) {
      throw new ValidationError('La fecha de fin no puede ser anterior a la de inicio');
    }
    if (!motivo || !MOTIVOS_LICENCIAS_VALUES.includes(motivo)) {
      throw new ValidationError('Motivo de licencia inválido');
    }
    if (!detalleMotivo || !String(detalleMotivo).trim()) {
      throw new ValidationError('El detalle del motivo es obligatorio');
    }

    const totalDias = diasInclusivos(fechaInicio, fechaFin);
    if (totalDias > TOPE_DIAS_GESTION) {
      throw new ValidationError(
        `Una licencia no puede superar ${TOPE_DIAS_GESTION} días por gestión`,
      );
    }
    const diasAprobados = await this.licenseRepository.sumApprovedDaysByInscripcion(
      licencia.enrollmentId,
      { excludeId: id },
    );
    if (diasAprobados + totalDias > TOPE_DIAS_GESTION) {
      throw new ValidationError(
        `Supera el tope de ${TOPE_DIAS_GESTION} días por gestión (aprobados: ${diasAprobados})`,
      );
    }

    await this.licenseRepository.update(
      id,
      {
        startDate: fechaInicio,
        endDate: fechaFin,
        totalDays: totalDias,
        reason: motivo,
        reasonDetail: String(detalleMotivo).trim(),
      },
      usuarioId,
    );

    this.logger?.info('[Licencias] Licencia editada', { id, totalDias });

    const row = await this.licenseRepository.findByIdWithStudentName(id);
    return { licencia: toLicenciaDTO(row) };
  }
}

export default EditarLicenciaUseCase;
