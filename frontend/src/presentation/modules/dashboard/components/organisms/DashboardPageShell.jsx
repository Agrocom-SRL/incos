import { Flex } from 'antd';

/**
 * Organismo: contenedor de layout de la página dashboard (solo flex, sin
 * padding ni fondo propios: se apoya en `.content` para no apilar spacing ni
 * un segundo tono de gris encima).
 */
const DashboardPageShell = ({ children }) => {
    return (
        <Flex
            gap="large"
            align="flex-start"
            style={{
                width: '100%',
                minHeight: '100%',
                boxSizing: 'border-box',
            }}
            className="page-container"
        >
            {children}
        </Flex>
    );
};

export default DashboardPageShell;
