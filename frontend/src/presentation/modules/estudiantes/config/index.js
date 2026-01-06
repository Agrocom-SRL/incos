/**
 * Config - Configuración del módulo de estudiantes
 * 
 * Centraliza todas las configuraciones del módulo de estudiantes
 * 
 * Single Responsibility: Exportar todas las configuraciones del módulo
 */

export { createEstudiantesTableColumns } from './tableColumns';
export { createEstudianteWizardSteps } from './estudianteWizardSteps';
export { createEstudianteDatosPersonalesFields } from './estudianteDatosPersonalesFields';
export { createEstudianteDiscapacidadFields } from './estudianteDiscapacidadFields';
export { createListBreadcrumbItems, createRegisterBreadcrumbItems, createDetailBreadcrumbItems } from './breadcrumbs.jsx';
export { createCamposContactosEmergenciaDinamicos } from './estudianteContactoEmergenciaFields';
export { createCamposDocumentacionDinamicos } from './estudianteDocumentacionFields';

