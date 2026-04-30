import { Alert, Col, Row, Space } from 'antd';
import { Card } from '@atoms';
import { ParaleloCard } from '../molecules';

const STATUS_DECORATOR = {
    incompleto: { dot: 'var(--color-warning)', border: 'var(--color-warning)' },
    sin_horario: { dot: 'var(--color-info)', border: 'var(--color-info)' },
    conflicto: { dot: 'var(--color-danger)', border: 'var(--color-danger)' },
    completo: { dot: 'var(--incos-green-border)', border: 'var(--incos-green-border)' },
};

const ParalelosBoard = ({ boardByStatus, onOpenArmado }) => {
    return (
        <Row gutter={[12, 12]}>
            {boardByStatus.map((column) => (
                <Col xs={24} md={12} xl={6} key={column.key}>
                    <Card
                        size="small"
                        title={
                            <Space size={8}>
                                <span style={{ width: 8, height: 8, borderRadius: 999, background: STATUS_DECORATOR[column.key]?.dot }} />
                                {column.title}
                            </Space>
                        }
                        style={{ borderTop: `2px solid ${STATUS_DECORATOR[column.key]?.border || '#d9d9d9'}` }}
                    >
                        <Space orientation="vertical" style={{ width: '100%' }}>
                            {column.items.map((item) => (
                                <ParaleloCard key={item.id} paralelo={item} onOpen={onOpenArmado} />
                            ))}
                            {column.items.length === 0 ? (
                                <Alert type="info" showIcon title="Sin paralelos para este estado con los filtros actuales." />
                            ) : null}
                        </Space>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default ParalelosBoard;
