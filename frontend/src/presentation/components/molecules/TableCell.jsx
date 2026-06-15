/**
 * TableCell - Molécula para renderizar celdas de tabla con formato consistente
 * 
 * Single Responsibility: Encapsular patrones comunes de renderizado de celdas de tabla
 * 
 * Atomic Design: Molecule
 * - Combina átomos (Text) con componentes de Ant Design (Space, Tag)
 * - Reutilizable para cualquier tabla que necesite mostrar datos formateados
 * 
 * Los estilos de tema vienen automáticamente de Ant Design via ConfigProvider
 * CSS solo para layout y espaciado
 */

import { Space, Tag, Flex } from 'antd';
import { Text } from '@atoms';

/**
 * TableCell - Componente molecular para celdas de tabla
 *
 * @param {ReactNode} children - Contenido principal de la celda
 * @param {string} subtext - Opcional. Si se pasa, se muestra debajo de children como texto secundario
 * @param {ReactNode} icon - Icono opcional a mostrar antes del contenido
 * @param {string} fallback - Texto a mostrar si children está vacío (default: 'N/A')
 * @param {boolean} strong - Si el texto debe ser negrita
 * @param {object} textStyle - Estilos adicionales para el Text
 * @param {string} textType - Tipo de texto (default, secondary, success, warning, danger)
 * @param {ReactNode} tag - Tag opcional a mostrar después del contenido
 * @param {string} tagColor - Color del tag (clase CSS o preset Ant Design)
 * @param {object} tagStyle - Estilo inline del tag (prioridad sobre tagColor cuando se usa colores de tipo admisión)
 * @param {string} orientation - Orientación del Space (horizontal | vertical)
 * @param {string} size - Tamaño del Space (small | middle | large)
 * @param {object} spaceStyle - Estilos adicionales para el Space
 * @param {string} align - Alineación del contenido (left | center | right)
 * @param {boolean} actions - Si es true, renderiza children directamente sin Text (para botones/acciones)
 */
const TableCell = ({
    children,
    subtext,
    icon,
    fallback = 'N/A',
    strong = false,
    textStyle = {},
    textType = 'default',
    tag,
    tagColor = 'blue',
    tagStyle,
    orientation: orientationProp = 'horizontal',
    size = 'small',
    spaceStyle = {},
    align = 'left',
    actions = false,
    ...props
}) => {
    const orientation = orientationProp ?? 'horizontal';
    const content = children ?? fallback;
    const hasContent = content !== null && content !== undefined && content !== '';

    const alignClass = `table-cell--align-${align}`;
    const cellClassName = `table-cell ${alignClass}`;

    if (actions) {
        return (
            <Flex className={cellClassName}>
                <Space size={size} orientation={orientation} style={spaceStyle} {...props}>
                    {children}
                </Space>
            </Flex>
        );
    }

    const textBlock = subtext != null && subtext !== '' ? (
        <Flex vertical gap={2}>
            {hasContent && (
                <Text strong={strong} type={textType} style={textStyle}>
                    {content}
                </Text>
            )}
            {!hasContent && fallback && (
                <Text type="secondary" style={textStyle}>
                    {fallback}
                </Text>
            )}
            <Text type="secondary" style={{ fontSize: 'var(--font-size-sm)', ...textStyle }}>
                {subtext}
            </Text>
        </Flex>
    ) : (
        hasContent ? (
            <Text strong={strong} type={textType} style={textStyle}>
                {content}
            </Text>
        ) : (
            fallback && (
                <Text type="secondary" style={textStyle}>
                    {fallback}
                </Text>
            )
        )
    );

    return (
        <div className={cellClassName}>
            <Space size={size} orientation={orientation} style={spaceStyle} {...props}>
                {icon && icon}
                {textBlock}
                {tag && (
                    <Tag
                        className={`table-cell__tag ${orientation === 'vertical' ? 'table-cell__tag--vertical' : ''} ${!tagStyle ? `table-cell__tag--${tagColor}` : ''}`}
                        style={tagStyle}
                    >
                        {tag}
                    </Tag>
                )}
            </Space>
        </div>
    );
};

export default TableCell;

