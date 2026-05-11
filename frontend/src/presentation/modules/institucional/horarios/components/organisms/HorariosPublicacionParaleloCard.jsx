import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Flex, Tag, Tooltip, Typography } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import DocenteHorarioSemanalGrid from '@docentes/components/organisms/DocenteHorarioSemanalGrid';
import {
    getSabadoArmadoGridRangeMinutes,
    getTurnoGridRangeMinutes,
} from '@application-institucional/horarios/utils/turnoGridRange';
import { paraleloScheduleToCourseSchedules } from '@application-institucional/horarios/utils/paraleloScheduleToCourseSchedules';
import {
    appendParaleloEstadoLineas,
    buildHorariosPlanPendientesDetalleLines,
} from '@application-institucional/horarios/utils/buildHorariosPlanPendientesDetalle';
import ParaleloPlanSemanaCell from '../atoms/ParaleloPlanSemanaCell';
import HorariosPlanPendientesLista from './HorariosPlanPendientesLista';

const { Text, Title } = Typography;

const SLOT_STEP = 45;

const cardShell = (accentBorder) => ({
    style: {
        borderRadius: 12,
        border: accentBorder ? `1px solid ${accentBorder}` : undefined,
        overflow: 'hidden',
    },
});

const estadoTag = (estado) => {
    if (estado === 'completo') return { color: 'success', label: 'Listo para publicar' };
    if (estado === 'conflicto') return { color: 'error', label: 'Con conflictos' };
    if (estado === 'sin_horario') return { color: 'processing', label: 'Pendiente de horarios/aulas' };
    if (estado === 'incompleto') return { color: 'warning', label: 'Incompleto' };
    return { color: 'default', label: estado || '—' };
};

const HorariosPublicacionParaleloCard = ({ plan, paraleloEstado }) => {
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
    const estado = paraleloEstado?.estado || null;
    const pendientesLineas = useMemo(() => {
        const fromPlan = buildHorariosPlanPendientesDetalleLines(courseSchedules);
        let merged = appendParaleloEstadoLineas(fromPlan, paraleloEstado);
        if (
            paraleloEstado?.conflictoDocenteHorario &&
            !merged.some((l) => String(l).startsWith('Choque de docente'))
        ) {
            merged = [
                ...merged,
                'El sistema marca choque de horario de docente; no aparecen choques listables en el plan cargado (revisá docentes sin identificar o sincronización).',
            ];
        }
        return merged;
    }, [courseSchedules, paraleloEstado]);
    const tag = useMemo(() => estadoTag(estado), [estado]);
    const okPublicacion = estado === 'completo' && pendientesLineas.length === 0;
    const mensajeVacio =
        paraleloEstado == null
            ? 'No hay datos de estado para este paralelo.'
            : 'No se listaron pendientes en el plan cargado; si el estado sigue incompleto, revisá otras pestañas o la sincronización.';

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
                    <Flex align="center" gap={8} wrap="wrap">
                        <Title level={5} style={{ margin: 0 }}>
                            {paralelo?.nombre || 'Paralelo'}
                        </Title>
                        <Tag color={tag.color}>{tag.label}</Tag>
                    </Flex>
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
                <div>
                    <HorariosPlanPendientesLista
                        ok={okPublicacion}
                        lineas={pendientesLineas}
                        mensajeExito="Estado publicación: sin observaciones en el plan ni en validaciones del sistema."
                        mensajeVacio={mensajeVacio}
                    />
                </div>
            </Flex>
        </Card>
    );
};

export default HorariosPublicacionParaleloCard;
