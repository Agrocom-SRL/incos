import { Flex, Typography } from 'antd';
import { allSpacing, allColors, typography } from '@theme/tokens';
import DashboardOverlappingAvatarRow from './DashboardOverlappingAvatarRow';

const { Title, Text } = Typography;

/**
 * Molécula: bloque “últimos docentes” o “últimos estudiantes” (título, avatares, contador).
 */
const DashboardUltimosPersonasBlock = ({
    title,
    onVerTodos,
    people,
    onOverflowClick,
    overflowTooltip,
}) => {
    const recentLine =
        people.length > 0 && people[0].description ? `Reciente: ${people[0].description}` : null;

    return (
        <Flex vertical gap={allSpacing.margin} style={{ flex: '1 1 280px', minWidth: 0 }}>
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
                <Typography.Link
                    style={{ color: allColors.colorPrimary, fontSize: `${typography.fontSizeSM}px` }}
                    onClick={onVerTodos}
                >
                    Ver todos
                </Typography.Link>
            </Flex>
            <Flex justify="space-between" align="center" gap={allSpacing.margin}>
                <DashboardOverlappingAvatarRow
                    people={people}
                    overflowTooltip={overflowTooltip}
                    onOverflowClick={onOverflowClick}
                />
                <Flex align="center" gap={allSpacing.margin} style={{ flexShrink: 0 }}>
                    <div
                        style={{
                            width: 1,
                            alignSelf: 'stretch',
                            minHeight: 44,
                            backgroundColor: allColors.colorBorder,
                        }}
                    />
                    <Flex vertical gap={2}>
                        <Text strong style={{ fontSize: `${typography.fontSizeHeading5}px`, lineHeight: 1.2 }}>
                            {people.length}
                        </Text>
                        <Text type="secondary" style={{ fontSize: `${typography.fontSizeSM}px`, lineHeight: 1.2 }}>
                            registros
                        </Text>
                    </Flex>
                </Flex>
            </Flex>
            {recentLine ? (
                <Text type="secondary" style={{ fontSize: `${typography.fontSizeSM}px` }}>
                    {recentLine}
                </Text>
            ) : null}
        </Flex>
    );
};

export default DashboardUltimosPersonasBlock;
