// src/shared/config/theme.config.js
/**
 * Configuración del tema de Ant Design para INCOS Santa Cruz
 * Basado en los colores institucionales del logo y la bandera cruceña
 * 
 * Este archivo combina todos los módulos del tema siguiendo principios SOLID
 */

import { theme } from 'antd';
import { allThemeTokens, componentConfig } from './theme';

const { defaultAlgorithm, darkAlgorithm } = theme;

export const incosTheme = {
  token: allThemeTokens,
  components: componentConfig,
  algorithm: defaultAlgorithm,
};

// Versión dark (opcional)
export const incosDarkTheme = {
  ...incosTheme,
  algorithm: darkAlgorithm,
  token: {
    ...incosTheme.token,
    colorBgContainer: '#1a1a1a',
    colorBgLayout: '#0a0a0a',
    colorText: '#e8e8e8',
    colorTextSecondary: '#b6b5b5',
    colorBorder: '#333333',
  },
};

export default incosTheme;
