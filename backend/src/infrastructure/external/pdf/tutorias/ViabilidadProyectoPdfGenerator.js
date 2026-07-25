/**
 * ViabilidadProyectoPdfGenerator (módulo TUT · titulación)
 *
 * Genera el INFORME DE VIABILIDAD TÉCNICA del proyecto de grado a partir de
 * la plantilla institucional (Plantilla.pdf) con pdf-lib. Patrón
 * ActaCompromisoPdfGenerator: extiende IncosPDFLibBase, retorna Buffer.
 *
 * @implements {IViabilidadProyectoPdfGenerator}
 */

import { IncosPDFLibBase } from '../IncosPDFLibBase.js';

export class ViabilidadProyectoPdfGenerator extends IncosPDFLibBase {
  /**
   * @param {Object} params
   * @param {ILogger} [params.logger]
   */
  constructor({ logger } = {}) {
    super({ logger });
  }

  /**
   * @param {Object} options - Ver IViabilidadProyectoPdfGenerator.generate
   * @returns {Promise<Buffer>}
   */
  async generate(options = {}) {
    try {
      const pdfDoc = await this._loadTemplate('Plantilla.pdf');
      const firstPage = pdfDoc.getPages()[0];
      this._initializeDocumentState(pdfDoc, firstPage, true);

      await this._addDocumentTitle('INFORME DE VIABILIDAD TÉCNICA');
      if (options.proyecto?.gestionAnio) {
        await this._addSubtitle(`GESTIÓN ${options.proyecto.gestionAnio}`);
      }
      this._addSpace();

      await this._buildDatosInforme(options);
      await this._buildDatosProyecto(options);
      await this._buildIntegrantes(options);
      await this._buildDictamen(options);

      const pdfBuffer = await this._saveDocument(pdfDoc);
      this.logger?.info('[ViabilidadProyectoPdfGenerator] PDF generado (buffer)', {
        size: pdfBuffer.length,
      });
      return pdfBuffer;
    } catch (error) {
      this.logger?.error('[ViabilidadProyectoPdfGenerator] Error al generar PDF', {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /** @private */
  async _buildDatosInforme(options) {
    await this._addSection('DATOS DEL INFORME');
    if (options.numeroInforme) {
      await this._addLabelValue('Número de informe:', options.numeroInforme);
    }
    if (options.fechaEmision) {
      await this._addLabelValue('Fecha de emisión:', options.fechaEmision);
    }
    await this._addLabelValue('Destinatario:', options.destinatario || 'Dirección Académica');
    this._addSpace();
  }

  /** @private */
  async _buildDatosProyecto(options) {
    const proyecto = options.proyecto || {};
    await this._addSection('DATOS DEL PROYECTO DE GRADO');
    await this._addLabelValue('Título:', proyecto.titulo || '');
    if (proyecto.modalidadNombre) {
      await this._addLabelValue('Modalidad:', proyecto.modalidadNombre);
    }
    if (proyecto.carreraNombre) {
      await this._addLabelValue('Carrera:', proyecto.carreraNombre);
    }
    await this._addLabelValue('Tutor:', options.tutorNombre || '');
    this._addSpace();
  }

  /** @private */
  async _buildIntegrantes(options) {
    const integrantes = Array.isArray(options.integrantes) ? options.integrantes : [];
    if (integrantes.length === 0) return;
    await this._addSection('ESTUDIANTES');
    for (const integrante of integrantes) {
      const codigo = integrante.codigoEstudiante ? ` (${integrante.codigoEstudiante})` : '';
      const rol = integrante.rol === 'TITULAR' ? ' — Titular' : '';
      await this._addBulletPoint(`${integrante.estudianteNombre || ''}${codigo}${rol}`);
    }
    this._addSpace();
  }

  /** @private */
  async _buildDictamen(options) {
    await this._addSection('DICTAMEN');
    await this._addLabelValue('Resultado:', options.resultado || '');
    if (options.contenido) {
      await this._addParagraph(options.contenido);
    }
    await this._addSignatureBlock({
      lines: ['TUTOR DEL PROYECTO', options.tutorNombre || ''],
    });
  }
}
