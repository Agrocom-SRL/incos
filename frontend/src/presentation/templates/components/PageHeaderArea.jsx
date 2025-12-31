// src/presentation/templates/components/PageHeaderArea.jsx
/**
 * PageHeaderArea - Componente compartido entre templates
 * 
 * NO es un Organism - es parte de la estructura de los templates
 * - Contenedor para el header de página
 * - Ocupa todo el ancho disponible (independiente de MainContent y Sidebar)
 * - Usado por PageTemplate y otros templates que lo necesiten
 * 
 * Atomic Design: Componente interno de templates
 * - No es reutilizable fuera de templates
 * - Es parte de la estructura del layout
 */

import { Flex } from 'antd';

const PageHeaderArea = ({ children }) => {
    return (
        <Flex 
            vertical 
            gap="middle" 
            className="page-header"
        >
            {children}
        </Flex>
    );
};

export default PageHeaderArea;

