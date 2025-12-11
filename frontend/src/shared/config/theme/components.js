// src/shared/config/theme/components.js
/**
 * Configuración específica de componentes de Ant Design
 * TODOS los valores deben venir del tema (allColors, allSpacing, etc.)
 */

import { allColors } from './colors';
import { allSpacing } from './spacing';
import { shadows } from './shadows';
import { typography } from './typography';

export const componentConfig = {
  Button: {
    colorPrimary: allColors.colorPrimary,
    colorPrimaryHover: allColors.colorPrimaryHover,
    colorPrimaryActive: allColors.colorPrimaryActive,
    primaryShadow: shadows.shadowPrimary,
    defaultShadow: shadows.shadowElevation1,
    dangerShadow: shadows.shadowRed,
    borderRadius: allSpacing.borderRadius,
    controlHeight: allSpacing.controlHeight,
    controlHeightLG: allSpacing.controlHeightLG,
    controlHeightSM: allSpacing.controlHeightSM,
    fontWeight: typography.fontWeightStrong,
  },
  Input: {
    colorPrimary: allColors.colorPrimary,
    colorPrimaryHover: allColors.colorPrimaryHover,
    activeBorderColor: allColors.colorPrimary,
    hoverBorderColor: allColors.colorPrimaryBorder,
    controlHeight: allSpacing.controlHeight,
    controlHeightLG: allSpacing.controlHeightLG,
    controlHeightSM: allSpacing.controlHeightSM,
    borderRadius: allSpacing.borderRadius,
  },
  Menu: {
    itemSelectedBg: allColors.colorPrimary,
    itemSelectedColor: allColors.colorBgContainer,
    itemHoverBg: allColors.colorPrimaryBg,
    itemHoverColor: allColors.colorPrimary,
    itemActiveBg: allColors.colorPrimaryActive,
    horizontalItemSelectedColor: allColors.colorPrimary,
    horizontalItemSelectedBg: allColors.colorPrimaryBg,
    itemColor: allColors.colorText,
    itemBorderRadius: allSpacing.borderRadius,
  },
  Layout: {
    siderBg: allColors.colorBgContainer,
    headerBg: allColors.colorPrimary,
    bodyBg: allColors.colorBgLayout,
    triggerBg: allColors.colorPrimaryHover,
    triggerColor: allColors.colorBgContainer,
  },
  Card: {
    headerBg: 'transparent',
    colorBorderSecondary: allColors.colorBorderSecondary,
    boxShadowTertiary: shadows.shadowElevation1,
    borderRadius: allSpacing.borderRadiusLG,
  },
  Sider: {
    colorBgContainer: allColors.colorBgContainer,
    colorText: allColors.colorText,
    colorTextSecondary: allColors.colorTextSecondary,
    colorBorder: allColors.colorBorderSecondary,
    borderRadius: 0,
  },
  Header: {
    colorBgContainer: allColors.colorPrimary,
    colorText: allColors.colorTextOnDark,
    colorTextSecondary: allColors.colorTextSecondaryOnDark,
    colorBorder: allColors.colorBorderOnDark,
    height: allSpacing.headerHeight,
    padding: `0 ${allSpacing.marginLG}px`,
    borderRadius: 0,
  },
  Badge: {
    colorError: allColors.colorError,
    colorWarning: allColors.colorWarning,
    colorInfo: allColors.colorInfo,
    colorSuccess: allColors.colorSuccess,
    colorText: allColors.colorBgContainer,
    fontSize: typography.fontSizeSM,
    lineHeight: typography.lineHeight,
  },
  Tag: {
    borderRadius: allSpacing.borderRadiusSM,
    fontSize: typography.fontSizeSM,
    lineHeight: typography.lineHeight,
  },
  Divider: {
    colorSplit: allColors.colorSplit,
    margin: `${allSpacing.margin}px 0`,
  },
  Tooltip: {
    colorBgSpotlight: allColors.colorBgTooltip, // Color oscuro del tema (colors.js)
    borderRadius: allSpacing.borderRadius, // spacing.js
    fontSize: typography.fontSizeBase, // typography.js
    zIndexPopup: allSpacing.zIndexPopupBase + 70, // 1070 desde zIndexPopupBase (spacing.js)
  },
  Dropdown: {
    colorBgElevated: allColors.colorBgElevated,
    borderRadius: allSpacing.borderRadius,
    boxShadowSecondary: shadows.shadowElevation2,
  },
};
