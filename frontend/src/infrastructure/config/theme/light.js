// src/infrastructure/config/theme/light.js
/**
 * Tema claro (light) de INCOS — construido desde buildAntdTheme.
 * La API de este módulo se mantiene para no romper los imports de init.js
 * y de cualquier consumidor legacy que use `@theme/light`.
 */

import { theme } from 'antd';
import { buildAntdTheme } from '@theme/buildAntdTheme';

const { defaultAlgorithm } = theme;

/** Objeto de tema AntD para modo claro (listo para <ConfigProvider theme=…>). */
export const incosTheme = {
  ...buildAntdTheme('light'),
  algorithm: defaultAlgorithm,
};

export default incosTheme;
