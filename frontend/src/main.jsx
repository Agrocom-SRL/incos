// src/main.jsx
/**
 * Punto de entrada de la aplicación
 * 
 * Responsabilidades:
 * - Inicializar React y renderizar la aplicación
 * - Configurar StrictMode para desarrollo
 * - NO debe contener lógica de negocio ni providers
 * 
 * Arquitectura:
 * - main.jsx (disparador) → App.jsx (configuración + providers) → AppRouter
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>
);