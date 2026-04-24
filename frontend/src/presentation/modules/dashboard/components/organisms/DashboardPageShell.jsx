import { Flex } from 'antd';
import { allSpacing, componentConfig, allColors } from '@theme/tokens';

/**
 * Organismo: contenedor visual de la página dashboard (fondo y padding).
 */
const DashboardPageShell = ({ children }) => {
    return (
        <Flex
            gap="large"
            align="flex-start"
            style={{
                width: '100%',
                height: '100%',
                backgroundColor: allColors.colorBgLayout,
                padding: `${allSpacing.marginMD}px`,
                borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
                boxSizing: 'border-box',
            }}
            className="page-container"
        >
            {children}
        </Flex>
    );
};

export default DashboardPageShell;
