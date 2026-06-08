import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Flex, Result, Spin, Tabs } from 'antd';
import {
    ArrowLeftOutlined,
    CompressOutlined,
    ExpandOutlined,
    EyeOutlined,
    PieChartOutlined,
    ScheduleOutlined,
} from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader, ParaleloGestionContextHeader } from '@molecules';
import { IconButton } from '@atoms';
import { allColors, allSpacing, componentConfig, shadows } from '@theme/tokens';
import { useHorariosArmadoContext } from '@application-institucional/horarios';
import ParaleloArmadoPlanSection from '../components/organisms/ParaleloArmadoPlanSection';
import ParaleloCoberturaTabSection from '../components/organisms/ParaleloCoberturaTabSection';
import '@configuracion/academico/styles/academico-form-page.css';
import '@presentation/styles/pages/detail-page.css';
import '../styles/gestion-horarios-page.css';

const ARMADO_CONTEXT_HINT =
    'Revisá la cobertura horaria, generá horarios por materia y afiná el plan semanal en la grilla. Docentes y oferta de cursos se gestionan en Institucional → Oferta académica.';

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
        persistLoading,
        paraleloGestionDetalle,
        draftSchedules,
        setDraftSchedules,
        onRequestPersist,
        handleVolver,
        paraleloGestionId,
        validatePlacement,
        hasParaleloSelected,
        horarioEditable,
        planSemanalEditable,
        coberturaReajustable,
        coberturaGrilla,
        generarBloquesCurso,
        reajustarBloquesCurso,
    } = useHorariosArmadoContext();
    const [vistaExpandida, setVistaExpandida] = useState(false);

    useEffect(() => {
        if (!vistaExpandida) return undefined;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [vistaExpandida]);

    const handleGenerarBloquesCurso = useCallback(
        (cursoId, horasPlan) => generarBloquesCurso(cursoId, horasPlan),
        [generarBloquesCurso],
    );

    const handleReajustarBloquesCurso = useCallback(
        (cursoId, horasPlan) => reajustarBloquesCurso(cursoId, horasPlan),
        [reajustarBloquesCurso],
    );

    const tabItems = useMemo(
        () => [
            {
                key: 'cobertura',
                label: (
                    <span className="sd-tab-label">
                        <PieChartOutlined className="horarios-armado-tab__icon" aria-hidden />
                        <span>Cobertura</span>
                    </span>
                ),
                children: (
                    <div className="sd-tab-body horarios-armado-tab-body">
                        <ParaleloCoberturaTabSection
                            draftSchedules={draftSchedules}
                            paraleloGestionId={paraleloGestionId}
                            coberturaGrilla={coberturaGrilla}
                            horarioEditable={horarioEditable}
                            coberturaReajustable={coberturaReajustable}
                            onGenerarBloquesCurso={handleGenerarBloquesCurso}
                            onReajustarBloquesCurso={handleReajustarBloquesCurso}
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
                            editable={planSemanalEditable}
                            allowDelete={horarioEditable}
                            soloReubicacion={planSemanalEditable && !horarioEditable}
                            turnoLabel={turnoEfectivo || undefined}
                            persistLoading={persistLoading}
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
            turnoEfectivo,
            persistLoading,
            setDraftSchedules,
            onRequestPersist,
            horarioEditable,
            planSemanalEditable,
            coberturaReajustable,
            vistaExpandida,
            paraleloGestionId,
            coberturaGrilla,
            handleGenerarBloquesCurso,
            handleReajustarBloquesCurso,
            validatePlacement,
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
        </PageTemplate>
    );
};

export default GestionHorariosArmadoPage;
