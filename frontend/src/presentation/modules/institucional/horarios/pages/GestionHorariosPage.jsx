import { useMemo } from 'react';
import { AppstoreOutlined, TableOutlined } from '@ant-design/icons';
import { Alert, Card, Flex, Spin, Tabs } from 'antd';
import { MainContent, InfoSidebar, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { Button } from '@atoms';
import { allSpacing, allColors, componentConfig, shadows } from '@theme/tokens';
import { useHorariosContext } from '@application-institucional/horarios';
import { DashboardPageShell } from '@presentation/modules/dashboard/components/organisms';
import '@presentation/styles/pages/detail-page.css';
import '../styles/gestion-horarios-page.css';
import {
    HorariosAlertBanner,
    HorariosCapacitySidebar,
    HorariosFiltersBar,
    HorariosKpiStrip,
    ParalelosBoard,
    ParalelosTable,
    ProgresoGestionPanel,
} from '../components';

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

const GestionHorariosPage = () => {
    const {
        title,
        filters,
        options,
        viewMode,
        kpis,
        boardByStatus,
        filteredParallels,
        setViewMode,
        onFilterChange,
        onOpenArmado,
        onViewConflicts,
        onPublish,
        clearFilters,
        hayAlertas,
        progresoGestion,
        loading,
        error,
    } = useHorariosContext();

    const breadcrumbItems = [
        { title: 'Inicio', href: '/' },
        { title: 'Institucional', href: '/institucional' },
        { title: 'Gestión de horarios' },
    ];

    const planificacionTabItems = useMemo(
        () => [
            {
                key: 'board',
                label: (
                    <span className="horarios-plan-tab-label">
                        <AppstoreOutlined className="horarios-plan-tab-label__icon" aria-hidden />
                        <span>Tablero</span>
                    </span>
                ),
                children: <ParalelosBoard boardByStatus={boardByStatus} onOpenArmado={onOpenArmado} />,
            },
            {
                key: 'table',
                label: (
                    <span className="horarios-plan-tab-label">
                        <TableOutlined className="horarios-plan-tab-label__icon" aria-hidden />
                        <span>Tabla</span>
                    </span>
                ),
                children: (
                    <ParalelosTable
                        filteredParallels={filteredParallels}
                        onOpenArmado={onOpenArmado}
                        embedded
                    />
                ),
            },
        ],
        [boardByStatus, filteredParallels, onOpenArmado],
    );

    return (
        <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
            <PageHeaderArea>
                <PageHeader
                    title={title}
                    breadcrumbItems={breadcrumbItems}
                    actions={
                        <Flex wrap="wrap" gap={allSpacing.marginSM} justify="flex-end">
                            <Button
                                variant={kpis?.conConflicto > 0 ? 'warning' : 'default'}
                                onClick={onViewConflicts}
                            >
                                Ver conflictos ({kpis?.conConflicto || 0})
                            </Button>
                            <Button variant="primary" onClick={onPublish}>
                                Publicar cambios
                            </Button>
                        </Flex>
                    }
                />
            </PageHeaderArea>

            <DashboardPageShell>
                <MainContent>
                    <Spin spinning={loading} tip="Cargando datos de horarios...">
                        <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
                            {error ? <Alert type="error" showIcon message={error} /> : null}
                            {hayAlertas ? (
                                <HorariosAlertBanner
                                    incompletos={kpis.incompletos}
                                    conflictos={kpis.conConflicto}
                                />
                            ) : null}

                            <HorariosKpiStrip kpis={kpis} variant="details" />

                            <Card className="horarios-gestion-planificacion" {...sectionCardProps}>
                                <Flex vertical gap={allSpacing.marginLG}>
                                    <HorariosFiltersBar
                                        filters={filters}
                                        options={options}
                                        onFilterChange={onFilterChange}
                                        onClearFilters={clearFilters}
                                    />
                                    <div className="sd-tabs-shell horarios-gestion-planificacion__tabs">
                                        <Tabs
                                            className="sd-tabs"
                                            activeKey={viewMode}
                                            onChange={setViewMode}
                                            items={planificacionTabItems}
                                        />
                                    </div>
                                </Flex>
                            </Card>
                        </Flex>
                    </Spin>
                </MainContent>

                <InfoSidebar>
                    <Flex vertical gap={allSpacing.marginMD} style={{ width: '100%', minWidth: 0 }}>
                        <Alert
                            type="info"
                            showIcon
                            title="Acciones rápidas"
                            description={`Incompletos: ${kpis.incompletos} | Sin horario: ${kpis.sinHorario} | Conflictos: ${kpis.conConflicto}`}
                        />
                        <HorariosKpiStrip kpis={kpis} variant="total" />
                        <HorariosCapacitySidebar />
                        <ProgresoGestionPanel progresoGestion={progresoGestion} />
                    </Flex>
                </InfoSidebar>
            </DashboardPageShell>
        </Flex>
    );
};

export default GestionHorariosPage;
