// src/presentation/templates/MainLayout/MainLayout.jsx
import { useState } from 'react';
import { Layout, Flex } from 'antd';
import Sidebar from '@organisms/Sidebar';

const { Sider, Header, Content } = Layout;

const MainLayout = ({ header, children, sideContent }) => {
    const [collapsed, setCollapsed] = useState(false);

    const handleMenuClick = ({ key }) => {
        console.log('Menu clicked:', key);
        // Aquí puedes manejar la navegación
    };

    const handleLogoClick = () => {
        setCollapsed(!collapsed); // Toggle al hacer click en logo
    };

    return (
        <Layout>
            <Sider
                theme="light"
                trigger={null}
                collapsible
                collapsed={collapsed}
                className="sider"
                width={250}
                collapsedWidth={80}
            >
                <Sidebar
                    collapsed={collapsed}           // Pasar estado
                    onMenuClick={handleMenuClick}
                    onLogoClick={handleLogoClick}   // Toggle con logo
                />
            </Sider>

            <Layout>
                <Header className="header">{header}</Header>

                <Content className="content">
                    <Flex gap="large">
                        <div style={{ flex: 1 }}>{children}</div>
                        {sideContent && <div style={{ width: 350 }}>{sideContent}</div>}
                    </Flex>
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;