// src/presentation/components/organisms/Header/Header.jsx
import { Flex, Typography, Avatar } from 'antd';
import Search from 'antd/es/input/Search';
import {
    MessageOutlined,
    NotificationOutlined,
    UserOutlined,
} from '@ant-design/icons';
import Logo from '@atoms/Logo';

const Header = () => {
    return (
        <Flex align="center" justify="space-between">
            {/* Logo horizontal en header (opcional) */}
            <Flex align="center" gap="middle">
                <Logo variant="horizontal" size="small" />
                <Typography.Title level={3} type="secondary" className="header__title">
                    Bienvenido, Miguel!
                </Typography.Title>
            </Flex>

            <Flex align="center" gap="3rem">
                <Search placeholder="Buscar en Dashboard" allowClear />

                <Flex align="center" gap="10px">
                    <MessageOutlined className="header-icon" />
                    <NotificationOutlined className="header-icon" />
                    <Avatar icon={<UserOutlined />} />
                </Flex>
            </Flex>
        </Flex>
    );
};

export default Header;