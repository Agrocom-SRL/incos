/**
 * Builder del tema AntD para INCOS — modo claro / oscuro.
 *
 * Única fuente de verdad para los tokens AntD de toda la app.
 * Promovido de matricula-v2/theme/incosTheme.js a capa global.
 *
 * Paleta: REVAMP §3 — verde #007848 (brand.500), #006048 (brand.600),
 *   #004830 (brand.700), dorado #9a6b00 (AA light), rojo #c0282a, azul #3d6dd0.
 *
 * ── Single source de literales ────────────────────────────────────────────────
 * Los valores por modo se leen de brandScale (tokens/colors.js).
 * Esta función NO contiene ningún literal de color (#hex).
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * @module @theme/buildAntdTheme
 */

import { allThemeTokens, componentConfig } from '@theme/tokens';
import { brandScale } from '@theme/tokens/colors';

/**
 * Construye el objeto de tema para <ConfigProvider theme={...}>.
 * El algorithm se inyecta en App.jsx junto con la llamada a esta función.
 *
 * @param {'light' | 'dark'} mode
 * @param {object} [overrides={}] Tokens extra para personalización runtime (accent/scale WS-future).
 * @returns {{ token: object, components: object }}
 */
export function buildAntdTheme(mode, overrides = {}) {
  const sc = brandScale[mode] ?? brandScale.light;

  return {
    token: {
      // Base: escala rica del sistema global (legacy). La marca sobreescribe encima → aditivo.
      ...allThemeTokens,
      // ── Primario de marca (lee de brandScale, cero literales) ────────────
      colorPrimary:     sc.brand500,
      // ── Semánticos reanclados a §3 ────────────────────────────────────────
      colorSuccess: sc.success,
      colorWarning: sc.warning,
      colorError:   sc.error,
      colorInfo:    sc.info,
      // ── Superficies conmutables ───────────────────────────────────────────
      colorBgContainer: sc.colorBgContainer,
      colorBgElevated:  sc.colorBgElevated,
      colorBgLayout:    sc.colorBgLayout,
      // ── Texto ─────────────────────────────────────────────────────────────
      colorText:          sc.text,
      colorTextSecondary: sc.textSecondary,
      colorTextHeading:   sc.brand500,
      // ── Bordes ────────────────────────────────────────────────────────────
      colorBorder: sc.border,
      // ── Tipografía y radio (del sistema global) ───────────────────────────
      fontFamily:   allThemeTokens.fontFamily,
      fontSize:     allThemeTokens.fontSize,
      borderRadius: allThemeTokens.borderRadius,
      // ── Personalización runtime (preparado, sin feature implementada) ─────
      ...overrides,
    },
    components: {
      ...componentConfig,
      Table: {
        ...(componentConfig.Table || {}),
        headerBg: 'transparent',
        headerColor: 'inherit',
        headerSplitColor: 'transparent',
      },
      Select: {
        ...(componentConfig.Select || {}),
        optionSelectedBg: sc.brand100,
      },
      Dropdown: {
        ...(componentConfig.Dropdown || {}),
        colorBgElevated: sc.colorBgContainer,
      },
      Tooltip: {
        ...(componentConfig.Tooltip || {}),
        colorBgSpotlight:    sc.brand200,
        colorTextLightSolid: sc.text,
        borderRadius: 8,
        fontSize: 12,
      },
      Button: {
        ...(componentConfig.Button || {}),
        primaryShadow: 'none',
      },
    },
  };
}

export default buildAntdTheme;
