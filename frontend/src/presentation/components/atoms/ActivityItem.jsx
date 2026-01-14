/**
 * ActivityItem - Componente atómico para items de actividad
 * 
 * Single Responsibility: Renderizar un item de actividad con estructura estándar (avatar, nombre, acción, tiempo)
 * 
 * Atomic Design: Atom
 * - Componente básico reutilizable para mostrar actividades/notificaciones
 * - Similar a ListItem pero específico para actividades con estructura: avatar + nombre + acción + tiempo
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo renderiza UI de un item de actividad
 * - Open/Closed: Extensible mediante props, pero mantiene estructura consistente
 * 
 * Estructura:
 * - avatar: Avatar con color de fondo personalizado
 * - name: Nombre de la actividad (requerido)
 * - action: Acción realizada (opcional)
 * - timeAgo: Tiempo transcurrido (opcional)
 * - avatarColor: Color de fondo del avatar (opcional)
 * - avatarText: Texto del avatar (opcional, por defecto primera letra del nombre)
 * 
 * Props:
 * - name: Nombre de la actividad (string, requerido)
 * - action: Acción realizada (string, opcional)
 * - timeAgo: Tiempo transcurrido (string, opcional)
 * - avatarColor: Color de fondo del avatar (string, opcional)
 * - avatarText: Texto del avatar (string, opcional)
 * - avatarSize: Tamaño del avatar (number, default: 40)
 * - onClick: Callback cuando se hace click (opcional)
 * - className: Clase CSS adicional (opcional)
 * - style: Estilos personalizados (opcional)
 */

import { Flex } from 'antd';
import { Avatar } from '@atoms';
import { Text } from '@atoms';

const ActivityItem = ({
    name,
    action,
    timeAgo,
    avatarColor,
    avatarText,
    avatarSize = 40,
    onClick = null,
    className = '',
    style = null,
    ...props
}) => {
    // Determinar el texto del avatar
    const displayAvatarText = avatarText || name?.[0]?.toUpperCase() || 'U';
    
    // Determinar el color del texto del avatar (blanco si hay color de fondo, sino usar variable del tema)
    const avatarTextColor = avatarColor ? 'var(--color-white)' : 'var(--color-avatar-text)';

    // Agregar cursor pointer si hay onClick
    const itemStyle = onClick ? { cursor: 'pointer', ...style } : style;

    // Clase CSS del componente
    const itemClassName = className ? `activity-item ${className}`.trim() : 'activity-item';

    return (
        <Flex
            gap="middle"
            align="flex-start"
            style={itemStyle}
            onClick={onClick}
            className={itemClassName}
            {...props}
        >
            {/* Avatar */}
            <Avatar
                size={avatarSize}
                style={{
                    backgroundColor: avatarColor || 'var(--color-avatar-bg)',
                    color: avatarTextColor,
                    flexShrink: 0,
                }}
            >
                {displayAvatarText}
            </Avatar>
            
            {/* Contenido: nombre, acción y tiempo */}
            <Flex vertical gap="small" style={{ flex: 1, minWidth: 0 }}>
                {/* Nombre */}
                <Text strong style={{ fontSize: 'var(--font-size-base)' }}>
                    {name || 'Sin nombre'}
                </Text>
                
                {/* Acción */}
                {action && (
                    <Text style={{ 
                        color: 'var(--color-text-tertiary)',
                        fontSize: 'var(--font-size-sm)',
                    }}>
                        {action}
                    </Text>
                )}
                
                {/* Tiempo */}
                {timeAgo && (
                    <Text 
                        type="secondary" 
                        style={{ 
                            fontSize: 'var(--font-size-sm)',
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
