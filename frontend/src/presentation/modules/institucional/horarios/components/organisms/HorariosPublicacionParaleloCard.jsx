import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Flex, Tooltip, Typography } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import DocenteHorarioSemanalGrid from '@docentes/components/organisms/DocenteHorarioSemanalGrid';
import {
    getSabadoArmadoGridRangeMinutes,
    getTurnoGridRangeMinutes,
} from '@application-institucional/horarios/utils/turnoGridRange';
import { paraleloScheduleToCourseSchedules } from '@application-institucional/horarios/utils/paraleloScheduleToCourseSchedules';
import ParaleloPlanSemanaCell from '../atoms/ParaleloPlanSemanaCell';

const { Text, Title } = Typography;

const SLOT_STEP = 45;

const cardShell = (accentBorder) => ({
    style: {
        borderRadius: 12,
        border: accentBorder ? `1px solid ${accentBorder}` : undefined,
        overflow: 'hidden',
    },
});

const HorariosPublicacionParaleloCard = ({ plan }) => {
    const navigate = useNavigate();
    const { paralelo, schedule } = plan || {};
    const gridRange = useMemo(() => getTurnoGridRangeMinutes(paralelo?.turno), [paralelo?.turno]);
    const sabadoRange = useMemo(() => getSabadoArmadoGridRangeMinutes(), []);
    const courseSchedules = useMemo(
        () =>
            paraleloScheduleToCourseSchedules(
                { schedule: schedule || [] },
                { turno: paralelo?.turno || null, paraleloNombre: paralelo?.nombre || null },
            ),
        [schedule, paralelo?.turno, paralelo?.nombre],
    );

    const border = paralelo?.carreraColorHex ? `${paralelo.carreraColorHex}55` : undefined;

    const onEditarPlan = () => {
        const id = paralelo?.id;
        if (id == null) return;
        const turnoQ = encodeURIComponent(paralelo?.turno || '');
        navigate(`/institucional/horarios/armado?paralelo=${id}&turno=${turnoQ}&tab=plan`);
    };

    return (
        <Card {...cardShell(border)} styles={{ body: { padding: 16 } }}>
            <Flex vertical gap={12} style={{ minWidth: 0 }}>
                <div className="horarios-publicacion-paralelo-card__head">
                    {paralelo?.id != null ? (
                        <Tooltip title="Editar plan semanal">
                            <button
                                type="button"
                                className="sd-profile__edit-btn"
                                onClick={onEditarPlan}
                                aria-label="Editar plan semanal del paralelo"
                            >
                                <EditOutlined />
                            </button>
                        </Tooltip>
                    ) : null}
                    <Title level={5} style={{ margin: 0 }}>
                        {paralelo?.nombre || 'Paralelo'}
                    </Title>
                    <Text type="secondary">
                        {paralelo?.carreraNombre || '—'}
                        {paralelo?.carreraCodigo ? ` (${paralelo.carreraCodigo})` : ''}
                        {' · '}
                        {paralelo?.periodoNombre || '—'}
                        {paralelo?.turno ? ` · Turno ${paralelo.turno}` : ''}
                    </Text>
                </div>
                <div className="horarios-publicacion-plan__grid">
                    <DocenteHorarioSemanalGrid
                        courseSchedules={courseSchedules}
                        CellComponent={ParaleloPlanSemanaCell}
                        gridTimeRange={gridRange}
                        saturdayGridTimeRange={sabadoRange}
                        slotStepMinutes={SLOT_STEP}
                        uniformSlotGrid
                        editable={false}
                        cellExtraProps={{}}
                    />
                </div>
            </Flex>
        </Card>
    );
};

export default HorariosPublicacionParaleloCard;
