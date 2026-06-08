/**
 * Plan semanal de un paralelo: grilla compartida con docentes + edición local (drag, quitar).
 */

import React, { useCallback, useMemo } from 'react';
import { App, Flex, Space, Typography } from 'antd';
import { ActionButton } from '@atoms';
import DocenteHorarioSemanalGrid from '@docentes/components/organisms/DocenteHorarioSemanalGrid';
import {
    getSabadoArmadoGridRangeMinutes,
    getTurnoGridRangeMinutes,
} from '@application-institucional/horarios/utils/turnoGridRange';
import { buildHorariosPlanPendientesDetalleLines } from '@application-institucional/horarios/utils/buildHorariosPlanPendientesDetalle';
import ParaleloPlanSemanaCell, { DRAG_MIME } from '../atoms/ParaleloPlanSemanaCell';
import HorariosPlanPendientesLista from './HorariosPlanPendientesLista';
import {
    removeBlockFromSchedules,
    swapOrMoveBlockToSlot,
} from '../../utils/planSemanalBlockOps';

const { Text } = Typography;

const SLOT_STEP_ADD = 45;

const ParaleloArmadoPlanSection = ({
    schedules,
    onSchedulesChange,
    editable = false,
    /** Si false, no se muestra quitar bloque (p. ej. paralelo PUBLICADO). Por defecto sigue a `editable`. */
    allowDelete,
    /** Paralelo publicado: arrastrar y guardar, sin alta/baja desde grilla. */
    soloReubicacion = false,
    turnoLabel,
    onRequestPersist,
    validatePlacement,
    persistLoading = false,
    vistaExpandida = false,
    /** Si es true, bajo la grilla se muestra el detalle de solapes / sin aula / docentes (vista previa). */
    showPendientesDetalle = false,
    /** horario_id del catálogo en choque (resaltado rojo por celda en grilla de conflictos). */
    conflictHorarioIds = null,
    horarioSlotIndex = null,
    /** true = resalta celdas por horario_id del docente (pantalla conflictos). */
    docenteConflictMode = false,
    /** Oculta títulos y leyendas; solo grilla + guardar (pantalla de conflictos). */
    headerMinimal = false,
}) => {
    const { notification } = App.useApp();
    const puedeEliminar = allowDelete ?? editable;
    const gridRange = useMemo(() => getTurnoGridRangeMinutes(turnoLabel), [turnoLabel]);
    const sabadoRange = useMemo(() => getSabadoArmadoGridRangeMinutes(), []);
    const pendientesLineas = useMemo(() => {
        if (!showPendientesDetalle) return [];
        return buildHorariosPlanPendientesDetalleLines(schedules || []);
    }, [showPendientesDetalle, schedules]);
    const tieneCursos = (schedules || []).length > 0;

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
            if (!editable) return;
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
                        description: check?.message || 'No se puede colocar el bloque en ese horario.',
                    });
                    return;
                }
            }

            onSchedulesChange(swapOrMoveBlockToSlot(schedules, meta));
        },
        [editable, notification, onSchedulesChange, schedules, validatePlacement],
    );

    const handleDeleteChip = useCallback(
        (item) => {
            if (!puedeEliminar || !item?.cursoId || item.cursoHorarioId == null) return;
            onSchedulesChange(removeBlockFromSchedules(schedules, item.cursoId, item.cursoHorarioId));
        },
        [puedeEliminar, onSchedulesChange, schedules],
    );

    const handleSaveClick = useCallback(() => {
        if (typeof onRequestPersist === 'function') {
            onRequestPersist();
            return;
        }
        notification.warning({
            title: 'Guardado no disponible',
            description:
                'Los cambios del plan son locales por ahora. El guardado en servidor se conectará cuando exista el endpoint de persistencia de bloques.',
        });
    }, [notification, onRequestPersist]);

    return (
        <section
            className={[
                'horarios-armado-plan',
                vistaExpandida ? 'horarios-armado-plan--fill' : '',
            ]
                .filter(Boolean)
                .join(' ')}
            aria-label="Plan semanal del paralelo"
        >
            {headerMinimal ? (
                editable ? (
                    <Flex justify="flex-end" style={{ marginBottom: 12, flexShrink: 0 }}>
                        <ActionButton
                            permiso="institucional.horario.armado"
                            accion="EDITAR"
                            variant="primary"
                            onClick={handleSaveClick}
                            loading={persistLoading}
                        >
                            Guardar cambios
                        </ActionButton>
                    </Flex>
                ) : null
            ) : (
                <Flex
                    justify="space-between"
                    align="center"
                    wrap="wrap"
                    gap={12}
                    style={{ marginBottom: 12, flexShrink: 0 }}
                >
                    <div>
                        <Text strong>Plan semanal</Text>
                        {turnoLabel ? (
                            <Text type="secondary">
                                {' '}
                                · Turno {turnoLabel}
                            </Text>
                        ) : null}
                        {soloReubicacion ? (
                            <Text type="secondary" style={{ display: 'block' }}>
                                Paralelo publicado: podés reubicar bloques existentes; no se pueden agregar ni quitar
                                desde la grilla.
                            </Text>
                        ) : null}
                    </div>
                    <Space wrap>
                        {editable ? (
                            <ActionButton
                                permiso="institucional.horario.armado"
                                accion="EDITAR"
                                variant="primary"
                                onClick={handleSaveClick}
                                loading={persistLoading}
                            >
                                Guardar cambios
                            </ActionButton>
                        ) : (
                            <Text type="secondary">Solo lectura</Text>
                        )}
                    </Space>
                </Flex>
            )}
            <div
                className={vistaExpandida ? 'horarios-armado-plan__grid-host' : undefined}
            >
                <DocenteHorarioSemanalGrid
                    courseSchedules={schedules}
                    CellComponent={ParaleloPlanSemanaCell}
                    gridTimeRange={gridRange}
                    saturdayGridTimeRange={sabadoRange}
                    slotStepMinutes={SLOT_STEP_ADD}
                    uniformSlotGrid={!editable}
                    editable={editable}
                    onSlotDrop={handleSlotDrop}
                    conflictHorarioIds={conflictHorarioIds}
                    horarioSlotIndex={horarioSlotIndex}
                    docenteConflictMode={docenteConflictMode}
                    cellExtraProps={{
                        onBeginDragChip: handleBeginDragChip,
                        onDeleteChip: puedeEliminar ? handleDeleteChip : undefined,
                    }}
                />
            </div>
            {showPendientesDetalle ? (
                <div className="horarios-armado-plan__pendientes" style={{ marginTop: 12, flexShrink: 0 }}>
                    <Text strong style={{ display: 'block', marginBottom: 6 }}>
                        Resumen del plan
                    </Text>
                    <HorariosPlanPendientesLista
                        ok={tieneCursos && pendientesLineas.length === 0}
                        lineas={pendientesLineas}
                        mensajeExito="Vista previa: no se detectan solapes, choques de docente ni bloques sin aula en esta grilla."
                        mensajeVacio="No hay cursos en el paralelo para evaluar la vista previa."
                    />
                </div>
            ) : null}
        </section>
    );
};

export default React.memo(ParaleloArmadoPlanSection);
