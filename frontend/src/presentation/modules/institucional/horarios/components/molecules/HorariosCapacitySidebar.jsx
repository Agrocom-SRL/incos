import { Space, Typography } from 'antd';
import { Card } from '@atoms';

const HorariosCapacitySidebar = () => {
    return (
        <Space orientation="vertical" style={{ width: '100%' }}>
            <Card title="Capacidad operativa" size="small">
                <Typography.Paragraph style={{ marginBottom: 8 }}>
                    Aulas disponibles (manana/tarde/noche): 12 / 9 / 8
                </Typography.Paragraph>
                <Typography.Paragraph style={{ marginBottom: 8 }}>
                    Franja mas saturada: 19:00 - 20:30
                </Typography.Paragraph>
                <Typography.Paragraph style={{ marginBottom: 0 }}>
                    Docentes no disponibles: 4 registrados
                </Typography.Paragraph>
            </Card>
        </Space>
    );
};

export default HorariosCapacitySidebar;
