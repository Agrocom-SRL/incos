/**
 * DataList: Molécula para mostrar lista de datos genérica
 * 
 * Single Responsibility: Renderizar una lista de datos usando ListItem como base
 * 
 * Clean Architecture:
 * - Presentation Layer: Componente que solo maneja UI
 * 
 * Atomic Design: Molecule
 * - Componente compuesto de átomos (Spinner, ListItem) y componentes de Ant Design (List, Empty, Flex)
 * - Reutilizable para cualquier tipo de datos
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo renderiza UI de lista de datos
 * - Open/Closed: Extensible mediante props y renderItem function
 * - Dependency Inversion: Depende de abstracciones (renderItem function)
 * 
 * Props:
 * - data: Array de items a mostrar
 * - loading: Si está cargando
 * - emptyMessage: Mensaje cuando no hay datos
 * - renderItem: Función para renderizar cada item
 *   - Si retorna un objeto con props: {avatar, title, caption}, se pasan explícitamente a ListItem
 *   - Si retorna contenido (ReactNode), se pasa como children a ListItem
 * - onSelect: Callback cuando se selecciona un item (opcional)
 * - loadingText: Texto a mostrar mientras carga (opcional)
 * - itemStyle: Estilos personalizados para cada item (opcional)
 * - listProps: Props adicionales para el componente List de Ant Design (opcional)
 * - className: Clase CSS adicional para el contenedor de la lista (opcional)
 * 
 * Nota: Los estilos se manejan mediante:
 * - Tema de Ant Design (componentConfig.List) para colores y espaciado base
 * - CSS con variables del tema (data-list.css) para layout personalizado
 */

import { List, Empty, Flex } from 'antd';
import { Spinner, ListItem } from '@atoms';

const DataList = ({ 
    data = [], 
    loading = false, 
    emptyMessage = 'No se encontraron datos',
    renderItem,
    onSelect = null,
    loadingText = 'Cargando...',
    itemStyle = null,
    listProps = {},
    className = '',
}) => {
    // Si está cargando, mostrar spinner
    if (loading) {
        return (
            <Flex
                vertical
                align="center"
                justify="center"
                className="data-list-loading"
            >
                <Spinner size="large" text={loadingText} />
            </Flex>
        );
    }

    // Si no hay datos, mostrar mensaje vacío
    if (!data || data.length === 0) {
        return (
            <Empty
                description={emptyMessage}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
        );
    }

    const listClassName = className ? `data-list ${className}`.trim() : 'data-list';

    return (
        <List
            className={listClassName}
            itemLayout="horizontal"
            dataSource={data}
            renderItem={(item, index) => {
                const rendered = renderItem ? renderItem(item, index) : null;
                const isPropsObject = rendered && typeof rendered === 'object' && !rendered.type;
                
                return (
                    <ListItem
                        {...(isPropsObject ? rendered : {})}
                        title={!rendered ? JSON.stringify(item) : undefined}
                        style={itemStyle}
                        onClick={() => onSelect && onSelect(item, index)}
                    >
                        {!isPropsObject && rendered}
                    </ListItem>
                );
            }}
            {...listProps}
        />
    );
};

export default DataList;
