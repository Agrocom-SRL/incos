import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppstoreOutlined, TableOutlined, TeamOutlined } from '@ant-design/icons';
import { Alert, Card, Flex, Spin, Tabs } from 'antd';
import { MainContent, InfoSidebar, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton } from '@atoms';
import { allSpacing, allColors, componentConfig, shadows } from '@theme/tokens';
import { useHorariosContext } from '@application-institucional/horarios';
import { canListarAsignacion } from '@application-institucional/horarios/config/asignacionDocentePermisos';
import { useAuthContext } from '@application-auth';
import { DashboardPageShell } from '@presentation/modules/dashboard/components/organisms';
import '@presentation/styles/pages/detail-page.css';
import '../styles/gestion-horarios-page.css';
import {
    HorariosAlertBanner,
    HorariosFiltersBar,
    HorariosGestionSidebarResumen,
    HorariosKpiStrip,
    HorariosOperativaBanner,
    ParalelosBoard,
    ParalelosTable,
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
        onVerHorariosAulas,
        onPublish,
        clearFilters,
        hayAlertas,
        pendientesSidebar,
        loading,
        error,
    } = useHorariosContext();
    const navigate = useNavigate();
    const { hasPermiso } = useAuthContext();
    const puedeAsignacionDocente = canListarAsignacion(hasPermiso);

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
                            {puedeAsignacionDocente ? (
                                <ActionButton
                                    permiso="institucional.horarios.asignacion-docente"
                                    accion="LISTAR"
                                    variant="default"
                                    icon={<TeamOutlined />}
                                    onClick={() => navigate('/institucional/horarios/asignacion-docente')}
                                >
                                    Asignación docente
                                </ActionButton>
                            ) : null}
                            <ActionButton
                                permiso="institucional.horario.armado"
                                accion="LISTAR"
                                variant="warning"
                                onClick={onVerHorariosAulas}
                            >
                                Horarios en aulas
                            </ActionButton>
                            <ActionButton
                                permiso="institucional.horario.publicacion"
                                accion="EDITAR"
                                variant="primary"
                                onClick={onPublish}
                            >
                                Publicar cambios
                            </ActionButton>
                        </Flex>
                    }
                />
            </PageHeaderArea>

            <DashboardPageShell>
                <MainContent>
                    <Spin spinning={loading} tip="Cargando datos de horarios...">
                        <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
                            {error ? <Alert type="error" showIcon message={error} /> : null}
                            <HorariosOperativaBanner />
                            {hayAlertas ? (
                                <HorariosAlertBanner
                                    sinDocentes={kpis.sinDocentes}
                                    sinAulas={kpis.sinAulas}
                                    sinHorarios={kpis.sinHorarios}
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
                                    <div className="sd-tabs-shell">
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
                        <HorariosKpiStrip kpis={kpis} variant="total" />
                        <HorariosGestionSidebarResumen
                            filteredParallels={filteredParallels}
                            bloquesSinAulaPorParalelo={pendientesSidebar?.bloquesSinAulaPorParalelo}
                            cursosSinDocentePorParalelo={pendientesSidebar?.cursosSinDocentePorParalelo}
                            docentesConConflictosOperativos={pendientesSidebar?.docentesConConflictosOperativos}
                        />
                    </Flex>
                </InfoSidebar>
            </DashboardPageShell >
        </Flex >
    );
};

export default GestionHorariosPage;
