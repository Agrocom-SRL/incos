// src/presentation/components/molecules/ProductListSection/ProductListSection.jsx
/**
 * ProductListSection - Sección de lista de productos
 * Usa el tema para todos los estilos
 */

import { Flex, Typography } from 'antd';
import { allColors, allSpacing, typography } from '@theme/tokens';
import ProductCard from '../ProductCard';

const { Title } = Typography;

const ProductListSection = ({ 
    title = "My Listings",
    viewAllText = "View All",
    products = [],
    onViewAll,
    onProductClick
}) => {
    return (
        <Flex vertical gap={allSpacing.marginLG}>
            <Flex justify="space-between" align="center">
                <Title
                    level={4}
                    style={{
                        color: allColors.colorPrimary,
                        fontSize: `${typography.fontSizeHeading4}px`,
                        fontWeight: typography.fontWeightStrong,
                        margin: 0,
                    }}
                >
                    {title}
                </Title>
                
                {viewAllText && (
                    <Typography.Link
                        onClick={onViewAll}
                        style={{
                            color: allColors.colorPrimary,
                            fontSize: `${typography.fontSize}px`,
                            fontWeight: typography.fontWeightStrong,
                        }}
                    >
                        {viewAllText}
                    </Typography.Link>
                )}
            </Flex>
            
            <Flex gap={allSpacing.marginLG} wrap="wrap">
                {products.map((product, index) => (
                    <ProductCard
                        key={index}
                        image={product.image}
                        imageAlt={product.label}
                        label={product.label}
                        onClick={() => onProductClick?.(product, index)}
                    />
                ))}
            </Flex>
        </Flex>
    );
};

export default ProductListSection;
