/**
 * DataList: Molécula para mostrar lista de datos genérica
 *
 * Single Responsibility: Renderizar una lista de datos usando ListItem como base,
 * resolviendo sus cuatro estados: cargando, vacío, error y con resultados.
 *
 * Clean Architecture:
 * - Presentation Layer: Componente que solo maneja UI
 *
 * Atomic Design: Molecule
 * - Componente compuesto de átomos (ListItem) y componentes de Ant Design (Empty, Flex, Skeleton)
 * - Reutilizable para cualquier tipo de datos
 *
 * SOLID Principles:
 * - Single Responsibility: Solo renderiza UI de lista de datos
 * - Open/Closed: Extensible mediante props y renderItem function
 * - Dependency Inversion: Depende de abstracciones (renderItem function)
 *
 * NOTA: No usa el componente List de Ant Design porque está deprecado.
 * Implementación propia usando Flex de Ant Design.
 *
 * Props de datos:
 * - data: Array de items a mostrar
 * - groups: Alternativa a `data` — [{ key, title, hint, items }] para separar bloques
 *   dentro de la misma lista (p. ej. «Disponibles» vs «Ya matriculados»)
 * - renderItem: (item, index) => props de ListItem: { avatar, title, caption, extra, blocked, className }
 * - onSelect / selectedItem / isSelected: selección de un item
 * - getItemKey: (item, index) => key estable (por defecto item.id)
 *
 * Props de cabecera:
 * - header: Cabecera de bloque (string o ReactNode), p. ej. «Estudiantes nuevos sin matrícula»
 * - headerExtra: Contenido a la derecha de la cabecera (contador, pista de orden)
 *
 * Props de estado:
 * - loading + skeletonRows + loadingText: estado de carga (skeleton de filas)
 * - emptyTitle / emptyMessage / emptyAction: estado vacío explicado y accionable
 * - status: 'default' | 'error' — tiñe el estado vacío cuando la carga falló
 *
 * Nota: los estilos salen de tokens del theme (data-list.css, list-item.css);
 * este componente no declara colores ni tamaños.
 */

import { Empty, Flex, Skeleton, Typography } from 'antd';
import { ListItem } from '@atoms';

const { Text } = Typography;

const DEFAULT_SKELETON_ROWS = 3;

/** Resuelve si un item está seleccionado según las props de selección. */
const resolveActive = ({ item, index, isSelected, selectedItem }) => {
    if (typeof isSelected === 'function') return isSelected(item, index);
    if (selectedItem === null || selectedItem === undefined) return false;
    return selectedItem === item || (!!selectedItem?.id && !!item?.id && selectedItem.id === item.id);
};

const DataList = ({
    data = [],
    groups = null,
    loading = false,
    emptyMessage = 'No se encontraron datos',
    emptyTitle = null,
    emptyAction = null,
    status = 'default',
    renderItem,
    onSelect = null,
    selectedItem = null,
    isSelected = null,
    getItemKey = null,
    loadingText = 'Cargando…',
    skeletonRows = DEFAULT_SKELETON_ROWS,
    className = '',
    // Cabecera de bloque opcional (string o ReactNode) sobre los items,
    // p. ej. «Estudiantes nuevos sin matrícula» en el wizard de matrícula.
    header = null,
    headerExtra = null,
}) => {
    const listClassName = ['data-list', className].filter(Boolean).join(' ');

    const headerBlock =
        header || headerExtra ? (
            <div className="data-list__head">
                {header ? <span className="data-list__header">{header}</span> : <span />}
                {headerExtra ? <span className="data-list__head-extra">{headerExtra}</span> : null}
            </div>
        ) : null;

    // Estado: cargando → skeleton de filas (conserva la altura y evita el salto
    // visual del spinner centrado).
    if (loading) {
        return (
            <Flex vertical className={listClassName} gap={0}>
                {headerBlock}
                <div className="data-list__skeleton" aria-busy="true" aria-label={loadingText}>
                    {Array.from({ length: Math.max(1, skeletonRows) }).map((_, index) => (
                        <div className="data-list__skeleton-row" key={`skeleton-${index}`}>
                            <Skeleton active avatar paragraph={{ rows: 1 }} title={{ width: '40%' }} />
                        </div>
                    ))}
                </div>
            </Flex>
        );
    }

    const flatItems = Array.isArray(groups)
        ? groups.flatMap((group) => group?.items ?? [])
        : data ?? [];

    // Estado: vacío o error → explicación (título + detalle) y acción opcional.
    if (flatItems.length === 0) {
        const emptyClassName = [
            'data-list__empty',
            status === 'error' ? 'data-list__empty--error' : '',
        ]
            .filter(Boolean)
            .join(' ');

        return (
            <Flex vertical className={listClassName} gap={0}>
                {headerBlock}
                <div className={emptyClassName}>
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <Flex vertical align="center" gap={4}>
                                {emptyTitle ? (
                                    <Text strong className="data-list__empty-title">
                                        {emptyTitle}
                                    </Text>
                                ) : null}
                                <Text type="secondary" className="data-list__empty-desc">
                                    {emptyMessage}
                                </Text>
                            </Flex>
                        }
                    >
                        {emptyAction}
                    </Empty>
                </div>
            </Flex>
        );
    }

    // Renderiza un item (ListItem) resolviendo selección y bloqueo.
    const renderRow = (item, index) => {
        // renderItem del config retorna { avatar, title, caption, extra, blocked }
        const { blocked = false, ...itemProps } = renderItem
            ? renderItem(item, index)
            : { title: JSON.stringify(item) };

        const active = resolveActive({ item, index, isSelected, selectedItem });
        const key = getItemKey ? getItemKey(item, index) : (item?.id ?? index);

        return (
            <ListItem
                key={key}
                {...itemProps}
                active={active}
                blocked={blocked}
                onClick={onSelect ? () => onSelect(item, index) : null}
            />
        );
    };

    return (
        <Flex vertical className={listClassName} gap={0}>
            {headerBlock}
            <div className="data-list__items">
                {Array.isArray(groups)
                    ? groups
                          .filter((group) => (group?.items ?? []).length > 0)
                          .map((group) => (
                              <section className="data-list__group" key={group.key}>
                                  {group.title ? (
                                      <div className="data-list__group-head">
                                          <span className="data-list__group-title">{group.title}</span>
                                          {group.hint ? (
                                              <span className="data-list__group-hint">{group.hint}</span>
                                          ) : null}
                                      </div>
                                  ) : null}
                                  {group.items.map(renderRow)}
                              </section>
                          ))
                    : flatItems.map(renderRow)}
            </div>
        </Flex>
    );
};

export default DataList;
