// src/App.jsx
/**
 * Componente raíz de la aplicación
 * 
 * Responsabilidades:
 * - Configurar providers globales (Theme, Ant Design, etc.)
 * - Renderizar el router de la aplicación
 * - Contener la lógica de inicialización de la aplicación
 * - NO incluye Providers de módulos específicos (estos van en cada página)
 * 
 * Arquitectura:
 * - main.jsx → App.jsx (providers + lógica app) → AppRouter → LayoutWrapper → Pages
 * 
 * Single Responsibility: Configurar la aplicación y sus providers globales
 * Open/Closed: Abierto para agregar Providers globales (Auth, Theme, etc.)
 */

import { ConfigProvider, App as AntApp } from 'antd';
import { initStyles } from '@theme/init';
import AppRouter from '@components-router/AppRouter';

// Inicializar sistema de estilos (tema + variables CSS + estilos)
const incosTheme = initStyles();

const App = () => {
    return (
        <ConfigProvider theme={incosTheme}>
            <AntApp>
                <AppRouter />
            </AntApp>
        </ConfigProvider>
    );
};

export default App;
