import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Divider, Flex, Spin, Tabs, Typography } from 'antd';
import { ArrowLeftOutlined, BookOutlined, EyeOutlined, ScheduleOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Button, Card } from '@atoms';
import { useParaleloScheduleApi } from '@application-academico/paralelos/hooks';
import {
    extractParaleloScheduleMeta,
    paraleloScheduleToCourseSchedules,
} from '@application-institucional/horarios';
import { blockDurationMinutes } from '../utils/planSemanalBlockOps';
import ParaleloArmadoPlanSection from '../components/organisms/ParaleloArmadoPlanSection';
import '@presentation/styles/pages/detail-page.css';
import '../styles/gestion-horarios-page.css';

const { Text, Title } = Typography;

const DIA_ETIQUETA = {
    LUNES: 'Lunes',
    MARTES: 'Martes',
    MIERCOLES: 'Miércoles',
    JUEVES: 'Jueves',
    VIERNES: 'Viernes',
    SABADO: 'Sábado',
};

const fmtHoraCorta = (t) => {
    if (t == null || t === '') return '—';
    const s = String(t);
    return s.length >= 5 ? s.slice(0, 5) : s;
};

const buildCarreraImageUrl = (ruta) => {
    if (!ruta) return null;
    if (ruta.startsWith('http://') || ruta.startsWith('https://')) return ruta;
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    const serverBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '');
    const path = ruta.startsWith('/') ? ruta : `/${ruta}`;
    return `${serverBaseUrl}${path}`;
};

const resumenBloquesCurso = (c) => {
    const bloques = c.bloques || [];
    let minutos = 0;
    const diasOrd = [];
    const visto = new Set();
    const lineas = [];
    for (const b of bloques) {
        const d = b.dia ? String(b.dia).toUpperCase() : '';
        const mins = blockDurationMinutes(b.horaInicio, b.horaFin);
        minutos += mins;
        if (d && !visto.has(d)) {
            visto.add(d);
            diasOrd.push(DIA_ETIQUETA[d] || d);
        }
        if (d) {
            lineas.push(
                `${DIA_ETIQUETA[d] || d}: ${fmtHoraCorta(b.horaInicio)}–${fmtHoraCorta(b.horaFin)}${b.aula ? ` · ${b.aula}` : ''
                }`,
            );
        }
    }
    const horasGrilla = Math.round((minutos / 60) * 100) / 100;
    const horasPlan = c.horasSemanalesPlan != null ? Number(c.horasSemanalesPlan) : null;
    return { horasGrilla, horasPlan, diasOrd, lineas };
};

const normalizeTab = (raw) => {
    if (raw === 'cursos' || raw === 'plan' || raw === 'vista') return raw;
    if (raw === 'horarios') return 'plan';
    return 'plan';
};

const GestionHorariosArmadoPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const paraleloId = searchParams.get('paralelo');
    const tab = normalizeTab(searchParams.get('tab'));
    const turnoParam = searchParams.get('turno') || '';

    const { schedule, loading, error, fetch } = useParaleloScheduleApi();

    const paraleloApiMeta = useMemo(() => extractParaleloScheduleMeta(schedule), [schedule]);
    const turnoEfectivo = (turnoParam || paraleloApiMeta?.turno || '').trim();
    const paraleloNombre =
        paraleloApiMeta?.nombre || (paraleloId ? `Paralelo #${paraleloId}` : null);

    const breadcrumbItems = useMemo(
        () => [
            { title: 'Inicio', href: '/' },
            { title: 'Institucional', href: '/institucional' },
            { title: 'Gestión de horarios', href: '/institucional/horarios' },
            { title: 'Armado' },
        ],
        [],
    );

    const pageTitle = useMemo(() => {
        if (!paraleloId) return 'Armado de horarios';
        const nombre = paraleloApiMeta?.nombre;
        const base = nombre
            ? `Armado de horarios — ${nombre}`
            : `Armado de horarios — Paralelo #${paraleloId}`;
        return turnoEfectivo ? `${base} · Turno ${turnoEfectivo}` : base;
    }, [paraleloId, paraleloApiMeta?.nombre, turnoEfectivo]);

    const meta = useMemo(
        () => ({
            turno: turnoEfectivo || null,
            paraleloNombre,
        }),
        [turnoEfectivo, paraleloNombre],
    );

    const serverSchedules = useMemo(() => paraleloScheduleToCourseSchedules(schedule, meta), [schedule, meta]);

    const [draftSchedules, setDraftSchedules] = useState([]);

    useEffect(() => {
        setDraftSchedules(serverSchedules);
    }, [serverSchedules]);

    useEffect(() => {
        if (paraleloId) {
            fetch(Number(paraleloId));
        }
    }, [paraleloId, fetch]);

    const setTab = useCallback(
        (key) => {
            setSearchParams(
                (prev) => {
                    const n = new URLSearchParams(prev);
                    n.set('tab', key);
                    if (paraleloId) n.set('paralelo', paraleloId);
                    if (turnoParam) n.set('turno', turnoParam);
                    return n;
                },
                { replace: true },
            );
        },
        [setSearchParams, paraleloId, turnoParam],
    );

    const tabItems = useMemo(
        () => [
            {
                key: 'cursos',
                label: (
                    <span className="sd-tab-label">
                        <BookOutlined className="horarios-armado-tab__icon" aria-hidden />
                        <span>Cursos del paralelo</span>
                    </span>
                ),
                children: (
                    <div className="sd-tab-body horarios-armado-tab-body">
                        {!draftSchedules.length ? (
                            <Alert
                                type="info"
                                showIcon
                                title="Sin cursos"
                                description="No hay cursos cargados para este paralelo."
                            />
                        ) : (
                            <Flex vertical gap={12}>
                                {draftSchedules.map((c) => {
                                    const titulo = c.materiaNombre || c.materiaSigla || 'Materia sin nombre';
                                    const { horasGrilla, horasPlan, diasOrd, lineas } = resumenBloquesCurso(c);
                                    return (
                                        <Card
                                            key={c.cursoId}
                                            variant="default"
                                            shadow={true}
                                            headerColor="primary"
                                            headerAccentHex={c.cursoColorHex}
                                            title={titulo}
                                        >
                                            <Flex vertical gap={6}>
                                                {c.materiaSigla && c.materiaNombre ? (
                                                    <Text type="secondary">
                                                        Sigla: <Text strong>{c.materiaSigla}</Text>
                                                    </Text>
                                                ) : null}
                                                <Text type="secondary">
                                                    Carga horaria del periodo (plan):{' '}
                                                    <Text strong>
                                                        {horasPlan != null && !Number.isNaN(horasPlan)
                                                            ? `${horasPlan} h/semana`
                                                            : '—'}
                                                    </Text>
                                                </Text>
                                                <Text type="secondary">
                                                    Horas acumuladas en la grilla (bloques):{' '}
                                                    <Text strong>{horasGrilla} h</Text> (
                                                    {c.bloques?.length ?? 0} bloques)
                                                </Text>
                                                <Text type="secondary">
                                                    Días con clase:{' '}
                                                    <Text strong>
                                                        {diasOrd.length ? diasOrd.join(', ') : '—'}
                                                    </Text>
                                                </Text>
                                                {lineas.length ? (
                                                    <>
                                                        <Divider plain style={{ margin: '8px 0' }} />
                                                        <Text strong>Detalle por combinación día / horario</Text>
                                                        <ul className="horarios-armado-cursos__lista">
                                                            {lineas.map((ln, idx) => (
                                                                <li key={`${c.cursoId}-${idx}`}>
                                                                    <Text type="secondary">{ln}</Text>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </>
                                                ) : (
                                                    <Text type="secondary" italic>
                                                        Aún no hay bloques cargados en el plan para esta materia.
                                                    </Text>
                                                )}
                                            </Flex>
                                        </Card>
                                    );
                                })}
                            </Flex>
                        )}
                    </div>
                ),
            },
            {
                key: 'plan',
                label: (
                    <span className="sd-tab-label">
                        <ScheduleOutlined className="horarios-armado-tab__icon" aria-hidden />
                        <span>Plan semanal</span>
                    </span>
                ),
                children: (
                    <div className="sd-tab-body horarios-armado-tab-body">
                        <ParaleloArmadoPlanSection
                            schedules={draftSchedules}
                            onSchedulesChange={setDraftSchedules}
                            editable
                            turnoLabel={turnoEfectivo || undefined}
                        />
                    </div>
                ),
            },
            {
                key: 'vista',
                label: (
                    <span className="sd-tab-label">
                        <EyeOutlined className="horarios-armado-tab__icon" aria-hidden />
                        <span>Vista previa</span>
                    </span>
                ),
                children: (
                    <div className="sd-tab-body horarios-armado-tab-body">
                        <ParaleloArmadoPlanSection
                            schedules={draftSchedules}
                            onSchedulesChange={() => { }}
                            editable={false}
                            turnoLabel={turnoEfectivo || undefined}
                        />
                    </div>
                ),
            },
        ],
        [draftSchedules, turnoEfectivo],
    );

    const headerActions = (
        <Button variant="default" icon={<ArrowLeftOutlined />} onClick={() => navigate('/institucional/horarios')}>
            Volver a gestión
        </Button>
    );

    return (
        <PageTemplate
            header={<PageHeader title={pageTitle} breadcrumbItems={breadcrumbItems} actions={headerActions} />}
            sidebar={null}
        >
            <Spin spinning={Boolean(paraleloId) && loading} size="large" tip="Cargando plan del paralelo…">
                <div className="sd sd-spin-body horarios-armado-page">
                    {!paraleloId ? (
                        <Alert
                            type="warning"
                            showIcon
                            title="Falta el paralelo"
                            description="Abrí esta pantalla desde la gestión de horarios eligiendo un paralelo (Tablero o Tabla)."
                        />
                    ) : (
                        <>
                            {error ? (
                                <Alert
                                    type="error"
                                    showIcon
                                    style={{ marginBottom: 16 }}
                                    title="No se pudo cargar el plan"
                                    description={error}
                                />
                            ) : null}
                            {!error ? (
                                <>
                                    <div className="horarios-armado-context" style={{ marginBottom: 16 }}>
                                        <Flex gap={16} align="flex-start" wrap="wrap">
                                            {paraleloApiMeta?.carreraImagenRuta ? (
                                                <img
                                                    className="horarios-armado-context__img"
                                                    src={buildCarreraImageUrl(paraleloApiMeta.carreraImagenRuta)}
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
                                                    {paraleloNombre || 'Paralelo'}
                                                </Title>
                                                <Text type="secondary">
                                                    {paraleloApiMeta?.carreraNombre
                                                        ? `${paraleloApiMeta.carreraNombre}${paraleloApiMeta.carreraCodigo
                                                            ? ` (${paraleloApiMeta.carreraCodigo})`
                                                            : ''
                                                        }`
                                                        : 'Carrera: —'}
                                                </Text>
                                                <Text type="secondary">
                                                    Periodo:{' '}
                                                    <Text strong>
                                                        {paraleloApiMeta?.periodoNombre
                                                            ? `${paraleloApiMeta.periodoNombre}${paraleloApiMeta.periodoNumero != null
                                                                ? ` (n.º ${paraleloApiMeta.periodoNumero})`
                                                                : ''
                                                            }`
                                                            : '—'}
                                                    </Text>
                                                </Text>
                                                <Text type="secondary">
                                                    Turno:{' '}
                                                    <Text strong>{turnoEfectivo || '—'}</Text>
                                                </Text>
                                                {paraleloApiMeta?.descripcion ? (
                                                    <Text type="secondary" style={{ marginTop: 4 }}>
                                                        {paraleloApiMeta.descripcion}
                                                    </Text>
                                                ) : null}
                                                <Text type="secondary" style={{ marginTop: 8 }}>
                                                    Revisá las materias del periodo, editá el plan semanal (arrastrá
                                                    bloques entre celdas de la misma ventana del turno) y usá la vista
                                                    previa. El guardado en servidor se habilitará cuando exista el
                                                    endpoint de persistencia.
                                                </Text>
                                            </Flex>
                                        </Flex>
                                    </div>
                                    <div className="sd-tabs-shell">
                                        <Tabs
                                            className="sd-tabs"
                                            activeKey={tab}
                                            onChange={setTab}
                                            items={tabItems}
                                            destroyOnHidden
                                        />
                                    </div>
                                </>
                            ) : null}
                        </>
                    )}
                </div>
            </Spin>
        </PageTemplate>
    );
};

export default GestionHorariosArmadoPage;
