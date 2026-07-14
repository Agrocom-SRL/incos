// src/infrastructure/config/theme/components/layout.js
/**
 * Layout Components - Componentes de estructura y layout
 * Layout, Sider, Header
 */

import { allColors } from '../colors';
import { allSpacing } from '../spacing';
import { shadows } from '../shadows';

/**
 * Layout - Configuración general del Layout de Ant Design
 * Aplica a TODO el sistema de Layout (Sider, Header, Content, Footer)
 */
export const Layout = {
  // Sider y Header: Blanco para diferenciarse del Content
  siderBg: allColors.colorBgContainer,  // Blanco
  headerBg: allColors.colorBgContainer,  // Blanco

  // Content: Gris más oscuro para diferenciarse del fondo blanco
  bodyBg: allColors.colorAccentBrownBg,  // Marrón oscuro

  // Altura real del Header de Ant Design. Es el ÚNICO nombre de token que
  // Ant Design realmente lee para esto (vive en el namespace "Layout", no
  // "Header" — ver antd/es/layout/style/index.js). `Header.height` de más
  // abajo NO tiene efecto: Ant Design no reconoce "Header" como componente
  // temático propio, cae al default `controlHeight * 2` y por eso el header
  // medía 80px aunque este token dijera 56 — desalineando el `top` fijo del
  // Sider (que sí lee `--header-height` vía CSS) con la altura real.
  headerHeight: allSpacing.headerHeight,
};

/**
 * Sider - Panel lateral (Sidebar)
 * Nota: En Ant Design v5, el color de fondo del Sider se controla con Layout.siderBg
 */
export const Sider = {
  // Texto oscuro sobre fondo blanco
  colorText: allColors.colorText,
  colorTextSecondary: allColors.colorTextSecondary,
  colorBorder: allColors.colorBorder,
  boxShadow: shadows.shadowElevation2,
};

/**
 * Header - Barra superior
 */
export const Header = {
  // Fondo blanco (igual que Sider)
  colorBgContainer: allColors.colorBgContainer,
  colorText: allColors.colorText,
  colorTextSecondary: allColors.colorTextSecondary,
  colorBorder: allColors.colorBorder,
  padding: `0 ${allSpacing.marginLG}px`,
  borderRadius: 0,
  boxShadow: shadows.shadowElevation1,
};
