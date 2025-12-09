// src/presentation/pages/Dashboard/Dashboard.jsx
import { Flex } from 'antd';
import {
    Banner,
    ProductList,
    SellerLists,
    ContentSidebar,
    Activity,
} from '@organisms';

const Dashboard = () => {
    return (
        <>
            {/* Main Content */}
            <Flex vertical gap="2.3rem">
                <Banner />
                <ProductList />
                <SellerLists />
            </Flex>
        </>
    );
};

export default Dashboard;