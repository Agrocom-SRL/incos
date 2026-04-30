import { Progress, Space, Typography } from 'antd';
import { Card } from '@atoms';

const colorByKey = {
    completo: 'var(--color-success, #639922)',
    conflicto: 'var(--color-danger, #E24B4A)',
    sin_horario: 'var(--color-info, #378ADD)',
    incompleto: 'var(--color-warning, #EF9F27)',
};

const ProgresoGestionPanel = ({ progresoGestion }) => {
    return (
        <Card size="small" title="Progreso de gestion">
            <Space orientation="vertical" style={{ width: '100%' }}>
                {(progresoGestion || []).map((item) => (
                    <div key={item.key}>
                        <Typography.Text>
                            {item.label} ({item.value})
                        </Typography.Text>
                        <Progress percent={item.percent} strokeColor={colorByKey[item.key]} size={[220, 8]} />
                    </div>
                ))}
            </Space>
        </Card>
    );
};

export default ProgresoGestionPanel;
