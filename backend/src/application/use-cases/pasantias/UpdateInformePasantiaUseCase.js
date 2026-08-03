import {
  assertTipoInformeCoherente,
  getInformeOfPasantiaOrFail,
  getPasantiaOrFail,
} from './helpers/pasantiaGuards.js';
import {
  actualizarInformeConPdf,
  buildContextoInformePdf,
} from './helpers/informePdfHelpers.js';

/**
 * Use Case: UpdateInformePasantiaUseCase (P13)
 * Módulo: Pasantías (TUT · práctica laboral)
 *
 * Edita un informe del trámite y REGENERA su PDF (misma ruta: saveToUploads
 * sobrescribe el archivo, conservando el nombre original). El tipo del
 * informe no puede salirse de la coherencia camino ↔ informe.
 */
export class UpdateInformePasantiaUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.pasantiaRepository - Raíz pasantias
   * @param {Object} params.pasantiaInformeRepository - CRUD pasantias_informes
   * @param {Object} params.pasantiaViewRepository - Vista 168 (contexto del PDF)
   * @param {Object} params.pasantiaInformePdfGenerator - IPasantiaInformePdfGenerator
   * @param {Object} params.uploadsStorage - IUploadsStorage
   * @param {ILogger} params.logger
   */
  constructor({
    pasantiaRepository,
    pasantiaInformeRepository,
    pasantiaViewRepository,
    pasantiaInformePdfGenerator,
    uploadsStorage,
    logger,
  }) {
    this.pasantiaRepository = pasantiaRepository;
    this.pasantiaInformeRepository = pasantiaInformeRepository;
    this.pasantiaViewRepository = pasantiaViewRepository;
    this.pasantiaInformePdfGenerator = pasantiaInformePdfGenerator;
    this.uploadsStorage = uploadsStorage;
    this.logger = logger;
  }

  /**
   * @param {number} pasantiaId
   * @param {number} informeId
   * @param {Object} data - Payload parcial del informe
   * @param {number|null} userId - Usuario de la sesión (auditoría updated_by)
   * @returns {Promise<{informe: Object}>}
   */
  async execute(pasantiaId, informeId, data, userId = null) {
    const pasantia = await getPasantiaOrFail(this.pasantiaRepository, pasantiaId);
    const current = await getInformeOfPasantiaOrFail(
      this.pasantiaInformeRepository,
      pasantiaId,
      informeId
    );

    const tipo = data.tipo ?? current.tipo;
    assertTipoInformeCoherente(pasantia, tipo);

    const contexto = await buildContextoInformePdf({
      pasantiaViewRepository: this.pasantiaViewRepository,
      pasantia,
    });

    const informeData = {
      tipo,
      docenteId: data.docenteId ?? current.docenteId,
      numeroMemo: data.numeroMemo ?? current.numeroMemo,
      fechaVerificacion: data.fechaVerificacion ?? current.fechaVerificacion,
      fechaEmision: data.fechaEmision ?? current.fechaEmision,
      destinatario: data.destinatario ?? current.destinatario,
      areaRelacionada: data.areaRelacionada ?? current.areaRelacionada,
      evaluacionCualitativa: data.evaluacionCualitativa ?? current.evaluacionCualitativa,
      resultado: data.resultado ?? current.resultado,
      contenido: data.contenido ?? current.contenido,
    };

    const buffer = await this.pasantiaInformePdfGenerator.generate({
      tipo,
      pasantia: contexto,
      informe: informeData,
    });

    const informe = await actualizarInformeConPdf({
      uploadsStorage: this.uploadsStorage,
      pasantiaInformeRepository: this.pasantiaInformeRepository,
      pasantiaId,
      informeId,
      buffer,
      fileName:
        current.nombreArchivo ?? `informe_${tipo.toLowerCase()}_${pasantiaId}_${Date.now()}.pdf`,
      informeData,
      userId,
    });

    this.logger.info('[Pasantías] Informe actualizado con PDF regenerado', {
      pasantiaId,
      informeId,
    });

    // La ruta del archivo NO se expone (descarga autenticada vía res.download).
    const informeSafe = { ...informe };
    delete informeSafe.rutaArchivo;
    return { informe: informeSafe };
  }
}
