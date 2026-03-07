/**
 * ReciboPagoPdfGenerator
 *
 * Servicio de infraestructura que genera el RECIBO DE PAGO a partir de una plantilla PDF en blanco.
 * 
 * Tecnología: Usa pdf-lib para crear el documento desde cero (similar a ReciboPagoMejorado pero con pdf-lib).
 * 
 * Diseño:
 * - Documento vertical (portrait)
 * - Logo a la izquierda
 * - Título al centro
 * - Fecha y número de recibo (FAV) a la derecha
 * - Datos del instituto desde IncosPDFBase.INSTITUTE
 *
 * Arquitectura:
 * - Extiende IncosPDFLibBase para reutilizar métodos comunes de pdf-lib
 * - Crea el documento desde cero (no edita plantilla)
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo maneja lógica específica del recibo de pago
 * - Open/Closed: Extiende IncosPDFLibBase sin modificar la clase base
 * - Liskov Substitution: Puede usarse donde se espere IncosPDFLibBase
 *
 * @module ReciboPagoPdfGenerator
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { IncosPDFLibBase } from './IncosPDFLibBase.js';
import { IncosPDFBase } from './IncosPDFBase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ReciboPagoPdfGenerator extends IncosPDFLibBase {
    /**
     * @param {Object} params - Dependencias inyectadas
     * @param {ILogger} [params.logger] - Logger para registro de eventos
     */
    constructor({ logger } = {}) {
        super({ logger });
    }

    /**
     * Genera un PDF de Recibo de Pago desde cero.
     * Retorna Buffer. El guardado en uploads lo hace el caso de uso / almacenamiento.
     *
     * @param {Object} data - Datos del recibo
     * @param {string} data.numeroRecibo - Número del recibo (FAV)
     * @param {string} data.fechaPago - Fecha del pago (formato YYYY-MM-DD o DD/MM/YYYY)
     * @param {string} data.nombreCompleto - Nombre completo del estudiante
     * @param {string} data.ci - Cédula de identidad
     * @param {string} [data.carrera] - Nombre de la carrera (opcional)
     * @param {string} [data.cursoParalelo] - Curso y paralelo (opcional)
     * @param {string} [data.anio] - Año académico (opcional)
     * @param {number} data.montoTotal - Monto total del aporte
     * @param {number} data.descuentoBeca - Descuento por beca
     * @param {number} data.montoPagado - Monto pagado (total - descuento)
     * @param {string} data.concepto - Concepto del pago
     * @param {string} data.metodoPago - Método de pago
     * @param {string} [data.numeroTransaccion] - Número de transacción (opcional)
     * @param {Object} [data.becaInfo] - Información de beca (opcional)
     * @returns {Promise<Buffer>} Contenido del PDF generado
     */
    async generate(data) {
        try {
            if (this.logger) {
                this.logger.debug('[ReciboPagoPdfGenerator] Iniciando generación de PDF', {
                    hasData: !!data,
                    numeroRecibo: data?.numeroRecibo,
                });
            }

            // Crear documento PDF desde cero (vertical/portrait)
            const pdfDoc = await PDFDocument.create();

            // Registrar fontkit para poder usar fuentes personalizadas TTF/OTF
            // Importar fontkit dinámicamente para evitar problemas de carga
            try {
                const fontkit = (await import('@pdf-lib/fontkit')).default;
                pdfDoc.registerFontkit(fontkit);
            } catch (fontkitError) {
                if (this.logger) {
                    this.logger.warn('[ReciboPagoPdfGenerator] Error al cargar fontkit, continuando sin fuentes personalizadas', {
                        error: fontkitError.message,
                        stack: fontkitError.stack,
                    });
                }
                // Continuar sin fontkit (solo se podrán usar fuentes estándar)
            }

            // Crear página con tamaño LETTER vertical
            const page = pdfDoc.addPage([612, 792]); // LETTER: 8.5" x 11" en puntos

            // Inicializar estado interno
            this._initializeDocumentState(pdfDoc, page, false);

            if (this.logger) {
                this.logger.debug('[ReciboPagoPdfGenerator] Estado inicializado', {
                    currentY: this._currentY,
                });
            }

            // Construir el documento sección por sección
            try {
                await this._buildHeader(data);
                if (this.logger) {
                    this.logger.debug('[ReciboPagoPdfGenerator] Header construido');
                }
            } catch (headerError) {
                if (this.logger) {
                    this.logger.error('[ReciboPagoPdfGenerator] Error en _buildHeader', {
                        error: headerError.message,
                        stack: headerError.stack,
                    });
                }
                throw headerError;
            }

            try {
                await this._buildDatosPersonales(data);
                if (this.logger) {
                    this.logger.debug('[ReciboPagoPdfGenerator] Datos personales construidos');
                }
            } catch (datosError) {
                if (this.logger) {
                    this.logger.error('[ReciboPagoPdfGenerator] Error en _buildDatosPersonales', {
                        error: datosError.message,
                        stack: datosError.stack,
                    });
                }
                throw datosError;
            }

            try {
                await this._buildDeclaracionJurada(data);
                if (this.logger) {
                    this.logger.debug('[ReciboPagoPdfGenerator] Declaración jurada construida');
                }
            } catch (declaracionError) {
                if (this.logger) {
                    this.logger.error('[ReciboPagoPdfGenerator] Error en _buildDeclaracionJurada', {
                        error: declaracionError.message,
                        stack: declaracionError.stack,
                    });
                }
                throw declaracionError;
            }

            // Serializar el PDF a bytes
            const pdfBuffer = await this._saveDocument(pdfDoc);

            if (this.logger) {
                this.logger.info('[ReciboPagoPdfGenerator] Recibo de pago PDF generado (buffer)', {
                    size: pdfBuffer.length,
                });
            }

            return pdfBuffer;
        } catch (error) {
            if (this.logger) {
                const errorInfo = {
                    errorMessage: error?.message || 'Error desconocido',
                    errorName: error?.name || 'Error',
                    errorType: error?.constructor?.name || 'Unknown',
                };

                // Agregar stack trace si existe
                if (error?.stack) {
                    errorInfo.stack = error.stack;
                }

                // Agregar información adicional del error si existe
                if (error?.code) errorInfo.errorCode = error.code;
                if (error?.errno) errorInfo.errno = error.errno;
                if (error?.syscall) errorInfo.syscall = error.syscall;
                if (error?.path) errorInfo.path = error.path;

                // Intentar obtener propiedades del error
                try {
                    const errorKeys = Object.getOwnPropertyNames(error);
                    if (errorKeys.length > 0) {
                        errorInfo.errorProperties = errorKeys;
                    }
                } catch (e) {
                    // Ignorar si no se pueden obtener las propiedades
                }

                this.logger.error('[ReciboPagoPdfGenerator] Error al generar recibo de pago PDF', errorInfo);
            }
            throw error;
        }
    }

    // ============================================
    // MÉTODOS ESPECÍFICOS DEL RECIBO DE PAGO
    // ============================================

    /**
     * Construye el encabezado del documento
     * Logo a la izquierda, título al centro, fecha y FAV a la derecha
     * 
     * @private
     * @param {Object} data - Datos del recibo
     * @returns {Promise<void>}
     */
    async _buildHeader(data) {
        const { width: pageWidth, height: pageHeight } = this._currentPage.getSize();
        const margins = IncosPDFBase.LAYOUT.margins;
        const startY = pageHeight - margins.top;

        // =========================
        // LOGO (esquina superior izquierda)
        // =========================
        const logoPath = path.resolve(__dirname, '../templates/logo.png');
        let logoLoaded = false;
        let logoHeight = 0;
        let logoWidth = 0;
        const logoMaxHeight = 64;
        const logoMaxWidth = 120;

        if (fs.existsSync(logoPath)) {
            try {
                const logoBytes = fs.readFileSync(logoPath);
                // Intentar cargar como PNG primero, luego como JPG
                let logoImage;
                try {
                    logoImage = await this._pdfDoc.embedPng(logoBytes);
                } catch (pngError) {
                    try {
                        logoImage = await this._pdfDoc.embedJpg(logoBytes);
                    } catch (jpgError) {
                        throw new Error('No se pudo cargar la imagen como PNG ni JPG');
                    }
                }

                // Calcular dimensiones manteniendo proporción
                const logoDims = logoImage.scale(1);
                const scale = Math.min(
                    logoMaxWidth / logoDims.width,
                    logoMaxHeight / logoDims.height
                );

                logoWidth = logoDims.width * scale;
                logoHeight = logoDims.height * scale;

                this._currentPage.drawImage(logoImage, {
                    x: margins.left,
                    y: startY - logoHeight,
                    width: logoWidth,
                    height: logoHeight,
                });

                logoLoaded = true;
            } catch (imageError) {
                if (this.logger) {
                    this.logger.warn('[ReciboPagoPdfGenerator] No se pudo cargar el logo:', imageError.message);
                }
            }
        }

        // =========================
        // TÍTULO AL CENTRO
        // =========================
        const titleFont = await this._loadCustomFont(this._pdfDoc, IncosPDFBase.FONTS.defaultTitleFont);
        const titleFontSize = IncosPDFBase.FONTS.title.size;
        const titleRgb = this._hexToRgb(IncosPDFBase.COLORS.primary);

        const titleText = IncosPDFBase.INSTITUTE.name;
        let titleTextWidth = 0;
        try {
            titleTextWidth = titleFont.widthOfTextAtSize(titleText, titleFontSize);
        } catch (widthError) {
            // Si widthOfTextAtSize falla (puede pasar con algunas fuentes), usar estimación
            if (this.logger) {
                this.logger.warn('[ReciboPagoPdfGenerator] Error al calcular ancho del título, usando estimación', {
                    error: widthError.message,
                });
            }
            // Estimación aproximada: 0.6 puntos por carácter
            titleTextWidth = titleText.length * titleFontSize * 0.6;
        }

        // Calcular posición X del título (centrado, considerando logo y área de recibo a la derecha)
        const reciboAreaWidth = 100; // Área para fecha y número de recibo a la derecha
        const availableWidth = pageWidth - margins.left - margins.right - reciboAreaWidth;
        const titleStartX = logoLoaded
            ? margins.left + logoWidth + 10
            : margins.left;
        const titleMaxWidth = logoLoaded
            ? availableWidth - logoWidth - 10
            : availableWidth;
        const titleX = titleStartX + (titleMaxWidth - titleTextWidth) / 2;

        this._currentPage.drawText(titleText, {
            x: titleX,
            y: startY - 20,
            size: titleFontSize,
            font: titleFont,
            color: titleRgb,
        });

        // Subtítulo: BOLETA DE APORTE VOLUNTARIO
        const subtitleFont = await this._loadCustomFont(this._pdfDoc, IncosPDFBase.FONTS.defaultTitleFont);
        const subtitleFontSize = IncosPDFBase.FONTS.subtitle.size;
        const subtitleText = 'BOLETA DE APORTE VOLUNTARIO';
        let subtitleTextWidth = 0;
        try {
            subtitleTextWidth = subtitleFont.widthOfTextAtSize(subtitleText, subtitleFontSize);
        } catch (widthError) {
            // Si widthOfTextAtSize falla, usar estimación
            if (this.logger) {
                this.logger.warn('[ReciboPagoPdfGenerator] Error al calcular ancho del subtítulo, usando estimación', {
                    error: widthError.message,
                });
            }
            subtitleTextWidth = subtitleText.length * subtitleFontSize * 0.6;
        }
        const subtitleX = titleStartX + (titleMaxWidth - subtitleTextWidth) / 2;

        this._currentPage.drawText(subtitleText, {
            x: subtitleX,
            y: startY - 40,
            size: subtitleFontSize,
            font: subtitleFont,
            color: titleRgb,
        });

        // =========================
        // FECHA (a la izquierda, debajo del subtítulo)
        // =========================
        const normalFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font);
        const normalFont = await this._pdfDoc.embedFont(normalFontName);
        const smallFontSize = IncosPDFBase.FONTS.small.size;
        const textRgb = this._hexToRgb(IncosPDFBase.COLORS.textLight);

        const fechaFormateada = this._formatFecha(data?.fechaPago || data?.fecha_pago || new Date());
        // Aumentar espaciado después del subtítulo para que la fecha sea más visible
        const fechaY = startY - 70;
        // Aumentar tamaño de fuente de la fecha (de normal.size a section.size)
        const fechaFontSize = IncosPDFBase.FONTS.section.size;

        this._currentPage.drawText('FECHA:', {
            x: margins.left,
            y: fechaY,
            size: fechaFontSize,
            font: normalFont,
            color: textRgb,
        });

        this._currentPage.drawText(fechaFormateada, {
            x: margins.left + 40,
            y: fechaY,
            size: fechaFontSize,
            font: normalFont,
            color: this._hexToRgb(IncosPDFBase.COLORS.text),
        });

        // =========================
        // CÓDIGO FAV-{GESTIÓN} (arriba del número de recibo)
        // =========================
        const gestion = data?.gestion || data?.gestionYear || new Date().getFullYear();
        const favText = `FAV-${gestion}`;
        const favFontSize = 16; // Mismo tamaño que el número del registro
        
        // Cargar fuente bold para el FAV
        const boldFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.bold.font);
        const boldFont = await this._pdfDoc.embedFont(boldFontName);
        
        let favTextWidth = 0;
        try {
            favTextWidth = boldFont.widthOfTextAtSize(favText, favFontSize);
        } catch (widthError) {
            favTextWidth = favText.length * favFontSize * 0.6;
        }

        // =========================
        // NÚMERO DE RECIBO (esquina superior derecha, debajo del FAV)
        // =========================
        const reciboBoxWidth = 75;
        const reciboBoxHeight = 30;
        const reciboBoxX = pageWidth - margins.right - reciboBoxWidth;
        // Bajar el cuadro verde: posicionarlo más abajo para dejar espacio para el FAV arriba
        const spacingBetweenFavAndBox = 8; // Espacio entre FAV y cuadro verde
        const reciboBoxY = startY - 25 - favFontSize - spacingBetweenFavAndBox; // Bajar el cuadro

        // Centrar el texto FAV sobre el cuadro verde
        const favX = reciboBoxX + (reciboBoxWidth - favTextWidth) / 2;
        // Posicionar el FAV arriba del cuadro verde
        const favY = reciboBoxY + reciboBoxHeight + spacingBetweenFavAndBox;

        // Dibujar el texto FAV ANTES del cuadro verde para que quede visible
        this._currentPage.drawText(favText, {
            x: favX,
            y: favY,
            size: favFontSize,
            font: boldFont,
            color: this._hexToRgb(IncosPDFBase.COLORS.text), // Negro
        });

        const reciboRgb = this._hexToRgb(IncosPDFBase.COLORS.primary);

        // Fondo del cuadro de número de recibo
        this._currentPage.drawRectangle({
            x: reciboBoxX,
            y: reciboBoxY,
            width: reciboBoxWidth,
            height: reciboBoxHeight,
            color: reciboRgb,
        });

        // Borde del cuadro de número de recibo
        this._currentPage.drawRectangle({
            x: reciboBoxX,
            y: reciboBoxY,
            width: reciboBoxWidth,
            height: reciboBoxHeight,
            borderColor: this._hexToRgb(IncosPDFBase.COLORS.border),
            borderWidth: 1.5,
        });

        // Número de recibo (centrado en el cuadro)
        const numeroRecibo = data?.numeroRecibo || data?.numero_recibo || data?.receiptNumber || '001';
        const numeroReciboText = String(numeroRecibo);
        let numeroReciboWidth = 0;
        try {
            numeroReciboWidth = boldFont.widthOfTextAtSize(numeroReciboText, 16);
        } catch (widthError) {
            // Si widthOfTextAtSize falla, usar estimación
            if (this.logger) {
                this.logger.warn('[ReciboPagoPdfGenerator] Error al calcular ancho del número de recibo, usando estimación', {
                    error: widthError.message,
                });
            }
            numeroReciboWidth = numeroReciboText.length * 16 * 0.6;
        }
        const numeroReciboX = reciboBoxX + (reciboBoxWidth - numeroReciboWidth) / 2;

        this._currentPage.drawText(numeroReciboText, {
            x: numeroReciboX,
            y: reciboBoxY + (reciboBoxHeight - 16) / 2 + 4, // Centrado verticalmente
            size: 16,
            font: boldFont,
            color: rgb(1, 1, 1), // Blanco
        });

        // Línea decorativa - Aumentar espaciado después del logo
        // Calcular posición Y de la línea: debajo del logo con más espacio
        const logoBottomY = logoLoaded ? (startY - logoHeight) : startY;
        const lineY = logoBottomY - 15; // 15 puntos de espacio entre logo y línea
        this._currentY = lineY;
        this._addLine(IncosPDFBase.COLORS.primary, 2);
    }

    /**
     * Agrega una línea horizontal
     * @private
     * @param {string} color - Color en hexadecimal
     * @param {number} thickness - Grosor de la línea
     */
    _addLine(color, thickness = 1) {
        if (!this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }
        if (this._currentY === null || this._currentY === undefined) {
            throw new Error('_currentY no está inicializado');
        }

        const { width: pageWidth } = this._currentPage.getSize();
        const margins = IncosPDFBase.LAYOUT.margins;
        const lineRgb = this._hexToRgb(color);

        this._currentPage.drawLine({
            start: { x: margins.left, y: this._currentY },
            end: { x: pageWidth - margins.right, y: this._currentY },
            thickness: thickness,
            color: lineRgb,
        });
    }

    /**
     * Construye la sección de datos personales del estudiante
     * 
     * @private
     * @param {Object} data - Datos del recibo
     * @returns {Promise<void>}
     */
    async _buildDatosPersonales(data) {
        const margins = IncosPDFBase.LAYOUT.margins;
        const { width: pageWidth } = this._currentPage.getSize();
        const sectionHeight = 20;

        // Espaciado antes de la sección
        this._currentY -= IncosPDFBase.LAYOUT.spacing.section;

        // Título de la sección
        const sectionRgb = this._hexToRgb(IncosPDFBase.COLORS.primary);
        this._currentPage.drawRectangle({
            x: margins.left,
            y: this._currentY - sectionHeight,
            width: pageWidth - margins.left - margins.right,
            height: sectionHeight,
            color: sectionRgb,
        });

        const boldFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.bold.font);
        const boldFont = await this._pdfDoc.embedFont(boldFontName);

        this._currentPage.drawText('DATOS PERSONALES DEL ESTUDIANTE', {
            x: margins.left + 5,
            y: this._currentY - sectionHeight + 6,
            size: IncosPDFBase.FONTS.section.size,
            font: boldFont,
            color: rgb(1, 1, 1), // Blanco
        });

        this._currentY -= sectionHeight;

        // Fila 1: APELLIDOS Y NOMBRES
        if (data.nombreCompleto) {
            await this._addTableRow('APELLIDOS Y NOMBRES', data.nombreCompleto, false);
        }

        // Fila 2: N° C.I.
        if (data.ci) {
            await this._addTableRow('CÉDULA DE IDENTIDAD', data.ci, false);
        }

        // Fila 3: CARRERA | CURSO Y PARALELO | Año (solo si hay datos válidos)
        const hasCarrera = data.carrera && String(data.carrera).trim() !== '' && data.carrera !== 'N/A';
        const hasCursoParalelo = data.cursoParalelo && String(data.cursoParalelo).trim() !== '' && data.cursoParalelo !== 'N/A';
        const hasAnio = data.anio && String(data.anio).trim() !== '' && data.anio !== 'N/A' && data.anio !== '1° A';

        if (hasCarrera || hasCursoParalelo || hasAnio) {
            const columns = [];
            if (hasCarrera) {
                columns.push({
                    label: 'CARRERA',
                    value: String(data.carrera).trim(),
                    width: (hasCursoParalelo || hasAnio) ? 0.5 : 1.0
                });
            }
            if (hasCursoParalelo) {
                columns.push({
                    label: 'CURSO Y PARALELO',
                    value: String(data.cursoParalelo).trim(),
                    width: (hasCarrera && hasAnio) ? 0.25 : ((hasCarrera || hasAnio) ? 0.5 : 1.0)
                });
            }
            if (hasAnio) {
                columns.push({
                    label: '',
                    value: String(data.anio).trim(),
                    width: (hasCarrera && hasCursoParalelo) ? 0.25 : ((hasCarrera || hasCursoParalelo) ? 0.5 : 1.0)
                });
            }

            if (columns.length > 0) {
                // Normalizar anchos
                const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
                if (totalWidth > 0) {
                    columns.forEach(col => {
                        col.width = col.width / totalWidth;
                    });
                }
                await this._addTableRowMultipleColumns(columns);
            }
        }

        // Recibo por cuota: base, descuento, total a pagar, ya pagado, monto de esta cuota, saldo pendiente
        const montoTotal = Number(data.montoTotal) ?? 400.00;
        const descuentoBeca = Number(data.descuentoBeca) ?? 0;
        const montoObligatorio = Number(data.montoObligatorio) ?? (montoTotal - descuentoBeca);
        const totalPagadoAntes = Number(data.totalPagadoAntes) ?? 0;
        const montoEstaCuota = Number(data.montoPagado) ?? 0;
        const saldoPendiente = data.saldoPendiente != null ? Number(data.saldoPendiente) : null;

        const esReciboPorCuota = saldoPendiente !== null && saldoPendiente !== undefined;

        if (esReciboPorCuota) {
            await this._addTableRow('BASE DEL APORTE', this._formatMonto(montoTotal), false);
            if (descuentoBeca > 0) {
                await this._addTableRow('DESCUENTO POR BECA', `- ${this._formatMonto(descuentoBeca)}`, false);
            }
            await this._addTableRow('TOTAL A PAGAR', this._formatMonto(montoObligatorio), true);
            if (totalPagadoAntes > 0) {
                await this._addTableRow('MONTO YA PAGADO', this._formatMonto(totalPagadoAntes), false);
            }
            const esExclusionCuota = (montoEstaCuota === 0 || montoEstaCuota < 0) && data.becaInfo && String(data.becaInfo.nombre ?? data.becaInfo.name ?? '').trim() !== '';
            const valorAporteCuota = esExclusionCuota
                ? String(data.becaInfo.nombre ?? data.becaInfo.name).trim().toUpperCase()
                : this._formatAporte({ montoPagado: montoEstaCuota, becaInfo: data.becaInfo });
            await this._addTableRow(esExclusionCuota ? 'EXCLUSIÓN DE PAGO' : 'MONTO PAGADO', valorAporteCuota, true);
            await this._addTableRow('SALDO PENDIENTE', this._formatMonto(saldoPendiente), true);
        } else {
            if (descuentoBeca > 0) {
                await this._addTableRow('MONTO TOTAL', this._formatMonto(montoTotal), false);
                await this._addTableRow('DESCUENTO POR BECA', `- ${this._formatMonto(descuentoBeca)}`, false);
            }
            const montoPagadoCabecera = montoEstaCuota || (montoTotal - descuentoBeca);
            const esExclusionCabecera = (Number(montoPagadoCabecera) === 0 || Number(montoPagadoCabecera) < 0) && data.becaInfo && String(data.becaInfo.nombre ?? data.becaInfo.name ?? '').trim() !== '';
            const valorAporteCabecera = esExclusionCabecera
                ? String(data.becaInfo.nombre ?? data.becaInfo.name).trim().toUpperCase()
                : this._formatAporte({ montoPagado: montoPagadoCabecera, becaInfo: data.becaInfo });
            await this._addTableRow(esExclusionCabecera ? 'EXCLUSIÓN DE PAGO' : 'MONTO PAGADO', valorAporteCabecera, true);
        }

        // Fila OBSERVACIÓN debajo del cuadro de datos personales (plazo, datos adicionales)
        // Usa fila con texto que hace wrap para evitar desborde
        const observacion = (data.observacion ?? data.descripcion ?? '').toString().trim();
        await this._addTableRowObservacion('OBSERVACIÓN', observacion || '—');
    }

    /**
     * Agrega una fila de tabla para OBSERVACIÓN con valor que hace wrap en varias líneas.
     * Evita que el texto se desborde cuando es largo.
     * @private
     * @param {string} label - Etiqueta (ej. OBSERVACIÓN)
     * @param {string} value - Texto que puede ser largo
     * @returns {Promise<void>}
     */
    async _addTableRowObservacion(label, value) {
        const margins = IncosPDFBase.LAYOUT.margins;
        const { width: pageWidth } = this._currentPage.getSize();
        const totalWidth = pageWidth - margins.left - margins.right;
        const labelWidth = totalWidth * 0.3;
        const valueWidth = totalWidth - labelWidth;
        const paddingHorizontal = 6;
        const paddingVertical = 6;
        const lineSpacing = IncosPDFBase.LAYOUT.spacing.line ?? 4;
        const minRowHeight = 22;

        // Mismo formato y tamaño de fuente que _addTableRow (filas normales)
        const boldFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.bold.font);
        const normalFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font);
        const boldFont = await this._pdfDoc.embedFont(boldFontName);
        const normalFont = await this._pdfDoc.embedFont(normalFontName);
        const fontSize = IncosPDFBase.FONTS.normal.size;
        const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);
        const borderRgb = this._hexToRgb(IncosPDFBase.COLORS.border);

        const maxValueWidth = valueWidth - paddingHorizontal * 2;
        const valueLines = value
            ? this._wrapText(value, normalFont, fontSize, maxValueWidth)
            : ['—'];
        const lineHeight = fontSize + lineSpacing;
        const contentHeight = valueLines.length * lineHeight - lineSpacing;
        const rowHeight = Math.max(minRowHeight, contentHeight + paddingVertical * 2);

        const rowY = this._currentY - rowHeight;

        // Celdas: label (izq) y valor (der)
        this._currentPage.drawRectangle({
            x: margins.left,
            y: rowY,
            width: labelWidth,
            height: rowHeight,
            borderColor: borderRgb,
            borderWidth: 1,
        });
        this._currentPage.drawRectangle({
            x: margins.left + labelWidth,
            y: rowY,
            width: valueWidth,
            height: rowHeight,
            borderColor: borderRgb,
            borderWidth: 1,
        });

        // Label (centrado verticalmente en la celda izquierda)
        const labelY = rowY + (rowHeight - fontSize) / 2 + fontSize * 0.3;
        this._currentPage.drawText(label, {
            x: margins.left + 3,
            y: labelY,
            size: fontSize,
            font: boldFont,
            color: textRgb,
        });

        // Valor: varias líneas desde arriba de la celda
        const valueStartY = rowY + rowHeight - paddingVertical - fontSize;
        let currentValueY = valueStartY;
        for (const line of valueLines) {
            this._currentPage.drawText(line, {
                x: margins.left + labelWidth + paddingHorizontal,
                y: currentValueY,
                size: fontSize,
                font: normalFont,
                color: textRgb,
            });
            currentValueY -= lineHeight;
        }

        this._currentY -= rowHeight;
    }

    /**
     * Agrega una fila de tabla simple (label | value)
     * @private
     * @param {string} label - Etiqueta
     * @param {string} value - Valor
     * @param {boolean} isHeader - Si es header (bold)
     * @returns {Promise<void>}
     */
    async _addTableRow(label, value, isHeader = false) {
        const margins = IncosPDFBase.LAYOUT.margins;
        const { width: pageWidth } = this._currentPage.getSize();
        const rowHeight = 22; // Aumentado para mejor espaciado
        const labelWidth = (pageWidth - margins.left - margins.right) * 0.3;
        const rowY = this._currentY - rowHeight;

        // Bordes
        const borderRgb = this._hexToRgb(IncosPDFBase.COLORS.border);
        this._currentPage.drawRectangle({
            x: margins.left,
            y: rowY,
            width: labelWidth,
            height: rowHeight,
            borderColor: borderRgb,
            borderWidth: 1,
        });
        this._currentPage.drawRectangle({
            x: margins.left + labelWidth,
            y: rowY,
            width: pageWidth - margins.left - margins.right - labelWidth,
            height: rowHeight,
            borderColor: borderRgb,
            borderWidth: 1,
        });

        // Textos
        const boldFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.bold.font);
        const normalFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font);
        const boldFont = await this._pdfDoc.embedFont(boldFontName);
        const normalFont = await this._pdfDoc.embedFont(normalFontName);

        // Tamaño: mayor solo para filas marcadas como destacadas (isHeader)
        const fontSize = isHeader ? IncosPDFBase.FONTS.amount.size : IncosPDFBase.FONTS.normal.size;
        const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);

        // Label: siempre en negrita
        this._currentPage.drawText(label, {
            x: margins.left + 3,
            y: rowY + 6, // Ajustado para centrado vertical
            size: fontSize,
            font: boldFont,
            color: textRgb,
        });

        // Valor: negrita solo cuando isHeader (ej. TOTAL A PAGAR, MONTO PAGADO, SALDO PENDIENTE)
        this._currentPage.drawText(value, {
            x: margins.left + labelWidth + 3,
            y: rowY + 6, // Ajustado para centrado vertical
            size: fontSize,
            font: isHeader ? boldFont : normalFont,
            color: textRgb,
        });

        this._currentY -= rowHeight;
    }

    /**
     * Agrega una fila de tabla con múltiples columnas
     * @private
     * @param {Array} columns - Array de {label, value, width}
     * @returns {Promise<void>}
     */
    async _addTableRowMultipleColumns(columns) {
        const margins = IncosPDFBase.LAYOUT.margins;
        const { width: pageWidth } = this._currentPage.getSize();
        const rowHeight = 18;
        const rowY = this._currentY - rowHeight;
        const totalWidth = pageWidth - margins.left - margins.right;

        const borderRgb = this._hexToRgb(IncosPDFBase.COLORS.border);
        const boldFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.bold.font);
        const normalFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font);
        const boldFont = await this._pdfDoc.embedFont(boldFontName);
        const normalFont = await this._pdfDoc.embedFont(normalFontName);
        const fontSize = IncosPDFBase.FONTS.normal.size;
        const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);

        let currentX = margins.left;
        for (const col of columns) {
            const colWidth = totalWidth * col.width;

            // Borde
            this._currentPage.drawRectangle({
                x: currentX,
                y: rowY,
                width: colWidth,
                height: rowHeight,
                borderColor: borderRgb,
                borderWidth: 1,
            });

            // Label (si existe)
            if (col.label && col.label.trim() !== '') {
                this._currentPage.drawText(col.label, {
                    x: currentX + 3,
                    y: rowY + 3,
                    size: fontSize,
                    font: boldFont,
                    color: textRgb,
                });
            }

            // Value
            if (col.value && col.value.trim() !== '') {
                this._currentPage.drawText(col.value, {
                    x: currentX + 3,
                    y: rowY + (col.label ? 11 : 5),
                    size: fontSize,
                    font: normalFont,
                    color: textRgb,
                });
            }

            currentX += colWidth;
        }

        this._currentY -= rowHeight;
    }

    /**
     * Construye la sección de declaración jurada
     * 
     * @private
     * @param {Object} data - Datos del recibo
     * @returns {Promise<void>}
     */
    async _buildDeclaracionJurada(data) {
        const margins = IncosPDFBase.LAYOUT.margins;
        const { width: pageWidth } = this._currentPage.getSize();

        // Espaciado antes de la sección
        this._currentY -= IncosPDFBase.LAYOUT.spacing.section;

        // Título de la sección
        const sectionHeight = 20;
        const sectionRgb = this._hexToRgb(IncosPDFBase.COLORS.primary);
        this._currentPage.drawRectangle({
            x: margins.left,
            y: this._currentY - sectionHeight,
            width: pageWidth - margins.left - margins.right,
            height: sectionHeight,
            color: sectionRgb,
        });

        const boldFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.bold.font);
        const boldFont = await this._pdfDoc.embedFont(boldFontName);

        this._currentPage.drawText('DECLARACIÓN JURADA', {
            x: margins.left + 5,
            y: this._currentY - sectionHeight + 6,
            size: IncosPDFBase.FONTS.section.size,
            font: boldFont,
            color: rgb(1, 1, 1), // Blanco
        });

        this._currentY -= sectionHeight;

        // Contenido de la declaración
        const declaracionTexto = this._getDeclaracionTexto(data);

        // Preparar fuentes y estilos (necesarios para calcular altura del cuadro)
        const normalFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font);
        const normalFont = await this._pdfDoc.embedFont(normalFontName);
        const fontSize = IncosPDFBase.FONTS.section.size;
        const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);
        const lineSpacing = IncosPDFBase.LAYOUT.spacing.line;
        const paragraphSpacing = IncosPDFBase.LAYOUT.spacing.paragraph;

        // Calcular altura necesaria para el contenido antes de dibujar el cuadro
        // Estimación: cada párrafo tiene aproximadamente 3-4 líneas, más espacio para firmas
        const parrafosEstimados = declaracionTexto.split(/\n\s*\n/).filter(p => p.trim() !== '');
        const estimatedLines = parrafosEstimados.length * 3.5; // Estimación de líneas por párrafo
        const espacioFirmas = 60; // Espacio para las firmas
        const boxHeightBase = 220; // Altura base suficiente para texto y firmas
        const boxHeight = Math.max(
            boxHeightBase,
            (estimatedLines * (fontSize + lineSpacing)) + espacioFirmas + 30
        );

        // Borde del cuadro
        const borderRgb = this._hexToRgb(IncosPDFBase.COLORS.border);
        this._currentPage.drawRectangle({
            x: margins.left,
            y: this._currentY - boxHeight,
            width: pageWidth - margins.left - margins.right,
            height: boxHeight,
            borderColor: borderRgb,
            borderWidth: 1,
        });

        // Calcular ancho máximo disponible (con padding interno del cuadro)
        const padding = 16; // 8 puntos a cada lado
        const maxWidth = pageWidth - margins.left - margins.right - padding;

        // Dividir texto en párrafos (respetar saltos de línea dobles)
        // Ya calculamos parrafos arriba, pero lo recalculamos aquí para usar en el loop
        const parrafos = declaracionTexto.split(/\n\s*\n/).filter(p => p.trim() !== '');

        let currentY = this._currentY - 12; // Empezar un poco más arriba

        for (let i = 0; i < parrafos.length; i++) {
            const parrafo = parrafos[i].trim();

            // Envolver cada párrafo en líneas
            let parrafoLines = [];
            try {
                parrafoLines = this._wrapText(parrafo, normalFont, fontSize, maxWidth);
            } catch (wrapError) {
                if (this.logger) {
                    this.logger.error('[ReciboPagoPdfGenerator] Error al envolver párrafo de declaración', {
                        error: wrapError.message,
                        parrafo: parrafo?.substring(0, 100),
                    });
                }
                // Fallback: dividir por espacios
                parrafoLines = parrafo.split(' ').filter(w => w.trim() !== '');
            }

            // Dibujar cada línea del párrafo
            for (const line of parrafoLines) {
                try {
                    this._currentPage.drawText(line, {
                        x: margins.left + 8,
                        y: currentY,
                        size: fontSize,
                        font: normalFont,
                        color: textRgb,
                    });
                } catch (drawError) {
                    if (this.logger) {
                        this.logger.error('[ReciboPagoPdfGenerator] Error al dibujar línea de declaración', {
                            error: drawError.message,
                            line: line?.substring(0, 50),
                        });
                    }
                }
                currentY -= fontSize + lineSpacing;
            }

            // Espaciado entre párrafos (excepto después del último)
            if (i < parrafos.length - 1) {
                currentY -= paragraphSpacing - lineSpacing;
            }
        }

        // Área de firmas dentro del cuadro
        // Calcular posición Y para las firmas (debajo del texto, con espacio)
        const espacioEntreTextoYFirmas = 20;
        const firmaY = currentY - espacioEntreTextoYFirmas;
        const firmaLineHeight = fontSize + 5;

        // Firma del estudiante (izquierda)
        const firmaEstudianteText = 'Firma del estudiante: .......................................';
        this._currentPage.drawText(firmaEstudianteText, {
            x: margins.left + 8,
            y: firmaY,
            size: fontSize,
            font: normalFont,
            color: textRgb,
        });

        // Carrera y Paralelo (derecha, alineados) - Campos para llenar manualmente
        const rightAlignX = pageWidth - margins.right - 8;

        // Carrera (siempre visible, con puntos para llenar manualmente)
        const carreraText = 'Carrera: .......................................';
        let carreraTextWidth = 0;
        try {
            carreraTextWidth = normalFont.widthOfTextAtSize(carreraText, fontSize);
        } catch (widthError) {
            // Estimación si falla
            carreraTextWidth = carreraText.length * fontSize * 0.6;
        }
        this._currentPage.drawText(carreraText, {
            x: rightAlignX - carreraTextWidth,
            y: firmaY,
            size: fontSize,
            font: normalFont,
            color: textRgb,
        });

        // Paralelo (siempre visible, con puntos para llenar manualmente, debajo de carrera)
        const paraleloText = 'Paralelo: .......................................';
        let paraleloTextWidth = 0;
        try {
            paraleloTextWidth = normalFont.widthOfTextAtSize(paraleloText, fontSize);
        } catch (widthError) {
            // Estimación si falla
            paraleloTextWidth = paraleloText.length * fontSize * 0.6;
        }
        this._currentPage.drawText(paraleloText, {
            x: rightAlignX - paraleloTextWidth,
            y: firmaY - firmaLineHeight,
            size: fontSize,
            font: normalFont,
            color: textRgb,
        });

    }

    /**
     * Construye el bloque de firma (footer)
     * 
     * @private
     * @param {Object} data - Datos del recibo
     * @returns {Promise<void>}
     */
    async _buildFirma(data) {
        await this._addSignatureBlock({
            lines: [
                IncosPDFBase.SIGNATURE.LABEL,
                `C.I.: ${data.ci || ''} ${data.expedicion || ''}`.trim()
            ]
        });
    }

    /**
     * Obtiene el texto de la declaración jurada
     * @private
     * @param {Object} data - Datos del recibo
     * @returns {string}
     */
    _getDeclaracionTexto(data) {
        return `Yo, el estudiante arriba descrito, declaro de manera voluntaria y consciente que realizo el presente aporte económico, sin que exista ningún tipo de obligación, presión o condicionamiento académico.

Manifiesto que tengo pleno conocimiento de que este aporte será destinado exclusivamente a cubrir gastos de equipamiento, mantenimiento, materiales, suministros y actividades necesarias, los cuales serán ejecutados de manera gradual durante la gestión, en función a la planificación del POA institucional, con el objetivo de fortalecer mi formación y desarrollo profesional.

Asimismo, dejo constancia de que estoy de acuerdo con el monto aportado y con el destino del mismo, entendiendo que se trata de un aporte voluntario, aceptado libremente y sin derecho a reclamo posterior.

En conformidad, firmo la presente para los fines que correspondan.`;
    }

    /**
     * Formatea un monto en formato monetario
     * @private
     * @param {number} monto - Monto a formatear
     * @returns {string} Monto formateado (ej: "400.00 Bs")
     */
    _formatMonto(monto) {
        if (monto === null || monto === undefined) return '0.00 Bs';
        return `${Number(monto).toFixed(2)} Bs`;
    }

    /**
     * Formatea la información del aporte.
     * Si el monto es 0 y hay beca/descuento aplicado (becaInfo), devuelve solo el nombre del descuento en mayúsculas
     * (el prefijo "EXCLUSIÓN DE PAGO" va en la etiqueta de la fila, no aquí).
     * @private
     * @param {Object} data - Datos con montoPagado y opcionalmente becaInfo { nombre, porcentaje }
     * @returns {string} Aporte formateado
     */
    _formatAporte(data) {
        try {
            if (!data || typeof data !== 'object') {
                return '0.00 Bs';
            }

            const monto = Number(data.montoPagado ?? data.montoTotal ?? data.monto_pagado ?? data.monto_total ?? 0);

            if (monto === 0 || monto < 0 || isNaN(monto)) {
                const becaInfo = data.becaInfo;
                const nombreDescuento = becaInfo?.nombre ?? becaInfo?.name ?? '';
                if (nombreDescuento && String(nombreDescuento).trim() !== '') {
                    return String(nombreDescuento).trim().toUpperCase();
                }
                return 'GRATIS';
            }

            const bolivianos = Math.floor(monto);
            const centavos = Math.round((monto - bolivianos) * 100);
            const montoEnLetras = this._numberToWords(bolivianos);

            return `${bolivianos} Bs (${montoEnLetras} con ${String(centavos).padStart(2, '0')}/100 bolivianos)`;
        } catch (error) {
            if (this.logger) {
                this.logger.error('[ReciboPagoPdfGenerator] Error en _formatAporte:', error.message);
            }
            return '0.00 Bs';
        }
    }

    /**
     * Convierte un número a palabras en español
     * @private
     * @param {number} num - Número a convertir
     * @returns {string} Número en palabras
     */
    _numberToWords(num) {
        if (num === 0) return 'cero';

        const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
        const decenas = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
        const especiales = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];

        if (num < 10) return unidades[num];
        if (num < 20) return especiales[num - 10];
        if (num < 100) {
            const decena = Math.floor(num / 10);
            const unidad = num % 10;
            if (unidad === 0) return decenas[decena];
            return `${decenas[decena]} y ${unidades[unidad]}`;
        }
        if (num < 1000) {
            const centena = Math.floor(num / 100);
            const resto = num % 100;
            let resultado = centena === 1 ? 'ciento' : `${unidades[centena]}cientos`;
            if (resto > 0) resultado += ` ${this._numberToWords(resto)}`;
            return resultado;
        }

        return `${num} bolivianos`;
    }

    /**
     * Formatea la fecha en formato DD/MM/YYYY
     * @private
     * @param {string|Date} fecha - Fecha a formatear
     * @returns {string} Fecha formateada
     */
    _formatFecha(fecha) {
        try {
            if (!fecha) {
                const hoy = new Date();
                return `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`;
            }

            // Si es string en formato YYYY-MM-DD
            if (typeof fecha === 'string' && fecha.includes('-')) {
                const partes = fecha.split('-');
                if (partes.length === 3) {
                    return `${partes[2]}/${partes[1]}/${partes[0]}`;
                }
            }

            // Si es string en formato DD/MM/YYYY, devolverlo tal cual
            if (typeof fecha === 'string' && fecha.includes('/')) {
                return fecha;
            }

            // Si es Date object
            if (fecha instanceof Date) {
                if (isNaN(fecha.getTime())) {
                    const hoy = new Date();
                    return `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`;
                }
                return `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${fecha.getFullYear()}`;
            }

            // Si no se puede formatear, usar fecha actual
            const hoy = new Date();
            return `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`;
        } catch (error) {
            if (this.logger) {
                this.logger.error('[ReciboPagoPdfGenerator] Error en _formatFecha:', error.message);
            }
            const hoy = new Date();
            return `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`;
        }
    }
}
