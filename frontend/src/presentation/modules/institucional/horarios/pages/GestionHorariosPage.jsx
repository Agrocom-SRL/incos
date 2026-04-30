import { Alert, Segmented, Space, Spin } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Button } from '@atoms';
import { useHorariosContext } from '@application-institucional/horarios';
import {
    CursosIncompletosPanel,
    HorariosAlertBanner,
    HorariosCapacitySidebar,
    HorariosFlowSteps,
    HorariosFiltersBar,
    HorariosKpiStrip,
    ParalelosBoard,
    ParalelosTable,
    ProgresoGestionPanel,
} from '../components';

const GestionHorariosPage = () => {
    const {
        title,
        subtitle,
        filters,
        options,
        viewMode,
        kpis,
        boardByStatus,
        filteredParallels,
        setViewMode,
        onFilterChange,
        onOpenArmado,
        onGenerate,
        onViewConflicts,
        onPublish,
        clearFilters,
        hayAlertas,
        cursosIncompletos,
        progresoGestion,
        loading,
        error,
    } = useHorariosContext();

    const breadcrumbItems = [
        { title: 'Inicio', href: '/' },
        { title: 'Institucional', href: '/institucional' },
        { title: 'Gestión de horarios' },
    ];

    return (
        <PageTemplate
            header={
                <PageHeader
                    title={title}
                    breadcrumbItems={breadcrumbItems}
                    actions={
                        <Space wrap>
                            <Button onClick={onGenerate}>Generar propuesta</Button>
                            <Button
                                variant={kpis?.conConflicto > 0 ? 'warning' : 'default'}
                                onClick={onViewConflicts}
                            >
                                Ver conflictos{` (${kpis?.conConflicto || 0})`}
                            </Button>
                            <Button variant="primary" onClick={onPublish}>
                                Publicar cambios
                            </Button>
                        </Space>
                    }
                />
            }
            sidebar={
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <HorariosCapacitySidebar />
                    <ProgresoGestionPanel progresoGestion={progresoGestion} />
                    <CursosIncompletosPanel cursosIncompletos={cursosIncompletos} />
                    <Alert
                        type="info"
                        showIcon
                        message="Acciones rápidas"
                        description={`Incompletos: ${kpis.incompletos} | Sin horario: ${kpis.sinHorario} | Conflictos: ${kpis.conConflicto}`}
                    />
                </Space>
            }
        >
            <Spin spinning={loading} tip="Cargando catálogos de horarios...">
                <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
                    {error && <Alert type="error" showIcon message={error} />}
                    <HorariosFlowSteps />
                    {hayAlertas && (
                        <HorariosAlertBanner incompletos={kpis.incompletos} conflictos={kpis.conConflicto} />
                    )}
                    <HorariosFiltersBar
                        filters={filters}
                        options={options}
                        onFilterChange={onFilterChange}
                        onClearFilters={clearFilters}
                    />
                    <HorariosKpiStrip kpis={kpis} />
                    <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ fontWeight: 500 }}>Vista de planificación</span>
                        <Segmented
                            value={viewMode}
                            onChange={setViewMode}
                            options={[
                                { value: 'board', label: 'Tablero' },
                                { value: 'table', label: 'Tabla' },
                            ]}
                        />
                    </Space>

                    {viewMode === 'board' ? (
                        <ParalelosBoard boardByStatus={boardByStatus} onOpenArmado={onOpenArmado} />
                    ) : (
                        <ParalelosTable filteredParallels={filteredParallels} onOpenArmado={onOpenArmado} />
                    )}
                </Space>
            </Spin>
        </PageTemplate>
    );
};

export default GestionHorariosPage;
