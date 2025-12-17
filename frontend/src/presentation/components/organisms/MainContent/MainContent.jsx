// src/presentation/components/organisms/MainContent/MainContent.jsx
/**
 * MainContent - Contenido principal de página
 * Ocupa el 70% en pantallas grandes, se expande cuando el sidebar está abajo
 * Reutilizable en cualquier página que necesite este layout
 */

import { Flex } from 'antd';
import '@presentation/styles/components/organisms/main-content.css';

const MainContent = ({ children }) => {
    return (
        <Flex 
            vertical 
            gap="large" 
            className="main-content"
        >
            {children}
        </Flex>
    );
};

export default MainContent;
