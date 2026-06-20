// src/App.jsx
/**
 * Componente raíz de la aplicación.
 *
 * Responsabilidades:
 * - Configurar providers globales (ThemeProvider, ConfigProvider AntD, AntApp).
 * - Renderizar el router de la aplicación.
 *
 * Arquitectura:
 *   main.jsx → App.jsx (providers) → AppRouter → MainLayout → Pages
 *
 * ThemeProvider: gestiona data-theme en <html> + localStorage 'incos-theme'.
 * AppConfigProvider: inyecta el tema AntD correcto según el modo activo.
 * injectCSSVariables(): sigue corriendo para los módulos legacy que leen --color-*.
 *
 * Single Responsibility: Configurar la aplicación y sus providers globales.
 */

import { ConfigProvider, App as AntApp, theme as antTheme } from 'antd';
import esES from 'antd/locale/es_ES';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { initStyles } from '@theme/init';
import { buildAntdTheme } from '@theme/buildAntdTheme';
import { ThemeProvider, useTheme } from '@presentation/hooks/useTheme';
import AppRouter from '@components-router/AppRouter';

// Locale global en español: AntD (textos de DatePicker/Today/etc.) + dayjs (nombres de
// días y meses de TODOS los DatePicker). Antes solo se fijaba dentro de un hook del
// dashboard, así que el idioma dependía del orden de carga de módulos.
dayjs.locale('es');

// Inicializar variables CSS legacy (injectCSSVariables) y estilos.
// La llamada sigue siendo necesaria: los módulos no migrados leen --color-* de JS.
initStyles();

/**
 * Inner: accede al contexto de tema para pasar el algorithm correcto a AntD.
 * Separado de App para poder usar useTheme() (necesita estar dentro del Provider).
 */
function AppConfigProvider({ children }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const antdTheme = {
    ...buildAntdTheme(theme),
    algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
  };

  return (
    <ConfigProvider theme={antdTheme} locale={esES}>
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  );
}

const App = () => (
  <ThemeProvider>
    <AppConfigProvider>
      <AppRouter />
    </AppConfigProvider>
  </ThemeProvider>
);

export default App;
