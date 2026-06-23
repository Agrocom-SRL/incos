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
    // CSS variables de AntD: emite `var(--ant-*)` UNA vez; al cambiar de modo solo
    // se reescriben los valores de esas variables en vez de reinyectar todo el
    // stylesheet hasheado. Esto elimina el flash (inputs/checkbox que parpadeaban
    // con estilos viejos durante la regeneración del CSS-in-JS al togglear tema).
    cssVar: true,
    hashed: false,
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
    components: {
      // Table: alinear los fondos de la tabla a la paleta de superficies del DS.
      // AntD pinta la columna `fixed` (acciones), el hover y la cabecera con sus
      // propios tokens; en dark el darkAlgorithm deriva `colorBgContainer` MÁS
      // claro que `colorBgBase`, por lo que la columna fija se veía verdosa "como
      // seleccionada". Igualar estos tokens a --surface/--surface-alt/--surface-hover
      // hace que la celda fija coincida con la fila en todos los estados.
      Table: {
        colorBgContainer: p.surface.base,
        headerBg: p.surface.alt,
        rowHoverBg: p.surface.hover,
        borderColor: p.border.divider,
      },
    },
  };
}

export default buildAntdTheme;
