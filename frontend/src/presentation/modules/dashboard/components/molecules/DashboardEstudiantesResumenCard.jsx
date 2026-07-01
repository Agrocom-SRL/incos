import { Card, Flex, Typography } from 'antd';
import { allSpacing, componentConfig, allColors, typography, gradients, shadows } from '@theme/tokens';

const { Title, Text } = Typography;

/**
 * Molécula: tarjeta verde con conteo de estudiantes (hoy / mes).
 */
const DashboardEstudiantesResumenCard = ({
    todayCount,
    monthCount,
    title = 'Registro de estudiantes',
    todayLabel = 'Hoy',
    monthLabel = 'Este mes',
    unidad = 'estudiantes',
}) => {
    return (
        <Card
            style={{
                background: gradients.gradientSuccess,
                borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
                boxShadow: shadows.shadowPrimary,
                border: 'none',
                minHeight: 160,
            }}
            styles={{ body: { padding: `${componentConfig.Card.paddingLG}px` } }}
        >
            <Flex vertical gap={allSpacing.marginMD}>
                <Text
                    style={{
                        color: allColors.colorTextSecondaryOnDark,
                        fontSize: `${typography.fontSizeSM}px`,
                        margin: 0,
                        letterSpacing: '0.02em',
                    }}
                >
                    {title}
                </Text>
                <Title
                    level={4}
                    style={{
                        color: allColors.colorTextOnDark,
                        fontSize: `${typography.fontSizeHeading3}px`,
                        fontWeight: typography.fontWeightStrong,
                        margin: 0,
                        lineHeight: 1.35,
                    }}
                >
                    {todayLabel}: {todayCount} {unidad}
                </Title>
                <Title
                    level={4}
                    style={{
                        color: allColors.colorTextOnDark,
                        fontSize: `${typography.fontSizeHeading3}px`,
                        fontWeight: typography.fontWeightStrong,
                        margin: 0,
                        lineHeight: 1.35,
                    }}
                >
                    {monthLabel}: {monthCount} {unidad}
                </Title>
            </Flex>
        </Card>
    );
};

export default DashboardEstudiantesResumenCard;
