import { Tag } from 'antd';
import { STATUS_LABELS } from '@application-institucional/horarios/config/dashboardConstants';

const STATUS_COLOR = {
    incompleto: 'warning',
    sin_horario: 'processing',
    conflicto: 'error',
    completo: 'success',
};

const StatusTag = ({ status, children }) => {
    return <Tag color={STATUS_COLOR[status] || 'default'}>{children || STATUS_LABELS[status] || status}</Tag>;
};

export default StatusTag;
