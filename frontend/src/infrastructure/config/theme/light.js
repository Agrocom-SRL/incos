// src/infrastructure/config/theme/light.js
/**
 * Configuración del tema claro (light) de Ant Design para INCOS Santa Cruz
 * Basado en los colores institucionales del logo y la bandera cruceña
 * 
 * Este archivo combina todos los módulos del tema siguiendo principios SOLID
 * 
 * NOTA: Si en el futuro se necesita un tema oscuro, crear un archivo dark.js
 * siguiendo la misma estructura pero con darkAlgorithm y tokens oscuros
 */

import { theme } from 'antd';
import { allThemeTokens, componentConfig } from './tokens';

const { defaultAlgorithm } = theme;

/**
 * Tema claro (light) de INCOS
 * Usa defaultAlgorithm de Ant Design y todos los tokens personalizados
 */
export const incosTheme = {
  token: allThemeTokens,
  components: componentConfig,
  algorithm: defaultAlgorithm,
};

export default incosTheme;
