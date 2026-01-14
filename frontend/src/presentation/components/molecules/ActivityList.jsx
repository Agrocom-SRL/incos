/**
 * ActivityList - Componente molécula para lista de actividades
 * 
 * Single Responsibility: Renderizar una lista de actividades usando ActivityItem
 * 
 * Atomic Design: Molecule
 * - Componente compuesto de átomos (ActivityItem, Spinner, Empty)
 * - Reutilizable para cualquier tipo de lista de actividades/notificaciones
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo renderiza UI de lista de actividades
 * - Open/Closed: Extensible mediante props y renderItem function
 * - Dependency Inversion: Depende de abstracciones (ActivityItem)
 * 
 * Props:
 * - activities: Array de actividades a mostrar
 *   - name: Nombre de la actividad (string, requerido)
 *   - action: Acción realizada (string, opcional)
 *   - timeAgo: Tiempo transcurrido (string, opcional)
 *   - avatarColor: Color de fondo del avatar (string, opcional)
 *   - avatarText: Texto del avatar (string, opcional)
 * - loading: Si está cargando (boolean, opcional)
 * - emptyMessage: Mensaje cuando no hay datos (string, opcional)
 * - loadingText: Texto a mostrar mientras carga (string, opcional)
 * - className: Clase CSS adicional para el contenedor (opcional)
 * - gap: Espaciado entre items (string, default: 'large')
 * - onItemClick: Callback cuando se hace click en un item (function, opcional)
 * - accentColors: Array de colores para avatares cuando no se especifica avatarColor (array, opcional)
 */

import { Empty, Flex } from 'antd';
import { Spinner, ActivityItem } from '@atoms';

const ActivityList = ({
    activities = [],
    loading = false,
    emptyMessage = 'No hay actividades disponibles',
    loadingText = 'Cargando actividades...',
    className = '',
    gap = 'large',
    onItemClick = null,
    accentColors = [],
    ...props
}) => {
    // Si está cargando, mostrar spinner
    if (loading) {
        return (
            <Flex
                vertical
                align="center"
                justify="center"
                className="activity-list-loading"
            >
                <Spinner size="large" text={loadingText} />
            </Flex>
        );
    }

    // Si no hay datos, mostrar mensaje vacío
    if (!activities || activities.length === 0) {
        return (
            <Empty
                description={emptyMessage}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
        );
    }

    const listClassName = className ? `activity-list ${className}`.trim() : 'activity-list';

    return (
        <Flex
            vertical
            gap={gap}
            className={listClassName}
            {...props}
        >
            {activities.map((activity, index) => {
                // Determinar color del avatar si no está especificado
                const avatarColor = activity.avatarColor || 
                    (accentColors.length > 0 ? accentColors[index % accentColors.length] : undefined);

                return (
                    <ActivityItem
                        key={activity.id || index}
                        name={activity.name}
                        action={activity.action}
                        timeAgo={activity.timeAgo}
                        avatarColor={avatarColor}
                        avatarText={activity.avatarText}
                        onClick={onItemClick ? () => onItemClick(activity, index) : null}
                    />
                );
            })}
        </Flex>
    );
};

export default ActivityList;
