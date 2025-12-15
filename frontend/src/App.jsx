// src/App.jsx
/**
 * Componente raíz de la aplicación
 * 
 * Responsabilidades:
 * - Renderizar el router de la aplicación
 * - NO incluye Providers de módulos específicos (estos van en cada página)
 * 
 * Arquitectura:
 * - main.jsx → App.jsx → AppRouter → LayoutWrapper → Pages (con sus Providers)
 * 
 * Single Responsibility: Solo renderiza el router
 * Open/Closed: Abierto para agregar Providers globales (Auth, Theme) si se necesitan
 */

import AppRouter from '@router';

const App = () => {
    return <AppRouter />;
};

export default App;