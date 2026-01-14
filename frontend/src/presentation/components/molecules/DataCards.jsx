/**
 * DataCards: Molécula para mostrar array de tarjetas genérico
 * 
 * Single Responsibility: Renderizar un array de tarjetas usando Card como base
 * 
 * Clean Architecture:
 * - Presentation Layer: Componente que solo maneja UI
 * 
 * Atomic Design: Molecule
 * - Componente compuesto de átomos (Card, Spinner) y componentes de Ant Design (Empty, Flex)
 * - Reutilizable para cualquier tipo de datos que se muestren como tarjetas
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo renderiza UI de array de tarjetas
 * - Open/Closed: Extensible mediante props y renderItem function
 * - Dependency Inversion: Depende de abstracciones (renderItem function)
 * 
 * Props:
 * - data: Array de items a mostrar
 * - loading: Si está cargando
 * - emptyMessage: Mensaje cuando no hay datos
 * - renderItem: Función que retorna el contenido JSX para cada Card
 *   - Recibe (item, index) y debe retornar JSX
 *   - Se define en la configuración del step (ej: step2SeleccionarParalelos.jsx)
 * - onSelect: Callback cuando se selecciona una tarjeta (opcional)
 * - selectedItem: Item seleccionado para aplicar estado activo (opcional)
 * - isSelected: Función para determinar si un item está seleccionado (item, index) => boolean (opcional)
 * - loadingText: Texto a mostrar mientras carga (opcional)
 * - className: Clase CSS adicional para el contenedor (opcional)
 * - orientation: 'vertical' | 'horizontal' - Orientación del layout (default: 'vertical')
 * - cardWidth: Ancho de cada tarjeta (default: '100%' para vertical, '300px' para horizontal)
 * 
 * Nota: Los estilos se manejan mediante:
 * - Variables CSS del tema (--color-primary, --spacing-*, etc.) definidas en root.js
 */

import { Empty, Flex } from 'antd';
import { Spinner, Card } from '@atoms';

const DataCards = ({ 
    data = [], 
    loading = false, 
    emptyMessage = 'No se encontraron datos',
    renderItem,
    onSelect = null,
    selectedItem = null,
    isSelected = null,
    loadingText = 'Cargando...',
    className = '',
    orientation = 'vertical',
    cardWidth = null,
}) => {
    // Si está cargando, mostrar spinner
    if (loading) {
        return (
            <Flex
                vertical
                align="center"
                justify="center"
                className="data-cards-loading"
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

    // Determinar ancho de tarjeta según orientación
    const defaultCardWidth = orientation === 'vertical' ? '100%' : '300px';
    const finalCardWidth = cardWidth || defaultCardWidth;
    
    // Clase CSS según orientación
    const orientationClass = orientation === 'vertical' ? 'data-cards--vertical' : 'data-cards--horizontal';
    const containerClassName = className 
        ? `data-cards ${orientationClass} ${className}`.trim() 
        : `data-cards ${orientationClass}`.trim();

    return (
        <div className={containerClassName}>
            {data.map((item, index) => {
                // Determinar si el item está seleccionado
                let active = false;
                if (isSelected && typeof isSelected === 'function') {
                    active = isSelected(item, index);
                } else if (selectedItem !== null && selectedItem !== undefined) {
                    // Comparar por referencia o por ID si existe
                    active = selectedItem === item || (selectedItem?.id && item?.id && selectedItem.id === item.id);
                }

                // Renderizar el contenido de la tarjeta usando renderItem
                const cardContent = renderItem ? renderItem(item, index) : null;

                // Clase CSS para tarjeta activa
                const cardClassName = active ? 'data-cards__card data-cards__card--active' : 'data-cards__card';

                return (
                    <Card
                        key={item?.id || index}
                        hoverable={!!onSelect}
                        onClick={() => onSelect && onSelect(item, index)}
                        className={cardClassName}
                        style={{
                            width: finalCardWidth,
                            maxWidth: orientation === 'horizontal' ? finalCardWidth : '100%',
                            flex: orientation === 'horizontal' ? '1 1 300px' : undefined,
                        }}
                    >
                        {cardContent}
                    </Card>
                );
            })}
        </div>
    );
};

export default DataCards;
