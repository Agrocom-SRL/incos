/**
 * Use Case: ExportPanelAcompanamientoPdfUseCase (A11)
 * Módulo: Académico (ACA · acompañamiento)
 *
 * Exporta el panel de acompañamiento a PDF (vistas 157/158/162). Reutiliza
 * GetPanelAcompanamientoUseCase para armar los datos (no duplica lecturas).
 */
export class ExportPanelAcompanamientoPdfUseCase {
  /**
   * @param {Object} params
   * @param {Object} params.getPanelAcompanamientoUseCase - Datos del panel (A10)
   * @param {Object} params.panelAcompanamientoPdfGenerator - IPanelAcompanamientoPdfGenerator
   * @param {ILogger} params.logger
   */
  constructor({ getPanelAcompanamientoUseCase, panelAcompanamientoPdfGenerator, logger }) {
    this.getPanelAcompanamientoUseCase = getPanelAcompanamientoUseCase;
    this.panelAcompanamientoPdfGenerator = panelAcompanamientoPdfGenerator;
    this.logger = logger;
  }

  /**
   * @param {Object} [queryParams] - { gestionId }
   * @returns {Promise<{buffer: Buffer, fileName: string, mimeType: string}>}
   */
  async execute(queryParams = {}) {
    const { panelAcompanamiento } = await this.getPanelAcompanamientoUseCase.execute(queryParams);

    const buffer = await this.panelAcompanamientoPdfGenerator.generate({
      gestionAnio: panelAcompanamiento.gestion?.gestionAnio ?? null,
      riesgoPorCarrera: panelAcompanamiento.riesgoPorCarrera,
      materiasCriticas: panelAcompanamiento.materiasCriticas,
      sesionesResumen: panelAcompanamiento.sesionesResumen,
    });

    const sufijo = panelAcompanamiento.gestion?.gestionAnio ?? 'general';

    this.logger.info('[Acompañamiento] Panel de acompañamiento exportado a PDF', {
      gestionId: panelAcompanamiento.gestion?.gestionId ?? null,
    });

    return {
      buffer,
      fileName: `panel_acompanamiento_${sufijo}.pdf`,
      mimeType: 'application/pdf',
    };
  }
}
