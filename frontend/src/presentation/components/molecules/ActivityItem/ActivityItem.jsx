// src/presentation/components/molecules/ActivityItem/ActivityItem.jsx
/**
 * ActivityItem - Item individual de actividad reciente
 * Usa el tema para todos los estilos
 */

import { Flex, Avatar, Typography } from 'antd';
import { allColors, allSpacing, typography, componentConfig } from '@theme/tokens';

const { Text } = Typography;

const ActivityItem = ({ 
    name,
    action,
    timeAgo,
    avatarColor,
    avatarText
}) => {
    return (
        <Flex gap={allSpacing.margin} align="flex-start">
            <Avatar
                size={40}
                style={{
                    backgroundColor: avatarColor || componentConfig.Avatar.colorBgContainer,
                    color: avatarColor ? allColors.colorTextOnDark : componentConfig.Avatar.colorText,
                    flexShrink: 0,
                }}
            >
                {avatarText || name?.[0] || 'U'}
            </Avatar>
            
            <Flex vertical gap={allSpacing.marginXS} style={{ flex: 1, minWidth: 0 }}>
                <Text
                    strong
                    style={{
                        color: allColors.colorText,
                        fontSize: `${typography.fontSize}px`,
                    }}
                >
                    {name}
                </Text>
                
                <Text
                    style={{
                        color: allColors.colorTextSecondary,
                        fontSize: `${typography.fontSizeSM}px`,
                    }}
                >
                    {action}
                </Text>
                
                {timeAgo && (
                    <Text
                        type="secondary"
                        style={{
                            color: allColors.colorTextTertiary,
                            fontSize: `${typography.fontSizeSM}px`,
                        }}
                    >
                        {timeAgo}
                    </Text>
                )}
            </Flex>
        </Flex>
    );
};

export default ActivityItem;
