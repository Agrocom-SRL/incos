// src/presentation/templates/components/MainContent.jsx
/**
 * MainContent - Componente compartido entre templates
 * 
 * NO es un Organism - es parte de la estructura de los templates
 * - Contenedor para el contenido principal de página
 * - Ocupa el 70% en pantallas grandes, se expande cuando el sidebar está abajo
 * - Usado por PageTemplate y otros templates que lo necesiten
 * 
 * Atomic Design: Componente interno de templates
 * - No es reutilizable fuera de templates
 * - Es parte de la estructura del layout
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

