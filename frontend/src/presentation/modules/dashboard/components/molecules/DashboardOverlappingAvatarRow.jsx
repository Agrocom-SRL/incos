import { Flex, Avatar, Tooltip } from 'antd';
import { allColors, typography, shadows } from '@theme/tokens';
import { dashboardAvatarUrl } from '../../utils/dashboardAvatarUrl';
import { dashboardTooltipProps } from '../../utils/dashboardTooltipProps';
import { PERSONAS_VISIBLE } from '../../constants';

/**
 * Molécula: fila de avatares superpuestos + badge +N (dashboard).
 */
const DashboardOverlappingAvatarRow = ({ people, onOverflowClick, overflowTooltip }) => {
    const extra = people.length > PERSONAS_VISIBLE ? people.length - PERSONAS_VISIBLE : 0;
    return (
        <Flex align="center" style={{ paddingLeft: 4 }}>
            {people.slice(0, PERSONAS_VISIBLE).map((person, index) => (
                <Tooltip
                    key={person.id ?? index}
                    {...dashboardTooltipProps}
                    title={
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <span style={{ fontWeight: 700, fontSize: typography.fontSize }}>
                                {person.name}
                            </span>
                            {person.description ? (
                                <span
                                    style={{
                                        fontWeight: 500,
                                        fontSize: typography.fontSizeSM,
                                        opacity: 0.92,
                                    }}
                                >
                                    {person.description}
                                </span>
                            ) : null}
                        </div>
                    }
                >
                    <Avatar
                        src={dashboardAvatarUrl(person.avatarSeed)}
                        size={44}
                        style={{
                            marginLeft: index === 0 ? 0 : -14,
                            border: `2px solid ${allColors.colorBgContainer}`,
                            boxShadow: shadows.shadowElevation1,
                            cursor: 'default',
                            backgroundColor: allColors.colorBgElevated,
                        }}
                    />
                </Tooltip>
            ))}
            {extra > 0 ? (
                <Tooltip {...dashboardTooltipProps} title={overflowTooltip}>
                    <Avatar
                        size={44}
                        style={{
                            marginLeft: -14,
                            border: `2px solid ${allColors.colorBgContainer}`,
                            boxShadow: shadows.shadowElevation1,
                            backgroundColor: allColors.colorWarningBg,
                            color: allColors.colorWarning,
                            fontWeight: typography.fontWeightStrong,
                            cursor: 'pointer',
                        }}
                        onClick={onOverflowClick}
                    >
                        +{extra}
                    </Avatar>
                </Tooltip>
            ) : null}
        </Flex>
    );
};

export default DashboardOverlappingAvatarRow;
