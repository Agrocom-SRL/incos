import { useEffect, useMemo, useState } from 'react';
import { Badge, Col, Flex, Modal, Row, Space, Tag, Typography, message } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { SearchBar } from '@atoms';
import { useDocentesApi } from '@application-docentes/hooks/api';
import DocenteRepository from '@implementations/DocenteRepository';
import DocenteSchedulesSection from '@docentes/components/organisms/DocenteSchedulesSection';

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
}) => {
    const [candidateSearch, setCandidateSearch] = useState('');
    const [selectedDocenteId, setSelectedDocenteId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [loadingAsignacion, setLoadingAsignacion] = useState(false);
    const [cursoAsignacion, setCursoAsignacion] = useState(null);
    const { docentes = [] } = useDocentesApi();

    const docenteCandidates = useMemo(() => {
        const query = candidateSearch.trim().toLowerCase();
        return docentes
            .filter((d) => {
                if (!query) return true;
                return String(d.nombreCompleto || '').toLowerCase().includes(query);
            })
            .map((d) => {
                const totalAsignaciones = Number(d.teachingStats?.totalAsignaciones || 0);
                const hasConflicts = Boolean(d.teachingStats?.conflictos?.hasConflictos);
                const semaforo = hasConflicts ? 'rojo' : totalAsignaciones >= 5 ? 'amarillo' : 'verde';
                return {
                    ...d,
                    semaforo,
                };
            });
    }, [docentes, candidateSearch]);

    const selectedDocente = useMemo(
        () => docenteCandidates.find((d) => Number(d.id) === Number(selectedDocenteId)) || null,
        [docenteCandidates, selectedDocenteId],
    );

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

    const handleConfirm = async () => {
        if (!selectedCourse?.cursoId || !selectedDocenteId) return;
        setSaving(true);
        try {
            let result = null;
            const asignacionId = cursoAsignacion?.id ?? null;
            if (asignacionId) {
                result = await DocenteRepository.actualizarAsignacion(asignacionId, {
                    docenteId: Number(selectedDocenteId),
                    vigente: true,
                });
            } else {
                const gestionPlanId =
                    selectedCourse?.gestionPlanId ??
                    selectedCourse?.parallelGestionPlanId ??
                    selectedCourse?.planHabilitadoId ??
                    null;
                if (!gestionPlanId) {
                    message.error('No se encontro gestionPlanId para crear una asignacion nueva.');
                    return;
                }
                result = await DocenteRepository.crearAsignacion({
                    gestionPlanId: Number(gestionPlanId),
                    cursoId: Number(selectedCourse.cursoId),
                    docenteId: Number(selectedDocenteId),
                    vigente: true,
                });
            }

            if (!result?.success) {
                message.error(result?.error || 'No se pudo guardar la asignacion docente.');
                return;
            }

            const docenteSel = docentes.find((d) => Number(d.id) === Number(selectedDocenteId)) || null;
            message.success('Asignacion docente guardada.');
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
        <Modal
            title={
                <Space>
                    <TeamOutlined />
                    {selectedCourse?.materiaNombre || 'Asignacion docente semanal'}
                </Space>
            }
            width={1100}
            open={open}
            onCancel={onClose}
            destroyOnHidden
            okText="Guardar asignacion"
            onOk={handleConfirm}
            okButtonProps={{ disabled: !selectedDocente || saving, loading: saving }}
            cancelText="Cancelar"
        >
            <Flex gap={16} vertical>
                <Text type="secondary">
                    Paralelo: {paraleloLabel || '—'} · Materia: {selectedCourse?.materiaNombre || '—'}
                </Text>
                <DocenteSchedulesSection
                    courseSchedules={selectedCourse ? [selectedCourse] : []}
                    compact
                    emptyDescription="Sin bloques para mostrar."
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
                    {docenteCandidates.slice(0, 10).map((item) => {
                        const color = item.semaforo === 'rojo' ? 'red' : item.semaforo === 'amarillo' ? 'gold' : 'green';
                        const label =
                            item.semaforo === 'rojo'
                                ? 'Choque detectado'
                                : item.semaforo === 'amarillo'
                                  ? 'Carga alta'
                                  : 'Libre total';
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
        </Modal>
    );
};

export default DocenteAsignacionCursoModal;
