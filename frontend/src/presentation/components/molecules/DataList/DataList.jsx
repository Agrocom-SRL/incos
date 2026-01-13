/**
 * DataList: Molécula para mostrar lista de datos genérica
 * 
 * Single Responsibility: Renderizar una lista de datos usando ListItem como base
 * 
 * Clean Architecture:
 * - Presentation Layer: Componente que solo maneja UI
 * 
 * Atomic Design: Molecule
 * - Componente compuesto de átomos (Spinner, ListItem) y componentes de Ant Design (Empty, Flex, Space)
 * - Reutilizable para cualquier tipo de datos
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo renderiza UI de lista de datos
 * - Open/Closed: Extensible mediante props y renderItem function
 * - Dependency Inversion: Depende de abstracciones (renderItem function)
 * 
 * NOTA: No usa el componente List de Ant Design porque está deprecado.
 * Implementación propia usando Flex y Space de Ant Design.
 * 
 * Props:
 * - data: Array de items a mostrar
 * - loading: Si está cargando
 * - emptyMessage: Mensaje cuando no hay datos
 * - renderItem: Función que retorna un objeto con props para ListItem: { avatar, title, caption }
 *   - Estos props coinciden exactamente con los que espera ListItem
 *   - Se define en la configuración del step (ej: step1BuscarEstudiante.jsx)
 * - onSelect: Callback cuando se selecciona un item (opcional)
 * - loadingText: Texto a mostrar mientras carga (opcional)
 * - className: Clase CSS adicional para el contenedor de la lista (opcional)
 * 
 * Nota: Los estilos se manejan mediante:
 * - CSS con variables del tema (data-list.css, list-item.css) para layout y estilos
 * - Variables CSS del tema (--color-primary, --spacing-*, etc.) definidas en root.js
 */

import { Empty, Flex, Space } from 'antd';
import { Spinner, ListItem } from '@atoms';

const DataList = ({ 
    data = [], 
    loading = false, 
    emptyMessage = 'No se encontraron datos',
    renderItem,
    onSelect = null,
    loadingText = 'Cargando...',
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
        <Flex
            vertical
            className={listClassName}
            gap={0}
        >
            <Space direction="vertical" size={0} style={{ width: '100%' }}>
                {data.map((item, index) => {
                    // renderItem del config retorna { avatar, title, caption } que son los props que ListItem espera
                    const itemProps = renderItem ? renderItem(item, index) : { title: JSON.stringify(item) };
                    
                    return (
                        <ListItem
                            key={index}
                            {...itemProps}
                            onClick={() => onSelect && onSelect(item, index)}
                        />
                    );
                })}
            </Space>
        </Flex>
    );
};

export default DataList;
