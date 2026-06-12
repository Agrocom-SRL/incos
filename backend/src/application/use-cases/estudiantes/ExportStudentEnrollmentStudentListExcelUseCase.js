import { NotFoundError, ValidationError } from '../../../domain/errors/AppError.js';
import { ExcelGenerator } from '../../../infrastructure/external/excel/ExcelGenerator.js';

/**
 * Genera el Excel de lista de inscritos (por carrera) con una hoja por paralelo.
 */
export class ExportStudentEnrollmentStudentListExcelUseCase {
  /**
   * @param {Object} params
   * @param {import('../../../infrastructure/repositories/views/StudentEnrollmentStudentListExcelReportRepository.js').StudentEnrollmentStudentListExcelReportRepository} params.studentEnrollmentStudentListExcelReportRepository
   * @param {import('../../../domain/interfaces/repositories/IGestionRepository.js').IGestionRepository} params.managementRepository
   * @param {import('../../../domain/interfaces/repositories/ICarreraRepository.js').ICarreraRepository} params.careerRepository
   * @param {Object} params.logger
   */
  constructor({
    studentEnrollmentStudentListExcelReportRepository,
    managementRepository,
    careerRepository,
    logger
  }) {
    this.studentEnrollmentStudentListExcelReportRepository = studentEnrollmentStudentListExcelReportRepository;
    this.managementRepository = managementRepository;
    this.careerRepository = careerRepository;
    this.logger = logger;
  }

  /**
   * @param {Object} params
   * @param {string|number|null|undefined} [params.gestionId] - Opcional; si no se envía, usa la gestión vigente
   * @param {string|number|null|undefined} params.carreraId - Requerido
   * @returns {Promise<{ buffer: Buffer, fileName: string, mimeType: string }>}
   */
  async execute({ gestionId: rawGestionId, carreraId: rawCarreraId } = {}) {
    const gestionId = await this._resolveGestionId(rawGestionId);
    const carreraId = this._parseRequiredPositiveInt(rawCarreraId, 'carrera_id inválido');

    const career = await this.careerRepository.findById(carreraId);
    if (!career) {
      throw new NotFoundError(`Carrera con ID ${carreraId}`);
    }

    const management = await this.managementRepository.findById(gestionId);
    const managementPlain = management?.toPlainObject ? management.toPlainObject() : management;
    const careerPlain = career?.toPlainObject ? career.toPlainObject() : career;

    const rows = await this.studentEnrollmentStudentListExcelReportRepository.findRowsByGestionIdAndCarreraId(
      gestionId,
      carreraId
    );

    const filtros = {
      gestion_anio:
        managementPlain?.year != null
          ? String(managementPlain.year)
          : managementPlain?.anio != null
            ? String(managementPlain.anio)
            : '',
      gestion_nombre: managementPlain?.name != null ? String(managementPlain.name) : '',
      carrera_nombre: careerPlain?.name != null ? String(careerPlain.name) : '',
      carrera_codigo:
        careerPlain?.code != null
          ? String(careerPlain.code)
          : careerPlain?.codigo != null
            ? String(careerPlain.codigo)
            : ''
    };

    const buffer = await ExcelGenerator.generarListaInscritosPorCarrera(rows, filtros);

    const safeCareer =
      filtros.carrera_codigo.replace(/[^\dA-Za-z._-]/g, '_') || `carrera_${carreraId}`;
    const safeYear = filtros.gestion_anio.replace(/[^\dA-Za-z._-]/g, '_') || String(gestionId);
    const fileName = `lista_inscritos_${safeCareer}_${safeYear}.xlsx`;

    this.logger.info('[Estudiantes] Excel lista inscritos por carrera generado', {
      gestionId,
      carreraId,
      filas: rows.length,
      fileName
    });

    return {
      buffer: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer),
      fileName,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
  }

  _parseRequiredPositiveInt(value, errorMessage) {
    if (value == null || value === '') {
      throw new ValidationError(errorMessage);
    }
    const id = parseInt(String(value), 10);
    if (Number.isNaN(id) || id < 1) {
      throw new ValidationError(errorMessage);
    }
    return id;
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
