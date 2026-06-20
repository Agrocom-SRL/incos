/**
 * Entry point — monta la app e inyecta el tema inicial antes del primer render
 * (evita flash sin estilos). La base.css trae fuentes + reset + reduced-motion.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { applyThemeVars } from '@ds/theme/applyThemeVars';
import { App } from './app/App';
import '@ds/styles/base.css';

// Tema inicial síncrono (el ThemeProvider lo re-aplica según preferencia guardada).
applyThemeVars('light');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
