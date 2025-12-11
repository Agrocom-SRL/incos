// src/presentation/components/molecules/OrdersSummaryCard/OrdersSummaryCard.jsx
/**
 * OrdersSummaryCard - Card grande con resumen de órdenes
 * Usa gradiente verde del tema
 */

import { Card, Typography, Flex } from 'antd';
import { allColors } from '@config/theme/colors';
import { allSpacing } from '@config/theme/spacing';
import { typography } from '@config/theme/typography';
import { gradients } from '@config/theme/gradients';
import { shadows } from '@config/theme/shadows';
import { componentConfig } from '@config/theme/components';

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
            bodyStyle={{
                padding: 0,
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
                        Today <br />
                        {todayOrders} orders
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
                        This month <br />
                        {monthOrders} orders
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
