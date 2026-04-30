import { Collapse, Space, Typography } from 'antd';
import { Card } from '@atoms';

const CursosIncompletosPanel = ({ cursosIncompletos }) => {
    const grouped = (cursosIncompletos || []).reduce((acc, item) => {
        const key = `${item.carrera} · ${item.periodo}`;
        acc[key] = (acc[key] || 0) + item.faltantes;
        return acc;
    }, {});
    const entries = Object.entries(grouped);

    return (
        <Card size="small" title="Cursos incompletos del plan">
            {entries.length === 0 ? (
                <Typography.Text type="secondary">Sin brechas de cobertura del plan.</Typography.Text>
            ) : (
                <Collapse
                    size="small"
                    items={entries.map(([key, value], idx) => ({
                        key: String(idx + 1),
                        label: `${value} asignaturas sin curso en ${key}`,
                        children: (
                            <Space orientation="vertical">
                                <Typography.Text type="secondary">Cobertura pendiente para esta combinacion de carrera/periodo.</Typography.Text>
                            </Space>
                        ),
                    }))}
                />
            )}
        </Card>
    );
};

export default CursosIncompletosPanel;
