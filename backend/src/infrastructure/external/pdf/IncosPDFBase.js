/**
 * IncosPDFBase - Constantes y configuración para generación de PDFs del Instituto INCOS
 * 
 * Este archivo contiene SOLO constantes estáticas y configuración compartida.
 * NO contiene lógica de generación de PDFs.
 * 
 * Para generar PDFs:
 * - Usa IncosPDFLibBase (pdf-lib) para editar plantillas o crear desde cero
 * - Las constantes aquí definidas son usadas por todos los generadores
 * 
 * Contenido:
 * - Configuración institucional (INSTITUTE)
 * - Títulos de documentos (DOCUMENT_TITLES)
 * - Colores institucionales (COLORS)
 * - Fuentes y tamaños (FONTS)
 * - Márgenes y espaciado (LAYOUT)
 * - Rutas de recursos (TEMPLATES_DIR, FONTS_DIR)
 * 
 * Principios SOLID:
 * - Single Responsibility: Solo contiene constantes de configuración
 * - Dependency Inversion: Proporciona abstracción de configuración
 * 
 * Clean Architecture:
 * - Infrastructure Layer: Configuración compartida
 * - Usado por IncosPDFLibBase y otros generadores
 * 
 * NOTA: Este archivo NO es una clase base para extender.
 * Solo contiene constantes estáticas que pueden ser usadas por cualquier generador.
 */

import path from 'path';
import { fileURLToPath } from 'url';

// Obtener __dirname para rutas de plantillas y fuentes
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Clase estática con constantes y configuración para generación de PDFs
 * 
 * NO es una clase base para extender. Solo contiene constantes estáticas.
 * Para generar PDFs, usa IncosPDFLibBase (pdf-lib).
 */
export class IncosPDFBase {
    // ============================================
    // CONFIGURACIÓN INSTITUCIONAL
    // ============================================

    static INSTITUTE = {
        name: 'INSTITUTO TÉCNICO INCOS SANTA CRUZ',
        motto: 'RESOLUCIÓN MINISTERIAL No. 426/2016',
    };

    // ============================================
    // TÍTULOS DE DOCUMENTOS
    // ============================================

    static DOCUMENT_TITLES = {
        ACTA_COMPROMISO: 'ACTA DE COMPROMISO PARA LA ENTREGA DE DOCUMENTOS',
    };

    // ============================================
    // TÍTULOS DE SECCIONES
    // ============================================

    static SECTION_TITLES = {
        FECHA_REGISTRO: 'I. FECHA DE REGISTRO',
        NOMBRE_IDENTIFICACION: 'II. NOMBRE COMPLETO E IDENTIFICACION',
        REQUISITOS: 'III. REQUISISTOS',
        PLAZOS_COMPROMISO: 'IV. PLAZOS DE COMPROMISO',
        MOTIVOS: 'V. MOTIVOS',
    };

    // ============================================
    // TEXTOS DE PLANTILLA
    // ============================================

    /**
     * Textos de plantilla para documentos
     * Usar placeholders como {FECHA}, {APELLIDO_PATERNO}, {APELLIDO_MATERNO}, {NOMBRES}, {CI}, {EXPEDICION}
     */
    static TEMPLATE_TEXTS = {
        FECHA_REGISTRO: 'En la ciudad de Santa Cruz de la Sierra, {FECHA}.',
        NOMBRE_IDENTIFICACION: 'Yo {APELLIDO_PATERNO} {APELLIDO_MATERNO} {NOMBRES} con C.I. {CI} {EXPEDICION}, me comprometo completar la documentación Faltante.',
        REQUISITOS_INTRO: 'Los siguientes documentos están pendientes de entrega:',
    };

    // ============================================
    // COLORES INSTITUCIONALES
    // ============================================

    static COLORS = {
        primary: '#196b45',      // Verde primario institucional
        secondary: '#8b5cf6',    // Púrpura accent
        text: '#000000',         // Negro texto principal
        textLight: '#666666',    // Gris texto secundario
        border: '#cccccc',       // Gris bordes
        background: '#f5f5f5',   // Fondo claro
    };

    // ============================================
    // FUENTES Y TAMAÑOS
    // ============================================

    static FONTS = {
        title: { size: 16 }, // Tamaño para títulos (usa defaultTitleFont)
        subtitle: { size: 14 }, // Tamaño para subtítulos (usa defaultTitleFont)
        section: { size: 12, font: 'Helvetica-Bold' }, // Títulos de secciones (Helvetica-Bold)
        normal: { size: 10, font: 'Helvetica' },
        small: { size: 8, font: 'Helvetica' },
        bold: { size: 10, font: 'Helvetica-Bold' },
        // Fuente personalizada por defecto para títulos de documentos
        defaultTitleFont: 'britannic-bold-regular',
    };

    // ============================================
    // MÁRGENES Y ESPACIADO
    // ============================================

    static LAYOUT = {
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        spacing: {
            section: 20,      // Entre secciones
            subsection: 15,   // Entre subsecciones
            paragraph: 16,    // Entre párrafos
            line: 5,          // Entre líneas
            bullet: 8,        // Entre viñetas y texto
        },
        pageSize: 'LETTER',
        lineHeight: 15,
        labelWidth: 150,    // Ancho por defecto para etiquetas en campos de formulario
        // Posicionamiento para documentos con plantilla (encabezado)
        headerHeight: 100,  // Altura del encabezado desde arriba (para plantillas)
        spacingAfterHeader: 15, // Espacio después del encabezado antes del contenido
        // Configuración de viñetas
        bulletIndent: 16,   // Indentación adicional para viñetas (más a la derecha que las secciones)
        bulletDiameter: 4,  // Diámetro del círculo de la viñeta (en puntos)
        bulletSpacing: 8,  // Espacio entre el círculo y el texto de la viñeta (en puntos)
    };

    // ============================================
    // TAMAÑOS DE PÁGINA
    // ============================================

    /**
     * Mapeo de tamaños de página a dimensiones en puntos [ancho, alto]
     * Usado por generadores que crean documentos desde cero
     */
    static PAGE_SIZES = {
        'LETTER': [612, 792],  // 8.5" x 11" en puntos
        'A4': [595, 842],
        'LEGAL': [612, 1008],
    };

    // ============================================
    // RUTAS DE RECURSOS
    // ============================================

    /**
     * Ruta al directorio de plantillas PDF
     * Usado por generadores que usan pdf-lib para cargar plantillas
     */
    static TEMPLATES_DIR = path.join(__dirname, '../templates');

    /**
     * Ruta al directorio de fuentes personalizadas (TTF/OTF)
     * Usado por generadores que necesitan fuentes personalizadas
     */
    static FONTS_DIR = path.join(IncosPDFBase.TEMPLATES_DIR, 'fonts');
}
