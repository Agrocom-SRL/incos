import {
  assertTipoInformeCoherente,
  getPasantiaOrFail,
} from './helpers/pasantiaGuards.js';
import {
  buildContextoInformePdf,
  guardarInformeConPdf,
  hoyISO,
} from './helpers/informePdfHelpers.js';

/**
 * Use Case: CreateInformePasantiaUseCase (P12)
 * Módulo: Pasantías (TUT · práctica laboral)
 *
 * Emite un informe formal del trámite y genera su PDF institucional
 * (PasantiaInformePdfGenerator + plantilla). Coherencia camino ↔ informe:
 * VERIFICACION_EMPRESA solo si el trámite es PASANTIA; CONVALIDACION_TRABAJO
 * solo si es CONVALIDACION (R.M. 487/2023).
 */
export class CreateInformePasantiaUseCase {
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
   * @param {Object} data - { tipo, docenteId?, numeroMemo?, fechaVerificacion?,
   *   fechaEmision?, destinatario?, areaRelacionada?, evaluacionCualitativa?,
   *   resultado?, contenido? }
   * @param {number|null} userId - Usuario de la sesión (auditoría created_by)
   * @returns {Promise<{informe: Object}>}
   */
  async execute(pasantiaId, data, userId = null) {
    const pasantia = await getPasantiaOrFail(this.pasantiaRepository, pasantiaId);
    assertTipoInformeCoherente(pasantia, data.tipo);

    const contexto = await buildContextoInformePdf({
      pasantiaViewRepository: this.pasantiaViewRepository,
      pasantia,
    });

    const informeData = {
      tipo: data.tipo,
      docenteId: data.docenteId ?? pasantia.docenteSupervisorId ?? null,
      numeroMemo: data.numeroMemo ?? null,
      fechaVerificacion: data.fechaVerificacion ?? null,
      fechaEmision: data.fechaEmision ?? hoyISO(),
      destinatario: data.destinatario ?? null,
      areaRelacionada: data.areaRelacionada ?? null,
      evaluacionCualitativa: data.evaluacionCualitativa ?? null,
      resultado: data.resultado ?? null,
      contenido: data.contenido ?? null,
    };

    const buffer = await this.pasantiaInformePdfGenerator.generate({
      tipo: data.tipo,
      pasantia: contexto,
      informe: informeData,
    });

    const informe = await guardarInformeConPdf({
      uploadsStorage: this.uploadsStorage,
      pasantiaInformeRepository: this.pasantiaInformeRepository,
      pasantiaId,
      buffer,
      fileName: `informe_${data.tipo.toLowerCase()}_${pasantiaId}_${Date.now()}.pdf`,
      informeData,
      userId,
    });

    this.logger.info('[Pasantías] Informe emitido con PDF', {
      pasantiaId,
      informeId: informe.id,
      tipo: informe.tipo,
    });

    // La ruta del archivo NO se expone (descarga autenticada vía res.download).
    const informeSafe = { ...informe };
    delete informeSafe.rutaArchivo;
    return { informe: informeSafe };
  }
}
