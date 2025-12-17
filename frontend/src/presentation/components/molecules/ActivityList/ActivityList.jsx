// src/presentation/components/molecules/ActivityList/ActivityList.jsx
/**
 * ActivityList - Lista de actividades recientes
 * Usa el tema para todos los estilos
 */

import { Flex, Typography } from 'antd';
import { allColors, allSpacing, typography } from '@theme/tokens';
import ActivityItem from '../ActivityItem';

const { Title } = Typography;

// Colores de acento para avatares de actividades
const activityAvatarColors = [
    allColors.colorAccentBeige,
    allColors.colorAccentBrown,
    allColors.colorAccentBlue,
    allColors.colorAccentRed,
    allColors.colorAccentOlive,
    allColors.colorAccentGreenLight,
];

const ActivityList = ({ 
    title = "Recent Activity",
    viewAllText = "View All",
    activities = [],
    onViewAll
}) => {
    return (
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
                
                {viewAllText && (
                    <Typography.Link
                        onClick={onViewAll}
                        style={{
                            color: allColors.colorPrimary,
                            fontSize: `${typography.fontSize}px`,
                            fontWeight: typography.fontWeightStrong,
                        }}
                    >
                        {viewAllText}
                    </Typography.Link>
                )}
            </Flex>
            
            <Flex vertical gap={allSpacing.marginLG}>
                {activities.map((activity, index) => (
                    <ActivityItem
                        key={index}
                        name={activity.name}
                        action={activity.action}
                        timeAgo={activity.timeAgo}
                        avatarColor={activity.avatarColor || activityAvatarColors[index % activityAvatarColors.length]}
                        avatarText={activity.avatarText}
                    />
                ))}
            </Flex>
        </Flex>
    );
};

export default ActivityList;
