// src/presentation/components/organisms/ContentSidebar/ContentSidebar.jsx
import { Flex } from 'antd';
import { Card, Typography, Image } from '@atoms';
import plant from '@assets/plant02.png';
import '@styles/components/organisms/content-sidebar.css';

const ContentSidebar = () => {
    return (
        <Card className="content-sidebar-card">
            <Flex vertical gap="large">
                <Typography.Title level={4} strong>
                    Today <br />5 orders
                </Typography.Title>
                <Typography.Title level={4} strong>
                    This month <br />
                    240 orders
                </Typography.Title>
            </Flex>

            <Image
                src={plant}
                alt="plant"
                className="content-sidebar__image"
            />
        </Card>
    );
};

export default ContentSidebar;