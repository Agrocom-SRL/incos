/**
 * Config - Configuración del módulo de inscripciones
 * 
 * Centraliza todas las configuraciones del módulo de inscripciones
 * 
 * Single Responsibility: Exportar todas las configuraciones del módulo
 * 
 * Clean Architecture:
 * - Presentation Layer: Configuración de UI (columnas, steps, etc.)
 * - No contiene lógica de negocio, solo metadata de presentación
 * 
 * Nota: Los breadcrumbs ahora se manejan en el Provider (InscripcionesNuevaProvider)
 * para mantener la lógica centralizada junto con el título de la página
 */

export { createInscripcionNuevaWizardSteps } from './inscripcionNuevaWizardSteps';
export { createDetailBreadcrumbItems } from './breadcrumbs.jsx';
