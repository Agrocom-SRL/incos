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

import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { allSpacing } from '@theme/tokens';
import { Sidebar, useSidebarState } from '@organisms';
import AppTopBar from '@organisms/Header/AppTopBar';
import LoadingFallback from '@components-router/LoadingFallback';
import { NavigationProvider } from '@application-navigation';
import { useReducedMotion } from '@presentation/hooks/useReducedMotion';
import { useMobileNav } from '@presentation/hooks/useMobileNav';
import { EASE, DUR } from '@presentation/motion/presets';

const { Sider, Header: AntHeader, Content } = Layout;

// Alias para JSX (motion/react)
const MotionDiv = motion.div;

/**
 * Wrapper de transición de ruta — fade + translateY motivado (jerarquía/narrativa).
 * Gateado por useReducedMotion: si el usuario prefiere reducido, solo opacidad.
 */
/**
 * Wrapper de transición de ruta — fade + translateY motivado (jerarquía/narrativa).
 * Usa presets EASE/DUR (cero literales). MotionConfig global cubre el gate reduced.
 */
function RouteTransition({ children }) {
    const reduced = useReducedMotion();
    return (
        <MotionDiv
            initial={{ opacity: 0, y: reduced ? 0 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.press, ease: EASE.out }}
            style={{ height: '100%' }}
        >
            {children}
        </MotionDiv>
    );
}

const MainLayout = () => {
    // Estado del sidebar: colapso en desktop, drawer overlay en móvil (≤767px, como mv2)
    const { collapsed, toggle } = useSidebarState(false);
    const { isMobile, navOpen, closeNav, toggleNav } = useMobileNav();
    const location = useLocation();

    // En móvil, cerrar el drawer al navegar (cambio de ruta)
    useEffect(() => {
        if (isMobile) closeNav();
    }, [location.pathname, isMobile, closeNav]);

    // Usar valores del tema para el sidebar
    const sidebarWidth = allSpacing.sidebarWidth;
    const sidebarCollapsedWidth = allSpacing.sidebarCollapsedWidth;

    // El trigger alterna el drawer en móvil y el colapso en desktop
    const handleMenuClick = isMobile ? toggleNav : toggle;
    // En móvil el sider se muestra a ancho completo (drawer), nunca colapsado
    const siderCollapsed = isMobile ? false : collapsed;
    const siderClass = [
        'sider',
        isMobile ? 'sider--mobile' : '',
        isMobile && navOpen ? 'sider--mobile-open' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        // MotionConfig global: reducedMotion="user" cubre toda la app (incluye mv2).
        // mv2Layout ya no necesita su propio MotionConfig.
        <MotionConfig reducedMotion="user">
        <NavigationProvider defaultSelectedKey="DASH">
            {/* Estructura mv2: Sider a top:0 (columna izquierda, altura completa) y a su
               derecha una columna con TopBar + Content (flex, no fixed). */}
            <Layout className="app-shell">
                {/* Backdrop del drawer móvil — cierra el menú al tocar fuera (como mv2) */}
                {isMobile && navOpen ? (
                    <button
                        type="button"
                        className="app-sider-backdrop"
                        onClick={closeNav}
                        aria-label="Cerrar menú"
                    />
                ) : null}
                {/* Sider: columna fija en desktop; drawer overlay en móvil */}
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={siderCollapsed}
                    className={siderClass}
                    width={sidebarWidth}
                    collapsedWidth={sidebarCollapsedWidth}
                >
                    <Sidebar collapsed={siderCollapsed} />
                </Sider>

                {/* Columna principal: TopBar sobre el área de contenido (no full-width) */}
                <Layout className="app-main">
                    <AntHeader className="header">
                        <AppTopBar onMenuClick={handleMenuClick} collapsed={collapsed} />
                    </AntHeader>

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
        </MotionConfig>
    );
};

export default MainLayout;
