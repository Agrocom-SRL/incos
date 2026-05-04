import { Alert, Col, Row, Space } from 'antd';
import { Card } from '@atoms';
import { ParaleloCard } from '../molecules';

const STATUS_DECORATOR = {
    incompleto: { dot: 'var(--color-warning)', accent: 'var(--color-warning)' },
    sin_horario: { dot: 'var(--color-info)', accent: 'var(--color-info)' },
    conflicto: { dot: 'var(--color-error)', accent: 'var(--color-error)' },
    completo: { dot: 'var(--color-primary)', accent: 'var(--color-primary)' },
};

const ParalelosBoard = ({ boardByStatus, onOpenArmado }) => {
    return (
        <Row gutter={[12, 12]} className="horarios-gestion-board">
            {boardByStatus.map((column) => (
                <Col xs={24} md={12} xl={6} key={column.key}>
                    <Card
                        className={`horarios-gestion-board__column horarios-gestion-board__column--${column.key}`}
                        variant="outlined"
                        shadow={false}
                        title={
                            <Space>
                                <span
                                    className="horarios-gestion-board__status-dot"
                                    style={{ background: STATUS_DECORATOR[column.key]?.dot }}
                                />
                                {column.title}
                            </Space>
                        }
                        styles={{
                            header: {
                                borderBottom: `2px solid ${STATUS_DECORATOR[column.key]?.accent || 'var(--ant-color-border-secondary)'}`,
                            },
                            body: { padding: 12 },
                        }}
                    >
                        <div className="horarios-gestion-board__scroll">
                            <Space orientation="vertical" size={12} style={{ width: '100%' }}>
                                {column.items.map((item) => (
                                    <ParaleloCard key={item.id} paralelo={item} onOpen={onOpenArmado} />
                                ))}
                                {column.items.length === 0 ? (
                                    <Alert type="info" showIcon title="Sin paralelos para este estado con los filtros actuales." />
                                ) : null}
                            </Space>
                        </div>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default ParalelosBoard;
