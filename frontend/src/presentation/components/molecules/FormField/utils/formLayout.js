/**
 * formLayout - Configuración de layout responsive para FormField
 * 
 * Single Responsibility: Proporcionar configuración de layout responsive
 * 
 * Clean Architecture:
 * - Presentation Layer: Utilidades específicas del componente FormField
 * - Co-localizado: Está junto al componente que lo usa (Atomic Design)
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo proporciona configuración de layout
 * - Open/Closed: Extensible sin modificar código existente
 * 
 * Uso: Solo dentro del componente FormField
 */

/**
 * Dimensiones responsive para labelCol
 * Aplicando las mismas dimensiones responsive de FormSection
 */
export const labelCol = {
  xs: { span: 24 },        // < 576px (Móviles): label ocupa 100% (layout vertical)
  sm: { span: 24 },        // ≥ 576px (Tablets pequeñas): label ocupa 100% (layout vertical)
  md: { span: 8 },         // ≥ 768px (Tablets): label ocupa 8 columnas (33%)
  lg: { span: 8 },         // ≥ 992px (Desktop): label ocupa 8 columnas (33%)
  xl: { span: 10 },        // ≥ 1200px (Desktop grande): label ocupa 10 columnas (42%)
  xxl: { span: 10 },       // ≥ 1600px (Desktop extra grande): label ocupa 10 columnas (42%)
};

/**
 * Dimensiones responsive para wrapperCol
 * Aplicando las mismas dimensiones responsive de FormSection
 */
export const wrapperCol = {
  xs: { span: 24 },        // < 576px (Móviles): input ocupa 100% (layout vertical)
  sm: { span: 24 },        // ≥ 576px (Tablets pequeñas): input ocupa 100% (layout vertical)
  md: { span: 16 },        // ≥ 768px (Tablets): input ocupa 16 columnas (67%)
  lg: { span: 16 },        // ≥ 992px (Desktop): input ocupa 16 columnas (67%)
  xl: { span: 14 },        // ≥ 1200px (Desktop grande): input ocupa 14 columnas (58%)
  xxl: { span: 14 },       // ≥ 1600px (Desktop extra grande): input ocupa 14 columnas (58%)
};

