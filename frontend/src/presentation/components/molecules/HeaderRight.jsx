// src/presentation/components/molecules/HeaderRight.jsx
import { Flex } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Avatar } from '@atoms';
import { allSpacing } from '@theme/tokens';

/**
 * HeaderRight - Componente molecular para la sección derecha del Header
 * Contiene elementos como Avatar, notificaciones, etc.
 */
const HeaderRight = () => {
    return (
        <Flex align="center" gap={allSpacing.margin}>
            <Avatar icon={<UserOutlined />} />
        </Flex>
    );
};

export default HeaderRight;
