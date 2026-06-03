import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Flex, Tag, Tooltip, Typography, message } from 'antd';
import { EditOutlined, SendOutlined } from '@ant-design/icons';
import DocenteHorarioSemanalGrid from '@docentes/components/organisms/DocenteHorarioSemanalGrid';
import { ActionButton } from '@atoms';
import {
    getSabadoArmadoGridRangeMinutes,
    getTurnoGridRangeMinutes,
} from '@application-institucional/horarios/utils/turnoGridRange';
import { buildHorariosArmadoUrl } from '@application-institucional/horarios/config/paths';
import { paraleloScheduleToCourseSchedules } from '@application-institucional/horarios/utils/paraleloScheduleToCourseSchedules';
import { buildHorariosPlanPendientesDetalleLines } from '@application-institucional/horarios/utils/buildHorariosPlanPendientesDetalle';
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

const estadoPgTag = (estado) => {
    const e = String(estado || '').toUpperCase();
    switch (e) {
        case 'OFERTADO':
            return { color: 'processing', label: 'OFERTADO' };
        case 'PUBLICADO':
            return { color: 'success', label: 'PUBLICADO' };
        case 'CERRADO':
            return { color: 'default', label: 'CERRADO' };
        default:
            return { color: 'default', label: e || '—' };
    }
};

const HorariosPublicacionParaleloCard = ({ plan, onPublicar, publicando = false }) => {
    const navigate = useNavigate();
    const { paralelo, schedule } = plan || {};
    const pgId = paralelo?.paraleloGestionId;
    const pgEstado = paralelo?.paraleloGestionEstado;

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
    const pendientesLineas = useMemo(() => {
        const fromPlan = buildHorariosPlanPendientesDetalleLines(courseSchedules);
        return fromPlan;
    }, [courseSchedules]);

    const estadoTag = useMemo(() => estadoPgTag(pgEstado), [pgEstado]);
    const puedePublicar =
        String(pgEstado || '').toUpperCase() === 'OFERTADO' && pendientesLineas.length === 0;

    const mensajeVacio =
        pendientesLineas.length === 0
            ? 'Sin observaciones en el plan cargado.'
            : 'Revise pendientes antes de publicar.';

    const onEditarPlan = () => {
        if (!pgId) return;
        navigate(buildHorariosArmadoUrl(pgId, { tab: 'plan' }));
    };

    const onClickPublicar = async () => {
        if (!pgId) {
            message.warning('Falta paralelo en gestión. Recree la vista 84 en base de datos.');
            return;
        }
        if (!puedePublicar) {
            message.warning('El paralelo debe estar en OFERTADO y sin pendientes en el plan.');
            return;
        }
        const res = await onPublicar?.(pgId);
        if (res?.success) {
            message.success('Paralelo publicado correctamente');
        } else if (res?.error) {
            message.error(res.error);
        }
    };

    return (
        <Card {...cardShell(border)} styles={{ body: { padding: 16 } }}>
            <Flex vertical gap={12} style={{ minWidth: 0 }}>
                <div className="horarios-publicacion-paralelo-card__head">
                    <Flex align="center" justify="space-between" wrap="wrap" gap={8}>
                        <Flex align="center" gap={8} wrap="wrap">
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
                            <Tag color={estadoTag.color}>{estadoTag.label}</Tag>
                        </Flex>
                        {pgId ? (
                            <ActionButton
                                permiso="institucional.horario.publicacion"
                                accion="EDITAR"
                                variant="primary"
                                icon={<SendOutlined />}
                                onClick={onClickPublicar}
                                loading={publicando}
                                disabled={!puedePublicar}
                            >
                                Publicar
                            </ActionButton>
                        ) : null}
                    </Flex>
                    <Text type="secondary">
                        {paralelo?.carreraNombre || '—'}
                        {paralelo?.carreraCodigo ? ` (${paralelo.carreraCodigo})` : ''}
                        {' · '}
                        {paralelo?.periodoNombre || '—'}
                        {paralelo?.turno ? ` · Turno ${paralelo.turno}` : ''}
                        {pgId ? ` · PG #${pgId}` : ''}
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
                        ok={puedePublicar}
                        lineas={pendientesLineas}
                        mensajeExito="Listo para publicar (estado OFERTADO y plan sin pendientes locales)."
                        mensajeVacio={mensajeVacio}
                    />
                </div>
            </Flex>
        </Card>
    );
};

export default HorariosPublicacionParaleloCard;
