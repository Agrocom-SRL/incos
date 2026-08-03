/**
 * Use Case: ExportAvanceTutoriaCarreraPdfUseCase
 * Módulo: Titulación (TIT), Requisito 2 — extensión 2026-07-31
 *
 * PDF del reporte de avance de tutorías por carrera: reutiliza
 * `GetAvanceTutoriaCarreraUseCase.execute` (no relee la BD dos veces, patrón
 * `ExportPanelAcompanamientoPdfUseCase`). Documento "export": no persiste
 * nada.
 */
export class ExportAvanceTutoriaCarreraPdfUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.getAvanceTutoriaCarreraUseCase
   * @param {Object} params.managementRepository - Año de gestión para el PDF
   * @param {Object} params.avanceTutoriaCarreraPdfGenerator
   * @param {ILogger} params.logger
   */
  constructor({
    getAvanceTutoriaCarreraUseCase,
    managementRepository,
    avanceTutoriaCarreraPdfGenerator,
    logger,
  }) {
    this.getAvanceTutoriaCarreraUseCase = getAvanceTutoriaCarreraUseCase;
    this.managementRepository = managementRepository;
    this.avanceTutoriaCarreraPdfGenerator = avanceTutoriaCarreraPdfGenerator;
    this.logger = logger;
  }

  /**
   * @param {Object} [queryParams] - { gestionId, carreraId }
   * @returns {Promise<{buffer: Buffer, fileName: string, mimeType: string}>}
   */
  async execute(queryParams = {}) {
    const { avanceTutoriaCarrera } = await this.getAvanceTutoriaCarreraUseCase.execute(queryParams);

    const gestionAnio = await this._resolverGestionAnio(avanceTutoriaCarrera.gestionId);

    const buffer = await this.avanceTutoriaCarreraPdfGenerator.generate({
      gestionAnio,
      resumenPorCarrera: avanceTutoriaCarrera.resumenPorCarrera,
      detalle: avanceTutoriaCarrera.detalle,
    });

    this.logger.info('[Titulación] Reporte de avance de tutorías por carrera exportado (PDF)', {
      gestionId: avanceTutoriaCarrera.gestionId,
      carreraId: avanceTutoriaCarrera.carreraId,
    });

    return {
      buffer,
      fileName: `reporte-avance-tutorias-carrera${gestionAnio ? `-${gestionAnio}` : ''}.pdf`,
      mimeType: 'application/pdf',
    };
  }

  /** @private */
  async _resolverGestionAnio(gestionId) {
    if (!gestionId) return null;
    const gestion = await this.managementRepository.findById(Number(gestionId));
    const plain = gestion?.toPlainObject?.() ?? gestion;
    return plain?.year ?? plain?.anio ?? null;
  }
}
