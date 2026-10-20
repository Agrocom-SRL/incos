/**
 * ListItem - Componente atómico para items de lista
 *
 * Single Responsibility: Renderizar un item de lista con estructura estándar
 * (avatar, title, caption, extra) y sus estados de selección/bloqueo.
 *
 * Atomic Design: Atom
 * - Componente básico reutilizable
 * - Implementación propia usando Flex y Space de Ant Design (no usa List.Item deprecado)
 *
 * SOLID Principles:
 * - Single Responsibility: Solo renderiza UI de un item de lista con estructura consistente
 * - Open/Closed: Extensible mediante props (extra, blocked, className), sin variantes por módulo
 *
 * Estructura estándar:
 * - avatar: Icono, iniciales o imagen (opcional)
 * - title: Título principal del item (string o ReactNode, requerido si no hay children)
 * - caption: Descripción o información adicional (ReactNode, opcional)
 * - extra: Contenido alineado a la derecha (check de selección, pista de acción, opcional)
 * - children: Contenido personalizado (opcional)
 *
 * Estados (los pinta `list-item.css` con tokens del theme, sin estilos inline):
 * - normal → superficie del contenedor
 * - hover/focus (solo si es clickeable) → borde primario + elevación
 * - active (seleccionado) → fondo primario suave + barra de acento + texto primario
 * - blocked → item presente pero NO elegible (p. ej. estudiante ya matriculado):
 *   atenuado y `aria-disabled`, pero conserva el click para poder explicar el motivo.
 *
 * NOTA: No usa List.Item de Ant Design porque List está deprecado.
 *
 * Props:
 * - avatar, title, caption, extra, children
 * - onClick: Callback al seleccionar (click o Enter/Espacio)
 * - active: Si el item está seleccionado
 * - blocked: Si el item no es elegible (mantiene el click para informar el motivo)
 * - style / className: extensiones puntuales
 */

import { Flex, Typography } from 'antd';

const { Text } = Typography;

const ListItem = ({
    avatar,
    title,
    caption,
    extra = null,
    children,
    onClick = null,
    active = false,
    blocked = false,
    style = null,
    className = '',
    ...props
}) => {
    const isClickable = typeof onClick === 'function';

    // Clases: base + estado. Se conserva `active` (sin prefijo) por compatibilidad
    // con los consumidores actuales de DataList/SelectableDataList.
    const itemClassName = [
        'list-item',
        isClickable ? 'list-item--clickable' : '',
        active ? 'active' : '',
        blocked ? 'list-item--blocked' : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    // Teclado: el item seleccionable se comporta como botón (Enter / Espacio).
    const handleKeyDown = (event) => {
        if (!isClickable) return;
        if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
            event.preventDefault();
            onClick(event);
        }
    };

    // Convertir title a ReactNode si es string (el color lo resuelve el CSS por estado)
    const titleContent = typeof title === 'string' ? <Text strong>{title}</Text> : title;

    // Determinar si hay contenido para mostrar
    const hasMeta = avatar || title || caption || extra;

    return (
        <Flex
            vertical={!hasMeta && !!children}
            align={hasMeta ? 'flex-start' : undefined}
            gap={hasMeta ? 'middle' : undefined}
            style={style}
            onClick={onClick}
            onKeyDown={isClickable ? handleKeyDown : undefined}
            className={itemClassName}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
            aria-pressed={isClickable ? active : undefined}
            aria-disabled={blocked || undefined}
            {...props}
        >
            {hasMeta && (
                <Flex align="center" gap="middle" style={{ width: '100%' }}>
                    {/* Avatar */}
                    {avatar && (
                        <Flex className="list-item-avatar" align="center" justify="center">
                            {avatar}
                        </Flex>
                    )}

                    {/* Contenido: title y caption */}
                    <Flex vertical style={{ flex: 1, minWidth: 0 }}>
                        {titleContent || <Text type="secondary">Sin título</Text>}
                        {caption && (
                            <Flex className="list-item-caption" vertical>
                                {caption}
                            </Flex>
                        )}
                    </Flex>

                    {/* Zona derecha: check de selección, pista de acción o estado */}
                    {extra && (
                        <Flex className="list-item__extra" align="center" justify="flex-end">
                            {extra}
                        </Flex>
                    )}
                </Flex>
            )}

            {/* Renderizar children si se proporciona */}
            {children}
        </Flex>
    );
};

export default ListItem;
