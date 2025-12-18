// src/presentation/components/molecules/HeaderLeft/HeaderLeft.jsx
import { Flex } from 'antd';
import IconButton from '@/presentation/components/atoms/Iconbutton';
import Logo from '@/presentation/components/atoms/Logo';
import { MenuOutlined } from '@ant-design/icons';
import { allSpacing } from '@theme/tokens';

/**
 * HeaderLeft - Componente molecular para la sección izquierda del Header
 * Contiene el Logo y el botón trigger (hamburguesa)
 */
const HeaderLeft = ({ collapsed, onToggle }) => {
    return (
        <Flex align="center" gap={allSpacing.margin}>
            <Logo variant="horizontal" size="medium" />
            <IconButton
                icon={<MenuOutlined />}
                onClick={onToggle}
                size="large"
                className="header-trigger"
            />
        </Flex>
    );
};

export default HeaderLeft;
