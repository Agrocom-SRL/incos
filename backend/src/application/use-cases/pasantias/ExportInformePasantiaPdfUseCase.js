import fs from 'fs';
import { NotFoundError } from '../../../domain/errors/AppError.js';
import {
  getInformeOfPasantiaOrFail,
  getPasantiaOrFail,
} from './helpers/pasantiaGuards.js';

/**
 * Use Case: ExportInformePasantiaPdfUseCase (P14)
 * Módulo: Pasantías (TUT · práctica laboral)
 *
 * Resuelve la ruta del PDF de un informe para su descarga autenticada
 * (res.download en el controller). Valida la pertenencia informe → trámite
 * (anti-IDOR) y la existencia física del archivo.
 */
export class ExportInformePasantiaPdfUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.pasantiaRepository - Raíz pasantias
   * @param {Object} params.pasantiaInformeRepository - CRUD pasantias_informes
   * @param {ILogger} params.logger
   */
  constructor({ pasantiaRepository, pasantiaInformeRepository, logger }) {
    this.pasantiaRepository = pasantiaRepository;
    this.pasantiaInformeRepository = pasantiaInformeRepository;
    this.logger = logger;
  }

  /**
   * @param {{ pasantiaId: number, informeId: number }} input
   * @returns {Promise<{absolutePath: string, fileName: string}>}
   */
  async execute({ pasantiaId, informeId } = {}) {
    await getPasantiaOrFail(this.pasantiaRepository, pasantiaId);
    const informe = await getInformeOfPasantiaOrFail(
      this.pasantiaInformeRepository,
      pasantiaId,
      informeId
    );

    if (!informe.rutaArchivo || !fs.existsSync(informe.rutaArchivo)) {
      throw new NotFoundError(`archivo del informe ${informeId}`);
    }

    this.logger.info('[Pasantías] Descarga de informe autorizada', {
      pasantiaId,
      informeId,
    });

    return {
      absolutePath: informe.rutaArchivo,
      fileName: informe.nombreArchivo ?? `informe_pasantia_${informeId}.pdf`,
    };
  }
}
