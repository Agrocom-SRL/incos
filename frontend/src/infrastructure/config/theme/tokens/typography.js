// src/infrastructure/config/theme/typography.js
/**
 * Configuración de tipografía
 * Solo Poppins como fuente principal
 */

export const typography = {
  // ========================================
  // FAMILIAS DE FUENTES
  // ========================================
  // Fuente principal para toda la aplicación
  fontFamily: "'Poppins', sans-serif",
  // Fuente monoespaciada: código (<code>, <pre>) y datos de ancho fijo que deben
  // alinearse en columna (siglas de asignatura, C.I., códigos de estudiante).
  // Pila del sistema: se ve moderna en macOS/Windows sin cargar una webfont.
  fontFamilyCode:
    "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",

  // ========================================
  // TAMAÑOS DE FUENTE - BASE
  // ========================================
  // Tamaño base para texto normal (body, párrafos, etc.)
  fontSize: 16,
  // Tamaño pequeño (texto secundario, labels pequeños)
  fontSizeSM: 14,
  // Tamaño extra pequeño (tags, badges, elementos muy pequeños)
  fontSizeXS: 12,
  // Tamaño mínimo (sobreimpresos small-caps, p. ej. código de carrera en tarjetas)
  fontSizeXXS: 11,
  // Tamaño grande (texto destacado)
  fontSizeLG: 18,
  // Tamaño extra grande (texto muy destacado)
  fontSizeXL: 20,

  // ========================================
  // TAMAÑOS DE FUENTE - HEADINGS
  // ========================================
  // H1 - Títulos principales de página
  fontSizeHeading1: 48,
  // H2 - Títulos de secciones grandes
  fontSizeHeading2: 36,
  // H3 - Títulos de secciones medianas
  fontSizeHeading3: 30,
  // H4 - Títulos de secciones pequeñas
  fontSizeHeading4: 24,
  // H5 - Títulos de subsecciones
  fontSizeHeading5: 20,

  // ========================================
  // PESO DE FUENTE
  // ========================================
  // Peso fuerte para texto destacado (bold, strong)
  fontWeightStrong: 700,

  // ========================================
  // ALTURA DE LÍNEA - BASE
  // ========================================
  // Altura de línea base para texto normal
  lineHeight: 1.5,
  // Altura de línea pequeña (texto compacto)
  lineHeightSM: 1.4,
  // Altura de línea grande (texto espaciado)
  lineHeightLG: 1.6,

  // ========================================
  // ALTURA DE LÍNEA - HEADINGS
  // ========================================
  // H1 - Línea más compacta para títulos grandes
  lineHeightHeading1: 1.2,
  // H2 - Línea compacta para títulos grandes
  lineHeightHeading2: 1.25,
  // H3 - Línea moderada para títulos medianos
  lineHeightHeading3: 1.3,
  // H4 - Línea moderada para títulos pequeños
  lineHeightHeading4: 1.35,
  // H5 - Línea moderada para subsecciones
  lineHeightHeading5: 1.4,
};
