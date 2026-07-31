/**
 * AvanceTutoriaCarreraPdfGenerator (módulo TIT · titulación, Requisito 2 —
 * extensión 2026-07-31)
 *
 * Genera el PDF del REPORTE DE AVANCE DE TUTORÍAS POR CARRERA a partir de la
 * plantilla institucional (Plantilla.pdf) con pdf-lib. Patrón
 * PanelAcompanamientoPdfGenerator: tabla agregada por carrera (vista 179) +
 * tabla de detalle por proyecto (vista 160).
 *
 * @implements {IAvanceTutoriaCarreraPdfGenerator}
 */

import { IncosPDFLibBase } from '../IncosPDFLibBase.js';

export class AvanceTutoriaCarreraPdfGenerator extends IncosPDFLibBase {
  /**
   * @param {Object} params
   * @param {ILogger} [params.logger]
   */
  constructor({ logger } = {}) {
    super({ logger });
  }

  /**
   * @param {Object} options - Ver IAvanceTutoriaCarreraPdfGenerator.generate
   * @returns {Promise<Buffer>}
   */
  async generate(options = {}) {
    try {
      const pdfDoc = await this._loadTemplate('Plantilla.pdf');
      const firstPage = pdfDoc.getPages()[0];
      this._initializeDocumentState(pdfDoc, firstPage, true);

      await this._addDocumentTitle('REPORTE DE AVANCE DE TUTORÍAS POR CARRERA');
      if (options.gestionAnio) {
        await this._addSubtitle(`GESTIÓN ${options.gestionAnio}`);
      }
      this._addSpace();

      await this._buildResumenPorCarrera(options);
      await this._buildDetallePorProyecto(options);

      const pdfBuffer = await this._saveDocument(pdfDoc);
      this.logger?.info('[AvanceTutoriaCarreraPdfGenerator] PDF generado (buffer)', {
        size: pdfBuffer.length,
      });
      return pdfBuffer;
    } catch (error) {
      this.logger?.error('[AvanceTutoriaCarreraPdfGenerator] Error al generar PDF', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /** @private */
  async _buildResumenPorCarrera(options) {
    const filas = Array.isArray(options.resumenPorCarrera) ? options.resumenPorCarrera : [];
    await this._addSection('RESUMEN POR CARRERA');
    if (filas.length === 0) {
      await this._addParagraph('Sin proyectos de grado registrados para la gestión seleccionada.');
      return;
    }
    await this._addTable(
      ['Carrera', 'Proyectos', '% avance promedio', 'Con observaciones pendientes'],
      [220, 80, 110, 90],
      filas.map((fila) => [
        fila.carreraNombre ?? '',
        String(fila.totalProyectos ?? 0),
        fila.promedioAvance != null ? `${fila.promedioAvance}%` : '—',
        String(fila.proyectosConObservacionesPendientes ?? 0),
      ])
    );
    this._addSpace();
  }

  /** @private */
  async _buildDetallePorProyecto(options) {
    const filas = Array.isArray(options.detalle) ? options.detalle : [];
    if (filas.length === 0) return;
    await this._addSection('DETALLE POR PROYECTO');
    await this._addTable(
      ['Título', 'Carrera', 'Tutor', '% avance', 'Última observación'],
      [150, 100, 100, 60, 90],
      filas.map((fila) => [
        fila.titulo ?? '',
        fila.carreraNombre ?? '',
        fila.tutorNombre ?? '—',
        fila.porcentajeAvance != null ? `${fila.porcentajeAvance}%` : '—',
        fila.ultimaObservacion ?? '—',
      ])
    );
  }
}
