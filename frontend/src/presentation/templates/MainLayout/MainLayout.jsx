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

import { useState } from 'react';
import { Layout } from 'antd';
import { allSpacing } from '@config/theme/spacing';

const { Sider, Header, Content } = Layout;

const MainLayout = ({ header, children }) => {
    const [collapsed, setCollapsed] = useState(true);

    // Usar valores del tema para el sidebar
    const sidebarWidth = allSpacing.sidebarWidth;
    const sidebarCollapsedWidth = allSpacing.sidebarCollapsedWidth;

    // Función para toggle del sidebar
    const handleToggle = () => {
        setCollapsed(!collapsed);
    };

    return (
        <Layout>
            {/* Header siempre visible en la parte superior */}
            <Header className="header">
                {header && typeof header === 'function' 
                    ? header({ collapsed, onToggle: handleToggle })
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
                </Sider>

                <Content className="content">{children}</Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
