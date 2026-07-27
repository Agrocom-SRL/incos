/**
 * DesignacionTutorPdfGenerator (módulo TUT · titulación)
 *
 * Genera el INFORME DE DESIGNACIÓN OFICIAL DE TUTOR a partir de la plantilla
 * institucional (Plantilla.pdf) con pdf-lib. Patrón ActaCompromisoPdfGenerator:
 * extiende IncosPDFLibBase, retorna Buffer (el guardado en uploads y el
 * registro en dictamenes_proyecto los hace el caso de uso).
 *
 * @implements {IDesignacionTutorPdfGenerator}
 */

import { IncosPDFLibBase } from '../IncosPDFLibBase.js';

export class DesignacionTutorPdfGenerator extends IncosPDFLibBase {
  /**
   * @param {Object} params
   * @param {ILogger} [params.logger]
   */
  constructor({ logger } = {}) {
    super({ logger });
  }

  /**
   * @param {Object} options - Ver IDesignacionTutorPdfGenerator.generate
   * @returns {Promise<Buffer>}
   */
  async generate(options = {}) {
    try {
      const pdfDoc = await this._loadTemplate('Plantilla.pdf');
      const firstPage = pdfDoc.getPages()[0];
      this._initializeDocumentState(pdfDoc, firstPage, true);

      await this._addDocumentTitle('INFORME DE DESIGNACIÓN OFICIAL DE TUTOR');
      if (options.proyecto?.gestionAnio) {
        await this._addSubtitle(`GESTIÓN ${options.proyecto.gestionAnio}`);
      }
      this._addSpace();

      await this._buildDatosInforme(options);
      await this._buildDatosProyecto(options);
      await this._buildIntegrantes(options);
      await this._buildDesignacion(options);

      const pdfBuffer = await this._saveDocument(pdfDoc);
      this.logger?.info('[DesignacionTutorPdfGenerator] PDF generado (buffer)', {
        size: pdfBuffer.length,
      });
      return pdfBuffer;
    } catch (error) {
      this.logger?.error('[DesignacionTutorPdfGenerator] Error al generar PDF', {
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
    await this._addLabelValue('Destinatario:', options.destinatario || 'Dirección Departamental de Educación (DDE)');
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
    this._addSpace();
  }

  /** @private */
  async _buildIntegrantes(options) {
    const integrantes = Array.isArray(options.integrantes) ? options.integrantes : [];
    if (integrantes.length === 0) return;
    await this._addSection('ESTUDIANTES POSTULANTES');
    for (const integrante of integrantes) {
      const codigo = integrante.codigoEstudiante ? ` (${integrante.codigoEstudiante})` : '';
      const rol = integrante.rol === 'TITULAR' ? ' — Titular' : '';
      // eslint-disable-next-line no-await-in-loop
      await this._addBulletPoint(`${integrante.estudianteNombre || ''}${codigo}${rol}`);
    }
    this._addSpace();
  }

  /** @private */
  async _buildDesignacion(options) {
    await this._addSection('DESIGNACIÓN');
    await this._addParagraph(
      'Por medio del presente informe se designa oficialmente como TUTOR del proyecto de grado ' +
        `al docente ${options.tutorNombre || ''}, quien asumirá el seguimiento académico del ` +
        'proyecto conforme a la normativa institucional y al reglamento de modalidades de ' +
        'graduación vigente.'
    );
    await this._addSignatureBlock({
      lines: ['DIRECCIÓN ACADÉMICA', 'Instituto INCOS'],
    });
  }
}
