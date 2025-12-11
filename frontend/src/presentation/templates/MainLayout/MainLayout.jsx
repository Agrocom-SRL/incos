// src/presentation/templates/MainLayout/MainLayout.jsx
import { useState } from 'react';
import { Layout, Flex } from 'antd';
import Sidebar from '@organisms/Sidebar';
import { allSpacing } from '@config/theme/spacing';

const { Sider, Header, Content } = Layout;

const MainLayout = ({ header, children, sideContent }) => {
    const [collapsed, setCollapsed] = useState(true);

    const handleMenuClick = ({ key }) => {
        // Aquí puedes manejar la navegación
    };

    const handleLogoClick = () => {
        setCollapsed(!collapsed); // Toggle al hacer click en logo
    };

    // Usar valores del tema para el sidebar
    const sidebarWidth = allSpacing.sidebarWidth;
    const sidebarCollapsedWidth = allSpacing.sidebarCollapsedWidth;

    return (
        <Layout>
            <Sider
                theme="light"
                trigger={null}
                collapsible
                collapsed={collapsed}
                className="sider"
                width={sidebarWidth}
                collapsedWidth={sidebarCollapsedWidth}
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
