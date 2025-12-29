// src/presentation/templates/MainLayout.jsx
/**
 * MainLayout - Template principal de la aplicación
 * 
 * Responsabilidades integradas:
 * - Router integration: Suspense + Outlet + LoadingFallback
 * - Estructura visual: Header + Sidebar + Content
 * - Estado del sidebar: usa useSidebarState hook del organismo Sidebar
 * 
 * Single Responsibility: Template completo que integra router y layout
 * 
 * Clean Architecture:
 * - Presentation Layer: Template de nivel más alto
 * - Usa: Organisms (Header, Sidebar) y hooks del Sidebar (useSidebarState)
 * - Usa: NavigationProvider (application layer) para proporcionar contexto de navegación
 * 
 * Componentes del Layout configurados desde componentConfig:
 * - Layout: componentConfig.Layout (colores generales)
 * - Sider: componentConfig.Sider (panel lateral)
 * - Header: componentConfig.Header (barra superior)
 * - Content: usa componentConfig.Layout.bodyBg (área de contenido)
 * 
 * Todos los colores y estilos se controlan desde:
 * src/infrastructure/config/theme/components.js
 */

import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import { allSpacing } from '@theme/tokens';
import { Sidebar, Header, useSidebarState } from '@organisms';
import LoadingFallback from '@components-router/LoadingFallback';
import { NavigationProvider } from '@application-navigation';

const { Sider, Header: AntHeader, Content } = Layout;

const MainLayout = () => {
    // Estado del sidebar (hook del organismo Sidebar)
    const { collapsed, toggle } = useSidebarState(false);

    // Usar valores del tema para el sidebar
    const sidebarWidth = allSpacing.sidebarWidth;
    const sidebarCollapsedWidth = allSpacing.sidebarCollapsedWidth;

    return (
        <NavigationProvider defaultSelectedKey="DASH">
            <Layout>
                {/* Header siempre visible en la parte superior */}
                <AntHeader className="header">
                    <Header collapsed={collapsed} onToggle={toggle} />
                </AntHeader>

                <Layout>
                    {/* Sider que se muestra/oculta según el trigger */}
                    <Sider
                        trigger={null}
                        collapsible
                        collapsed={collapsed}
                        className="sider"
                        width={sidebarWidth}
                        collapsedWidth={sidebarCollapsedWidth}
                    >
                        <Sidebar
                            collapsed={collapsed}
                        />
                    </Sider>

                    {/* Content con router integration (Suspense + Outlet) */}
                    <Content className="content">
                        <Suspense fallback={<LoadingFallback />}>
                            <Outlet />
                        </Suspense>
                    </Content>
                </Layout>
            </Layout>
        </NavigationProvider>
    );
};

export default MainLayout;
