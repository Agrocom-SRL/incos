import { useMemo } from 'react';
import { Alert, Card, Flex, Spin, Typography } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton } from '@atoms';
import { allSpacing, allColors, componentConfig, shadows } from '@theme/tokens';
import { useHorariosPublicacionContext } from '@application-institucional/horarios';
import { HorariosFiltersBar, HorariosPublicacionParaleloCard } from '../components';
import '@presentation/styles/pages/detail-page.css';
import '../styles/gestion-horarios-page.css';

const { Text } = Typography;

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
    const {
        filters,
        options,
        onFilterChange,
        clearFilters,
        planes,
        loading,
        error,
        breadcrumbItems,
        handleVolver,
        gestionVigente,
        resumenPublicacion,
        publicandoPgId,
        publicarParaleloLoading,
        publicarTodosLoading,
        publicarTodosResultado,
        handlePublicarParalelo,
        handlePublicarTodos,
    } = useHorariosPublicacionContext();

    const headerActions = useMemo(
        () => (
            <Flex gap={8} wrap="wrap" justify="flex-end">
                <ActionButton
                    permiso="institucional.horario.publicacion"
                    accion="EDITAR"
                    variant="primary"
                    onClick={handlePublicarTodos}
                    loading={publicarTodosLoading}
                    disabled={!gestionVigente?.id || resumenPublicacion.ofertado === 0}
                >
                    Publicar todos (OFERTADO)
                </ActionButton>
                <button type="button" className="sd-btn sd-btn--outline" onClick={handleVolver}>
                    <ArrowLeftOutlined /> Volver
                </button>
            </Flex>
        ),
        [
            handlePublicarTodos,
            handleVolver,
            publicarTodosLoading,
            gestionVigente?.id,
            resumenPublicacion.ofertado,
        ],
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
                            {gestionVigente ? (
                                <Text type="secondary">
                                    Gestión vigente: <strong>{gestionVigente.nombre || gestionVigente.codigo}</strong>
                                    {' · '}
                                    {resumenPublicacion.ofertado} en OFERTADO · {resumenPublicacion.publicado}{' '}
                                    publicados
                                </Text>
                            ) : null}

                            {publicarTodosResultado?.resumen ? (
                                <Alert
                                    type="info"
                                    showIcon
                                    icon={<CheckCircleOutlined />}
                                    title="Resultado publicación masiva"
                                    description={
                                        <>
                                            Publicados: {publicarTodosResultado.resumen.publicados ?? 0}. Omitidos:{' '}
                                            {publicarTodosResultado.resumen.omitidos ?? 0}.
                                        </>
                                    }
                                />
                            ) : null}

                            <HorariosFiltersBar
                                filters={filters}
                                options={options}
                                onFilterChange={onFilterChange}
                                onClearFilters={clearFilters}
                                title="Filtrar publicación"
                            />
                            {error ? <Alert type="error" showIcon message={error} /> : null}
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
                                    const pgId = plan?.paralelo?.paraleloGestionId;
                                    const key =
                                        pgId != null
                                            ? `pg-${pgId}`
                                            : `p-${plan.paralelo?.id ?? plan.paralelo?.nombre}`;
                                    return (
                                        <HorariosPublicacionParaleloCard
                                            key={key}
                                            plan={plan}
                                            onPublicar={handlePublicarParalelo}
                                            publicando={
                                                publicarParaleloLoading &&
                                                Number(publicandoPgId) === Number(pgId)
                                            }
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
