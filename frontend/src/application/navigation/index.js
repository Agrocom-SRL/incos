// src/application/navigation/index.js
/**
 * Barrel export para el módulo de navegación
 * 
 * Exporta:
 * - Contexto (para uso directo si es necesario)
 * - Hooks (useNavigationMenu, useNavigationContext)
 * - Providers (NavigationProvider)
 */
export { NavigationContext } from './context/NavigationContext';
export { useNavigationMenu, useNavigationContext } from './hooks';
export { NavigationProvider } from './providers';
