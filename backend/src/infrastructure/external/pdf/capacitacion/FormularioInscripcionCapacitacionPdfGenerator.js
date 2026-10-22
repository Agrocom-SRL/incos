/**
 * FormularioInscripcionCapacitacionPdfGenerator
 *
 * Servicio de infraestructura que genera el FORMULARIO DE INSCRIPCIÓN de UN
 * participante a un curso de capacitación, en PDF (carta, vertical) SOBRE la
 * plantilla institucional `Plantilla.pdf` —el mismo soporte que el Formulario de
 * Inscripción de estudiantes—. La plantilla aporta el encabezado con logos y el pie
 * verde; este generador dibuja el contenido debajo.
 *
 * Es un ORQUESTADOR: extiende IncosPDFLibBase (carga de plantilla, fuentes, estado
 * del documento) y delega cada bloque de contenido en un módulo de `secciones/`
 * (encabezado, participante, curso y grupo, requisitos, pagos, firmas). Etiquetas,
 * anchos y firmas viven en `capacitacionPdfConfig.js`; la aritmética, en
 * `capacitacionPdfLayout.js`.
 *
 * Implementa IFormularioInscripcionCapacitacionPdfGenerator.
 *
 * Principios SOLID:
 * - Single Responsibility: solo ordena las secciones; cada una dibuja una cosa.
 * - Open/Closed: extiende IncosPDFLibBase sin modificarla; una sección nueva es un
 *   archivo nuevo y una línea aquí.
 *
 * @module FormularioInscripcionCapacitacionPdfGenerator
 */

import { IncosPDFLibBase } from '../IncosPDFLibBase.js';
import { IncosPDFBase } from '../IncosPDFBase.js';
import { FORMULARIO_CAPACITACION_PDF_CONFIG as CFG } from './capacitacionPdfConfig.js';
import { dibujarEncabezado } from './secciones/seccionEncabezado.js';
import { dibujarParticipante } from './secciones/seccionParticipante.js';
import { dibujarCurso } from './secciones/seccionCurso.js';
import { dibujarRequisitos } from './secciones/seccionRequisitos.js';
import { dibujarPagos } from './secciones/seccionPagos.js';
import { dibujarFirmas } from './secciones/seccionFirmas.js';

export class FormularioInscripcionCapacitacionPdfGenerator extends IncosPDFLibBase {
  /**
   * @param {Object} params
   * @param {ILogger} [params.logger]
   */
  constructor({ logger } = {}) {
    super({ logger });
  }

  /**
   * Genera el PDF del formulario de inscripción de capacitación.
   * @param {Object} datos - Payload formado por `construirDatosFormularioInscripcion`.
   * @returns {Promise<Buffer>}
   */
  async generarFormularioInscripcion(datos) {
    const pdfDoc = await this._loadTemplate('Plantilla.pdf');
    const page = pdfDoc.getPages()[0];
    // useInitialY=true → el contenido arranca debajo del encabezado de la plantilla.
    this._initializeDocumentState(pdfDoc, page, true);

    await dibujarEncabezado(this, datos);
    await dibujarParticipante(this, datos);
    await dibujarCurso(this, datos);
    await dibujarRequisitos(this, datos);
    await dibujarPagos(this, datos);
    await dibujarFirmas(this, {
      firmas: CFG.firmas,
      pieHeight: IncosPDFBase.LAYOUT.signatureTemplateFooterHeight
    });

    const buffer = await this._saveDocument(pdfDoc);

    if (this.logger) {
      this.logger.info('[FormularioInscripcionCapacitacionPdfGenerator] Formulario generado (buffer)', {
        size: buffer.length,
        codigoInscripcion: datos?.codigoInscripcion,
        paginas: pdfDoc.getPageCount()
      });
    }

    return buffer;
  }
}

export default FormularioInscripcionCapacitacionPdfGenerator;
