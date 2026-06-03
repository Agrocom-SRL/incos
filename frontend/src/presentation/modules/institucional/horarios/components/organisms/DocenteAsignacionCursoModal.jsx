import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Col, Flex, Modal, Row, Space, Tag, Typography, message } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { SearchBar } from '@atoms';
import { useAuthContext } from '@application-auth';
import { useDocentesApi } from '@application-docentes/hooks/api';
import { useAsignacionDocenteApi } from '@application-institucional/horarios/hooks/api/useAsignacionDocenteApi';
import DocenteRepository from '@implementations/DocenteRepository';
import DocenteHorarioSemanalGrid from '@docentes/components/organisms/DocenteHorarioSemanalGrid';
import {
    buildDocenteAsignacionCandidatos,
    horasMateriaParaAsignacion,
    mapCargaDocentesIndex,
    pickAsignacionField,
} from '@application-institucional/horarios/mappers/asignacionDocenteMatrizMapper';
import '@institucional/horarios/styles/asignacion-docente.css';

const { Text } = Typography;

function extractApiErrorFlags(raw) {
    const err = raw?.response?.data?.error;
    if (!err || typeof err !== 'object') return {};
    return {
        requiereColor: Boolean(err.requiere_color),
        sobrecarga: Boolean(err.sobrecarga),
        message: err.message,
    };
}

const parseAsignaciones = (payload) => {
    const rows = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.rows)
            ? payload.rows
            : Array.isArray(payload?.items)
                ? payload.items
                : Array.isArray(payload?.asignaciones)
                    ? payload.asignaciones
                    : [];
    return rows;
};

const DocenteAsignacionCursoModal = ({
    open,
    onClose,
    selectedCourse,
    gestionId,
    paraleloLabel,
    onAssigned,
    onWarning,
    onPreviewDocenteChange,
}) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [candidateSearch, setCandidateSearch] = useState('');
    const [selectedDocenteId, setSelectedDocenteId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [loadingAsignacion, setLoadingAsignacion] = useState(false);
    const [cursoAsignacion, setCursoAsignacion] = useState(null);
    const [docentesConChoque, setDocentesConChoque] = useState(new Set());
    const [cargaPorDocente, setCargaPorDocente] = useState(() => new Map());
    const { docentes = [] } = useDocentesApi();
    const { fetchCargaGestion } = useAsignacionDocenteApi();
    const { hasPermiso } = useAuthContext();
    const puedeGuardarAsignacion =
        hasPermiso('institucional.horarios.asignacion-docente', 'EDITAR') ||
        hasPermiso('institucional.horarios.asignacion-docente', 'CREAR') ||
        hasPermiso('docentes.asignar', 'EDITAR');

    const horasPlanReferencia = useMemo(() => {
        const v =
            selectedCourse?.horasSemanalesPlan ??
            selectedCourse?.horasPlan ??
            selectedCourse?.horas_semanales_plan ??
            null;
        if (v == null || v === '') return null;
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
    }, [selectedCourse]);

    const fechaAsignacionDisplay = useMemo(() => {
        const fromApi = pickAsignacionField(cursoAsignacion, 'fecha_asignacion', 'fechaAsignacion');
        if (fromApi) return String(fromApi);
        if (selectedCourse?.fechaAsignacion) return String(selectedCourse.fechaAsignacion);
        return null;
    }, [cursoAsignacion, selectedCourse?.fechaAsignacion]);

    const cargaHorariaDisplay = useMemo(() => {
        const fromApi = pickAsignacionField(cursoAsignacion, 'carga_horaria', 'cargaHoraria');
        if (fromApi != null && fromApi !== '') return Number(fromApi);
        if (selectedCourse?.cargaHoraria != null && selectedCourse.cargaHoraria !== '') {
            return Number(selectedCourse.cargaHoraria);
        }
        return null;
    }, [cursoAsignacion, selectedCourse?.cargaHoraria]);

    const horasMateria = useMemo(
        () =>
            horasMateriaParaAsignacion({
                horasAsignacion: cargaHorariaDisplay,
                horasPlan: horasPlanReferencia,
            }),
        [cargaHorariaDisplay, horasPlanReferencia]
    );

    const docenteActualCursoId = useMemo(() => {
        const fromAsig = pickAsignacionField(cursoAsignacion, 'docente_id', 'docenteId');
        if (fromAsig != null) return Number(fromAsig);
        if (selectedCourse?.docenteId != null) return Number(selectedCourse.docenteId);
        return null;
    }, [cursoAsignacion, selectedCourse?.docenteId]);

    const gestionIdEfectiva = useMemo(() => {
        const g = Number(gestionId ?? selectedCourse?.gestionId);
        return Number.isFinite(g) && g > 0 ? g : null;
    }, [gestionId, selectedCourse?.gestionId]);

    const docenteCandidates = useMemo(
        () =>
            buildDocenteAsignacionCandidatos({
                docentes,
                candidateSearch,
                docentesConChoque,
                cargaPorDocente,
                horasMateria,
                docenteActualCursoId,
                selectedDocenteId,
            }),
        [
            docentes,
            candidateSearch,
            docentesConChoque,
            cargaPorDocente,
            horasMateria,
            docenteActualCursoId,
            selectedDocenteId,
        ]
    );

    const selectedDocente = useMemo(() => {
        if (selectedDocenteId == null) return null;
        return (
            docentes.find((d) => Number(d.id) === Number(selectedDocenteId)) ||
            docenteCandidates.find((d) => Number(d.id) === Number(selectedDocenteId)) ||
            null
        );
    }, [docentes, docenteCandidates, selectedDocenteId]);

    useEffect(() => {
        if (!open || !gestionIdEfectiva) {
            setCargaPorDocente(new Map());
            return;
        }
        let cancelled = false;
        fetchCargaGestion(gestionIdEfectiva).then((res) => {
            if (cancelled) return;
            if (res.success) {
                setCargaPorDocente(mapCargaDocentesIndex(res.data?.carga_docentes));
            } else {
                setCargaPorDocente(new Map());
            }
        });
        return () => {
            cancelled = true;
        };
    }, [open, gestionIdEfectiva, fetchCargaGestion]);

    useEffect(() => {
        if (!open || !selectedCourse?.cursoId) return;
        DocenteRepository.getConflictoBloquesCurso(selectedCourse.cursoId)
            .then((res) => {
                if (res?.success && Array.isArray(res.data?.docenteIdsConChoque)) {
                    setDocentesConChoque(new Set(res.data.docenteIdsConChoque.map(Number)));
                } else {
                    setDocentesConChoque(new Set());
                }
            })
            .catch(() => setDocentesConChoque(new Set()));
    }, [open, selectedCourse?.cursoId]);

    useEffect(() => {
        if (!open || !selectedCourse?.cursoId) return;
        setCandidateSearch('');
        setSelectedDocenteId(
            selectedCourse?.docenteId != null ? Number(selectedCourse.docenteId) : null
        );
        setLoadingAsignacion(true);
        DocenteRepository.listarAsignaciones({
                ofertaCursoId: selectedCourse.cursoId,
                cursoId: selectedCourse.cursoId,
                vigente: 'true',
                page: 1,
                limit: 5,
            })
            .then((res) => {
                if (!res?.success) {
                    setCursoAsignacion(null);
                    setSelectedDocenteId(
                        selectedCourse?.docenteId != null ? Number(selectedCourse.docenteId) : null
                    );
                    return;
                }
                const rows = parseAsignaciones(res.data);
                const first = rows[0] || null;
                setCursoAsignacion(first);
                const docenteIdAsig = pickAsignacionField(first, 'docente_id', 'docenteId');
                setSelectedDocenteId(
                    docenteIdAsig != null
                        ? Number(docenteIdAsig)
                        : selectedCourse?.docenteId != null
                          ? Number(selectedCourse.docenteId)
                          : null
                );
            })
            .catch(() => {
                setCursoAsignacion(null);
                setSelectedDocenteId(null);
            })
            .finally(() => setLoadingAsignacion(false));
    }, [open, selectedCourse?.cursoId]);

    useEffect(() => {
        if (!open || typeof onPreviewDocenteChange !== 'function') return;
        if (!selectedCourse?.cursoId || selectedDocenteId == null) {
            onPreviewDocenteChange(null);
            return;
        }
        const d =
            docentes.find((x) => Number(x.id) === Number(selectedDocenteId)) ||
            docenteCandidates.find((x) => Number(x.id) === Number(selectedDocenteId)) ||
            null;
        if (!d) {
            onPreviewDocenteChange(null);
            return;
        }
        const hasConflicts = Boolean(d.teachingStats?.conflictos?.hasConflictos);
        onPreviewDocenteChange({
            cursoId: Number(selectedCourse.cursoId),
            docenteNombre: d.nombreCompleto || null,
            docenteEnConflictoHorario: hasConflicts,
        });
    }, [
        open,
        onPreviewDocenteChange,
        selectedCourse?.cursoId,
        selectedDocenteId,
        docentes,
        docenteCandidates,
    ]);

    const ejecutarAsignacion = useCallback(
        async (confirmOverload = false) => {
            const result = await DocenteRepository.asignarDocenteCurso({
                gestionPlanId: selectedCourse?.gestionPlanId ?? undefined,
                cursoId: Number(selectedCourse.cursoId),
                docenteId: Number(selectedDocenteId),
                vigente: true,
                confirmar_sobrecarga: confirmOverload,
            });

            if (!result?.success) {
                const flags = extractApiErrorFlags(result?.raw);
                if (flags.sobrecarga) {
                    Modal.confirm({
                        title: 'Sobrecarga docente',
                        content:
                            flags.message ||
                            'La asignación supera el máximo semanal del docente. ¿Desea confirmar bajo su responsabilidad?',
                        okText: 'Confirmar asignación',
                        cancelText: 'Cancelar',
                        onOk: () => ejecutarAsignacion(true),
                    });
                    return false;
                }
                messageApi.error(result?.error || 'No se pudo guardar la asignacion docente.');
                return false;
            }

            const warnings = Array.isArray(result?.data?.warnings) ? result.data.warnings : [];
            warnings.forEach((w) => {
                if (w?.message) messageApi.warning(w.message);
                if (typeof onWarning === 'function' && w?.suggestedTab) onWarning(w.suggestedTab, w);
            });

            const docenteSel = docentes.find((d) => Number(d.id) === Number(selectedDocenteId)) || null;
            messageApi.success('Asignacion docente guardada.');
            if (typeof onAssigned === 'function') {
                onAssigned({
                    cursoId: Number(selectedCourse.cursoId),
                    docenteId: Number(selectedDocenteId),
                    docenteNombre: docenteSel?.nombreCompleto || null,
                });
            }
            onClose?.();
            return true;
        },
        [
            selectedCourse,
            selectedDocenteId,
            docentes,
            messageApi,
            onAssigned,
            onClose,
            onWarning,
        ]
    );

    const handleConfirm = async () => {
        if (!puedeGuardarAsignacion || !selectedCourse?.cursoId || !selectedDocenteId) return;
        if (selectedDocente?.semaforo === 'rojo') {
            messageApi.warning('Este docente tiene choque de horario en los bloques de esta materia.');
            return;
        }
        if (selectedDocente?.cargaProyectada?.sobrecarga) {
            Modal.confirm({
                title: 'Sobrecarga docente',
                content: `Con esta materia (${horasMateria} h/sem) el docente quedaría en ${selectedDocente.cargaProyectada.projected}/${selectedDocente.cargaProyectada.maxSemana} h/semana. ¿Confirmar asignación?`,
                okText: 'Confirmar asignación',
                cancelText: 'Cancelar',
                onOk: async () => {
                    setSaving(true);
                    try {
                        await ejecutarAsignacion(true);
                    } finally {
                        setSaving(false);
                    }
                },
            });
            return;
        }
        setSaving(true);
        try {
            await ejecutarAsignacion(false);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            {contextHolder}
            <Modal
                title={
                    <Space>
                        <TeamOutlined />
                        {selectedCourse?.materiaNombre || 'Asignacion docente semanal'}
                    </Space>
                }
                width={1200}
                open={open}
                onCancel={onClose}
                destroyOnHidden
                okText="Guardar asignacion"
                onOk={handleConfirm}
                okButtonProps={{
                    disabled:
                        !selectedDocente ||
                        saving ||
                        !puedeGuardarAsignacion ||
                        selectedDocente?.semaforo === 'rojo',
                    loading: saving,
                }}
                cancelText="Cancelar"
            >
                <Flex gap={16} vertical>
                    {!puedeGuardarAsignacion ? (
                        <Alert
                            type="warning"
                            showIcon
                            title="Sin permiso para asignar docente"
                            description="Se requiere permiso de asignación docente (EDITAR). Podés revisar el horario; para guardar cambios pedí acceso al administrador."
                        />
                    ) : null}
                    <Text type="secondary">
                        Paralelo: {paraleloLabel || '—'} · Materia: {selectedCourse?.materiaNombre || '—'}
                    </Text>
                    <Alert
                        type="info"
                        showIcon
                        style={{ marginBottom: 4 }}
                        title="Fecha y carga de la asignación"
                        description={
                            <div style={{ fontSize: 13 }}>
                                <div>
                                    <Text strong>Fecha de asignación: </Text>
                                    {fechaAsignacionDisplay ? (
                                        <Text>{fechaAsignacionDisplay}</Text>
                                    ) : (
                                        <Text type="secondary">
                                            Sin fecha registrada — al guardar se usará la fecha de hoy.
                                        </Text>
                                    )}
                                </div>
                                <div style={{ marginTop: 6 }}>
                                    <Text strong>Carga horaria: </Text>
                                    {cargaHorariaDisplay != null ? (
                                        <Text>{cargaHorariaDisplay} h/semana</Text>
                                    ) : (
                                        <Text type="secondary">
                                            Sin carga registrada — al guardar se tomará la del plan de la materia
                                            {horasPlanReferencia != null
                                                ? ` (${horasPlanReferencia} h/semana según esta oferta)`
                                                : ''}
                                            .
                                        </Text>
                                    )}
                                </div>
                            </div>
                        }
                    />
                    <DocenteHorarioSemanalGrid
                        courseSchedules={selectedCourse ? [selectedCourse] : []}
                        editable={false}
                    />
                    <Row gutter={[12, 12]} align="middle">
                        <Col xs={24}>
                            <SearchBar
                                allowClear
                                placeholder="Buscar docente por nombre"
                                value={candidateSearch}
                                onChange={(e) => setCandidateSearch(e.target.value)}
                                enterButton={false}
                            />
                        </Col>
                    </Row>
                    <div className="ant-list ant-list-bordered ant-list-sm">
                        {docenteCandidates.map((item) => {
                            const color = item.semaforo === 'rojo' ? 'red' : item.semaforo === 'amarillo' ? 'gold' : 'green';
                            const label =
                                item.semaforo === 'rojo'
                                    ? 'Choque en estos bloques: '
                                    : item.semaforo === 'amarillo'
                                        ? item.cargaProyectada?.sobrecarga
                                            ? 'Excede carga horaria: '
                                            : 'Carga alta o conflicto general: '
                                        : 'Libre en estos bloques: ';
                            const { projected, maxSemana, sobrecarga } = item.cargaProyectada || {};
                            const cargaLabel =
                                projected != null && maxSemana != null
                                    ? `${projected}/${maxSemana} h/sem${sobrecarga ? ' ⚠' : ''}`
                                    : null;
                            const selected = Number(selectedDocenteId) === Number(item.id);
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    className="ant-list-item"
                                    onClick={() => setSelectedDocenteId(item.id)}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        background: selected ? 'var(--ant-color-primary-bg, #e6f4ff)' : 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Space>
                                        <Badge color={color} text={label} />
                                        <Text>{item.nombreCompleto}</Text>
                                        <Text type="secondary">· {item.genero || '—'}</Text>
                                        <Text type="secondary">· {item.tituloProfesional || '—'}</Text>
                                        {cargaLabel ? (
                                            <Text
                                                type="secondary"
                                                className={
                                                    sobrecarga ? 'asignacion-docente-carga--sobrecarga' : undefined
                                                }
                                            >
                                                · {cargaLabel}
                                            </Text>
                                        ) : null}
                                        {selected ? <Tag color="processing">Seleccionado</Tag> : null}
                                    </Space>
                                </button>
                            );
                        })}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Hasta 10 docentes libres (sin choque de bloques ni sobrecarga). Si la materia aún no tiene
                        horarios publicados, no se aplican choques por bloque. La carga suma las horas de esta materia
                        ({horasMateria} h/sem) al total semanal del docente en la gestión.
                    </Text>
                    <Text type="secondary">
                        Docente actual:{' '}
                        {loadingAsignacion
                            ? 'Cargando...'
                            : (() => {
                                const docenteActualId =
                                    pickAsignacionField(cursoAsignacion, 'docente_id', 'docenteId') ??
                                    selectedCourse?.docenteId ??
                                    null;
                                const docenteActual = docentes.find(
                                    (d) => Number(d.id) === Number(docenteActualId)
                                );
                                const nombreAsig = pickAsignacionField(
                                    cursoAsignacion,
                                    'docente_nombre',
                                    'docenteNombre'
                                );
                                return (
                                    docenteActual?.nombreCompleto ||
                                    nombreAsig ||
                                    selectedCourse?.docenteNombre ||
                                    selectedCourse?.docente ||
                                    'Sin asignar'
                                );
                            })()}
                    </Text>
                </Flex>
            </Modal >
        </>
    );
};

export default DocenteAsignacionCursoModal;
