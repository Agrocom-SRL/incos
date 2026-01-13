/**
 * ListItem - Componente atómico para items de lista
 * 
 * Single Responsibility: Renderizar un item de lista con estructura estándar (avatar, title, caption)
 * 
 * Atomic Design: Atom
 * - Componente básico reutilizable
 * - Wrapper de List.Item de Ant Design con estructura estándar usando List.Item.Meta
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo renderiza UI de un item de lista con estructura estándar
 * - Open/Closed: Extensible mediante props, pero mantiene estructura consistente
 * 
 * Estructura estándar:
 * - avatar: Icono o imagen (opcional)
 * - title: Título principal del item (string o ReactNode, requerido si no hay children)
 * - caption: Descripción o información adicional (ReactNode, opcional)
 * - children: Contenido personalizado (opcional, si se proporciona, se renderiza dentro del List.Item)
 * 
 * El componente siempre renderiza List.Item, y dentro:
 * - Si hay avatar, title o caption, renderiza List.Item.Meta
 * - Si hay children, los renderiza (puede ir junto a List.Item.Meta o solo)
 * 
 * Props:
 * - avatar: Icono, imagen o componente para el avatar (ReactNode, opcional)
 * - title: Título principal del item (string o ReactNode, requerido si no hay children)
 * - caption: Descripción o información adicional (ReactNode, opcional)
 * - onClick: Callback cuando se hace click (opcional)
 * - style: Estilos personalizados (opcional)
 * - className: Clase CSS adicional (opcional)
 * - children: Contenido personalizado (opcional, si se proporciona, se renderiza dentro del List.Item)
 * - ...props: Props adicionales para List.Item de Ant Design
 */

import { List, Typography } from 'antd';

const { Text } = Typography;

const ListItem = ({
    avatar,
    title,
    caption,
    children,
    onClick = null,
    style = null,
    className = '',
    ...props
}) => {
    // Solo agregar cursor pointer si hay onClick, los demás estilos vienen de CSS
    const itemStyle = onClick ? { cursor: 'pointer', ...style } : style;

    const itemClassName = className ? `list-item ${className}`.trim() : 'list-item';

    // Convertir title a ReactNode si es string
    const titleContent = typeof title === 'string' ? <Text strong>{title}</Text> : title;

    // Determinar si hay contenido para List.Item.Meta
    const hasMeta = avatar || title || caption;

    return (
        <List.Item
            style={itemStyle}
            onClick={onClick}
            className={itemClassName}
            {...props}
        >
            {/* Renderizar List.Item.Meta si hay avatar, title o caption */}
            {hasMeta && (
                <List.Item.Meta
                    avatar={avatar}
                    title={titleContent || <Text type="secondary">Sin título</Text>}
                    description={caption}
                />
            )}
            
            {/* Renderizar children si se proporciona (puede ir junto a List.Item.Meta o solo) */}
            {children}
        </List.Item>
    );
};

export default ListItem;
