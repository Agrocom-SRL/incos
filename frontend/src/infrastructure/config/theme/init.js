// src/infrastructure/config/theme/init.js
/**
 * Módulo de inicialización del tema
 * 
 * Responsabilidades:
 * - Configurar el tema de Ant Design
 * - Inyectar variables CSS en el DOM
 * - Importar todos los estilos CSS de presentación
 * 
 * Ubicación: Infrastructure/theme (todo el sistema de tema consolidado)
 * Single Responsibility: Inicializar todo el sistema de tema y estilos
 */

import incosTheme from './light';
import { injectCSSVariables } from './root';
import '@styles/index.css';

/**
 * Inicializa el sistema de tema completo
 * - Inyecta variables CSS desde el tema JS
 * - Importa todos los estilos CSS de presentación
 * 
 * @returns {Object} Tema de Ant Design configurado
 */
export function initStyles() {
    // Inyectar variables CSS desde el tema JS (sincronización)
    injectCSSVariables();
    
    // Retornar el tema para usar en ConfigProvider
    return incosTheme;
}

// Exportar también el tema directamente por si se necesita
export { default as incosTheme } from './light';
