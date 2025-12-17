// src/presentation/components/molecules/ProductCard/ProductCard.jsx
/**
 * ProductCard - Card individual de producto
 * Usa el tema para todos los estilos
 */

import { Card, Typography } from 'antd';
import { componentConfig, allColors, allSpacing, typography } from '@theme/tokens';

const { Text } = Typography;

const ProductCard = ({ 
    image,
    imageAlt = "Product",
    label,
    onClick
}) => {
    return (
        <Card
            hoverable
            onClick={onClick}
            style={{
                backgroundColor: componentConfig.Card.colorBgContainer,
                borderRadius: `${componentConfig.Card.borderRadius}px`,
                boxShadow: componentConfig.Card.boxShadow,
                border: `1px solid ${componentConfig.Card.colorBorder}`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                width: '100%',
                maxWidth: '300px',
                flex: '1 1 300px',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = componentConfig.Card.boxShadowHover;
                e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = componentConfig.Card.boxShadow;
                e.currentTarget.style.transform = 'translateY(0)';
            }}
            bodyStyle={{
                padding: `${componentConfig.Card.padding}px`,
            }}
        >
            {image && (
                <div
                    style={{
                        width: '100%',
                        height: '200px',
                        marginBottom: `${allSpacing.margin}px`,
                        borderRadius: `${componentConfig.Card.borderRadius}px`,
                        overflow: 'hidden',
                        backgroundColor: allColors.colorBgElevated,
                    }}
                >
                    <img
                        src={image}
                        alt={imageAlt}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                </div>
            )}
            
            {label && (
                <Text
                    style={{
                        color: allColors.colorText,
                        fontSize: `${typography.fontSize}px`,
                        fontWeight: typography.fontWeightStrong,
                    }}
                >
                    {label}
                </Text>
            )}
        </Card>
    );
};

export default ProductCard;
