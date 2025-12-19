// src/presentation/components/molecules/OrdersSummaryCard/OrdersSummaryCard.jsx
/**
 * OrdersSummaryCard - Card grande con resumen de órdenes
 * Usa gradiente verde del tema
 */

import { Card, Typography, Flex } from 'antd';
import { allColors, allSpacing, typography, gradients, shadows, componentConfig } from '@theme/tokens';

const { Title } = Typography;

const OrdersSummaryCard = ({ 
    todayOrders = 5,
    monthOrders = 240,
    image,
    imageAlt = "Orders summary"
}) => {
    return (
        <Card
            style={{
                background: gradients.gradientSuccess,
                borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
                boxShadow: shadows.shadowPrimary,
                border: 'none',
                padding: `${componentConfig.Card.paddingLG}px`,
                minHeight: '200px',
            }}
            styles={{
                body: {
                    padding: 0,
                }
            }}
        >
            <Flex justify="space-between" align="center" style={{ height: '100%' }}>
                <Flex vertical gap={allSpacing.marginLG}>
                    <Title
                        level={3}
                        style={{
                            color: allColors.colorTextOnDark,
                            fontSize: `${typography.fontSizeHeading3}px`,
                            fontWeight: typography.fontWeightStrong,
                            margin: 0,
                            lineHeight: typography.lineHeightHeading3,
                        }}
                    >
                        Hoy <br />
                        {todayOrders} estudiantes
                    </Title>
                    
                    <Title
                        level={3}
                        style={{
                            color: allColors.colorTextOnDark,
                            fontSize: `${typography.fontSizeHeading3}px`,
                            fontWeight: typography.fontWeightStrong,
                            margin: 0,
                            lineHeight: typography.lineHeightHeading3,
                        }}
                    >
                        Este mes <br />
                        {monthOrders} estudiantes
                    </Title>
                </Flex>
                
                {image && (
                    <div
                        style={{
                            width: '150px',
                            height: '150px',
                            borderRadius: `${componentConfig.Card.borderRadius}px`,
                            overflow: 'hidden',
                            flexShrink: 0,
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
            </Flex>
        </Card>
    );
};

export default OrdersSummaryCard;
