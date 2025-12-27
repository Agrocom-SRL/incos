// src/presentation/templates/MainLayout/MainLayout.jsx
/**
 * MainLayout - Template principal de la aplicación
 * 
 * Componentes del Layout configurados desde componentConfig:
 * - Layout: componentConfig.Layout (colores generales)
 * - Sider: componentConfig.Sider (panel lateral)
 * - Header: componentConfig.Header (barra superior)
 * - Content: usa componentConfig.Layout.bodyBg (área de contenido)
 * 
 * Todos los colores y estilos se controlan desde:
 * src/shared/config/theme/components.js
 */

import { Layout } from 'antd';
import { allSpacing } from '@theme/tokens';
import { useSidebarState } from './hooks/useSidebarState';

const { Sider, Header, Content } = Layout;

const MainLayout = ({ header, sidebar, children }) => {
    // Extraer lógica de estado del sidebar a hook personalizado
    const { collapsed, toggle } = useSidebarState(false);

    // Usar valores del tema para el sidebar
    const sidebarWidth = allSpacing.sidebarWidth;
    const sidebarCollapsedWidth = allSpacing.sidebarCollapsedWidth;

    // Handler para el Sidebar
    const handleMenuClick = () => {
        // Lógica para manejar clicks en el menú
    };

    return (
        <Layout>
            {/* Header siempre visible en la parte superior */}
            <Header className="header">
                {header && typeof header === 'function'
                    ? header({ collapsed, onToggle: toggle })
                    : header}
            </Header>

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
                    {sidebar && typeof sidebar === 'function'
                        ? sidebar({
                            collapsed,
                            onMenuClick: handleMenuClick
                        })
                        : sidebar}
                </Sider>

                <Content className="content">{children}</Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
