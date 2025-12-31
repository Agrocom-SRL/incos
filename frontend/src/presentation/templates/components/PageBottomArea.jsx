// src/presentation/templates/components/PageBottomArea.jsx
/**
 * PageBottomArea - Componente compartido entre templates
 * 
 * NO es un Organism - es parte de la estructura de los templates
 * - Contenedor para el footer/bottom de página
 * - Ocupa todo el ancho disponible (independiente de MainContent y Sidebar)
 * - Usado por PageTemplate y otros templates que lo necesiten
 * 
 * Atomic Design: Componente interno de templates
 * - No es reutilizable fuera de templates
 * - Es parte de la estructura del layout
 */

import { Flex } from 'antd';

const PageBottomArea = ({ children }) => {
    return (
        <Flex 
            vertical 
            gap="middle" 
            className="page-bottom"
        >
            {children}
        </Flex>
    );
};

export default PageBottomArea;

