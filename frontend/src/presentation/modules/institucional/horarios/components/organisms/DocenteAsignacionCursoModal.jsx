import { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Col, Flex, Modal, Row, Space, Tag, Typography, message } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { SearchBar } from '@atoms';
import { useAuthContext } from '@application-auth';
import { useDocentesApi } from '@application-docentes/hooks/api';
import DocenteRepository from '@implementations/DocenteRepository';
import DocenteHorarioSemanalGrid from '@docentes/components/organisms/DocenteHorarioSemanalGrid';

const { Text } = Typography;

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
    const { docentes = [] } = useDocentesApi();
    const { hasPermiso } = useAuthContext();
    const puedeGuardarAsignacion = hasPermiso('docentes.asignar', 'EDITAR');

    const docenteCandidates = useMemo(() => {
        const query = candidateSearch.trim().toLowerCase();
        const mapped = docentes
            .filter((d) => {
                if (!query) return true;
                return String(d.nombreCompleto || '').toLowerCase().includes(query);
            })
            .map((d) => {
                const totalAsignaciones = Number(d.teachingStats?.totalAsignaciones || 0);
                const hasConflicts = Boolean(d.teachingStats?.conflictos?.hasConflictos);
                const chocaBloques = docentesConChoque.has(Number(d.id));
                const semaforo = chocaBloques
                    ? 'rojo'
                    : hasConflicts || totalAsignaciones >= 5
                        ? 'amarillo'
                        : 'verde';
                return { ...d, semaforo, chocaBloques };
            });

        // Libres primero; garantizar al menos 50% del total visible
        const libres = mapped.filter((d) => d.semaforo === 'verde');
        const otros = mapped.filter((d) => d.semaforo !== 'verde');
        const MAX = 10;
        const libresSlot = Math.min(libres.length, Math.ceil(MAX / 2)); // hasta 5
        const otrosSlot = MAX - libresSlot;
        return [...libres.slice(0, libresSlot), ...otros.slice(0, otrosSlot)];
    }, [docentes, candidateSearch, docentesConChoque]);

    const selectedDocente = useMemo(
        () => docenteCandidates.find((d) => Number(d.id) === Number(selectedDocenteId)) || null,
        [docenteCandidates, selectedDocenteId],
    );

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
        setLoadingAsignacion(true);
        DocenteRepository.listarAsignaciones({ cursoId: selectedCourse.cursoId, vigente: 'true', page: 1, limit: 5 })
            .then((res) => {
                if (!res?.success) {
                    setCursoAsignacion(null);
                    setSelectedDocenteId(null);
                    return;
                }
                const rows = parseAsignaciones(res.data);
                const first = rows[0] || null;
                setCursoAsignacion(first);
                setSelectedDocenteId(first?.docenteId ?? first?.docente?.id ?? null);
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

    const handleConfirm = async () => {
        if (!puedeGuardarAsignacion || !selectedCourse?.cursoId || !selectedDocenteId) return;
        setSaving(true);
        try {
            const result = await DocenteRepository.asignarDocenteCurso({
                gestionPlanId: selectedCourse?.gestionPlanId ?? undefined,
                cursoId: Number(selectedCourse.cursoId),
                docenteId: Number(selectedDocenteId),
                vigente: true,
            });

            if (!result?.success) {
                messageApi.error(result?.error || 'No se pudo guardar la asignacion docente.');
                return;
            }

            const warnings = Array.isArray(result?.data?.warnings) ? result.data.warnings : [];
            if (warnings.length) {
                warnings.forEach((w) => {
                    if (w?.message) messageApi.warning(w.message);
                    if (typeof onWarning === 'function' && w?.suggestedTab) onWarning(w.suggestedTab, w);
                });
            }

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
                    disabled: !selectedDocente || saving || !puedeGuardarAsignacion,
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
                            description="Se requiere docentes.asignar (EDITAR). Podés revisar el horario; para guardar cambios pedí acceso al administrador."
                        />
                    ) : null}
                    <Text type="secondary">
                        Paralelo: {paraleloLabel || '—'} · Materia: {selectedCourse?.materiaNombre || '—'}
                    </Text>
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
                                        ? 'Carga alta o conflicto general: '
                                        : 'Libre en estos bloques: ';
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
                                        {selected ? <Tag color="processing">Seleccionado</Tag> : null}
                                    </Space>
                                </button>
                            );
                        })}
                    </div>
                    <Text type="secondary">
                        Docente actual:{' '}
                        {loadingAsignacion
                            ? 'Cargando...'
                            : (() => {
                                const docenteActualId = cursoAsignacion?.docenteId ?? null;
                                const docenteActual = docentes.find((d) => Number(d.id) === Number(docenteActualId));
                                return docenteActual?.nombreCompleto || selectedCourse?.docente || 'Sin asignar';
                            })()}
                    </Text>
                </Flex>
            </Modal >
        </>
    );
};

export default DocenteAsignacionCursoModal;
