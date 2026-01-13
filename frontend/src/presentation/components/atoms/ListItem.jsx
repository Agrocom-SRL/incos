/**
 * ListItem - Componente atómico para items de lista
 * 
 * Single Responsibility: Renderizar un item de lista con estructura estándar (avatar, title, caption)
 * 
 * Atomic Design: Atom
 * - Componente básico reutilizable
 * - Implementación propia usando Flex y Space de Ant Design (no usa List.Item deprecado)
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo renderiza UI de un item de lista con estructura estándar
 * - Open/Closed: Extensible mediante props, pero mantiene estructura consistente
 * 
 * Estructura estándar:
 * - avatar: Icono o imagen (opcional)
 * - title: Título principal del item (string o ReactNode, requerido si no hay children)
 * - caption: Descripción o información adicional (ReactNode, opcional)
 * - children: Contenido personalizado (opcional, si se proporciona, se renderiza dentro del item)
 * 
 * NOTA: No usa List.Item de Ant Design porque List está deprecado.
 * Implementación propia usando Flex y Space de Ant Design.
 * 
 * Props:
 * - avatar: Icono, imagen o componente para el avatar (ReactNode, opcional)
 * - title: Título principal del item (string o ReactNode, requerido si no hay children)
 * - caption: Descripción o información adicional (ReactNode, opcional)
 * - onClick: Callback cuando se hace click (opcional)
 * - style: Estilos personalizados (opcional)
 * - className: Clase CSS adicional (opcional)
 * - children: Contenido personalizado (opcional, si se proporciona, se renderiza dentro del item)
 */

import { Flex, Typography } from 'antd';

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

    // Convertir title a ReactNode si es string y aplicar color primario
    const titleContent = typeof title === 'string' ? (
        <Text strong style={{ color: 'var(--color-primary)' }}>{title}</Text>
    ) : title;

    // Determinar si hay contenido para mostrar
    const hasMeta = avatar || title || caption;

    return (
        <Flex
            vertical={!hasMeta && !!children}
            align={hasMeta ? "flex-start" : undefined}
            gap={hasMeta ? "middle" : undefined}
            style={itemStyle}
            onClick={onClick}
            className={itemClassName}
            {...props}
        >
            {hasMeta && (
                <Flex align="flex-start" gap="middle" style={{ width: '100%' }}>
                    {/* Avatar */}
                    {avatar && (
                        <Flex className="list-item-avatar" align="center" justify="center">
                            {avatar}
                        </Flex>
                    )}
                    
                    {/* Contenido: title y caption */}
                    <Flex vertical style={{ flex: 1 }}>
                        {titleContent || <Text type="secondary">Sin título</Text>}
                        {caption && (
                            <Flex className="list-item-caption" vertical>
                                {caption}
                            </Flex>
                        )}
                    </Flex>
                </Flex>
            )}
            
            {/* Renderizar children si se proporciona */}
            {children}
        </Flex>
    );
};

export default ListItem;
