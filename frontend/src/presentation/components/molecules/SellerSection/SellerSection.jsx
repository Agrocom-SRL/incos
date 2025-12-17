// src/presentation/components/molecules/SellerSection/SellerSection.jsx
/**
 * SellerSection - Sección de vendedores (Top Seller / Featured Seller)
 * Usa el tema para todos los estilos
 */

import { Flex, Typography, Avatar } from 'antd';
import { allColors, allSpacing, typography, componentConfig } from '@theme/tokens';

const { Title, Text } = Typography;

const SellerSection = ({ 
    title,
    viewAllText = "View All",
    sellers = [],
    onViewAll
}) => {
    // Colores de acento para avatares (rotando entre los disponibles)
    // Usa accentColors únicos + semanticColors para mayor variedad
    const accentColors = [
        allColors.colorAccentBeige,
        allColors.colorInfo,        // Reemplaza colorAccentBlue (duplicado)
        allColors.colorAccentOlive,
        allColors.colorAccentBrown,
        allColors.colorError,        // Reemplaza colorAccentRed (duplicado)
        allColors.colorAccentGreenLight,
    ];

    return (
        <Flex vertical gap={allSpacing.margin}>
            <Flex justify="space-between" align="center">
                <Title
                    level={5}
                    style={{
                        color: allColors.colorPrimary,
                        fontSize: `${typography.fontSizeHeading5}px`,
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
                            fontSize: `${typography.fontSizeSM}px`,
                        }}
                    >
                        {viewAllText}
                    </Typography.Link>
                )}
            </Flex>
            
            <Flex gap={allSpacing.marginSM} align="center" wrap="wrap">
                {sellers.map((seller, index) => (
                    <Avatar
                        key={index}
                        size={40}
                        style={{
                            backgroundColor: accentColors[index % accentColors.length],
                            color: allColors.colorTextOnDark,
                        }}
                    >
                        {seller.name?.[0] || 'U'}
                    </Avatar>
                ))}
                {sellers.length > 3 && (
                    <Avatar
                        size={40}
                        style={{
                            backgroundColor: allColors.colorBgElevated,
                            color: allColors.colorText,
                            border: `2px dashed ${allColors.colorBorder}`,
                        }}
                    >
                        +{sellers.length - 3}
                    </Avatar>
                )}
            </Flex>
            
            {sellers.length > 0 && sellers[0].description && (
                <Text
                    style={{
                        color: allColors.colorTextSecondary,
                        fontSize: `${typography.fontSizeSM}px`,
                    }}
                >
                    {sellers[0].description}
                </Text>
            )}
        </Flex>
    );
};

export default SellerSection;
