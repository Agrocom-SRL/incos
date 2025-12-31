// src/presentation/templates/index.js
/**
 * Barrel export para todos los templates y sus componentes
 * 
 * Single Responsibility: Exportar todos los templates y componentes compartidos de forma centralizada
 * 
 * Clean Architecture:
 * - Presentation Layer: Barrel export para acceso consistente a templates
 */

export { default as MainLayout } from './MainLayout';
export { default as PageTemplate } from './PageTemplate';

// Exportar componentes compartidos entre templates
// NOTA: Estos componentes son parte de los templates, no son organismos independientes
export { default as MainContent } from './components/MainContent';
export { default as InfoSidebar } from './components/InfoSidebar';
export { default as PageHeaderArea } from './components/PageHeaderArea';
export { default as PageBottomArea } from './components/PageBottomArea';
