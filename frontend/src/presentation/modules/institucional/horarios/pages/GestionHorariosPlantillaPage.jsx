import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { App, Alert, Flex, Modal, Spin, Table, Tag, Tooltip, Typography, Button as AntButton } from 'antd';
import { ArrowLeftOutlined, BookOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { useParaleloCursosOfertaApi } from '@application-academico/paralelos/hooks';
import { getUseCase } from '@container';
import DetailInfoCard from '@docentes/components/molecules/DetailInfoCard';
import '@presentation/styles/pages/detail-page.css';
import '../styles/gestion-horarios-page.css';
import ParaleloCursoOfertaModal from '../components/ParaleloCursoOfertaModal';

const { Text, Title } = Typography;

const buildCarreraImageUrl = (ruta) => {
    if (!ruta) return null;
    if (ruta.startsWith('http://') || ruta.startsWith('https://')) return ruta;
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    const serverBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '');
    const path = ruta.startsWith('/') ? ruta : `/${ruta}`;
    return `${serverBaseUrl}${path}`;
};

const GestionHorariosPlantillaPage = () => {
    const { message } = App.useApp();
    const navigate = useNavigate();
    const location = useLocation();
    const { paraleloId: paraleloIdParam } = useParams();
    const [searchParams] = useSearchParams();
    const queryParalelo = searchParams.get('paralelo');
    const turnoParam = searchParams.get('turno') || '';
    const returnTab =
        searchParams.get('returnTab') === 'plan' || searchParams.get('returnTab') === 'vista'
            ? searchParams.get('returnTab')
            : 'cursos';

    const paraleloIdResolved = paraleloIdParam || queryParalelo;
    const numericParaleloId = paraleloIdResolved ? Number(paraleloIdResolved) : null;
    const validParaleloId = numericParaleloId != null && !Number.isNaN(numericParaleloId) ? numericParaleloId : null;

    const { oferta, loading, error, fetch } = useParaleloCursosOfertaApi();

    const [cursoModal, setCursoModal] = useState({
        open: false,
        isEdit: false,
        cursoEdit: null,
        prefillAsignaturaPlanId: undefined,
    });

    useEffect(() => {
        if (location.pathname.endsWith('/horarios/plantilla') && queryParalelo) {
            const next = new URLSearchParams(searchParams);
            next.delete('paralelo');
            const suffix = next.toString();
            navigate(`/institucional/horarios/paralelo/${queryParalelo}/gestion${suffix ? `?${suffix}` : ''}`, {
                replace: true,
            });
        }
    }, [location.pathname, queryParalelo, navigate, searchParams]);

    useEffect(() => {
        if (validParaleloId) {
            fetch(validParaleloId);
        }
    }, [validParaleloId, fetch]);

    const meta = oferta?.paralelo || null;
    const cursos = Array.isArray(oferta?.cursos) ? oferta.cursos : [];
    const missingSubjects = Array.isArray(oferta?.missingSubjects) ? oferta.missingSubjects : [];

    const turnoEfectivo = (turnoParam || meta?.turno || '').trim();

    const filasOferta = useMemo(() => {
        const sinCurso = missingSubjects.map((m) => ({
            _rowKey: `sin-curso-${m.asignaturaPlanId ?? m.materiaId}`,
            rowKind: 'sin_curso',
            asignaturaPlanId: m.asignaturaPlanId,
            materiaId: m.materiaId,
            materiaNombre: m.materiaNombre,
            materiaSigla: m.materiaSigla,
            horasSemanalesPlan: m.horasSemanalesPlan,
        }));
        const conCurso = cursos.map((c) => ({
            _rowKey: `curso-${c.cursoId}`,
            rowKind: 'curso',
            ...c,
        }));
        return [...sinCurso, ...conCurso];
    }, [missingSubjects, cursos]);

    const breadcrumbItems = useMemo(
        () => [
            { title: 'Inicio', href: '/' },
            { title: 'Institucional', href: '/institucional' },
            { title: 'Gestión de horarios', href: '/institucional/horarios' },
            { title: 'Oferta de cursos' },
        ],
        [],
    );

    const pageTitle = useMemo(() => {
        if (!validParaleloId) return 'Gestión del paralelo — oferta de cursos';
        const nombre = meta?.nombre;
        const base = nombre
            ? `Oferta de cursos — ${nombre}`
            : `Oferta de cursos — Paralelo #${validParaleloId}`;
        return turnoEfectivo ? `${base} · Turno ${turnoEfectivo}` : base;
    }, [validParaleloId, meta?.nombre, turnoEfectivo]);

    const handleVolver = useCallback(() => {
        navigate('/institucional/horarios');
    }, [navigate]);

    const openCursoModalCrear = useCallback((prefillAsignaturaPlanId) => {
        if (!validParaleloId) return;
        setCursoModal({
            open: true,
            isEdit: false,
            cursoEdit: null,
            prefillAsignaturaPlanId:
                prefillAsignaturaPlanId != null && prefillAsignaturaPlanId !== ''
                    ? Number(prefillAsignaturaPlanId)
                    : undefined,
        });
    }, [validParaleloId]);

    const openCursoModalEditar = useCallback((record) => {
        if (!validParaleloId || !record?.cursoId) return;
        setCursoModal({
            open: true,
            isEdit: true,
            cursoEdit: record,
            prefillAsignaturaPlanId: undefined,
        });
    }, [validParaleloId]);

    const closeCursoModal = useCallback(() => {
        setCursoModal((s) => ({ ...s, open: false }));
    }, []);

    const onNuevoCurso = useCallback(() => {
        openCursoModalCrear(undefined);
    }, [openCursoModalCrear]);

    const onEditarCurso = useCallback(
        (record) => {
            openCursoModalEditar(record);
        },
        [openCursoModalEditar],
    );

    const onCrearCursoDesdeMateria = useCallback(
        (row) => {
            if (row?.asignaturaPlanId == null) return;
            openCursoModalCrear(row.asignaturaPlanId);
        },
        [openCursoModalCrear],
    );

    const onEliminarCurso = useCallback(
        (record) => {
            if (!validParaleloId || !record?.cursoId) return;
            const label = record.codigo || record.materiaSigla || `ID ${record.cursoId}`;
            Modal.confirm({
                title: 'Eliminar curso del paralelo',
                content: `¿Dar de baja el curso «${label}»? No se puede eliminar si ya tiene bloques de horario en el armado semanal.`,
                okText: 'Eliminar',
                okType: 'danger',
                cancelText: 'Cancelar',
                onOk: async () => {
                    const uc = getUseCase('eliminarCursoOferta');
                    if (!uc) {
                        message.error('No se pudo inicializar la operación');
                        throw new Error('no-use-case');
                    }
                    const res = await uc.ejecutar(record.cursoId, validParaleloId);
                    if (!res?.success) {
                        message.error(res?.error || 'No se pudo eliminar el curso');
                        throw new Error('delete-failed');
                    }
                    message.success('Curso eliminado');
                    fetch(validParaleloId);
                },
            });
        },
        [validParaleloId, message, fetch],
    );

    const handleCrearCursoOferta = useCallback(
        async (formValues) => {
            if (!validParaleloId) {
                return { success: false, error: 'Paralelo no válido' };
            }
            const uc = getUseCase('crearParaleloCursoOferta');
            if (!uc) {
                return { success: false, error: 'No se pudo inicializar la operación' };
            }
            return uc.ejecutar(validParaleloId, {
                asignaturaPlanId: formValues.asignaturaPlanId,
                cupoMinimo: formValues.cupoMinimo,
                cupoMaximo: formValues.cupoMaximo,
                colorHex: formValues.colorHex,
            });
        },
        [validParaleloId],
    );

    const handleActualizarCursoOferta = useCallback(
        async (courseId, payload) => {
            const uc = getUseCase('actualizarCursoOferta');
            if (!uc) {
                return { success: false, error: 'No se pudo inicializar la operación' };
            }
            return uc.ejecutar(courseId, payload);
        },
        [],
    );

    const headerActions = (
        <button type="button" className="sd-btn sd-btn--outline" onClick={handleVolver}>
            <ArrowLeftOutlined /> Volver
        </button>
    );

    const columnasOferta = useMemo(
        () => [
            {
                title: 'Sigla',
                dataIndex: 'materiaSigla',
                key: 'materiaSigla',
                width: 100,
                ellipsis: true,
                render: (v) => v || '—',
            },
            {
                title: 'Materia',
                dataIndex: 'materiaNombre',
                key: 'materiaNombre',
                ellipsis: true,
                render: (v) => v || '—',
            },
            {
                title: 'Estado',
                key: 'estado',
                width: 118,
                render: (_, row) =>
                    row.rowKind === 'sin_curso' ? (
                        <Tag color="warning">Sin curso</Tag>
                    ) : (
                        <Tag color="processing">Curso</Tag>
                    ),
            },
            {
                title: 'Cupo',
                key: 'cupo',
                width: 120,
                align: 'center',
                render: (_, row) => {
                    if (row.rowKind === 'sin_curso') return '—';
                    const min = row.cupoMinimo;
                    const max = row.cupoMaximo;
                    if (min == null && max == null) return '—';
                    return (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {min ?? '—'} / {max ?? '—'}
                        </Text>
                    );
                },
            },
            {
                title: 'Color',
                dataIndex: 'colorHex',
                key: 'colorHex',
                width: 88,
                render: (hex, row) =>
                    row.rowKind === 'sin_curso' ? (
                        '—'
                    ) : hex ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <span
                                style={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: 4,
                                    background: hex,
                                    border: '1px solid var(--ant-color-border-secondary, #ddd)',
                                }}
                            />
                            <Text type="secondary" code style={{ fontSize: 11 }}>
                                {hex}
                            </Text>
                        </span>
                    ) : (
                        '—'
                    ),
            },
            {
                title: '',
                key: 'acciones',
                width: 120,
                align: 'right',
                render: (_, row) =>
                    row.rowKind === 'sin_curso' ? (
                        <Flex gap={4} justify="flex-end" wrap="wrap">
                            <Tooltip title="Crear curso para esta materia">
                                <AntButton
                                    type="text"
                                    size="small"
                                    icon={<PlusOutlined />}
                                    aria-label="Crear curso para esta materia"
                                    onClick={() => onCrearCursoDesdeMateria(row)}
                                    style={{ color: 'var(--ant-color-success, #52c41a)' }}
                                />
                            </Tooltip>
                        </Flex>
                    ) : (
                        <Flex gap={4} justify="flex-end" wrap="wrap">
                            <Tooltip title="Editar curso">
                                <AntButton
                                    type="text"
                                    size="small"
                                    icon={<EditOutlined />}
                                    aria-label="Editar curso"
                                    onClick={() => onEditarCurso(row)}
                                    style={{ color: 'var(--accent-600, #d48806)' }}
                                />
                            </Tooltip>
                            <Tooltip title="Eliminar curso">
                                <AntButton
                                    type="text"
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    aria-label="Eliminar curso"
                                    onClick={() => onEliminarCurso(row)}
                                />
                            </Tooltip>
                        </Flex>
                    ),
            },
        ],
        [onEditarCurso, onEliminarCurso, onCrearCursoDesdeMateria],
    );

    const tituloTabla = `Cursos del periodo (${filasOferta.length})`;

    const extraCard = (
        <AntButton type="primary" icon={<PlusOutlined />} onClick={onNuevoCurso}>
            Nuevo curso
        </AntButton>
    );

    return (
        <PageTemplate
            header={<PageHeader title={pageTitle} breadcrumbItems={breadcrumbItems} actions={headerActions} />}
            sidebar={null}
        >
            <Spin spinning={Boolean(validParaleloId) && loading} size="large" tip="Cargando oferta del paralelo…">
                <div className="sd sd-spin-body horarios-armado-page">
                    {!validParaleloId ? (
                        <Alert
                            type="warning"
                            showIcon
                            title="Falta el paralelo"
                            description="Abrí esta pantalla desde la gestión de horarios o desde el armado (pestaña Cursos) con el enlace «Gestionar cursos del paralelo»."
                        />
                    ) : (
                        <>
                            {error ? (
                                <Alert
                                    type="error"
                                    showIcon
                                    style={{ marginBottom: 16 }}
                                    title="No se pudo cargar la oferta"
                                    description={error}
                                />
                            ) : null}
                            {!error ? (
                                <>
                                    <div className="horarios-armado-context" style={{ marginBottom: 16 }}>
                                        <Flex gap={16} align="flex-start" wrap="wrap">
                                            {meta?.carreraImagenRuta ? (
                                                <img
                                                    className="horarios-armado-context__img"
                                                    src={buildCarreraImageUrl(meta.carreraImagenRuta)}
                                                    alt=""
                                                    width={152}
                                                    height={152}
                                                    style={{
                                                        objectFit: 'cover',
                                                        borderRadius: 10,
                                                        flexShrink: 0,
                                                        border: '1px solid var(--ant-color-border-secondary, #eee)',
                                                    }}
                                                />
                                            ) : null}
                                            <Flex vertical gap={4} style={{ minWidth: 0, flex: 1 }}>
                                                <Title level={5} style={{ margin: 0 }}>
                                                    {meta?.nombre || `Paralelo #${validParaleloId}`}
                                                </Title>
                                                <Text type="secondary">
                                                    {meta?.carreraNombre
                                                        ? `${meta.carreraNombre}${meta.carreraCodigo ? ` (${meta.carreraCodigo})` : ''}`
                                                        : 'Carrera: —'}
                                                </Text>
                                                <Text type="secondary">
                                                    Periodo:{' '}
                                                    <Text strong>
                                                        {meta?.periodoNombre
                                                            ? `${meta.periodoNombre}${
                                                                  meta.periodoNumero != null ? ` (n.º ${meta.periodoNumero})` : ''
                                                              }`
                                                            : '—'}
                                                    </Text>
                                                </Text>
                                                <Text type="secondary">
                                                    Turno: <Text strong>{turnoEfectivo || '—'}</Text>
                                                </Text>
                                                {meta?.descripcion ? (
                                                    <Text type="secondary" style={{ marginTop: 4 }}>
                                                        {meta.descripcion}
                                                    </Text>
                                                ) : null}
                                            </Flex>
                                        </Flex>
                                    </div>
                                    <div className="sd-tab-body horarios-armado-tab-body horarios-oferta-cursos-card">
                                        <DetailInfoCard title={tituloTabla} icon={<BookOutlined />} cols={1} extra={extraCard}>
                                            {filasOferta.length === 0 ? (
                                                <div className="sd-empty" style={{ padding: '24px 0' }}>
                                                    <BookOutlined className="sd-empty__icon" />
                                                    <p className="sd-empty__text">
                                                        No hay materias del periodo ni cursos cargados para este paralelo.
                                                    </p>
                                                </div>
                                            ) : (
                                                <Table
                                                    className="horarios-oferta-cursos-table"
                                                    dataSource={filasOferta}
                                                    rowKey="_rowKey"
                                                    pagination={false}
                                                    size="small"
                                                    expandable={{
                                                        expandedRowRender: (record) => {
                                                            const isMissing = record.rowKind === 'sin_curso';
                                                            const codigo = !isMissing ? record.codigo || null : null;
                                                            const horariosTxt = isMissing
                                                                ? '—'
                                                                : record.tieneHorarios
                                                                  ? `${record.bloquesCount} bloque(s) en la grilla`
                                                                  : 'Sin bloques en la grilla';
                                                            return (
                                                                <div
                                                                    className="sd-card__body"
                                                                    style={{
                                                                        padding: '12px 16px',
                                                                        gap: '8px',
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        background: 'var(--border-soft, #f3f4f6)',
                                                                    }}
                                                                >
                                                                    <div>
                                                                        <span
                                                                            className="sd-field__label"
                                                                            style={{ display: 'block', marginBottom: 2 }}
                                                                        >
                                                                            Código del curso
                                                                        </span>
                                                                        <span className="sd-field__value">
                                                                            {codigo || '—'}
                                                                        </span>
                                                                    </div>
                                                                    <div>
                                                                        <span
                                                                            className="sd-field__label"
                                                                            style={{ display: 'block', marginBottom: 2 }}
                                                                        >
                                                                            Horarios (grilla)
                                                                        </span>
                                                                        <span className="sd-field__value">{horariosTxt}</span>
                                                                    </div>
                                                                    {isMissing && record.horasSemanalesPlan != null ? (
                                                                        <div>
                                                                            <span
                                                                                className="sd-field__label"
                                                                                style={{ display: 'block', marginBottom: 2 }}
                                                                            >
                                                                                Carga horaria plan (h/sem)
                                                                            </span>
                                                                            <span className="sd-field__value">
                                                                                {record.horasSemanalesPlan}
                                                                            </span>
                                                                        </div>
                                                                    ) : null}
                                                                </div>
                                                            );
                                                        },
                                                        rowExpandable: () => true,
                                                    }}
                                                    columns={columnasOferta}
                                                />
                                            )}
                                        </DetailInfoCard>
                                    </div>
                                </>
                            ) : null}
                        </>
                    )}
                </div>
            </Spin>
            {validParaleloId ? (
                <ParaleloCursoOfertaModal
                    open={cursoModal.open}
                    onClose={closeCursoModal}
                    isEdit={cursoModal.isEdit}
                    cursoEdit={cursoModal.cursoEdit}
                    missingSubjects={missingSubjects}
                    initialAsignaturaPlanId={cursoModal.prefillAsignaturaPlanId}
                    parallelId={validParaleloId}
                    onCrearCurso={handleCrearCursoOferta}
                    onActualizarCurso={handleActualizarCursoOferta}
                    onSaved={() => fetch(validParaleloId)}
                />
            ) : null}
        </PageTemplate>
    );
};

export default GestionHorariosPlantillaPage;
