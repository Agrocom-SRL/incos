import { Progress, Space, Typography } from 'antd';
import { Card } from '@atoms';
import { useHorariosContext } from '@application-institucional/horarios';

const getColor = (pct) => {
    if (pct >= 90) return 'var(--color-danger, #E24B4A)';
    if (pct >= 70) return 'var(--color-warning, #EF9F27)';
    return 'var(--color-success, #639922)';
};

const HorariosCapacitySidebar = () => {
    const { turnosCapacity } = useHorariosContext();
    const turnos = [
        { key: 'TARDE', label: 'Tarde' },
        { key: 'NOCHE', label: 'Noche' },
        { key: 'MANANA', altKey: 'MAÑANA', label: 'Manana' },
    ].map((turno) => {
        const row = turnosCapacity?.[turno.key] || turnosCapacity?.[turno.altKey] || {};
        return {
            label: turno.label,
            porcentaje: Number(row.porcentaje || 0),
            aulasEnUso: Number(row.aulasEnUso || 0),
            totalAulas: Number(row.totalAulas || 0),
        };
    });

    return (
        <Card size="small" title="Capacidad por turno">
            <Space direction="vertical" style={{ width: '100%' }}>
                {turnos.map((t) => (
                    <div key={t.label} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography.Text type="secondary">{t.label}</Typography.Text>
                            <Typography.Text strong>
                                {t.aulasEnUso}/{t.totalAulas} aulas
                            </Typography.Text>
                        </div>
                        <Progress
                            percent={t.porcentaje}
                            size="small"
                            showInfo={false}
                            strokeColor={getColor(t.porcentaje)}
                        />
                    </div>
                ))}
            </Space>
        </Card>
    );
};

export default HorariosCapacitySidebar;
