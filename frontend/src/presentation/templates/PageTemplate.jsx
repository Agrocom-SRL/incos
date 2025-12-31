// src/presentation/templates/PageTemplate.jsx
/**
 * PageTemplate - Template genérico para todas las páginas
 * 
 * Atomic Design: TEMPLATE
 * - Define la ESTRUCTURA/LAYOUT de la página (no el contenido específico)
 * - Solo proporciona "slots" (header, children, sidebar, bottom) donde van los componentes
 * - NO tiene lógica de negocio, solo layout
 * - Reutilizable para múltiples páginas con diferentes contenidos
 * 
 * Diferencia clave con Organism:
 * - Template: "Dónde van las cosas" (estructura)
 * - Organism: "Qué hacen las cosas" (funcionalidad)
 * 
 * Estructura del Template (4 niveles):
 * 1. Header - Ocupa todo el ancho (independiente de MainContent y Sidebar)
 * 2. MainContent - Contenido principal (limitado por Sidebar si existe)
 * 3. InfoSidebar - Sidebar opcional (30% en lg+, 100% en menores)
 * 4. Bottom - Footer/Bottom opcional (ocupa todo el ancho)
 * 
 * Single Responsibility: Proporcionar un layout consistente para todas las páginas
 * 
 * Este template:
 * - Usa el estilo de page.css para el layout responsive
 * - Proporciona 4 slots: header, children (MainContent), sidebar, bottom
 * - Mantiene consistencia visual en toda la aplicación
 */

import { Flex } from 'antd';
import MainContent from './components/MainContent';
import InfoSidebar from './components/InfoSidebar';
import PageHeaderArea from './components/PageHeaderArea';
import PageBottomArea from './components/PageBottomArea';

/**
 * Template genérico para páginas con estructura de 4 niveles
 * 
 * @param {ReactNode} header - Header de página (ocupa todo el ancho, independiente del contenido)
 * @param {ReactNode} children - Contenido principal (se renderiza en MainContent)
 * @param {ReactNode} sidebar - Contenido del sidebar (se renderiza en InfoSidebar, opcional)
 * @param {ReactNode} bottom - Footer/Bottom de página (ocupa todo el ancho, opcional)
 */
const PageTemplate = ({ header, children, sidebar, bottom }) => {
    return (
        <Flex
            vertical
            gap="large"
            className="page-container"
        >
            {/* Nivel 1: Header - Ocupa todo el ancho (independiente de MainContent y Sidebar) */}
            {header && (
                <PageHeaderArea>
                    {header}
                </PageHeaderArea>
            )}

            {/* Nivel 2 y 3: MainContent + InfoSidebar (layout horizontal/vertical según breakpoint) */}
            {(children || sidebar) && (
                <Flex
                    gap="large"
                    align="flex-start"
                    style={{ width: '100%', flex: 1 }}
                    className="page-container"
                >
                    {/* Contenido Principal - 70% en lg+, expandible en menores */}
                    {children && (
                        <MainContent>
                            {children}
                        </MainContent>
                    )}

                    {/* Resumen de Información - 30% en lg+ (min-width 300px), col-12 en menores */}
                    {sidebar && (
                        <InfoSidebar>
                            {sidebar}
                        </InfoSidebar>
                    )}
                </Flex>
            )}

            {/* Nivel 4: Bottom - Ocupa todo el ancho (independiente de MainContent y Sidebar) */}
            {bottom && (
                <PageBottomArea>
                    {bottom}
                </PageBottomArea>
            )}
        </Flex>
    );
};

export default PageTemplate;

