import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Card, Flex, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { allSpacing, allColors, componentConfig, shadows } from '@theme/tokens';
import {
    useHorariosContext,
    useHorariosPublicacionPlanesApi,
} from '@application-institucional/horarios';
import { HorariosFiltersBar, HorariosPublicacionParaleloCard } from '../components';
import '@presentation/styles/pages/detail-page.css';
import '../styles/gestion-horarios-page.css';

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

const GestionHorariosPublicacionPage = () => {
    const navigate = useNavigate();
    const {
        filters,
        options,
        onFilterChange,
        clearFilters,
        paralelosCatalog,
    } = useHorariosContext();
    const { data: publicacionPayload, loading, error, fetch } = useHorariosPublicacionPlanesApi();

    const planes = useMemo(() => publicacionPayload?.planes || [], [publicacionPayload]);

    const paraleloEstadoById = useMemo(() => {
        const map = new Map();
        (paralelosCatalog || []).forEach((p) => {
            if (p?.id == null) return;
            map.set(Number(p.id), p);
        });
        return map;
    }, [paralelosCatalog]);

    const carreraIdFromFiltro = useCallback(() => {
        if (filters.carrera === 'all') return null;
        const hit = (paralelosCatalog || []).find((p) => p.carrera === filters.carrera);
        return hit?.carreraId != null ? Number(hit.carreraId) : null;
    }, [filters.carrera, paralelosCatalog]);

    useEffect(() => {
        const params = {};
        const cid = carreraIdFromFiltro();
        if (cid != null) params.carrera_id = cid;
        if (filters.turno !== 'all') params.turno = filters.turno;
        if (filters.periodo !== 'all') params.periodo = filters.periodo;
        fetch({ params });
    }, [fetch, filters.carrera, filters.turno, filters.periodo, carreraIdFromFiltro]);

    const handleVolver = useCallback(() => {
        navigate('/institucional/horarios');
    }, [navigate]);

    const breadcrumbItems = useMemo(
        () => [
            { title: 'Inicio', href: '/' },
            { title: 'Institucional', href: '/institucional' },
            { title: 'Gestión de horarios', href: '/institucional/horarios' },
            { title: 'Publicación de horarios' },
        ],
        [],
    );

    const headerActions = useMemo(
        () => (
            <button type="button" className="sd-btn sd-btn--outline" onClick={handleVolver}>
                <ArrowLeftOutlined /> Volver
            </button>
        ),
        [handleVolver],
    );

    return (
        <PageTemplate
            header={
                <PageHeader
                    title="Publicación de horarios"
                    breadcrumbItems={breadcrumbItems}
                    actions={headerActions}
                />
            }
            sidebar={null}
        >
            <Flex vertical gap="large" className="horarios-publicacion-page-root horarios-publicacion-page" style={{ width: '100%' }}>
                <Spin spinning={loading} tip="Cargando planes de horarios…">
                    <Card className="horarios-gestion-planificacion" {...sectionCardProps}>
                        <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
                            <HorariosFiltersBar
                                filters={filters}
                                options={options}
                                onFilterChange={onFilterChange}
                                onClearFilters={clearFilters}
                                title="Filtrar publicación"
                            />
                            {error ? (
                                <Alert type="error" showIcon message={error} />
                            ) : null}
                            {!loading && !error && planes.length === 0 ? (
                                <Alert
                                    type="info"
                                    showIcon
                                    title="Sin resultados"
                                    description="No hay planes de horario para los filtros seleccionados."
                                />
                            ) : null}
                            <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
                                {planes.map((plan) => {
                                    const pid = plan?.paralelo?.id != null ? Number(plan.paralelo.id) : null;
                                    const paraleloEstado = pid != null ? paraleloEstadoById.get(pid) : null;
                                    return (
                                        <HorariosPublicacionParaleloCard
                                            key={plan.paralelo?.id ?? plan.paralelo?.nombre}
                                            plan={plan}
                                            paraleloEstado={paraleloEstado}
                                        />
                                    );
                                })}
                            </Flex>
                        </Flex>
                    </Card>
                </Spin>
            </Flex>
        </PageTemplate>
    );
};

export default GestionHorariosPublicacionPage;
