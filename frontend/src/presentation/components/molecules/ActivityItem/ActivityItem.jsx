// src/presentation/components/molecules/ActivityItem/ActivityItem.jsx
import { List } from 'antd';
import { Avatar, Typography } from '@atoms';
import '@styles/components/molecules/activity-item.css';

/**
 * Componente molecular ActivityItem
 * Combina List.Item, Avatar y Typography para mostrar una actividad reciente
 * 
 * @param {object} activity - Objeto de actividad con name, orderTime y avatar opcional
 * @param {string} className - Clases CSS adicionales
 */
const ActivityItem = ({ activity, className = '' }) => {
    const { name, orderTime, avatar } = activity;
    const timeText = `${orderTime} ${orderTime === 1 ? 'day ago' : 'days ago'}`;

    return (
        <List.Item className={`activity-item ${className}`}>
            <List.Item.Meta
                avatar={
                    <Avatar
                        src={avatar || `https://api.dicebear.com/7.x/miniavs/svg?seed=${name}`}
                    />
                }
                title={<a href="#">{name}</a>}
                description="Ordered a new plant"
            />
            <Typography.Text className="gray--color">{timeText}</Typography.Text>
        </List.Item>
    );
};

export default ActivityItem;
