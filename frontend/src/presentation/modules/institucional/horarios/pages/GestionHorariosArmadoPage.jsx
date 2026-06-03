import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Flex, Result, Spin, Tabs } from 'antd';
import {
    ArrowLeftOutlined,
    BookOutlined,
    CompressOutlined,
    ExpandOutlined,
    EyeOutlined,
    ScheduleOutlined,
} from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader, ParaleloGestionContextHeader } from '@molecules';
import { IconButton } from '@atoms';
import { allColors, allSpacing, componentConfig, shadows } from '@theme/tokens';
import { useHorariosArmadoContext } from '@application-institucional/horarios';
import ParaleloArmadoPlanSection from '../components/organisms/ParaleloArmadoPlanSection';
import DocenteAsignacionCursoModal from '../components/organisms/DocenteAsignacionCursoModal';
import ParaleloCursosTabSection from '../components/organisms/ParaleloCursosTabSection';
import '@presentation/styles/pages/detail-page.css';
import '../styles/gestion-horarios-page.css';

const ARMADO_CONTEXT_HINT =
    'Asigná docentes por curso, armá el plan semanal en la grilla y revisá la vista previa. La oferta de cursos se gestiona en Institucional → Oferta académica.';

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
        paraleloGestionDetalle,
        paraleloNombre,
        missingSubjects,
        draftSchedules,
        serverSchedules,
        setDraftSchedules,
        onRequestPersist,
        handleVolver,
        refetchSchedule,
        refetchOferta,
        paraleloGestionId,
        gestionVigenteId,
        validatePlacement,
        hasParaleloSelected,
        horarioEditable,
    } = useHorariosArmadoContext();
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
    }, [paraleloGestionId]);

    const handleOpenDocenteAsignacion = useCallback(
        (row) => {
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
        },
        [draftSchedules],
    );

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
        const key = `${paraleloGestionId}|${raw}`;
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
        handleOpenDocenteAsignacion(row);
        clearParam();
    }, [
        searchParams,
        tab,
        loading,
        draftSchedules,
        serverSchedules,
        paraleloGestionId,
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
            refetchOferta?.();
            refetchSchedule?.();
        },
        [refetchOferta, refetchSchedule, setDraftSchedules],
    );

    const handleDocenteModalClose = useCallback(() => {
        setDocentePreview(null);
        setDocenteModalOpen(false);
    }, []);

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
                            paraleloGestionId={paraleloGestionId}
                            onOpenDocenteAsignacion={handleOpenDocenteAsignacion}
                            docentePreview={docentePreview}
                        />
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
                            editable={horarioEditable}
                            turnoLabel={turnoEfectivo || undefined}
                            persistLoading={persistLoading}
                            persistError={persistError}
                            persistSuccess={Boolean(!persistLoading && !persistError && persistResult)}
                            onRequestPersist={onRequestPersist}
                            validatePlacement={validatePlacement}
                            vistaExpandida={vistaExpandida}
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
                            onSchedulesChange={() => {}}
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
            vistaExpandida,
            paraleloGestionId,
            loading,
            docentePreview,
            handleOpenDocenteAsignacion,
            validatePlacement,
            paraleloGestionDetalle,
            turnoEfectivo,
        ],
    );

    const headerActions = (
        <button type="button" className="sd-btn sd-btn--outline" onClick={handleVolver}>
            <ArrowLeftOutlined /> Volver
        </button>
    );

    const bodyContent = !hasParaleloSelected ? (
        <Result
            status="warning"
            title="Paralelo no indicado"
            subTitle="Abrí esta pantalla desde el tablero de Gestión de horarios o usá un enlace con ?pg= (paralelo en gestión) en la URL."
            extra={
                <button type="button" className="sd-btn sd-btn--outline" onClick={handleVolver}>
                    Volver al tablero
                </button>
            }
        />
    ) : error ? (
        <Result
            status="error"
            title="No se pudo cargar el plan"
            subTitle={error}
            extra={
                <button type="button" className="sd-btn sd-btn--outline" onClick={handleVolver}>
                    Volver al tablero
                </button>
            }
        />
    ) : (
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
                        <ParaleloGestionContextHeader
                            detalle={paraleloGestionDetalle}
                            variant="armado"
                            titleLevel={5}
                            hint={ARMADO_CONTEXT_HINT}
                        />
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
    );

    return (
        <PageTemplate
            header={<PageHeader title={pageTitle} breadcrumbItems={breadcrumbItems} actions={headerActions} />}
            sidebar={null}
        >
            <Spin spinning={hasParaleloSelected && loading} size="large" tip="Cargando plan del paralelo…">
                <div className="sd sd-spin-body horarios-armado-page">{bodyContent}</div>
            </Spin>
            {docenteModalOpen ? (
                <DocenteAsignacionCursoModal
                    open={docenteModalOpen}
                    onClose={handleDocenteModalClose}
                    selectedCourse={selectedCourse}
                    gestionId={gestionVigenteId}
                    paraleloLabel={paraleloNombre || `#${paraleloGestionId || '—'}`}
                    onAssigned={handleDocenteAssigned}
                    onPreviewDocenteChange={setDocentePreview}
                    onWarning={(suggestedTab) => {
                        if (suggestedTab === 'plan') setTab('plan');
                    }}
                />
            ) : null}
        </PageTemplate>
    );
};

export default GestionHorariosArmadoPage;
