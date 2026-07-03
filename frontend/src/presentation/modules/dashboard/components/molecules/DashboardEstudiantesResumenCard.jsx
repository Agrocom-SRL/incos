import { Card, Flex, Typography } from 'antd';
import { allSpacing, componentConfig, allColors, typography, gradients, shadows } from '@theme/tokens';

const { Title, Text } = Typography;

/**
 * Molécula: tarjeta verde con conteo de estudiantes (hoy / mes).
 *
 * Variante genérica (aditiva, no rompe consumidores): si se pasa `lines`
 * (`[{ label, value, unidad? }]`) se pintan esas filas como KPIs en lugar del
 * par hoy/mes — la usa el dashboard del docente (cursos / horas / estudiantes).
 */
const DashboardEstudiantesResumenCard = ({
    todayCount,
    monthCount,
    title = 'Registro de estudiantes',
    todayLabel = 'Hoy',
    monthLabel = 'Este mes',
    unidad = 'estudiantes',
    lines = null,
}) => {
    const kpiLines = Array.isArray(lines)
        ? lines
        : [
            { label: todayLabel, value: todayCount, unidad },
            { label: monthLabel, value: monthCount, unidad },
        ];
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
                {kpiLines.map((line) => (
                    <Title
                        key={line.label}
                        level={4}
                        style={{
                            color: allColors.colorTextOnDark,
                            fontSize: `${typography.fontSizeHeading3}px`,
                            fontWeight: typography.fontWeightStrong,
                            margin: 0,
                            lineHeight: 1.35,
                        }}
                    >
                        {line.label}: {line.value}
                        {line.unidad ? ` ${line.unidad}` : ''}
                    </Title>
                ))}
            </Flex>
        </Card>
    );
};

export default DashboardEstudiantesResumenCard;
