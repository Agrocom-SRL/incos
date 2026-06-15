// src/infrastructure/config/theme/dark.js
/**
 * Tema oscuro (dark) de INCOS — construido desde buildAntdTheme.
 * Usado por ThemeProvider cuando el modo activo es 'dark'.
 */

import { theme } from 'antd';
import { buildAntdTheme } from '@theme/buildAntdTheme';

const { darkAlgorithm } = theme;

/** Objeto de tema AntD para modo oscuro (listo para <ConfigProvider theme=…>). */
export const incosDarkTheme = {
  ...buildAntdTheme('dark'),
  algorithm: darkAlgorithm,
};

export default incosDarkTheme;
