/**
 * FormularioInscripcionPdfGenerator
 *
 * Servicio de infraestructura que generará el FORMULARIO DE INSCRIPCIÓN a partir de una plantilla PDF.
 * Esqueleto base para la migración desde BoletaInscripcionWordGenerator (Word + PizZip).
 *
 * Tecnología: pdf-lib (misma que ActaCompromisoPdfGenerator). Usa IncosPDFLibBase.
 *
 * Estructura reflejada del formulario Word:
 * - 1.- DATOS PERSONALES (nombre, CI, género, etc.; lugar/fecha nacimiento; domicilio, etc.)
 * - 2.- DATOS ACADÉMICOS (carrera, año, materias)
 * - 3.- DOCUMENTOS RECEPCIONADOS
 * - Firmas (Estudiante + Responsable Inscripción)
 * - Nota legal
 *
 * Por ahora solo orquesta los _build* y deja placeholders. Completar cada sección
 * durante la migración (datos desde options, layout 2 columnas si aplica, etc.).
 *
 * @module FormularioInscripcionPdfGenerator
 */

import { IncosPDFLibBase } from './IncosPDFLibBase.js';
import { IncosPDFBase } from './IncosPDFBase.js';

/** Títulos de sección del formulario (alineados con BoletaInscripcionWordGenerator) */
const FORMULARIO_SECTIONS = {
    DATOS_PERSONALES: '1.- DATOS PERSONALES',
    DATOS_ACADEMICOS: '2.- DATOS ACADÉMICOS',
    DOCUMENTOS_RECEPCIONADOS: '3.- DOCUMENTOS RECEPCIONADOS',
};

export class FormularioInscripcionPdfGenerator extends IncosPDFLibBase {
    /**
     * @param {Object} params - Dependencias inyectadas
     * @param {ILogger} [params.logger] - Logger para registro de eventos
     */
    constructor({ logger } = {}) {
        super({ logger });
    }

    /**
     * Genera un PDF de Formulario de Inscripción a partir de la plantilla.
     * Retorna Buffer. El guardado en uploads lo hace el caso de uso / almacenamiento.
     *
     * @param {Object} [options] - Opciones (estructura análoga a Acta: gestion, student, fechaActual)
     * @param {string|number} [options.gestion] - Año de gestión (alias: options.gestionYear)
     * @param {Object} [options.student] - Datos del estudiante { id, codigoEstudiante, ci, expedicion, nombres, apellidoPaterno, apellidoMaterno }
     * @param {string} [options.fechaActual] - Fecha actual para el documento
     * @param {Array<{ sigla: string, nombre: string }>} [options.materias]
     * @returns {Promise<Buffer>} Contenido del PDF generado
     */
    async generate(options = {}) {
        try {
            const pdfDoc = await this._loadTemplate('Plantilla.pdf');
            const pages = pdfDoc.getPages();
            const firstPage = pages[0];
            this._initializeDocumentState(pdfDoc, firstPage, true);

            await this._buildHeader(options);
            await this._buildDatosPersonales(options);
            await this._buildDatosAcademicos(options);
            await this._buildDocumentosRecepcionados(options);
            await this._buildFirmas(options);
            await this._buildNotaLegal(options);

            const pdfBuffer = await this._saveDocument(pdfDoc);

            if (this.logger) {
                this.logger.info('[FormularioInscripcionPdfGenerator] Formulario de inscripción PDF generado (buffer)', {
                    size: pdfBuffer.length,
                });
            }

            return pdfBuffer;
        } catch (error) {
            if (this.logger) {
                this.logger.error('[FormularioInscripcionPdfGenerator] Error al generar formulario de inscripción PDF', {
                    error: error.message,
                    stack: error.stack,
                });
            }
            throw error;
        }
    }

    // ============================================
    // MÉTODOS DE CONSTRUCCIÓN (esqueleto para migración)
    // ============================================

    async _buildHeader(options) {
        await this._addDocumentTitle(IncosPDFBase.DOCUMENT_TITLES.FORMULARIO_INSCRIPCION);
        const anio = options.gestion ?? options.gestionYear ?? new Date().getFullYear();
        await this._addSubtitle(`GESTIÓN ${anio}`);
        this._addSpace();
    }

    /**
     * 1.- DATOS PERSONALES. Migrar desde BoletaInscripcionWordGenerator:
     * nombre completo, CI+expedición, género, grupo sanguíneo, correo, estado civil, discapacidad;
     * lugar/fecha nacimiento; domicilio, idioma, celular, trabaja/cargo/empresa.
     */
    async _buildDatosPersonales(options) {
        await this._addSection(FORMULARIO_SECTIONS.DATOS_PERSONALES);
        // TODO(migración): nombre completo, tablas 2 columnas, lugar/fecha nacimiento, etc.
        const s = options.student || {};
        const nombre = [
            s.apellidoPaterno ?? options.apellidoPaterno,
            s.apellidoMaterno ?? options.apellidoMaterno,
            s.nombres ?? options.nombres,
        ].filter(Boolean).join(' ') || '—';
        await this._addParagraph(`Nombres y Apellidos: ${nombre}`);
        const ci = s.ci ?? options.ci;
        const exp = s.expedicion ?? options.expedicion;
        if (ci || exp) {
            await this._addParagraph(`C.I.: ${[ci, exp].filter(Boolean).join(' ') || '—'}`);
        }
        this._addSpace();
    }

    /**
     * 2.- DATOS ACADÉMICOS. Migrar: carrera, año, materias del primer periodo (2 columnas).
     */
    async _buildDatosAcademicos(options) {
        await this._addSection(FORMULARIO_SECTIONS.DATOS_ACADEMICOS);
        // TODO(migración): carrera, año, tabla de materias
        const carrera = options.carrera || '—';
        const anio = options.anio || '—';
        await this._addParagraph(`Carrera: ${carrera}. Año: ${anio}.`);
        this._addSpace();
    }

    /**
     * 3.- DOCUMENTOS RECEPCIONADOS. Migrar: lista con checkboxes (CI, certificado, diploma, aporte).
     */
    async _buildDocumentosRecepcionados(options) {
        await this._addSection(FORMULARIO_SECTIONS.DOCUMENTOS_RECEPCIONADOS);
        // TODO(migración): documentos.ci, certificadoNacimiento, diplomaBachiller, aporteVoluntario
        const docs = options.documentos || {};
        const items = [
            ['Fotocopia Carnet de Identidad', docs.ci],
            ['Fotocopia Certificado de Nacimiento', docs.certificadoNacimiento],
            ['Fotocopia de Título de Bachiller', docs.diplomaBachiller],
            ['Aporte Voluntario', docs.aporteVoluntario],
        ];
        for (const [label, checked] of items) {
            await this._addBulletPoint(`${label} ${checked ? '[X]' : '[  ]'}`);
        }
        this._addSpace();
    }

    /**
     * Firmas: Estudiante + Responsable Inscripción (2 columnas en Word).
     * Por ahora placeholder. Evaluar _addSignatureBlock u otro layout durante migración.
     */
    async _buildFirmas(options) {
        // TODO(migración): dos bloques (estudiante, responsable); opcional C.I. en firma estudiante
        await this._addSection('Firmas');
        await this._addParagraph('Firma Estudiante _____________________');
        this._addSpace(IncosPDFBase.LAYOUT.spacing.line);
        await this._addParagraph('Responsable Inscripción _____________________');
        this._addSpace();
    }

    /**
     * Nota legal. Migrar texto desde _createLegalNote (Word).
     */
    async _buildNotaLegal(options) {
        const texto = 'El llenado del presente formulario es responsabilidad plena del postulante (estudiante) y los documentos adjuntos respaldan los requisitos establecidos por la R.M. 0001/2026';
        await this._addParagraph(texto);
    }
}
