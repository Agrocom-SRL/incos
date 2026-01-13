/**
 * Application Utils - Hooks Genéricos Compartidos
 * 
 * Single Responsibility: Re-exportar hooks genéricos compartidos entre módulos
 * 
 * Clean Architecture:
 * - Application Layer: Hooks genéricos que pueden ser usados por cualquier módulo, componente o página
 * 
 * Estos hooks son independientes de cualquier módulo específico y proporcionan
 * funcionalidades comunes como mensajes, validaciones, enriquecimiento de wizards, etc.
 * 
 * Nota: Los hooks específicos de componentes están co-localizados con sus componentes:
 * - WizardForm hooks → presentation/components/organisms/WizardForm/hooks/
 * - FormField hooks → presentation/components/molecules/FormField/hooks/
 */

export { useMessage } from './useMessage';
export { useEnrichWizardSteps } from './useEnrichWizardSteps';

