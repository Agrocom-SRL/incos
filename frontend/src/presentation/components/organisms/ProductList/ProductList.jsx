// src/presentation/components/organisms/ProductList/ProductList.jsx
import { Flex } from 'antd';
import { SectionHeader } from '@molecules';
import { ProductCard } from '@molecules';
import plantData from '@data/plantData';
import '@styles/components/organisms/product-list.css';

const ProductList = () => {
    return (
        <div className="product-list">
            <SectionHeader title="My Listings" viewAllText="View All" />
            <Flex align="center" gap="large" className="product-list__container">
                {plantData.map((plant) => (
                    <ProductCard key={plant.id} product={plant} />
                ))}
            </Flex>
        </div>
    );
};

export default ProductList;