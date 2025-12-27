// src/presentation/templates/pages/PageTemplate.jsx
/**
 * PageTemplate - Template genérico para todas las páginas
 * 
 * Single Responsibility: Proporcionar un layout consistente para todas las páginas
 * 
 * Este template:
 * - Usa el estilo de page.css para el layout responsive
 * - Proporciona MainContent e InfoSidebar como slots
 * - Mantiene consistencia visual en toda la aplicación
 */

import { Flex } from 'antd';
import { MainContent, InfoSidebar } from '@organisms';

/**
 * Template genérico para páginas
 * 
 * @param {ReactNode} children - Contenido principal (se renderiza en MainContent)
 * @param {ReactNode} sidebar - Contenido del sidebar (se renderiza en InfoSidebar)
 * @param {string} className - Clases CSS adicionales
 */
const PageTemplate = ({ children, sidebar, className = '' }) => {
    return (
        <Flex 
            gap="large" 
            align="flex-start"
            style={{ width: '100%', height: '100%' }}
            className={`page-container ${className}`}
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
    );
};

export default PageTemplate;

