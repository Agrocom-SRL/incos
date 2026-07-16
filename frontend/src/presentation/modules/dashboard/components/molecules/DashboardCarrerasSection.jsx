import { Card, Flex, Typography } from 'antd';
import { allSpacing, componentConfig, allColors, typography, shadows } from '@theme/tokens';
import DashboardCarreraCard from './DashboardCarreraCard';

const { Title } = Typography;

/**
 * Molécula: panel “Nuestras carreras” con grid de tarjetas.
 */
const DashboardCarrerasSection = ({
    carreras,
    onVerTodas,
    onCarreraClick,
    detalleInteractivo = true,
    title = 'Nuestras carreras',
    emptyText = 'No hay carreras activas para mostrar.',
    style,
}) => {
    return (
        <Card
            style={{
                borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
                boxShadow: shadows.shadowElevation2,
                border: `1px solid ${allColors.colorBorder}`,
                backgroundColor: allColors.colorBgContainer,
                ...style,
            }}
            styles={{ body: { padding: `${componentConfig.Card.paddingLG}px` } }}
        >
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
                    {onVerTodas ? (
                        <Typography.Link
                            style={{
                                color: allColors.colorPrimary,
                                fontSize: `${typography.fontSize}px`,
                                fontWeight: typography.fontWeightStrong,
                            }}
                            onClick={onVerTodas}
                        >
                            Ver todas
                        </Typography.Link>
                    ) : null}
                </Flex>
                {carreras.length === 0 ? (
                    <Typography.Text type="secondary">{emptyText}</Typography.Text>
                ) : (
                    <Flex gap={allSpacing.marginLG} wrap="wrap">
                        {carreras.map((carrera) => (
                            <DashboardCarreraCard
                                key={carrera.id}
                                carrera={carrera}
                                interactive={detalleInteractivo}
                                onSelect={onCarreraClick}
                            />
                        ))}
                    </Flex>
                )}
            </Flex>
        </Card>
    );
};

export default DashboardCarrerasSection;
