import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Card, Flex, Spin, Tabs, Typography } from 'antd';
import {
    ArrowLeftOutlined,
    BookOutlined,
    CompressOutlined,
    ExpandOutlined,
    EyeOutlined,
    ScheduleOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { IconButton } from '@atoms';
import { allColors, allSpacing, componentConfig, shadows } from '@theme/tokens';
import { useHorariosArmadoContext } from '@application-institucional/horarios';
import { buildCarreraImageUrl } from '@application-institucional/horarios/utils/buildCarreraImageUrl';
import ParaleloArmadoPlanSection from '../components/organisms/ParaleloArmadoPlanSection';
import { HorariosArmadoCoberturaSidebar } from '../components/organisms';
import ParaleloCursosGestionSection from '../components/organisms/ParaleloCursosGestionSection';
import DocenteAsignacionCursoModal from '../components/organisms/DocenteAsignacionCursoModal';
import ParaleloCursosTabSection from '../components/organisms/ParaleloCursosTabSection';
import HorariosOperativaBanner from '../components/molecules/HorariosOperativaBanner';
import HorariosArmadoParaleloEstadoAlert from '../components/molecules/HorariosArmadoParaleloEstadoAlert';
import HorariosArmadoParaleloSelector from '../components/molecules/HorariosArmadoParaleloSelector';
import '@presentation/styles/pages/detail-page.css';
import '../styles/gestion-horarios-page.css';

const { Text, Title } = Typography;

const sectionCardProps = {
    style: {
        borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
        boxShadow: shadows.shadowElevation2,
        border: `1px solid ${allColors.colorBorder}`,
        backgroundColor: allColors.colorBgContainer,
    },
    styles: {
        body: { padding: `${componentConfig.Card.paddingLG}px` },
    },
};

const GestionHorariosArmadoPage = () => {
    const {
        paraleloId,
        tab,
        setTab,
        turnoEfectivo,
        breadcrumbItems,
        pageTitle,
        loading,
        error,
        persistResult,
        persistLoading,
        persistError,
        paraleloApiMeta,
        paraleloNombre,
        missingSubjects,
        draftSchedules,
        serverSchedules,
        setDraftSchedules,
        onRequestPersist,
        handleVolver,
        ofertaParalelo,
        refetchSchedule,
        conflictosGrilla,
        coberturaGrilla,
        paraleloGestionId,
        gestionVigenteId,
        selectedGestionId,
        handleSelectorGestionChange,
        handleSelectorParaleloChange,
        validatePlacement,
        hasParaleloSelected,
        validPgId,
        paraleloGestionEstado,
        horarioEditable,
    } = useHorariosArmadoContext();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [vistaExpandida, setVistaExpandida] = useState(false);
    const [docenteModalOpen, setDocenteModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [docentePreview, setDocentePreview] = useState(null);
    const lastHandledAsignarCursoKey = useRef(null);

    useEffect(() => {
        if (!vistaExpandida) return undefined;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [vistaExpandida]);

    useEffect(() => {
        lastHandledAsignarCursoKey.current = null;
    }, [paraleloId]);

    const handleOpenDocenteAsignacion = useCallback((row) => {
        if (!row?.cursoId) return;
        const source = draftSchedules.find((c) => Number(c.cursoId) === Number(row.cursoId));
        const fallback = {
            ...row,
            bloques: Array.isArray(row.bloques) ? row.bloques : [],
            docente: row.docente || null,
            cursoColorHex: row.colorHex || row.cursoColorHex || null,
        };
        setSelectedCourse(source || fallback);
        setDocentePreview(null);
        setDocenteModalOpen(true);
    }, [draftSchedules]);

    useEffect(() => {
        const raw = searchParams.get('asignarCurso');
        if (raw == null || String(raw).trim() === '') {
            lastHandledAsignarCursoKey.current = null;
            return;
        }
        const id = Number(raw);
        if (!Number.isFinite(id)) return;
        if (loading) return;
        if (tab !== 'cursos') {
            setTab('cursos');
            return;
        }
        const key = `${paraleloId}|${raw}`;
        if (lastHandledAsignarCursoKey.current === key) return;
        const fromDraft = (draftSchedules || []).find((c) => Number(c.cursoId) === id);
        const fromServer = (serverSchedules || []).find((c) => Number(c.cursoId) === id);
        const row = fromDraft || fromServer;
        const clearParam = () => {
            setSearchParams(
                (prev) => {
                    const n = new URLSearchParams(prev);
                    n.delete('asignarCurso');
                    return n;
                },
                { replace: true },
            );
        };
        if (!row?.cursoId) {
            lastHandledAsignarCursoKey.current = key;
            clearParam();
            return;
        }
        lastHandledAsignarCursoKey.current = key;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- enlace profundo `asignarCurso`: abrir modal cuando el tab y el plan están listos
        handleOpenDocenteAsignacion(row);
        clearParam();
    }, [
        searchParams,
        tab,
        loading,
        draftSchedules,
        serverSchedules,
        paraleloId,
        setSearchParams,
        handleOpenDocenteAsignacion,
        setTab,
    ]);

    const handleDocenteAssigned = useCallback(
        ({ cursoId, docenteNombre }) => {
            const docente = docenteNombre || null;
            setDocentePreview(null);
            setDraftSchedules((prev) =>
                prev.map((c) =>
                    Number(c.cursoId) === Number(cursoId)
                        ? {
                              ...c,
                              docente,
                          }
                        : c,
                ),
            );
            setSelectedCourse((prev) =>
                prev && Number(prev.cursoId) === Number(cursoId)
                    ? {
                          ...prev,
                          docente,
                      }
                    : prev,
            );
            if (paraleloId) {
                refetchSchedule?.(Number(paraleloId));
            }
        },
        [paraleloId, refetchSchedule, setDraftSchedules],
    );

    const handleDocenteModalClose = useCallback(() => {
        setDocentePreview(null);
        setDocenteModalOpen(false);
    }, []);

    const handleCursoOfertaSaved = useCallback(() => {
        ofertaParalelo.refetchOferta();
        if (paraleloId) refetchSchedule?.(Number(paraleloId));
    }, [ofertaParalelo, paraleloId, refetchSchedule]);

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
                        <ParaleloCursosTabSection
                            draftSchedules={draftSchedules}
                            missingSubjects={missingSubjects}
                            setTab={setTab}
                            onOpenDocenteAsignacion={handleOpenDocenteAsignacion}
                            docentePreview={docentePreview}
                        />
                    </div>
                ),
            },
            {
                key: 'gestion',
                label: (
                    <span className="sd-tab-label">
                        <SettingOutlined className="horarios-armado-tab__icon" aria-hidden />
                        <span>Gestión de cursos</span>
                    </span>
                ),
                children: (
                    <div className="sd-tab-body horarios-armado-tab-body horarios-oferta-cursos-card">
                        <Spin spinning={Boolean(ofertaParalelo?.validParaleloId) && Boolean(ofertaParalelo?.loading)} tip="Cargando oferta…">
                            <ParaleloCursosGestionSection
                                validParaleloId={ofertaParalelo.validParaleloId}
                                canCrear={ofertaParalelo.canCrear}
                                canEliminar={ofertaParalelo.canEliminar}
                                missingSubjects={ofertaParalelo.missingSubjects}
                                filasOferta={ofertaParalelo.filasOferta}
                                cursoModal={ofertaParalelo.cursoModal}
                                closeCursoModal={ofertaParalelo.closeCursoModal}
                                onNuevoCurso={ofertaParalelo.onNuevoCurso}
                                onCrearCursoDesdeMateria={ofertaParalelo.onCrearCursoDesdeMateria}
                                requestDeleteCurso={ofertaParalelo.requestDeleteCurso}
                                deleteCursoLoading={ofertaParalelo.deleteCursoLoading}
                                handleCrearCursoOferta={ofertaParalelo.handleCrearCursoOferta}
                                refetchOferta={handleCursoOfertaSaved}
                                ofertaError={ofertaParalelo.error}
                            />
                        </Spin>
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
                        <div className="horarios-armado-plan-layout">
                            <div className="horarios-armado-plan-layout__main">
                                <ParaleloArmadoPlanSection
                                    schedules={draftSchedules}
                                    onSchedulesChange={setDraftSchedules}
                                    editable={horarioEditable}
                                    turnoLabel={turnoEfectivo || undefined}
                                    persistLoading={persistLoading}
                                    persistError={persistError}
                                    persistSuccess={Boolean(
                                        !persistLoading && !persistError && persistResult,
                                    )}
                                    onRequestPersist={onRequestPersist}
                                    validatePlacement={validatePlacement}
                                    vistaExpandida={vistaExpandida}
                                />
                            </div>
                            {!vistaExpandida ? (
                                <HorariosArmadoCoberturaSidebar
                                    cobertura={coberturaGrilla}
                                    conflictos={conflictosGrilla}
                                    loading={loading}
                                    paraleloGestionId={paraleloGestionId}
                                />
                            ) : null}
                        </div>
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
                            vistaExpandida={vistaExpandida}
                            showPendientesDetalle
                        />
                    </div>
                ),
            },
        ],
        [
            draftSchedules,
            missingSubjects,
            turnoEfectivo,
            persistLoading,
            persistError,
            persistResult,
            setDraftSchedules,
            onRequestPersist,
            horarioEditable,
            setTab,
            ofertaParalelo,
            vistaExpandida,
            coberturaGrilla,
            conflictosGrilla,
            paraleloGestionId,
            loading,
            docentePreview,
            handleOpenDocenteAsignacion,
            handleCursoOfertaSaved,
        ],
    );

    const headerActions = (
        <button type="button" className="sd-btn sd-btn--outline" onClick={handleVolver}>
            <ArrowLeftOutlined /> Volver
        </button>
    );

    return (
        <PageTemplate
            header={<PageHeader title={pageTitle} breadcrumbItems={breadcrumbItems} actions={headerActions} />}
            sidebar={null}
        >
            <Spin spinning={hasParaleloSelected && loading} size="large" tip="Cargando plan del paralelo…">
                <div className="sd sd-spin-body horarios-armado-page">
                    <HorariosArmadoParaleloSelector
                        gestionId={selectedGestionId}
                        onGestionChange={handleSelectorGestionChange}
                        paraleloGestionId={validPgId ?? paraleloGestionId}
                        onParaleloGestionChange={handleSelectorParaleloChange}
                    />
                    {!hasParaleloSelected ? (
                        <Alert
                            type="warning"
                            showIcon
                            style={{ marginTop: 16 }}
                            title="Elija un paralelo"
                            description="Seleccione la gestión y el paralelo en gestión, o abra esta pantalla desde el tablero de horarios."
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
                            {paraleloGestionId && conflictosGrilla?.length > 0 ? (
                                <Alert
                                    type="warning"
                                    showIcon
                                    style={{ marginBottom: 16 }}
                                    title={`${conflictosGrilla.length} conflicto(s) de horario`}
                                    description="Resuelva solapes de paralelo, aula o docente antes de publicar. Los bloques en conflicto están marcados en la grilla."
                                    action={
                                        gestionVigenteId ? (
                                            <button
                                                type="button"
                                                className="sd-btn sd-btn--outline sd-btn--sm"
                                                onClick={() =>
                                                    navigate(
                                                        `/institucional/horarios/conflictos/${gestionVigenteId}`,
                                                    )
                                                }
                                            >
                                                Ver todos
                                            </button>
                                        ) : null
                                    }
                                />
                            ) : null}
                            {coberturaGrilla && coberturaGrilla.completa === false ? (
                                <Alert
                                    type="info"
                                    showIcon
                                    style={{ marginBottom: 16 }}
                                    title="Plan semanal incompleto"
                                    description="Faltan bloques en la grilla para una o más materias (p. ej. docente ya asignado pero sin franjas en el plan). Usá «Añadir bloque» o arrastrá en la grilla y guardá."
                                />
                            ) : null}
                            <HorariosArmadoParaleloEstadoAlert
                                estado={paraleloGestionEstado}
                                paraleloGestionId={paraleloGestionId}
                                style={{ marginBottom: 16 }}
                            />
                            <HorariosOperativaBanner style={{ marginBottom: 16 }} />
                            {!error ? (
                                <div
                                    className={[
                                        'horarios-armado-page-root',
                                        vistaExpandida ? 'horarios-armado-page-root--expanded' : '',
                                    ]
                                        .filter(Boolean)
                                        .join(' ')}
                                >
                                    <Card
                                        className={[
                                            'horarios-gestion-planificacion',
                                            vistaExpandida ? 'horarios-gestion-planificacion--expanded' : '',
                                        ]
                                            .filter(Boolean)
                                            .join(' ')}
                                        {...sectionCardProps}
                                        styles={{
                                            ...sectionCardProps.styles,
                                            body: {
                                                ...sectionCardProps.styles.body,
                                                ...(vistaExpandida
                                                    ? {
                                                        flex: 1,
                                                        minHeight: 0,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        overflow: 'hidden',
                                                    }
                                                    : {}),
                                            },
                                        }}
                                    >
                                        <Flex
                                            vertical
                                            gap={allSpacing.marginLG}
                                            className={[
                                                'horarios-armado-page__inner-flex',
                                                vistaExpandida ? 'horarios-armado-page__inner-flex--expanded' : '',
                                            ]
                                                .filter(Boolean)
                                                .join(' ')}
                                        >
                                            {!vistaExpandida ? (
                                                <div className="horarios-armado-context" style={{ marginBottom: 0 }}>
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
                                                                Turno: <Text strong>{turnoEfectivo || '—'}</Text>
                                                            </Text>
                                                            {paraleloApiMeta?.descripcion ? (
                                                                <Text type="secondary" style={{ marginTop: 4 }}>
                                                                    {paraleloApiMeta.descripcion}
                                                                </Text>
                                                            ) : null}
                                                            <Text type="secondary" style={{ marginTop: 8 }}>
                                                                Revisá las materias del periodo, editá el plan semanal (arrastrá bloques
                                                                entre celdas de la misma ventana del turno) y usá la vista previa.
                                                            </Text>
                                                        </Flex>
                                                    </Flex>
                                                </div>
                                            ) : null}
                                            <div
                                                className={[
                                                    'sd-tabs-shell',
                                                    vistaExpandida ? 'horarios-armado-tabs-shell--expanded' : '',
                                                ]
                                                    .filter(Boolean)
                                                    .join(' ')}
                                            >
                                                <Tabs
                                                    className="sd-tabs"
                                                    activeKey={tab}
                                                    onChange={setTab}
                                                    items={tabItems}
                                                    destroyOnHidden
                                                    tabBarExtraContent={
                                                        tab === 'plan' || tab === 'vista' || vistaExpandida ? (
                                                            <IconButton
                                                                variant="info"
                                                                icon={vistaExpandida ? <CompressOutlined /> : <ExpandOutlined />}
                                                                onClick={() => setVistaExpandida((v) => !v)}
                                                                size="middle"
                                                                circle={true}
                                                                aria-label={
                                                                    vistaExpandida
                                                                        ? 'Salir de pantalla completa del plan'
                                                                        : 'Expandir plan semanal a pantalla completa'
                                                                }
                                                                title={vistaExpandida ? 'Restaurar vista' : 'Pantalla completa'}
                                                            />
                                                        ) : null
                                                    }
                                                />
                                            </div>
                                        </Flex>
                                    </Card>
                                </div>
                            ) : null}
                        </>
                    )}
                </div>
            </Spin>
            {docenteModalOpen ? (
                <DocenteAsignacionCursoModal
                    open={docenteModalOpen}
                    onClose={handleDocenteModalClose}
                    selectedCourse={selectedCourse}
                    gestionId={selectedGestionId}
                    paraleloLabel={paraleloNombre || `#${paraleloId || '—'}`}
                    onAssigned={handleDocenteAssigned}
                    onPreviewDocenteChange={setDocentePreview}
                    onWarning={(suggestedTab) => {
                        if (suggestedTab === 'gestion' || suggestedTab === 'plan') setTab(suggestedTab);
                    }}
                />
            ) : null}
        </PageTemplate>
    );
};

export default GestionHorariosArmadoPage;
