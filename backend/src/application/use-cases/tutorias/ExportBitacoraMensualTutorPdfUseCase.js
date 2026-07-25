import { ValidationError } from '../../../domain/errors/AppError.js';
import { ProyectoGradoMapper } from '../../mappers/tutorias/index.js';

/**
 * Use Case: ExportBitacoraMensualTutorPdfUseCase (T5)
 * Módulo: Tutorías (TUT · titulación)
 *
 * Genera el PDF del reporte mensual de tutorías por tutor (planilla DDE)
 * desde la vista 163 (vista_base_tutoria_bitacora_mensual_tutor).
 */
export class ExportBitacoraMensualTutorPdfUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.proyectoGradoListadoViewRepository - Vista 163
   * @param {Object} params.managementRepository - Año de gestión para el PDF
   * @param {Object} params.bitacoraMensualTutorPdfGenerator - IBitacoraMensualTutorPdfGenerator
   * @param {ILogger} params.logger
   */
  constructor({
    proyectoGradoListadoViewRepository,
    managementRepository,
    bitacoraMensualTutorPdfGenerator,
    logger,
  }) {
    this.proyectoGradoListadoViewRepository = proyectoGradoListadoViewRepository;
    this.managementRepository = managementRepository;
    this.bitacoraMensualTutorPdfGenerator = bitacoraMensualTutorPdfGenerator;
    this.logger = logger;
  }

  /**
   * @param {{ mes: string, gestionId?: number, tutorId?: number }} input
   * @returns {Promise<{buffer: Buffer, fileName: string, mimeType: string}>}
   */
  async execute({ mes, gestionId, tutorId } = {}) {
    if (!mes || !/^\d{4}-\d{2}$/.test(String(mes))) {
      throw new ValidationError('mes es requerido con formato YYYY-MM');
    }

    const rows = await this.proyectoGradoListadoViewRepository.findBitacoraMensual({
      mes,
      gestionId: gestionId ? Number(gestionId) : undefined,
      tutorId: tutorId ? Number(tutorId) : undefined,
    });

    let gestionAnio = null;
    if (gestionId) {
      const gestion = await this.managementRepository.findById(Number(gestionId));
      const plain = gestion?.toPlainObject?.() ?? gestion;
      gestionAnio = plain?.year ?? plain?.anio ?? null;
    }

    const buffer = await this.bitacoraMensualTutorPdfGenerator.generate({
      mes,
      gestionAnio,
      filas: ProyectoGradoMapper.bitacoraMensualRowsToPresentation(rows),
    });

    this.logger.info('[Tutorías] Reporte mensual de bitácora exportado', {
      mes,
      gestionId,
      tutorId,
      filas: rows.length,
    });

    return {
      buffer,
      fileName: `reporte_tutorias_${mes}.pdf`,
      mimeType: 'application/pdf',
    };
  }
}
