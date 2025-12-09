// src/presentation/pages/Dashboard/SideContent.jsx
import { Flex } from 'antd';
import { ContentSidebar, Activity } from '@organisms';

const SideContent = () => {
    return (
        <Flex vertical gap="2.3rem">
            <ContentSidebar />
            <Activity />
        </Flex>
    );
};

export default SideContent;