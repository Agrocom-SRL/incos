/**
 * ActaCompromisoPdfGenerator
 *
 * Servicio de infraestructura que genera el ACTA DE COMPROMISO PARA LA ENTREGA DE DOCUMENTOS
 * a partir de una plantilla PDF (Plantilla.pdf).
 * 
 * Tecnología: Usa pdf-lib para cargar y editar la plantilla PDF existente.
 * 
 * Se registra en el contenedor DI (services.container) y se inyecta en GenerateActaCompromisoUseCase.
 * 
 * NOTA: Este es el único método para generar actas de compromiso. Ya no se usa Word.
 * El flujo anterior (Word → DOCX → PDF) fue reemplazado por este método directo.
 *
 * Arquitectura:
 * - Extiende IncosPDFLibBase para reutilizar métodos comunes de pdf-lib
 * - Solo contiene lógica específica del acta de compromiso:
 *   - _addDocumentTitle(): Título principal del documento (específico del acta)
 *   - generate(): Método principal de generación (orquesta la construcción)
 * 
 * Todos los métodos comunes (_addSubtitle, _addParagraph, _addField, etc.) están
 * en IncosPDFLibBase y se heredan automáticamente.
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja lógica específica del acta de compromiso
 * - Open/Closed: Extiende IncosPDFLibBase sin modificar la clase base
 * - Liskov Substitution: Puede usarse donde se espere IncosPDFLibBase
 *
 * @module ActaCompromisoPdfGenerator
 */

import { IncosPDFLibBase } from './IncosPDFLibBase.js';
import { IncosPDFBase } from './IncosPDFBase.js';

export class ActaCompromisoPdfGenerator extends IncosPDFLibBase {
    /**
     * @param {Object} params - Dependencias inyectadas
     * @param {ILogger} params.logger - Logger para registro de eventos
     */
    constructor({ logger } = {}) {
        super({ logger });
    }

    /**
     * Genera un PDF a partir de la plantilla (Plantilla.pdf).
     * Retorna el contenido como Buffer. No escribe en disco; el guardado lo hace
     * UploadsStorage u otro componente externo.
     *
     * @param {Object} [options] - Opciones para la generación
     * @param {string|number} [options.gestion] - Año de gestión (ej: '2026' o 2026). Ya validado por el caso de uso
     * @param {Object} [options.student] - Datos del estudiante
     * @param {string} [options.fechaActual] - Fecha actual formateada (ej: "25 de enero de 2026")
     * @returns {Promise<Buffer>} Contenido del PDF con título agregado
     */
    async generate(options = {}) {
        try {
            // 1. Cargar la plantilla PDF (usa método heredado de la clase base)
            const pdfDoc = await this._loadTemplate('Plantilla.pdf');

            // 2. Obtener la primera página e inicializar el estado interno
            const pages = pdfDoc.getPages();
            const firstPage = pages[0];

            // 3. Construir el documento agregando componentes secuencialmente
            this._initializeDocumentState(pdfDoc, firstPage, true);

            // Agregar título principal (usa fuente por defecto desde configuración)
            await this._addDocumentTitle(IncosPDFBase.DOCUMENT_TITLES.ACTA_COMPROMISO);

            // Agregar subtítulo de gestión si se proporciona
            if (options.gestion) {
                const gestionYear = String(options.gestion);
                await this._addSubtitle(`GESTIÓN ${gestionYear}`);
            }

            // Espaciado después del subtítulo para separar de las secciones
            this._addSpace();

            // Agregar títulos de secciones
            await this._addSection(IncosPDFBase.SECTION_TITLES.FECHA_REGISTRO);

            // Agregar párrafo de fecha con ciudad (reemplazar placeholder con fecha actual)
            if (options.fechaActual) {
                const fechaTexto = IncosPDFBase.TEMPLATE_TEXTS.FECHA_REGISTRO.replace('{FECHA}', options.fechaActual);
                await this._addParagraph(fechaTexto);
            }

            await this._addSection(IncosPDFBase.SECTION_TITLES.NOMBRE_IDENTIFICACION);

            // Agregar párrafo con información del estudiante
            if (options.student) {
                const nombreTexto = IncosPDFBase.TEMPLATE_TEXTS.NOMBRE_IDENTIFICACION
                    .replace('{APELLIDO_PATERNO}', options.student.apellidoPaterno || '')
                    .replace('{APELLIDO_MATERNO}', options.student.apellidoMaterno || '')
                    .replace('{NOMBRES}', options.student.nombres || '')
                    .replace('{CI}', options.student.ci || '')
                    .replace('{EXPEDICION}', options.student.expedicion || '');
                await this._addParagraph(nombreTexto);
            }

            await this._addSection(IncosPDFBase.SECTION_TITLES.REQUISITOS);

            // Agregar párrafo introductorio antes de la lista de documentos
            await this._addParagraph(IncosPDFBase.TEMPLATE_TEXTS.REQUISITOS_INTRO);

            // Agregar lista de documentos con viñetas
            if (options.entregas && Array.isArray(options.entregas) && options.entregas.length > 0) {
                for (const entrega of options.entregas) {
                    // Construir texto con los campos relevantes
                    const nombreDocumento = entrega.nombre_documento || 'Documento sin nombre';
                    const observaciones = entrega.observaciones_entrega || '';
                    const enTramite = entrega.en_tramite === 1 || entrega.en_tramite === true;

                    // Construir texto del documento
                    let documentoTexto = nombreDocumento;
                    if (enTramite) {
                        documentoTexto += ' - En trámite';
                    }

                    await this._addBulletPoint(documentoTexto);
                }
            }

            // Espaciado después de la lista de documentos para separar de las secciones
            this._addSpace();

            await this._addSection(IncosPDFBase.SECTION_TITLES.PLAZOS_COMPROMISO);
            await this._addSection(IncosPDFBase.SECTION_TITLES.MOTIVOS);

            // Aquí se pueden agregar más componentes (la librería maneja automáticamente currentY):
            // await this._addParagraph('Texto del párrafo...');
            // await this._addField('Campo', 'Valor');
            // this._addLine();

            // 4. Serializar el PDF a bytes (usa método heredado)
            const pdfBuffer = await this._saveDocument(pdfDoc);

            if (this.logger) {
                this.logger.info('[ActaCompromisoPdfGenerator] Acta de compromiso PDF generada (buffer)', {
                    size: pdfBuffer.length,
                });
            }

            return pdfBuffer;
        } catch (error) {
            if (this.logger) {
                this.logger.error('[ActaCompromisoPdfGenerator] Error al generar acta de compromiso PDF', {
                    error: error.message,
                    stack: error.stack,
                });
            }
            throw error;
        }
    }

    // ============================================
    // MÉTODOS ESPECÍFICOS DEL ACTA DE COMPROMISO
    // ============================================

    /* -----------------------------------------------------------------------
     * Métodos de construcción de contenido (comentados hasta uso por partes).
     * Se usarán cuando se construya el documento con datos del estudiante.
     * -----------------------------------------------------------------------
  
    */
}
