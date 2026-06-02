import { useMemo } from 'react';
import { Card, Flex, List, Tag, Typography } from 'antd';
import { CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { allSpacing, allColors, componentConfig } from '@theme/tokens';

const { Text, Title } = Typography;

const cardShell = {
    style: {
        borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
        border: `1px solid ${allColors.colorBorder}`,
        backgroundColor: allColors.colorBgContainer,
    },
    styles: { body: { padding: `${componentConfig.Card.padding}px` } },
};

/**
 * Panel lateral de armado: cobertura por asignación docente (payload grilla-horario).
 */
const HorariosArmadoCoberturaSidebar = ({
    cobertura,
    conflictos = [],
    loading = false,
    paraleloGestionId = null,
}) => {
    const asignaciones = useMemo(
        () => (Array.isArray(cobertura?.asignaciones) ? cobertura.asignaciones : []),
        [cobertura],
    );

    const resumen = useMemo(() => {
        const total = asignaciones.length;
        const ok = asignaciones.filter((a) => a?.ok === true).length;
        const horasReq = asignaciones.reduce((s, a) => s + Number(a?.horas_requeridas ?? 0), 0);
        const bloques = asignaciones.reduce((s, a) => s + Number(a?.bloques_asignados ?? 0), 0);
        return { total, ok, horasReq, bloques };
    }, [asignaciones]);

    const conflictosList = useMemo(
        () => (Array.isArray(conflictos) ? conflictos : []),
        [conflictos],
    );

    return (
        <aside className="horarios-armado-cobertura-sidebar" aria-label="Cobertura por asignación docente">
            <Card {...cardShell} loading={loading}>
                <Flex vertical gap={allSpacing.marginMD}>
                    <div>
                        <Title level={5} style={{ margin: 0 }}>
                            Bloques en el plan semanal
                        </Title>
                        {paraleloGestionId ? (
                            <Text type="secondary" style={{ fontSize: 'inherit' }}>
                                Paralelo en gestión #{paraleloGestionId}
                            </Text>
                        ) : null}
                    </div>

                    <Flex wrap="wrap" gap={8}>
                        <Tag>
                            {resumen.ok}/{resumen.total} materias con bloques completos
                        </Tag>
                        <Tag color={cobertura?.completa ? 'success' : 'warning'}>
                            {resumen.bloques}/{resumen.horasReq} bloques colocados / horas plan
                        </Tag>
                    </Flex>

                    <Text type="secondary" style={{ fontSize: 'inherit' }}>
                        Distinto a «Asignación docente»: aquí cuenta cada franja del plan (asignacion_horarios).
                        Si el docente ya está asignado pero faltan bloques, usá «Añadir bloque» en la grilla.
                    </Text>
                    <List
                        size="small"
                        dataSource={asignaciones}
                        locale={{ emptyText: 'Sin materias con docente vigente en la oferta' }}
                        renderItem={(item) => {
                            const ok = item?.ok === true;
                            const req = Number(item?.horas_requeridas ?? 0);
                            const asig = Number(item?.bloques_asignados ?? 0);
                            return (
                                <List.Item className="horarios-armado-cobertura-sidebar__row">
                                    <Flex align="flex-start" gap={8} style={{ width: '100%' }}>
                                        {ok ? (
                                            <CheckCircleOutlined style={{ color: 'var(--ant-color-success)' }} />
                                        ) : (
                                            <WarningOutlined style={{ color: 'var(--ant-color-warning)' }} />
                                        )}
                                        <Flex vertical gap={2} style={{ minWidth: 0, flex: 1 }}>
                                            <Text strong ellipsis>
                                                {item?.asignatura || 'Materia'}
                                            </Text>
                                            <Text type="secondary">
                                                {asig}/{req > 0 ? req : '—'} bloques
                                            </Text>
                                        </Flex>
                                    </Flex>
                                </List.Item>
                            );
                        }}
                    />

                    {conflictosList.length > 0 ? (
                        <div>
                            <Text strong>Conflictos ({conflictosList.length})</Text>
                            <List
                                size="small"
                                style={{ marginTop: 8 }}
                                dataSource={conflictosList.slice(0, 8)}
                                renderItem={(c) => (
                                    <List.Item>
                                        <Text type="secondary" style={{ fontSize: 'inherit' }}>
                                            [{c?.tipo || '—'}] {c?.mensaje || 'Conflicto de horario'}
                                        </Text>
                                    </List.Item>
                                )}
                            />
                            {conflictosList.length > 8 ? (
                                <Text type="secondary">… y {conflictosList.length - 8} más</Text>
                            ) : null}
                        </div>
                    ) : null}
                </Flex>
            </Card>
        </aside>
    );
};

export default HorariosArmadoCoberturaSidebar;
