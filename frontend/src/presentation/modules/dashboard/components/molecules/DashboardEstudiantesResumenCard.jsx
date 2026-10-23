import { Card, Flex, Typography } from 'antd';
import { allSpacing, componentConfig, allColors, typography, gradients, shadows } from '@theme/tokens';

const { Title, Text } = Typography;

/**
 * Molécula: tarjeta verde con conteo de estudiantes (hoy / mes).
 *
 * Variante genérica (aditiva, no rompe consumidores): si se pasa `lines`
 * (`[{ label, value, unidad? }]`) se pintan esas filas como KPIs en lugar del
 * par hoy/mes — la usa el dashboard del docente (cursos / horas / estudiantes).
 * `compact` reduce separación y alto mínimo para cuadros con varias filas (la tipografía queda
 * en 27 px, 50 % más que la versión anterior).
 */
const DashboardEstudiantesResumenCard = ({
    todayCount,
    monthCount,
    title = 'Registro de estudiantes',
    todayLabel = 'Hoy',
    monthLabel = 'Este mes',
    unidad = 'estudiantes',
    lines = null,
    compact = false,
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
                minHeight: compact ? undefined : 160,
            }}
            styles={{ body: { padding: `${compact ? componentConfig.Card.padding : componentConfig.Card.paddingLG}px` } }}
        >
            <Flex vertical gap={compact ? allSpacing.marginXS : allSpacing.marginMD}>
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
                        key={`${line.label}-${line.unidad ?? ''}`}
                        level={4}
                        style={{
                            color: allColors.colorTextOnDark,
                            fontSize: `${compact ? Math.round(typography.fontSizeLG * 1.5) : typography.fontSizeHeading3}px`,
                            fontWeight: typography.fontWeightStrong,
                            margin: 0,
                            lineHeight: compact ? 1.25 : 1.35,
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
