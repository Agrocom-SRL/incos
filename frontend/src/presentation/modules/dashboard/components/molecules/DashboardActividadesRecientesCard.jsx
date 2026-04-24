import { Card, Flex, Typography, Avatar, Tooltip, Divider } from 'antd';
import { allSpacing, componentConfig, allColors, typography, shadows } from '@theme/tokens';
import { dashboardAvatarUrl } from '../../utils/dashboardAvatarUrl';
import { dashboardTooltipProps } from '../../utils/dashboardTooltipProps';
import { ACTIVIDADES_SCROLL_MAX_PX } from '../../constants';

const { Title, Text } = Typography;

/** Texto multilínea (2 líneas máx.) — clamp CSS; Typography ellipsis falla dentro de Flex. */
const activityClampStyle = (extra) => ({
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    lineHeight: 1.45,
    ...extra,
});

/**
 * Molécula: tarjeta de actividades recientes con scroll interno.
 */
const DashboardActividadesRecientesCard = ({ actividades, onVerTodas, onRowNavigate }) => {
    return (
        <Card
            style={{
                borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
                boxShadow: shadows.shadowElevation2,
                border: `1px solid ${allColors.colorBorder}`,
                backgroundColor: allColors.colorBgContainer,
                overflow: 'hidden',
            }}
            styles={{ body: { padding: 0 } }}
        >
            <Flex
                justify="space-between"
                align="center"
                style={{
                    padding: `${allSpacing.margin}px ${allSpacing.marginLG}px`,
                }}
            >
                <Title
                    level={4}
                    style={{
                        color: allColors.colorPrimary,
                        fontSize: `${typography.fontSizeHeading4}px`,
                        fontWeight: typography.fontWeightStrong,
                        margin: 0,
                    }}
                >
                    Actividades recientes
                </Title>
                <Typography.Link
                    style={{
                        color: allColors.colorPrimary,
                        fontSize: `${typography.fontSizeSM}px`,
                        fontWeight: typography.fontWeightStrong,
                    }}
                    onClick={onVerTodas}
                >
                    Ver todas
                </Typography.Link>
            </Flex>
            <Divider style={{ margin: 0 }} />
            <div
                style={{
                    maxHeight: ACTIVIDADES_SCROLL_MAX_PX,
                    overflowY: 'auto',
                }}
            >
                {actividades.length === 0 ? (
                    <Text
                        type="secondary"
                        style={{
                            display: 'block',
                            padding: `${allSpacing.marginLG}px`,
                            fontSize: `${typography.fontSizeSM}px`,
                        }}
                    >
                        No hay actividades recientes.
                    </Text>
                ) : (
                    actividades.map((activity, index) => (
                        <Flex
                            key={`${activity.artefactoTipo || 'act'}-${index}-${activity.name}`}
                            align="flex-start"
                            justify="space-between"
                            gap={allSpacing.margin}
                            onClick={() => activity.linkPath && onRowNavigate(activity.linkPath)}
                            style={{
                                cursor: activity.linkPath ? 'pointer' : 'default',
                                padding: `${allSpacing.margin}px ${allSpacing.marginLG}px`,
                                minHeight: 108,
                                borderBottom:
                                    index < actividades.length - 1
                                        ? `1px solid ${allColors.colorBorderSecondary}`
                                        : 'none',
                                transition: 'background 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = allColors.colorPrimaryBg;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <Flex gap={allSpacing.margin} align="flex-start" style={{ flex: 1, minWidth: 0 }}>
                                <Tooltip {...dashboardTooltipProps} title={activity.name}>
                                    <span style={{ flexShrink: 0, lineHeight: 0 }}>
                                        <Avatar
                                            src={dashboardAvatarUrl(activity.avatarSeed)}
                                            size={44}
                                            style={{
                                                backgroundColor: allColors.colorBgElevated,
                                                border: `1px solid ${allColors.colorBorderSecondary}`,
                                            }}
                                        />
                                    </span>
                                </Tooltip>
                                <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                    <Tooltip
                                        {...dashboardTooltipProps}
                                        title={
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <div
                                                    style={{
                                                        fontWeight: 700,
                                                        fontSize: typography.fontSize,
                                                    }}
                                                >
                                                    {activity.name}
                                                </div>
                                                <div
                                                    style={{
                                                        fontWeight: 500,
                                                        fontSize: typography.fontSizeSM,
                                                        opacity: 0.92,
                                                    }}
                                                >
                                                    {activity.action}
                                                </div>
                                            </div>
                                        }
                                    >
                                        <div
                                            style={{
                                                display: 'block',
                                                minWidth: 0,
                                                width: '100%',
                                                maxWidth: '100%',
                                                boxSizing: 'border-box',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: allSpacing.marginXS,
                                                    minWidth: 0,
                                                }}
                                            >
                                                <div
                                                    style={activityClampStyle({
                                                        color: allColors.colorText,
                                                        fontSize: `${typography.fontSize}px`,
                                                        fontWeight: typography.fontWeightStrong,
                                                    })}
                                                >
                                                    {activity.name}
                                                </div>
                                                <div
                                                    style={activityClampStyle({
                                                        color: allColors.colorTextSecondary,
                                                        fontSize: `${typography.fontSizeSM}px`,
                                                    })}
                                                >
                                                    {activity.action}
                                                </div>
                                            </div>
                                        </div>
                                    </Tooltip>
                                </div>
                            </Flex>
                            {activity.timeAgo ? (
                                <Text
                                    type="secondary"
                                    style={{
                                        flex: '0 0 auto',
                                        maxWidth: 100,
                                        textAlign: 'right',
                                        fontSize: `${typography.fontSizeSM}px`,
                                        color: allColors.colorTextTertiary,
                                        lineHeight: 1.35,
                                        alignSelf: 'flex-start',
                                    }}
                                >
                                    {activity.timeAgo}
                                </Text>
                            ) : (
                                <span style={{ flexShrink: 0, width: 56 }} />
                            )}
                        </Flex>
                    ))
                )}
            </div>
        </Card>
    );
};

export default DashboardActividadesRecientesCard;
