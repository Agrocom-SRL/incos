import { useMemo } from 'react';
import { Card, Flex, Tag, Typography } from 'antd';
import { allSpacing, allColors, componentConfig, shadows, typography } from '@theme/tokens';
import { BOARD_COLUMN_LABELS } from '@application-institucional/horarios/config/dashboardConstants';
import { resolveHorariosBoardBucket } from '@application-institucional/horarios/utils/horariosBoardBucket';

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

const tableroGrupoColor = (p) => {
    const b = p?.boardBucket ?? resolveHorariosBoardBucket(p);
    if (b === 'completo') return 'success';
    if (b === 'sin_horarios') return 'error';
    if (b === 'sin_docentes') return 'warning';
    if (b === 'sin_aulas') return 'processing';
    return 'default';
};

/**
 * Paralelos visibles agrupados por turno (sidebar gestión de horarios).
 */
const HorariosParalelosPorTurnoSidebar = ({ filteredParallels = [] }) => {
    const gruposTurno = useMemo(() => {
        const m = new Map();
        (filteredParallels || []).forEach((p) => {
            const key = p.turno || 'Sin turno';
            if (!m.has(key)) m.set(key, []);
            m.get(key).push(p);
        });
        return [...m.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0])));
    }, [filteredParallels]);

    return (
        <Card {...cardShell}>
            <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
                <Title
                    level={5}
                    style={{
                        margin: 0,
                        color: allColors.colorPrimary,
                        fontSize: `${typography.fontSizeHeading5}px`,
                        fontWeight: typography.fontWeightStrong,
                    }}
                >
                    Paralelos por turno
                </Title>
                {gruposTurno.length === 0 ? (
                    <Text type="secondary">No hay paralelos con los filtros actuales.</Text>
                ) : (
                    gruposTurno.map(([turno, items]) => (
                        <Flex key={turno} vertical gap={allSpacing.marginSM} style={{ minWidth: 0 }}>
                            <Text strong style={{ fontSize: typography.fontSizeSM }}>
                                Turno {turno}
                            </Text>
                            <Flex vertical gap={allSpacing.marginXS} style={{ paddingLeft: 4 }}>
                                {items.map((p) => (
                                    <Flex key={p.id} justify="space-between" align="flex-start" gap={8} wrap="wrap">
                                        <Text style={{ flex: '1 1 140px', minWidth: 0 }} ellipsis>
                                            {p.paralelo}
                                        </Text>
                                        <Tag color={tableroGrupoColor(p)} style={{ margin: 0, flexShrink: 0 }}>
                                            {BOARD_COLUMN_LABELS[p.boardBucket ?? resolveHorariosBoardBucket(p)] || '—'}
                                        </Tag>
                                    </Flex>
                                ))}
                            </Flex>
                        </Flex>
                    ))
                )}
            </Flex>
        </Card>
    );
};

export default HorariosParalelosPorTurnoSidebar;
