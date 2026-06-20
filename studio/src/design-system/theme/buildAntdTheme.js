/**
 * buildAntdTheme(mode) — config de tema para el ConfigProvider de Ant Design 6.
 *
 * Responsabilidad ÚNICA: mapear la paleta del design-system a los tokens de AntD,
 * para que los componentes nativos (Table, Button, Select, Pagination…) hereden la
 * marca sin overrides sueltos. Misma fuente que applyThemeVars → un solo origen.
 */
import { theme as antdTheme } from 'antd';
import { activeBrand } from '@config/brand';
import { buildPalette, radii, typography } from '@ds/tokens';

const palette = buildPalette(activeBrand);

export function buildAntdTheme(mode = 'light') {
  const p = palette[mode] ?? palette.light;

  return {
    algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: p.brand[500],
      colorSuccess: p.semantic.success,
      colorWarning: p.semantic.warning,
      colorError: p.semantic.danger,
      colorInfo: p.semantic.info,
      colorBgBase: p.surface.base,
      colorTextBase: p.text.strong,
      colorBorder: p.border.base,
      colorBorderSecondary: p.border.divider,
      fontFamily: activeBrand.fontFamily,
      fontSize: typography.size.base,
      borderRadius: radii.base,
      borderRadiusLG: radii.lg,
    },
  };
}

export default buildAntdTheme;
