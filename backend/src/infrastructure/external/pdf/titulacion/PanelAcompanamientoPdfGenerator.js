/**
 * PanelAcompanamientoPdfGenerator (módulo TUT · acompañamiento)
 *
 * Genera el PDF del PANEL DE ACOMPAÑAMIENTO PEDAGÓGICO (riesgo por carrera,
 * materias críticas y resumen de sesiones de refuerzo) a partir de la
 * plantilla institucional (Plantilla.pdf) con pdf-lib. Fuentes: vistas
 * 157/158/162, mapeadas por el caso de uso.
 *
 * @implements {IPanelAcompanamientoPdfGenerator}
 */

import { IncosPDFLibBase } from '../IncosPDFLibBase.js';

export class PanelAcompanamientoPdfGenerator extends IncosPDFLibBase {
  /**
   * @param {Object} params
   * @param {ILogger} [params.logger]
   */
  constructor({ logger } = {}) {
    super({ logger });
  }

  /**
   * @param {Object} options - Ver IPanelAcompanamientoPdfGenerator.generate
   * @returns {Promise<Buffer>}
   */
  async generate(options = {}) {
    try {
      const pdfDoc = await this._loadTemplate('Plantilla.pdf');
      const firstPage = pdfDoc.getPages()[0];
      this._initializeDocumentState(pdfDoc, firstPage, true);

      await this._addDocumentTitle('PANEL DE ACOMPAÑAMIENTO PEDAGÓGICO');
      if (options.gestionAnio) {
        await this._addSubtitle(`GESTIÓN ${options.gestionAnio}`);
      }
      this._addSpace();

      await this._buildRiesgoPorCarrera(options);
      await this._buildMateriasCriticas(options);
      await this._buildSesionesResumen(options);

      const pdfBuffer = await this._saveDocument(pdfDoc);
      this.logger?.info('[PanelAcompanamientoPdfGenerator] PDF generado (buffer)', {
        size: pdfBuffer.length,
      });
      return pdfBuffer;
    } catch (error) {
      this.logger?.error('[PanelAcompanamientoPdfGenerator] Error al generar PDF', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /** @private */
  async _buildRiesgoPorCarrera(options) {
    const filas = Array.isArray(options.riesgoPorCarrera) ? options.riesgoPorCarrera : [];
    await this._addSection('ESTUDIANTES EN RIESGO POR CARRERA');
    if (filas.length === 0) {
      await this._addParagraph('Sin datos de riesgo para la gestión seleccionada.');
      return;
    }
    await this._addTable(
      ['Carrera', 'Estudiantes', 'En riesgo', '% riesgo'],
      [220, 90, 90, 80],
      filas.map((fila) => [
        fila.carreraNombre ?? '',
        String(fila.totalEstudiantes ?? 0),
        String(fila.estudiantesEnRiesgo ?? 0),
        fila.pctEstudiantesRiesgo != null ? `${fila.pctEstudiantesRiesgo}%` : '—',
      ])
    );
    this._addSpace();
  }

  /** @private */
  async _buildMateriasCriticas(options) {
    const filas = Array.isArray(options.materiasCriticas) ? options.materiasCriticas : [];
    if (filas.length === 0) return;
    await this._addSection('MATERIAS CRÍTICAS (RIESGO Y REPROBACIÓN)');
    await this._addTable(
      ['Materia', 'Docente', 'Matric.', 'En riesgo', '% riesgo'],
      [150, 150, 60, 70, 70],
      filas.map((fila) => [
        `${fila.asignaturaSigla ?? ''} ${fila.asignaturaNombre ?? ''}`.trim(),
        fila.docenteNombre ?? '',
        String(fila.matriculados ?? 0),
        String(fila.enRiesgo ?? 0),
        fila.pctRiesgo != null ? `${fila.pctRiesgo}%` : '—',
      ])
    );
    this._addSpace();
  }

  /** @private */
  async _buildSesionesResumen(options) {
    const filas = Array.isArray(options.sesionesResumen) ? options.sesionesResumen : [];
    if (filas.length === 0) return;
    await this._addSection('SESIONES DE REFUERZO POR MES');
    await this._addTable(
      ['Mes', 'Carrera', 'Program.', 'Realizadas', '% asist.'],
      [70, 190, 70, 80, 70],
      filas.map((fila) => [
        fila.mes ?? '',
        fila.carreraNombre ?? '',
        String(fila.sesionesProgramadas ?? 0),
        String(fila.sesionesRealizadas ?? 0),
        fila.pctAsistencia != null ? `${fila.pctAsistencia}%` : '—',
      ])
    );
  }
}
