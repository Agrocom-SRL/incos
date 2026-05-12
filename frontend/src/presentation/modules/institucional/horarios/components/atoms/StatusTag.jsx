import { Tag } from 'antd';
import { BOARD_COLUMN_LABELS } from '@application-institucional/horarios/config/dashboardConstants';

const TABLERO_COLOR = {
    sin_horarios: 'error',
    sin_docentes: 'warning',
    sin_aulas: 'processing',
    completo: 'success',
};

/**
 * Tag de grupo del tablero (sin_horarios | sin_docentes | sin_aulas | completo).
 * @param {{ status: string, children?: import('react').ReactNode }} props
 */
const StatusTag = ({ status, children }) => {
    return (
        <Tag color={TABLERO_COLOR[status] || 'default'}>
            {children || BOARD_COLUMN_LABELS[status] || status}
        </Tag>
    );
};

export default StatusTag;
