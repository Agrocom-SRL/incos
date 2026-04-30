import { AlertOutlined, CheckCircleOutlined, ClockCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Col, Progress, Row, Segmented, Select, Space, Spin, Statistic, Table, Tag, Typography } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { useHorariosContext } from '@application-institucional/horarios';

const STATUS_COLOR = {
    pendiente: 'default',
    armado: 'processing',
    conflictos: 'error',
    listo: 'success',
};

const GestionHorariosPage = () => {
    const {
        title,
        subtitle,
        filters,
        options,
        viewMode,
        kpis,
        boardByStatus,
        filteredParallels,
        setViewMode,
        onFilterChange,
        onOpenArmado,
        onGenerate,
        onViewConflicts,
        onPublish,
        loading,
        error,
    } = useHorariosContext();

    const columns = [
        { title: 'Paralelo', dataIndex: 'paralelo', key: 'paralelo' },
        { title: 'Carrera', dataIndex: 'carrera', key: 'carrera' },
        { title: 'Periodo', dataIndex: 'periodo', key: 'periodo' },
        { title: 'Turno', dataIndex: 'turno', key: 'turno' },
        {
            title: 'Estado',
            dataIndex: 'estado',
            key: 'estado',
            render: (value) => <Tag color={STATUS_COLOR[value]}>{value}</Tag>,
        },
        {
            title: 'Progreso',
            key: 'progreso',
            render: (_, row) => `${row.bloquesAsignados}/${row.bloquesRequeridos}`,
        },
        {
            title: 'Accion',
            key: 'accion',
            render: () => (
                <Button type="link" onClick={onOpenArmado}>
                    Abrir armado
                </Button>
            ),
        },
    ];

    const filtroItems = [
        { key: 'gestion', label: 'Gestion', values: options.gestiones },
        { key: 'carrera', label: 'Carrera', values: options.carreras },
        { key: 'periodo', label: 'Periodo/Ano', values: options.periodos },
        { key: 'turno', label: 'Turno', values: options.turnos },
        {
            key: 'estado',
            label: 'Estado',
            values: ['pendiente', 'armado', 'conflictos', 'listo'],
        },
    ];

    return (
        <PageTemplate
            header={
                <PageHeader
                    title={title}
                    subtitle={subtitle}
                    actions={
                        <Space wrap>
                            <Button onClick={onGenerate}>Generar propuesta</Button>
                            <Button onClick={onViewConflicts}>Ver conflictos</Button>
                            <Button type="primary" onClick={onPublish}>
                                Publicar cambios
                            </Button>
                        </Space>
                    }
                />
            }
            sidebar={
                <Space direction="vertical" style={{ width: '100%' }}>
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
            }
        >
            <Spin spinning={loading} tip="Cargando catalogos de horarios...">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {error ? <Alert type="error" showIcon message={error} /> : null}
                <Card size="small" title="Filtros">
                    <Row gutter={[12, 12]}>
                        {filtroItems.map((item) => (
                            <Col xs={24} md={12} xl={8} key={item.key}>
                                <Typography.Text strong>{item.label}</Typography.Text>
                                <Select
                                    style={{ width: '100%', marginTop: 4 }}
                                    value={filters[item.key]}
                                    onChange={(value) => onFilterChange(item.key, value)}
                                    options={[
                                        { value: 'all', label: 'Todos' },
                                        ...item.values.map((value) => ({ value, label: value })),
                                    ]}
                                />
                            </Col>
                        ))}
                    </Row>
                </Card>

                <Row gutter={[12, 12]}>
                    <Col xs={24} md={12} xl={6}>
                        <Card size="small">
                            <Statistic title="Paralelos totales" value={kpis.total} prefix={<ClockCircleOutlined />} />
                        </Card>
                    </Col>
                    <Col xs={24} md={12} xl={6}>
                        <Card size="small">
                            <Statistic title="Cursos pendientes" value={kpis.pendientes} prefix={<AlertOutlined />} />
                        </Card>
                    </Col>
                    <Col xs={24} md={12} xl={6}>
                        <Card size="small">
                            <Statistic title="Conflictos detectados" value={kpis.conflictos} prefix={<WarningOutlined />} />
                        </Card>
                    </Col>
                    <Col xs={24} md={12} xl={6}>
                        <Card size="small">
                            <Statistic title="Listos/publicados" value={kpis.publicados} prefix={<CheckCircleOutlined />} />
                        </Card>
                    </Col>
                </Row>

                <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
                    <Typography.Title level={5} style={{ margin: 0 }}>
                        Vista de planificacion
                    </Typography.Title>
                    <Segmented
                        value={viewMode}
                        onChange={setViewMode}
                        options={[
                            { value: 'board', label: 'Tablero' },
                            { value: 'table', label: 'Tabla' },
                        ]}
                    />
                </Space>

                    {viewMode === 'board' ? (
                    <Row gutter={[12, 12]}>
                        {boardByStatus.map((column) => (
                            <Col xs={24} md={12} xl={6} key={column.key}>
                                <Card size="small" title={column.title}>
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        {column.items.map((item) => (
                                            <Card key={item.id} size="small" type="inner" title={`${item.paralelo} - ${item.carrera}`}>
                                                <Typography.Text type="secondary">
                                                    Periodo {item.periodo} | Turno {item.turno}
                                                </Typography.Text>
                                                <br />
                                                <Typography.Text>
                                                    Materias: {item.materiasOfertadas}/{item.materiasPlan}
                                                </Typography.Text>
                                                <Progress
                                                    percent={Math.round((item.bloquesAsignados / item.bloquesRequeridos) * 100)}
                                                    size="small"
                                                    style={{ marginTop: 8 }}
                                                />
                                                <Space style={{ marginTop: 8 }}>
                                                    {item.conflictos > 0 ? <Tag color="error">{item.conflictos} conflictos</Tag> : <Tag color="success">Sin conflictos</Tag>}
                                                    <Button size="small" onClick={onOpenArmado}>
                                                        Abrir armado
                                                    </Button>
                                                </Space>
                                            </Card>
                                        ))}
                                        {column.items.length === 0 ? (
                                            <Alert type="info" showIcon message="Sin paralelos para este estado con los filtros actuales." />
                                        ) : null}
                                    </Space>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                    ) : (
                    <Card size="small">
                        <Table rowKey="id" columns={columns} dataSource={filteredParallels} pagination={{ pageSize: 6 }} />
                    </Card>
                    )}
                </Space>
            </Spin>
        </PageTemplate>
    );
};

export default GestionHorariosPage;
