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

    /**
     * Líneas del encabezado institucional (Ministerio, Viceministerio, Dirección, Instituto).
     * Se dibujan arriba del título del documento en el Formulario de Inscripción y otros PDFs.
     * Color: negro (COLORS.text). Orden: de arriba a abajo. Sin resolución ministerial en este bloque.
     */
    static get INSTITUTIONAL_HEADER_LINES() {
        return [
            'MINISTERIO DE EDUCACIÓN',
            'VICEMINISTERIO DE EDUCACIÓN SUPERIOR DE FORMACIÓN PROFESIONAL',
            'DIRECCIÓN GENERAL DE EDUCACIÓN SUPERIOR TÉCNICA TECNOLÓGICA LINGÜÍSTICA Y ARTÍSTICA',
        ];
    }

    // ============================================
    // TÍTULOS DE DOCUMENTOS
    // ============================================

    static DOCUMENT_TITLES = {
        ACTA_COMPROMISO: 'ACTA DE COMPROMISO PARA LA ENTREGA DE DOCUMENTOS',
        FORMULARIO_INSCRIPCION: 'FORMULARIO DE INSCRIPCIÓN',
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

    /**
     * Títulos de secciones del Formulario de Inscripción (I, II, III).
     * Usado por FormularioInscripcionPdfGenerator.
     */
    static FORMULARIO_SECTION_TITLES = {
        DATOS_PERSONALES: 'I. DATOS PERSONALES',
        DATOS_ACADEMICOS: 'II. DATOS ACADÉMICOS',
        DOCUMENTOS_RECEPCIONADOS: 'III. DOCUMENTOS RECEPCIONADOS',
    };

    // ============================================
    // TEXTOS DE PLANTILLA
    // ============================================

    /**
     * Textos de plantilla para documentos
     * Usar placeholders como {FECHA}, {APELLIDO_PATERNO}, {APELLIDO_MATERNO}, {NOMBRES}, {CI}, {EXPEDICION}, {INSTITUTE_NAME}, {DIAS_PLAZO}
     */
    static TEMPLATE_TEXTS = {
        FECHA_REGISTRO: 'En la ciudad de Santa Cruz de la Sierra, {FECHA}.',
        NOMBRE_IDENTIFICACION: 'Yo {APELLIDO_PATERNO} {APELLIDO_MATERNO} {NOMBRES} con C.I. {CI} {EXPEDICION}, me comprometo completar la documentación Faltante.',
        REQUISITOS_INTRO: 'Los siguientes documentos están pendientes de entrega:',
        PLAZOS_COMPROMISO: 'En un plazo máximo de {DIAS_PLAZO} días, a partir de la fecha de registro. Una vez vencido el plazo y en caso de no haber completado los requisitos exigidos por el {INSTITUTE_NAME}, me sujeto a las disposiciones de las Autoridades del Instituto.',
        MOTIVOS_INTRO: 'Por estos motivos no ha presentado los documentos faltantes:',
    };

    /**
     * Textos del bloque de firma (footer). Independiente de TEMPLATE_TEXTS.
     * LABEL: etiqueta bajo la línea (ej. "Firma"). CI_FORMAT: placeholders {CI}, {EXPEDICION}.
     */
    static SIGNATURE = {
        LABEL: 'Firma',
        CI_FORMAT: 'C.I.: {CI} {EXPEDICION}',
    };

    /**
     * Textos del Formulario de Inscripción (I. DATOS PERSONALES).
     * Solo labels (clave); el generador construye el valor y lo pasa.
     */
    static FORMULARIO_TEXTS = {
        /** Etiqueta del recuadro en esquina superior derecha del Formulario de Inscripción */
        REGISTRO_HEADER_LABEL: 'No. Registro',
        NOMBRES_APELLIDOS_LABEL: 'Nombres y Apellidos:',
        CI_LABEL: 'C.I.:',
        GENERO_LABEL: 'Género:',
        ESTADO_CIVIL_LABEL: 'Estado Civil:',
        TIPO_SANGRE_LABEL: 'Tipo de sangre:',
        DISCAPACIDAD_LABEL: 'Discapacidad:',
        EMAIL_LABEL: 'Correo Electrónico:',
        CELULAR_LABEL: 'Celular:',
        /** Línea debajo del grid cuando tiene discapacidad; valor desde vista_base_estudiante_discapacidades. */
        DETALLE_DISCAPACIDAD_LABEL: 'Detalle discapacidad:',
        /**
         * Texto del detalle por ítem. Reemplazo de valores como TEMPLATE_TEXTS.
         * Placeholders: {TIPO}, {GRADO}, {DESCRIPCION}, {CAUSA}. Solo se incluyen segmentos con valor.
         */
        DETALLE_DISCAPACIDAD_ITEM_FMT: 'Tipo: {TIPO}. Grado: {GRADO}. Descripción: {DESCRIPCION}. Causa: {CAUSA}.',
        /** Separador entre ítems de discapacidad (varios ítems en una sola línea). */
        DETALLE_DISCAPACIDAD_SEP: ' — ',
        // Lugar y fecha de nacimiento, domicilio, idioma (orígenes + residencia)
        LUGAR_NACIMIENTO_LABEL: 'Lugar de nacimiento:',
        DOMICILIO_LABEL: 'Domicilio:',
        // Contacto de emergencia (apoderado)
        CONTACTO_EMERGENCIA_TITULO: 'Contacto de emergencia',
        PARENTESCO_LABEL: 'Parentesco:',
        CELULAR_CONTACTO_LABEL: 'Celular:',
        DATOS_REFERENCIA_LABEL: 'Datos de referencia:',
        /** Valor mostrado cuando el apoderado no tiene nombre registrado */
        SIN_NOMBRE_PLACEHOLDER: 'Sin nombre',
        // Datos del trabajo (estudiante trabaja, empresa, cargo)
        TRABAJA_LABEL: 'Trabaja:',
        EMPRESA_INSTITUCION_LABEL: 'Empresa o institución:',
        CARGO_LABEL: 'Cargo:',
        LOCALIDAD_LABEL: 'Localidad:',
        DEPARTAMENTO_LABEL: 'Departamento:',
        NACIONALIDAD_LABEL: 'Nacionalidad:',
        EDAD_LABEL: 'Edad:',
        FECHA_NACIMIENTO_LABEL: 'Fecha de nacimiento:',
        IDIOMA_PRINCIPAL_LABEL: 'Idioma principal:',
        IDIOMA_SECUNDARIO_LABEL: 'Idioma secundario:',
        TELEFONO_FIJO_LABEL: 'Teléfono fijo:',
        IDIOMA_ORIGEN_LABEL: 'Idioma de origen:',
    };

    // ============================================
    // COLORES INSTITUCIONALES
    // ============================================

    static COLORS = {
        primary: '#196b45', // Verde primario institucional
        secondary: '#8b5cf6', // Púrpura accent
        text: '#000000', // Negro texto principal
        textLight: '#666666', // Gris texto secundario
        border: '#000000', // Gris bordes
        background: '#f5f5f5', // Fondo claro
    };

    // ============================================
    // FUENTES Y TAMAÑOS
    // ============================================

    static FONTS = {
        title: { size: 14 }, // Tamaño para títulos (usa defaultTitleFont)
        subtitle: { size: 12 }, // Tamaño para subtítulos (usa defaultTitleFont)
        section: { size: 10, font: 'Helvetica-Bold' }, // Títulos de secciones (Helvetica-Bold)
        normal: { size: 8, font: 'Helvetica' },
        small: { size: 6, font: 'Helvetica' },
        bold: { size: 8, font: 'Helvetica-Bold' },
        amount: { size: 9, font: 'Helvetica-Bold' }, // Tamaño para montos (más grande y bold)
        // Fuente personalizada por defecto para títulos de documentos
        defaultTitleFont: 'britannic-bold-regular',
    };

    // ============================================
    // MÁRGENES Y ESPACIADO
    // ============================================

    static LAYOUT = {
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        spacing: {
            section: 16, // Entre secciones
            subsection: 8, // Entre subsecciones
            paragraph: 12, // Entre párrafos
            line: 4, // Entre líneas
            bullet: 6, // Entre viñetas y texto
        },
        pageSize: 'LETTER',
        lineHeight: 15,
        labelWidth: 150, // Ancho por defecto para etiquetas en campos de formulario
        // Posicionamiento para documentos con plantilla (encabezado)
        headerHeight: 90, // Altura del encabezado desde arriba (para plantillas)
        spacingAfterHeader: 15, // Espacio después del encabezado antes del contenido
        // Configuración de viñetas
        bulletIndent: 12, // Indentación adicional para viñetas (más a la derecha que las secciones)
        bulletDiameter: 3, // Diámetro del círculo de la viñeta (en puntos)
        bulletSpacing: 6, // Espacio entre el círculo y el texto de la viñeta (en puntos)
        // Label + valor en misma línea y grid (formularios)
        labelValueGap: 3, // Espacio entre label (bold) y valor (normal) en la misma línea
        gridColGap: 16, // Espacio entre columnas en _addLabelValueGrid
        gridRowSpacing: 6, // Espacio entre filas del grid
        // Bloque de firma en footer (posición fija al final de página)
        signatureLineWidth: 150, // Ancho de la línea de firma (puntos), centrada
        signatureLineThickness: 1, // Grosor de la línea (puntos)
        signatureFooterPadding: 10, // Espacio entre el pie de plantilla y el bloque de firma
        /** Altura del pie de página de la plantilla (franja verde, contacto, etc.). El bloque de firma se dibuja por encima. */
        signatureTemplateFooterHeight: 45,
        signatureSpacingLineToFirstText: 8, // Espacio entre línea y primera línea de texto
        signatureSpacingBetweenTextLines: 4, // Espacio entre líneas de texto bajo la firma
        // Recuadro "No. Registro" en esquina superior derecha (Formulario de Inscripción)
        registrationBox: {
            width: 72,
            rowHeight: 10,
            padding: 4,
            borderWidth: 1,
            /** Margen derecho del recuadro (más pequeño = más pegado al borde de la hoja) */
            rightMargin: 18,
            /** Desplazamiento hacia abajo desde el margen superior (más = recuadro más abajo) */
            offsetFromTop: 50,
        },
        // Cuadro de foto 3x3 debajo del código de registro
        photoBox: {
            /** Espacio entre el recuadro de registro y el cuadro de foto */
            spacingBelowRegistration: 4,
            /** Grosor del borde del cuadro de foto */
            borderWidth: 1,
        },
        // Campos con recuadro (label + cuadro con valor)
        boxedFields: {
            /** Altura del recuadro */
            boxHeight: 18,
            /** Grosor del borde del recuadro */
            borderWidth: 1,
            /** Espacio entre label y cuadro dentro de cada columna */
            labelBoxGap: 4,
            /** Espacio entre columnas en grid de 2 columnas */
            colGap: 16,
            /** Espacio entre label y recuadro en campos de una sola columna (reducción desde fontSize) */
            labelBoxSpacing: 4,
            /** Factor de ajuste vertical para centrar texto dentro del recuadro (multiplicado por fontSize) */
            verticalCenterFactor: 0.2,
            /** Padding interno de las celdas (para text wrapping) */
            cellPadding: 4,
        },
        // Tablas (para asignaturas y otros datos tabulares)
        table: {
            /** Altura de cada fila de la tabla */
            rowHeight: 18,
            /** Altura del encabezado de la tabla */
            headerHeight: 20,
            /** Grosor del borde de la tabla */
            borderWidth: 1,
            /** Padding interno de las celdas */
            cellPadding: 4,
            /** Color de fondo del encabezado (color primario) */
            headerBackgroundColor: '#196b45',
        },
    };

    // ============================================
    // TAMAÑOS DE PÁGINA
    // ============================================

    /**
     * Mapeo de tamaños de página a dimensiones en puntos [ancho, alto]
     * Usado por generadores que crean documentos desde cero
     */
    static PAGE_SIZES = {
        LETTER: [612, 792], // 8.5" x 11" en puntos
        A4: [595, 842],
        LEGAL: [612, 1008],
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
