import { Alert, Card, Flex, Select, Spin, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { allColors, allSpacing, componentConfig, shadows } from '@theme/tokens';
import { useHorariosConflictosContext } from '@application-institucional/horarios/hooks/context/useHorariosConflictosContext';
import HorariosConflictosPlanSection from '../components/organisms/HorariosConflictosPlanSection';
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

const GestionHorariosConflictosPage = () => {
    const {
        docenteId,
        setDocenteId,
        docentesConConflictos,
        gestionVigente,
        loading,
        error,
        grilla,
        draftSchedules,
        setDraftSchedules,
        bloquesEnConflictoSet,
        persistLoading,
        onRequestPersist,
        validatePlacement,
        handleVolver,
        breadcrumbItems,
        pageTitle,
    } = useHorariosConflictosContext();

    const docenteOptions = (docentesConConflictos || []).map((d) => ({
        value: d.docenteId,
        label: d.docenteNombre || `Docente #${d.docenteId}`,
    }));

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
            <Spin spinning={loading} size="large" tip="Cargando grilla del docente…">
                <div className="sd sd-spin-body horarios-conflictos-page">
                    <Flex vertical gap={allSpacing.marginLG}>
                        <Alert
                            type="info"
                            showIcon
                            title="Resolución en Institucional"
                            description="Los choques de horario se resuelven moviendo bloques en esta grilla. La asignación docente ↔ materia ofertada se gestiona en Institucional → Oferta académica; el color del docente en su ficha."
                        />

                        <Card {...sectionCardProps}>
                            <Flex vertical gap={allSpacing.marginMD}>
                                <Flex wrap="wrap" gap={allSpacing.marginMD} align="flex-end">
                                    <Flex vertical gap={4} style={{ minWidth: 280, flex: '1 1 280px' }}>
                                        <Text type="secondary">Docente con conflicto operativo</Text>
                                        <Select
                                            showSearch
                                            allowClear
                                            placeholder="Elegí un docente…"
                                            optionFilterProp="label"
                                            value={docenteId ?? undefined}
                                            onChange={(v) => setDocenteId(v ?? null)}
                                            options={docenteOptions}
                                            style={{ width: '100%' }}
                                        />
                                    </Flex>
                                    {gestionVigente ? (
                                        <Text type="secondary">
                                            Gestión:{' '}
                                            <Text strong>
                                                {gestionVigente.nombre || gestionVigente.gestion || gestionVigente.id}
                                            </Text>
                                        </Text>
                                    ) : null}
                                </Flex>

                                {error ? <Alert type="error" showIcon title={error} /> : null}

                                {!docenteId ? (
                                    <Text type="secondary">
                                        Elegí un docente del listado o abrí esta pantalla desde el panel lateral del
                                        tablero de horarios.
                                    </Text>
                                ) : null}

                                {docenteId && grilla?.paresConflicto?.length ? (
                                    <div>
                                        <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                            Pares en conflicto ({grilla.paresConflicto.length})
                                        </Text>
                                        <Flex vertical gap={4}>
                                            {grilla.paresConflicto.map((p, i) => (
                                                <Text key={`par-${i}`} type="secondary">
                                                    {p.descripcion || `${p.siglaA} ↔ ${p.siglaB}`}
                                                </Text>
                                            ))}
                                        </Flex>
                                    </div>
                                ) : null}

                                {docenteId && !loading && !error ? (
                                    <HorariosConflictosPlanSection
                                        schedules={draftSchedules}
                                        onSchedulesChange={setDraftSchedules}
                                        bloquesEnConflicto={bloquesEnConflictoSet}
                                        onRequestPersist={onRequestPersist}
                                        validatePlacement={validatePlacement}
                                        persistLoading={persistLoading}
                                    />
                                ) : null}
                            </Flex>
                        </Card>
                    </Flex>
                </div>
            </Spin>
        </PageTemplate>
    );
};

export default GestionHorariosConflictosPage;
