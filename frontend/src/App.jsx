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
 * - main.jsx → App.jsx (providers + lógica app) → AppRouter → MainLayout → Pages
 * 
 * Single Responsibility: Configurar la aplicación y sus providers globales
 * Open/Closed: Abierto para agregar Providers globales (Auth, Theme, etc.)
 */

import { ConfigProvider, App as AntApp } from 'antd';
import esES from 'antd/locale/es_ES';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { initStyles } from '@theme/init';
import AppRouter from '@components-router/AppRouter';

// Locale global en español: AntD (textos de DatePicker/Today/etc.) + dayjs (nombres de
// días y meses de TODOS los DatePicker). Antes solo se fijaba dentro de un hook del
// dashboard, así que el idioma dependía del orden de carga de módulos.
dayjs.locale('es');

// Inicializar sistema de estilos (tema + variables CSS + estilos)
const incosTheme = initStyles();

const App = () => {
    return (
        <ConfigProvider theme={incosTheme} locale={esES}>
            <AntApp>
                <AppRouter />
            </AntApp>
        </ConfigProvider>
    );
};

export default App;
