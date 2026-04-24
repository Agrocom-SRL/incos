import { Card, Flex, Typography } from 'antd';
import { allSpacing, componentConfig, allColors, typography, gradients, shadows } from '@theme/tokens';

const { Title, Text } = Typography;

/**
 * Molécula: tarjeta verde con conteo de estudiantes (hoy / mes).
 */
const DashboardEstudiantesResumenCard = ({ todayCount, monthCount }) => {
    return (
        <Card
            style={{
                background: gradients.gradientSuccess,
                borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
                boxShadow: shadows.shadowPrimary,
                border: 'none',
                padding: `${componentConfig.Card.paddingLG}px`,
                minHeight: 160,
            }}
            styles={{ body: { padding: 0 } }}
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
                    Registro de estudiantes
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
                    Hoy: {todayCount} estudiantes
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
                    Este mes: {monthCount} estudiantes
                </Title>
            </Flex>
        </Card>
    );
};

export default DashboardEstudiantesResumenCard;
