/**
 * Grilla semanal del docente (todas las ofertas de la gestión) para reubicar bloques en conflicto.
 */

import React, { useCallback, useMemo } from 'react';
import { App, Flex, Space, Typography } from 'antd';
import { ActionButton } from '@atoms';
import DocenteHorarioSemanalGrid from '@docentes/components/organisms/DocenteHorarioSemanalGrid';
import {
    getSabadoArmadoGridRangeMinutes,
    getTurnoGridRangeMinutes,
} from '@application-institucional/horarios/utils/turnoGridRange';
import ConflictosPlanSemanaCell, { DRAG_MIME } from '../atoms/ConflictosPlanSemanaCell';
import {
    removeBlockFromSchedules,
    swapOrMoveBlockToSlot,
} from '../../utils/planSemanalBlockOps';

const { Text } = Typography;
const SLOT_STEP_ADD = 45;

const HorariosConflictosPlanSection = ({
    schedules,
    onSchedulesChange,
    bloquesEnConflicto,
    onRequestPersist,
    validatePlacement,
    persistLoading = false,
    turnoLabel = null,
    vistaLabel = 'Grilla semanal',
    vistaHint = null,
}) => {
    const { notification } = App.useApp();
    const gridRange = useMemo(() => getTurnoGridRangeMinutes(turnoLabel), [turnoLabel]);
    const sabadoRange = useMemo(() => getSabadoArmadoGridRangeMinutes(), []);

    const handleBeginDragChip = useCallback((e, item, sourceDia, sourceSlotMinutes) => {
        const payload = {
            cursoId: item.cursoId,
            cursoHorarioId: item.cursoHorarioId,
            sourceDia,
            sourceStartMinutes: sourceSlotMinutes,
        };
        e.dataTransfer.setData(DRAG_MIME, JSON.stringify(payload));
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleSlotDrop = useCallback(
        async (e, targetDia, targetSlotMinutes) => {
            const raw = e.dataTransfer.getData(DRAG_MIME);
            if (!raw) return;
            let payload;
            try {
                payload = JSON.parse(raw);
            } catch {
                return;
            }
            if (
                payload.sourceDia === targetDia &&
                Number(payload.sourceStartMinutes) === Number(targetSlotMinutes)
            ) {
                return;
            }

            const meta = {
                cursoId: payload.cursoId,
                cursoHorarioId: payload.cursoHorarioId,
                targetDia,
                targetSlotMinutes,
                sourceDia: payload.sourceDia,
                sourceSlotMinutes: payload.sourceStartMinutes,
            };

            if (typeof validatePlacement === 'function') {
                const check = await validatePlacement(meta);
                if (!check?.ok) {
                    notification.warning({
                        title: 'No se puede mover',
                        description: check?.message || 'Conflicto u otra restricción en esa franja.',
                    });
                    return;
                }
            }

            onSchedulesChange(swapOrMoveBlockToSlot(schedules, meta));
        },
        [notification, onSchedulesChange, schedules, validatePlacement],
    );

    const handleDeleteChip = useCallback(
        (item) => {
            if (!item?.cursoId || item.cursoHorarioId == null) return;
            onSchedulesChange(removeBlockFromSchedules(schedules, item.cursoId, item.cursoHorarioId));
        },
        [onSchedulesChange, schedules],
    );

    const hint =
        vistaHint ??
        'Arrastrá un bloque en rojo a una franja vacía del turno, o soltalo sobre otro bloque para intercambiar. Guardá al terminar.';

    return (
        <section className="horarios-armado-plan" aria-label={vistaLabel}>
            <Flex justify="space-between" align="center" wrap="wrap" gap={12} style={{ marginBottom: 12 }}>
                <div>
                    <Text strong>{vistaLabel}</Text>
                    <Text type="secondary" style={{ display: 'block' }}>
                        {hint}
                    </Text>
                </div>
                <Space wrap>
                    <ActionButton
                        permiso="institucional.horario.armado"
                        accion="EDITAR"
                        variant="primary"
                        onClick={onRequestPersist}
                        loading={persistLoading}
                    >
                        Guardar cambios
                    </ActionButton>
                </Space>
            </Flex>
            <DocenteHorarioSemanalGrid
                courseSchedules={schedules}
                CellComponent={ConflictosPlanSemanaCell}
                gridTimeRange={gridRange}
                saturdayGridTimeRange={sabadoRange}
                slotStepMinutes={SLOT_STEP_ADD}
                uniformSlotGrid={false}
                editable
                onSlotDrop={handleSlotDrop}
                cellExtraProps={{
                    onBeginDragChip: handleBeginDragChip,
                    onDeleteChip: handleDeleteChip,
                    bloquesEnConflicto,
                }}
            />
        </section>
    );
};

export default React.memo(HorariosConflictosPlanSection);
