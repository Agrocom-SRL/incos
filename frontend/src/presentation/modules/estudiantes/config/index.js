/**
 * Config - Configuración del módulo de estudiantes
 * 
 * Centraliza todas las configuraciones del módulo de estudiantes
 * 
 * Single Responsibility: Exportar todas las configuraciones del módulo
 */

export { createEstudiantesTableColumns } from './tableColumns';
export { createBecasTableColumns } from './becasTableColumns';
export { createEstudianteWizardSteps } from './estudianteWizardSteps';
export { createEstudianteDatosPersonalesFields } from './estudianteDatosPersonalesFields';
export { createEstudianteDiscapacidadFields } from './estudianteDiscapacidadFields';
// Breadcrumbs se definen directamente en cada página
export { createCamposContactosEmergenciaDinamicos } from './estudianteContactoEmergenciaFields';
export { createCamposDocumentacionDinamicos } from './estudianteDocumentacionFields';

