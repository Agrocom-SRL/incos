// src/presentation/components/organisms/InfoSidebar/InfoSidebar.jsx
/**
 * InfoSidebar - Barra lateral de información/resumen
 * min-width: 300px en pantallas lg+, col-12 en pantallas menores
 * Reutilizable en cualquier página que necesite este layout
 */

import { Flex } from 'antd';
import '@styles/components/organisms/info-sidebar.css';

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
