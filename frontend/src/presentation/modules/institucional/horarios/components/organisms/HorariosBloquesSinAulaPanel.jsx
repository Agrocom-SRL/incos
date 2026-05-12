import { Card, Flex, List, Typography } from 'antd';
import { allSpacing, allColors, componentConfig, shadows, typography } from '@theme/tokens';

const { Title, Text } = Typography;

const cardShell = {
    style: {
        borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
        boxShadow: shadows.shadowElevation2,
        border: `1px solid ${allColors.colorBorder}`,
        backgroundColor: allColors.colorBgContainer,
    },
    styles: { body: { padding: `${componentConfig.Card.paddingLG}px` } },
};

const fmtHora = (t) => (t == null ? '' : String(t).slice(0, 5));

const HorariosBloquesSinAulaPanel = ({ grupos = [] }) => {
    const conDatos = (grupos || []).filter((g) => Array.isArray(g.items) && g.items.length > 0);
    if (!conDatos.length) return null;

    return (
        <Card {...cardShell}>
            <Flex vertical gap={allSpacing.marginMD} style={{ width: '100%', minWidth: 0 }}>
                <Title
                    level={5}
                    style={{
                        margin: 0,
                        color: allColors.colorPrimary,
                        fontSize: `${typography.fontSizeHeading5}px`,
                        fontWeight: typography.fontWeightStrong,
                    }}
                >
                    Bloques sin aula
                </Title>
                <Text type="secondary" style={{ fontSize: typography.fontSizeSM }}>
                    Materias con franja horaria definida y aula pendiente, agrupadas por paralelo.
                </Text>
                {conDatos.map((g) => (
                    <Flex key={g.paraleloId} vertical gap={allSpacing.marginXS} style={{ minWidth: 0 }}>
                        <Text strong style={{ fontSize: typography.fontSizeSM }}>
                            {g.paraleloNombre || `Paralelo #${g.paraleloId}`}
                            {g.paraleloTurno ? ` · ${g.paraleloTurno}` : ''}
                        </Text>
                        <List
                            size="small"
                            dataSource={g.items}
                            renderItem={(it) => (
                                <List.Item style={{ padding: '6px 0', border: 'none' }}>
                                    <Text style={{ fontSize: typography.fontSizeSM }}>
                                        {(it.materiaSigla || it.materiaNombre || it.cursoCodigo || 'Materia') +
                                            ` · ${it.dia || '—'} ${fmtHora(it.horaInicio)}–${fmtHora(it.horaFin)}`}
                                    </Text>
                                </List.Item>
                            )}
                        />
                    </Flex>
                ))}
            </Flex>
        </Card>
    );
};

export default HorariosBloquesSinAulaPanel;
