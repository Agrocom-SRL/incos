// src/infrastructure/config/theme/components/index.js
/**
 * Configuración centralizada de componentes de Ant Design
 * 
 * Este archivo combina todas las configuraciones de componentes agrupadas por categorías
 * en un solo objeto componentConfig para uso en ConfigProvider
 * 
 * Organización por categorías funcionales:
 * - layout: Componentes de estructura (Layout, Sider, Header)
 * - navigation: Componentes de navegación (Menu, Tooltip)
 * - buttons: Componentes de botones (Button, IconButton)
 * - content: Componentes de contenido (Card, Typography, Avatar)
 */

import * as layout from './layout';
import * as navigation from './navigation';
import * as buttons from './buttons';
import * as content from './content';

/**
 * componentConfig - Configuración completa de todos los componentes
 * 
 * TODOS los valores deben venir del tema (allColors, allSpacing, etc.)
 * Los componentes están agrupados por categorías funcionales para mantener el código organizado
 */
export const componentConfig = {
  // Layout
  Layout: layout.Layout,
  Sider: layout.Sider,
  Header: layout.Header,

  // Navigation
  Menu: navigation.Menu,
  Tooltip: navigation.Tooltip,

  // Buttons
  Button: buttons.Button,
  IconButton: buttons.IconButton,

  // Content
  Card: content.Card,
  Typography: content.Typography,
  Avatar: content.Avatar,
  Alert: content.Alert,
};
