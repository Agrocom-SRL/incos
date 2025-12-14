// src/presentation/pages/Dashboard/Dashboard.jsx
import { Flex } from 'antd';
import { MainContent, InfoSidebar } from '@organisms';
import {
    BannerContent,
    ProductListSection,
    SellerSection,
    OrdersSummaryCard,
    ActivityList,
} from '@molecules';
import { allSpacing } from '@theme/spacing';
import plant02 from '@assets/plant02.png';
import plant01 from '@assets/plant01.png';
import plant03 from '@assets/plant03.png';
import '@styles/pages/dashboard.css';

const Dashboard = () => {
    // Datos de ejemplo para productos
    const products = [
        { image: plant01, label: 'Arecaceae' },
        { image: plant02, label: 'Indoor Potted' },
        { image: plant03, label: 'Succulent' },
    ];

    // Datos de ejemplo para vendedores
    const topSellers = [
        { name: 'Seller 1', description: '1,200 plants sold, 10 seller' },
        { name: 'Seller 2', description: '' },
        { name: 'Seller 3', description: '' },
        { name: 'Seller 4', description: '' },
        { name: 'Seller 5', description: '' },
    ];

    const featuredSellers = [
        { name: 'Featured 1', description: '800 plants sold, 5 seller' },
        { name: 'Featured 2', description: '' },
        { name: 'Featured 3', description: '' },
    ];

    // Datos de ejemplo para actividades
    const activities = [
        { name: 'Emma Turner', action: 'Ordered a new plant', timeAgo: '1 day ago' },
        { name: 'John Smith', action: 'Added a product', timeAgo: '2 days ago' },
        { name: 'Sarah Johnson', action: 'Completed an order', timeAgo: '3 days ago' },
        { name: 'Mike Davis', action: 'Updated profile', timeAgo: '4 days ago' },
        { name: 'Lisa Wilson', action: 'Created a listing', timeAgo: '5 days ago' },
        { name: 'Tom Brown', action: 'Made a purchase', timeAgo: '6 days ago' },
    ];

    return (
        <Flex 
            gap="large" 
            align="flex-start"
            style={{ width: '100%', height: '100%' }}
            className="dashboard-container"
        >
            {/* Contenido Principal - 70% en lg+, expandible en menores */}
            <MainContent>
                <BannerContent />
                <ProductListSection 
                    products={products}
                />
                <Flex gap={allSpacing.marginXL} wrap="wrap">
                    <SellerSection 
                        title="Top Seller"
                        sellers={topSellers}
                    />
                    <SellerSection 
                        title="Featured Seller"
                        sellers={featuredSellers}
                    />
                </Flex>
            </MainContent>

            {/* Resumen de Información - 30% en lg+ (min-width 300px), col-12 en menores */}
            <InfoSidebar>
                <OrdersSummaryCard 
                    todayOrders={5}
                    monthOrders={240}
                    image={plant02}
                />
                <ActivityList 
                    activities={activities}
                />
            </InfoSidebar>
        </Flex>
    );
};

export default Dashboard;