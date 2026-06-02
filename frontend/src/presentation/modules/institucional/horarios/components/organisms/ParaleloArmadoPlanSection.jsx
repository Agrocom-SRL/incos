/**
 * Plan semanal de un paralelo: grilla compartida con docentes + edición local (drag, quitar, añadir bloque).
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Flex, Form, message, Modal, Select, Space, Typography } from 'antd';
import { ActionButton } from '@atoms';
import DocenteHorarioSemanalGrid from '@docentes/components/organisms/DocenteHorarioSemanalGrid';
import {
    getSabadoArmadoGridRangeMinutes,
    getTurnoGridRangeMinutes,
} from '@application-institucional/horarios/utils/turnoGridRange';
import {
    buildFreeSlotOptionsForDay,
    buildOccupiedSlotKeysFromSchedules,
} from '@application-institucional/horarios/utils/buildHorarioSlotIndex';
import { buildHorariosPlanPendientesDetalleLines } from '@application-institucional/horarios/utils/buildHorariosPlanPendientesDetalle';
import ParaleloPlanSemanaCell, { DRAG_MIME } from '../atoms/ParaleloPlanSemanaCell';
import HorariosPlanPendientesLista from './HorariosPlanPendientesLista';
import {
    appendBlockToCourse,
    moveBlockToSlot,
    removeBlockFromSchedules,
} from '../../utils/planSemanalBlockOps';

const { Text } = Typography;

const DIA_OPTIONS = [
    { value: 'LUNES', label: 'Lunes' },
    { value: 'MARTES', label: 'Martes' },
    { value: 'MIERCOLES', label: 'Miércoles' },
    { value: 'JUEVES', label: 'Jueves' },
    { value: 'VIERNES', label: 'Viernes' },
    { value: 'SABADO', label: 'Sábado' },
];

const SLOT_STEP_ADD = 45;

const slotOptionsForRange = (rangeStart, rangeEnd, step = SLOT_STEP_ADD) => {
    const o = [];
    for (let m = rangeStart; m < rangeEnd; m += step) {
        const h = Math.floor(m / 60);
        const min = m % 60;
        const label = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
        o.push({ value: m, label });
    }
    return o;
};

const ParaleloArmadoPlanSection = ({
    schedules,
    onSchedulesChange,
    editable = false,
    turnoLabel,
    onRequestPersist,
    validatePlacement,
    persistLoading = false,
    persistError = null,
    persistSuccess = false,
    vistaExpandida = false,
    /** Si es true, bajo la grilla se muestra el detalle de solapes / sin aula / docentes (vista previa). */
    showPendientesDetalle = false,
}) => {
    const [addOpen, setAddOpen] = useState(false);
    const [form] = Form.useForm();
    const diaAddWatch = Form.useWatch('dia', form);
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
            };

            if (typeof validatePlacement === 'function') {
                const check = await validatePlacement(meta);
                if (!check?.ok) {
                    message.warning(check?.message || 'No se puede colocar el bloque en ese horario');
                    return;
                }
            }

            onSchedulesChange(moveBlockToSlot(schedules, meta));
        },
        [editable, onSchedulesChange, schedules, validatePlacement],
    );

    const handleDeleteChip = useCallback(
        (item) => {
            if (!editable || !item?.cursoId || item.cursoHorarioId == null) return;
            onSchedulesChange(removeBlockFromSchedules(schedules, item.cursoId, item.cursoHorarioId));
        },
        [editable, onSchedulesChange, schedules],
    );

    const cursoOptions = useMemo(() => {
        if (!addOpen) return [];
        return (schedules || []).map((c) => ({
            value: c.cursoId,
            label: c.materiaNombre || c.materiaSigla || 'Materia sin nombre',
        }));
    }, [addOpen, schedules]);

    const occupiedSlotKeys = useMemo(
        () => buildOccupiedSlotKeysFromSchedules(schedules),
        [schedules],
    );

    const slotOptionsAdd = useMemo(() => {
        if (!addOpen) return [];
        const dia = diaAddWatch ?? 'LUNES';
        return buildFreeSlotOptionsForDay({
            dia,
            rangeStart: gridRange.start,
            rangeEnd: gridRange.end,
            step: SLOT_STEP_ADD,
            occupiedKeys: occupiedSlotKeys,
            sabadoFixedStarts: sabadoRange.fixedSlotStartsMinutes,
        });
    }, [
        addOpen,
        diaAddWatch,
        sabadoRange.fixedSlotStartsMinutes,
        gridRange.start,
        gridRange.end,
        occupiedSlotKeys,
    ]);

    const freeSlotsTotal = useMemo(() => {
        let n = 0;
        for (const d of DIA_OPTIONS) {
            n += buildFreeSlotOptionsForDay({
                dia: d.value,
                rangeStart: gridRange.start,
                rangeEnd: gridRange.end,
                step: SLOT_STEP_ADD,
                occupiedKeys: occupiedSlotKeys,
                sabadoFixedStarts: sabadoRange.fixedSlotStartsMinutes,
            }).length;
        }
        return n;
    }, [occupiedSlotKeys, gridRange.start, gridRange.end, sabadoRange.fixedSlotStartsMinutes]);

    useEffect(() => {
        if (!addOpen) return;
        const curDia = form.getFieldValue('dia');
        let dia = curDia;
        let opts = buildFreeSlotOptionsForDay({
            dia: dia || 'LUNES',
            rangeStart: gridRange.start,
            rangeEnd: gridRange.end,
            step: SLOT_STEP_ADD,
            occupiedKeys: occupiedSlotKeys,
            sabadoFixedStarts: sabadoRange.fixedSlotStartsMinutes,
        });
        if (!opts.length) {
            const found = DIA_OPTIONS.find((d) =>
                buildFreeSlotOptionsForDay({
                    dia: d.value,
                    rangeStart: gridRange.start,
                    rangeEnd: gridRange.end,
                    step: SLOT_STEP_ADD,
                    occupiedKeys: occupiedSlotKeys,
                    sabadoFixedStarts: sabadoRange.fixedSlotStartsMinutes,
                }).length,
            );
            if (found) {
                dia = found.value;
                opts = buildFreeSlotOptionsForDay({
                    dia,
                    rangeStart: gridRange.start,
                    rangeEnd: gridRange.end,
                    step: SLOT_STEP_ADD,
                    occupiedKeys: occupiedSlotKeys,
                    sabadoFixedStarts: sabadoRange.fixedSlotStartsMinutes,
                });
            }
        }
        if (dia && dia !== curDia) {
            form.setFieldsValue({ dia, slotMinutes: opts[0]?.value });
        } else if (opts.length) {
            const cur = form.getFieldValue('slotMinutes');
            if (!opts.some((o) => o.value === cur)) {
                form.setFieldsValue({ slotMinutes: opts[0].value });
            }
        }
    }, [addOpen, slotOptionsAdd, form, occupiedSlotKeys, gridRange, sabadoRange]);

    const submitAddBlock = useCallback(() => {
        form.validateFields().then(async (values) => {
            if (!slotOptionsAdd.length) {
                message.warning(
                    'No hay franjas libres en el día elegido. Probá otro día o liberá un bloque en la grilla.',
                );
                return;
            }
            const cursoId = values.cursoId;
            const dia = values.dia;
            const startM = values.slotMinutes;
            const endM = startM + SLOT_STEP_ADD;
            const h = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
            const tempId = `temp-${Date.now()}`;
            const bloque = {
                cursoHorarioId: tempId,
                dia,
                horaInicio: h(startM),
                horaFin: h(endM),
                turno: turnoLabel || null,
                paralelo: null,
                aula: null,
            };

            if (typeof validatePlacement === 'function') {
                const check = await validatePlacement({
                    cursoId,
                    cursoHorarioId: tempId,
                    targetDia: dia,
                    targetSlotMinutes: startM,
                    bloquePreview: bloque,
                });
                if (!check?.ok) {
                    message.warning(check?.message || 'No se puede añadir el bloque en ese horario');
                    return;
                }
            }

            onSchedulesChange(appendBlockToCourse(schedules, cursoId, bloque));
            setAddOpen(false);
            form.resetFields();
        });
    }, [form, onSchedulesChange, schedules, turnoLabel, validatePlacement, slotOptionsAdd]);

    const handleSaveClick = useCallback(() => {
        if (typeof onRequestPersist === 'function') {
            onRequestPersist();
            return;
        }
        message.warning(
            'Los cambios del plan son locales por ahora. El guardado en servidor se conectará cuando exista el endpoint de persistencia de bloques.',
        );
    }, [onRequestPersist]);

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
                </div>
                <Space wrap>
                    {editable ? (
                        <>
                            <ActionButton
                                permiso="institucional.horario.armado"
                                accion="EDITAR"
                                variant="secondary"
                                buttonStyle="outlined"
                                onClick={() => setAddOpen(true)}
                            >
                                Añadir bloque
                            </ActionButton>
                            <ActionButton
                                permiso="institucional.horario.armado"
                                accion="EDITAR"
                                variant="primary"
                                onClick={handleSaveClick}
                                loading={persistLoading}
                            >
                                Guardar cambios
                            </ActionButton>
                        </>
                    ) : (
                        <Text type="secondary">Solo lectura</Text>
                    )}
                </Space>
            </Flex>
            {editable && persistLoading ? (
                <Alert
                    type="info"
                    showIcon
                    style={{ marginBottom: 12, flexShrink: 0 }}
                    title="Guardando cambios del plan semanal..."
                />
            ) : null}
            {editable && persistError ? (
                <Alert
                    type="error"
                    showIcon
                    style={{ marginBottom: 12, flexShrink: 0 }}
                    title="No se pudo guardar el plan"
                    description={
                        <span style={{ whiteSpace: 'pre-wrap' }}>{persistError}</span>
                    }
                />
            ) : null}
            {editable && !persistLoading && !persistError && persistSuccess ? (
                <Alert
                    type="success"
                    showIcon
                    style={{ marginBottom: 12, flexShrink: 0 }}
                    title="Plan semanal guardado correctamente."
                />
            ) : null}
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
                    cellExtraProps={{
                        onBeginDragChip: handleBeginDragChip,
                        onDeleteChip: handleDeleteChip,
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
            <Modal
                title="Añadir bloque al plan"
                open={addOpen}
                onOk={submitAddBlock}
                onCancel={() => {
                    setAddOpen(false);
                    form.resetFields();
                }}
                okText="Añadir"
                destroyOnHidden
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ dia: 'LUNES', slotMinutes: gridRange.start }}
                >
                    <Form.Item
                        name="cursoId"
                        label="Materia (curso del paralelo)"
                        rules={[{ required: true, message: 'Elija una materia' }]}
                    >
                        <Select
                            options={cursoOptions}
                            placeholder="Materia"
                            showSearch
                            optionFilterProp="label"
                        />
                    </Form.Item>
                    <Form.Item name="dia" label="Día" rules={[{ required: true }]}>
                        <Select options={DIA_OPTIONS} />
                    </Form.Item>
                    <Form.Item
                        name="slotMinutes"
                        label="Hora de inicio (solo franjas libres)"
                        rules={[{ required: true, message: 'Elija una franja libre' }]}
                    >
                        <Select
                            options={slotOptionsAdd}
                            showSearch
                            optionFilterProp="label"
                            placeholder={
                                slotOptionsAdd.length
                                    ? 'Franja disponible'
                                    : 'No hay franjas libres este día'
                            }
                            disabled={!slotOptionsAdd.length}
                        />
                    </Form.Item>
                    <Text type="secondary">
                        Duración: 45 min. En el paralelo quedan {freeSlotsTotal} franja(s) libre(s); MPI-101
                        necesita las que falten según el panel lateral. No se puede repetir la misma hora que otra
                        materia.
                    </Text>
                </Form>
            </Modal>
        </section>
    );
};

export default React.memo(ParaleloArmadoPlanSection);
