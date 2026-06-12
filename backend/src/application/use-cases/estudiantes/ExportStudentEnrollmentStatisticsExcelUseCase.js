import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { ExcelGenerator } from '../../../infrastructure/external/excel/ExcelGenerator.js';

/**
 * Genera el Excel de estadística de inscritos a partir de vista_reporte_excel_inscritos.
 */
export class ExportStudentEnrollmentStatisticsExcelUseCase {
  /**
   * @param {Object} params
   * @param {import('../../../infrastructure/repositories/views/StudentEnrollmentExcelReportRepository.js').StudentEnrollmentExcelReportRepository} params.studentEnrollmentExcelReportRepository
   * @param {import('../../../domain/interfaces/repositories/IGestionRepository.js').IGestionRepository} params.managementRepository
   * @param {Object} params.logger
   */
  constructor({ studentEnrollmentExcelReportRepository, managementRepository, logger }) {
    this.studentEnrollmentExcelReportRepository = studentEnrollmentExcelReportRepository;
    this.managementRepository = managementRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} [params]
   * @param {string|number|null|undefined} [params.gestionId] - Opcional; si no se envía, usa la gestión vigente
   * @returns {Promise<{ buffer: Buffer, fileName: string, mimeType: string }>}
   */
  async execute({ gestionId: rawGestionId } = {}) {
    const gestionId = await this._resolveGestionId(rawGestionId);

    const rows = await this.studentEnrollmentExcelReportRepository.findRowsByGestionId(gestionId);
    const management = await this.managementRepository.findById(gestionId);
    const plain = management?.toPlainObject ? management.toPlainObject() : management;

    const filtros = {
      gestion_anio: plain?.year != null ? String(plain.year) : '',
      gestion_nombre: plain?.name != null ? String(plain.name) : ''
    };

    // Fase 1: solo columnas B:L visibles (inscripción). M:AS quedan generadas y ocultas para activar luego sin reescribir el generador.
    const buffer = await ExcelGenerator.generarReporteInscritos(rows, filtros, { soloInscripcion: true });
    const safeYear = filtros.gestion_anio.replace(/[^\dA-Za-z._-]/g, '_') || String(gestionId);
    const fileName = `estadistica_inscritos_${safeYear}.xlsx`;

    this.logger.info('[Estudiantes] Excel estadística inscritos generado', {
      gestionId,
      filas: rows.length,
      fileName
    });

    return {
      buffer: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer),
      fileName,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
  }

  /**
   * @param {string|number|null|undefined} rawGestionId
   * @returns {Promise<number>}
   */
  async _resolveGestionId(rawGestionId) {
    if (rawGestionId != null && rawGestionId !== '') {
      const id = parseInt(String(rawGestionId), 10);
      if (Number.isNaN(id) || id < 1) {
        throw new ValidationError('gestion_id inválido');
      }
      const m = await this.managementRepository.findById(id);
      if (!m) {
        throw new NotFoundError(`Gestión con ID ${id}`);
      }
      return id;
    }

    const m = await this.managementRepository.findBy({ vigente: true, isActive: true });
    if (!m) {
      throw new ValidationError('No hay una gestión vigente configurada en el sistema');
    }
    const plain = m.toPlainObject ? m.toPlainObject() : m;
    const id = plain?.id ?? m.id;
    if (id == null) {
      throw new ValidationError('No se pudo determinar la gestión vigente');
    }
    return id;
  }
}
