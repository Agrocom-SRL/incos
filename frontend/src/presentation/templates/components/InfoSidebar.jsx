// src/presentation/templates/components/InfoSidebar.jsx
/**
 * InfoSidebar - Componente compartido entre templates
 * 
 * NO es un Organism - es parte de la estructura de los templates
 * - Barra lateral de información/resumen
 * - min-width: 300px en pantallas lg+, col-12 en pantallas menores
 * - Usado por PageTemplate y otros templates que lo necesiten
 * 
 * Atomic Design: Componente interno de templates
 * - No es reutilizable fuera de templates
 * - Es parte de la estructura del layout
 */

import { Flex } from 'antd';
import '@presentation/styles/components/organisms/info-sidebar.css';

const InfoSidebar = ({ children }) => {
    return (
        <Flex 
            vertical 
            gap="large" 
            className="info-sidebar"
        >
            {children}
        </Flex>
    );
};

export default InfoSidebar;

