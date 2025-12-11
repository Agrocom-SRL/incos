// src/presentation/components/molecules/BannerContent/BannerContent.jsx
/**
 * BannerContent - Contenido del banner principal
 * Usa el tema para todos los estilos
 */

import { Card, Typography, Button, Flex } from 'antd';
import { componentConfig } from '@config/theme/components';
import { allColors } from '@config/theme/colors';
import { allSpacing } from '@config/theme/spacing';
import { typography } from '@config/theme/typography';

const { Title, Text } = Typography;

const BannerContent = ({ 
    title = "Create and sell products",
    description = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
    primaryButtonText = "Explore More",
    secondaryButtonText = "Top Sellers",
    onPrimaryClick,
    onSecondaryClick
}) => {
    return (
        <Card
            style={{
                backgroundColor: componentConfig.Card.colorBgContainer,
                borderRadius: `${componentConfig.Card.borderRadius}px`,
                boxShadow: componentConfig.Card.boxShadow,
                padding: `${componentConfig.Card.paddingLG}px`,
            }}
        >
            <Flex vertical gap={allSpacing.marginLG}>
                <Title
                    level={3}
                    style={{
                        color: allColors.colorPrimary,
                        fontSize: `${typography.fontSizeHeading3}px`,
                        fontWeight: typography.fontWeightStrong,
                        margin: 0,
                    }}
                >
                    {title}
                </Title>
                
                <Text
                    style={{
                        color: allColors.colorTextSecondary,
                        fontSize: `${typography.fontSize}px`,
                        lineHeight: typography.lineHeight,
                    }}
                >
                    {description}
                </Text>
                
                <Flex gap={allSpacing.margin}>
                    <Button
                        type="primary"
                        size="large"
                        onClick={onPrimaryClick}
                        style={{
                            backgroundColor: componentConfig.Button.colorPrimary,
                            borderColor: componentConfig.Button.colorPrimaryBorder,
                            color: componentConfig.Button.colorPrimaryText,
                            borderRadius: `${componentConfig.Button.borderRadius}px`,
                            height: `${componentConfig.Button.controlHeightLG}px`,
                            paddingInline: `${componentConfig.Button.paddingInline}px`,
                            fontWeight: typography.fontWeightStrong,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = componentConfig.Button.colorPrimaryHover;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = componentConfig.Button.colorPrimary;
                        }}
                    >
                        {primaryButtonText}
                    </Button>
                    
                    <Button
                        size="large"
                        onClick={onSecondaryClick}
                        style={{
                            backgroundColor: allColors.colorBgContainer,
                            borderColor: allColors.colorBorder,
                            color: allColors.colorText,
                            borderRadius: `${componentConfig.Button.borderRadius}px`,
                            height: `${componentConfig.Button.controlHeightLG}px`,
                            paddingInline: `${componentConfig.Button.paddingInline}px`,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = allColors.colorBgElevated;
                            e.currentTarget.style.borderColor = allColors.colorPrimary;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = allColors.colorBgContainer;
                            e.currentTarget.style.borderColor = allColors.colorBorder;
                        }}
                    >
                        {secondaryButtonText}
                    </Button>
                </Flex>
            </Flex>
        </Card>
    );
};

export default BannerContent;
