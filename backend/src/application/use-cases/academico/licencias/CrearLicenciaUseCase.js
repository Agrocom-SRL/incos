import { ValidationError, NotFoundError } from '../../../../domain/errors/AppError.js';
import {
  MOTIVOS_LICENCIAS_VALUES,
  ESTADOS_LICENCIAS,
} from '../../../../domain/constants/licencias.constants.js';
import { parseFechaISO, parseIdPositivo } from '../../../utils/validacionEntrada.js';
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
 * Crea una solicitud de licencia estudiantil (estado inicial PENDIENTE).
 * Permiso: academico.asistencia.licencia.crear · CREAR.
 */
export class CrearLicenciaUseCase {
  constructor({ licenseRepository, logger }) {
    this.licenseRepository = licenseRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {number} params.usuarioId
   * @param {Object} params.body - { inscripcionId, fechaInicio, fechaFin, motivo, detalleMotivo }
   * @returns {Promise<{licencia: Object}>}
   */
  async execute({ usuarioId, body = {} }) {
    const { motivo, detalleMotivo } = body;

    if (!body.inscripcionId) {
      throw new ValidationError('La inscripción es obligatoria');
    }
    const inscripcionId = parseIdPositivo(body.inscripcionId, 'inscripcionId');
    if (!body.fechaInicio || !body.fechaFin) {
      throw new ValidationError('El rango de fechas es obligatorio');
    }
    const fechaInicio = parseFechaISO(body.fechaInicio, 'fechaInicio');
    const fechaFin = parseFechaISO(body.fechaFin, 'fechaFin');
    if (fechaFin < fechaInicio) {
      throw new ValidationError('La fecha de fin no puede ser anterior a la de inicio');
    }
    if (!motivo || !MOTIVOS_LICENCIAS_VALUES.includes(motivo)) {
      throw new ValidationError('Motivo de licencia inválido');
    }
    if (!detalleMotivo || !String(detalleMotivo).trim()) {
      throw new ValidationError('El detalle del motivo es obligatorio');
    }

    const inscripcion = await this.licenseRepository.getInscripcionInfo(inscripcionId);
    if (!inscripcion) {
      throw new NotFoundError('Inscripción');
    }

    const totalDias = diasInclusivos(fechaInicio, fechaFin);
    if (totalDias > TOPE_DIAS_GESTION) {
      throw new ValidationError(
        `Una licencia no puede superar ${TOPE_DIAS_GESTION} días por gestión`,
      );
    }
    const diasAprobados = await this.licenseRepository.sumApprovedDaysByInscripcion(inscripcionId);
    if (diasAprobados + totalDias > TOPE_DIAS_GESTION) {
      throw new ValidationError(
        `Supera el tope de ${TOPE_DIAS_GESTION} días por gestión (aprobados: ${diasAprobados})`,
      );
    }

    const hoy = new Date().toISOString().slice(0, 10);
    const creada = await this.licenseRepository.create(
      {
        enrollmentId: inscripcionId,
        requestDate: hoy,
        startDate: fechaInicio,
        endDate: fechaFin,
        totalDays: totalDias,
        reason: motivo,
        reasonDetail: String(detalleMotivo).trim(),
        state: ESTADOS_LICENCIAS.PENDIENTE,
      },
      usuarioId,
    );

    this.logger?.info('[Licencias] Solicitud creada', {
      id: creada.id,
      inscripcionId,
      totalDias,
    });

    const row = await this.licenseRepository.findByIdWithStudentName(creada.id);
    return { licencia: toLicenciaDTO(row) };
  }
}

export default CrearLicenciaUseCase;
