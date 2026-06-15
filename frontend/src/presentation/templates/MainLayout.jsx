// src/presentation/templates/MainLayout.jsx
/**
 * MainLayout — template principal de la aplicación (lenguaje visual mv2).
 *
 * Responsabilidades:
 * - Router integration: Suspense + Outlet + LoadingFallback.
 * - Estructura visual: Header + Sidebar + Content con tokens conmutables.
 * - Estado del sidebar: useSidebarState hook del organismo Sidebar.
 * - Transición de entrada de ruta (fade+translateY, gateada por useReducedMotion).
 *
 * Clean Architecture:
 * - Presentation Layer: Template de nivel más alto.
 * - Usa: Organisms (Header, Sidebar) + NavigationProvider (application).
 *
 * Todos los colores vienen de buildAntdTheme(mode) (ConfigProvider) y
 * de los tokens conmutables --brand-* / --surface* / --text* generados
 * por applyThemeVars(mode).
 */

import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import { motion, AnimatePresence } from 'motion/react';
import { allSpacing } from '@theme/tokens';
import { Sidebar, Header, useSidebarState } from '@organisms';
import LoadingFallback from '@components-router/LoadingFallback';
import { NavigationProvider } from '@application-navigation';
import { useReducedMotion } from '@presentation/hooks/useReducedMotion';

const { Sider, Header: AntHeader, Content } = Layout;

// Alias para JSX (motion/react)
const MotionDiv = motion.div;

/**
 * Wrapper de transición de ruta — fade + translateY motivado (jerarquía/narrativa).
 * Gateado por useReducedMotion: si el usuario prefiere reducido, solo opacidad.
 */
function RouteTransition({ children }) {
    const reduced = useReducedMotion();
    if (reduced) {
        // Sin transform; solo opacidad (seguro para prefers-reduced-motion)
        return (
            <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.14 }}
                style={{ height: '100%' }}
            >
                {children}
            </MotionDiv>
        );
    }
    return (
        <MotionDiv
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.14, ease: [0.23, 1, 0.32, 1] }}
            style={{ height: '100%' }}
        >
            {children}
        </MotionDiv>
    );
}

const MainLayout = () => {
    // Estado del sidebar (hook del organismo Sidebar)
    const { collapsed, toggle } = useSidebarState(false);
    const location = useLocation();

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
                        <Sidebar collapsed={collapsed} />
                    </Sider>

                    {/* Content con router integration (Suspense + AnimatePresence + Outlet) */}
                    <Content className="content">
                        <Suspense fallback={<LoadingFallback />}>
                            <AnimatePresence initial={false}>
                                <RouteTransition key={location.pathname}>
                                    <Outlet />
                                </RouteTransition>
                            </AnimatePresence>
                        </Suspense>
                    </Content>
                </Layout>
            </Layout>
        </NavigationProvider>
    );
};

export default MainLayout;
