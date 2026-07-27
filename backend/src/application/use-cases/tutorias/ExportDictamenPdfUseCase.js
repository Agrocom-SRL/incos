import fs from 'fs';
import { NotFoundError } from '../../../domain/errors/AppError.js';
import { getProyectoOrFail } from './helpers/proyectoTutoriaGuards.js';

/**
 * Use Case: ExportDictamenPdfUseCase (T23)
 * Módulo: Tutorías (TUT · titulación)
 *
 * Resuelve la ruta del PDF de un dictamen para su descarga autenticada
 * (res.download en el controller).
 */
export class ExportDictamenPdfUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.proyectoGradoRepository
   * @param {Object} params.dictamenProyectoRepository
   * @param {ILogger} params.logger
   */
  constructor({ proyectoGradoRepository, dictamenProyectoRepository, logger }) {
    this.proyectoGradoRepository = proyectoGradoRepository;
    this.dictamenProyectoRepository = dictamenProyectoRepository;
    this.logger = logger;
  }

  /**
   * @param {{ proyectoGradoId: number, dictamenId: number }} input
   * @returns {Promise<{absolutePath: string, fileName: string}>}
   */
  async execute({ proyectoGradoId, dictamenId } = {}) {
    await getProyectoOrFail(this.proyectoGradoRepository, proyectoGradoId);

    const dictamen = await this.dictamenProyectoRepository.findById(dictamenId);
    if (!dictamen || Number(dictamen.proyectoGradoId) !== Number(proyectoGradoId)) {
      throw new NotFoundError(`dictamen con ID ${dictamenId} del proyecto ${proyectoGradoId}`);
    }

    if (!dictamen.rutaArchivo || !fs.existsSync(dictamen.rutaArchivo)) {
      throw new NotFoundError(`archivo del dictamen ${dictamenId}`);
    }

    this.logger.info('[Tutorías] Descarga de dictamen autorizada', {
      proyectoGradoId,
      dictamenId,
    });

    return {
      absolutePath: dictamen.rutaArchivo,
      fileName: dictamen.nombreArchivo ?? `dictamen_${dictamenId}.pdf`,
    };
  }
}
