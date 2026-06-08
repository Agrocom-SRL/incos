import { Alert, Card, Flex, Segmented, Spin, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton } from '@atoms';
import { allColors, allSpacing, componentConfig, shadows } from '@theme/tokens';
import { useHorariosConflictosContext } from '@application-institucional/horarios/hooks/context/useHorariosConflictosContext';
import { buildOfertaParaleloDetalleFromHorarios } from '@application-institucional/horarios/config/paths';
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
    const navigate = useNavigate();
    const {
        docenteId,
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
        vistaActivaKey,
        vistaActivaLabel,
        vistaOpciones,
        setVistaModo,
        turnoVistaActiva,
        paralelosInvolucrados,
        isParaleloVista,
    } = useHorariosConflictosContext();

    const docenteNombre =
        grilla?.docenteNombre ||
        (docentesConConflictos || []).find((d) => Number(d.docenteId) === Number(docenteId))?.docenteNombre ||
        (docenteId ? `Docente #${docenteId}` : null);

    const headerActions = (
        <button type="button" className="sd-btn sd-btn--outline" onClick={handleVolver}>
            <ArrowLeftOutlined /> Volver
        </button>
    );

    const vistaHint = isParaleloVista
        ? 'Vista del paralelo completo: todas las materias y docentes. Reubicá o intercambiá bloques dentro de este paralelo.'
        : 'Vista agregada del docente en todos sus paralelos. Reubicá según disponibilidad o cambiá a vista de paralelo para intercalar con otras materias.';

    return (
        <PageTemplate
            header={<PageHeader title={pageTitle} breadcrumbItems={breadcrumbItems} actions={headerActions} />}
            sidebar={null}
        >
            <Spin spinning={loading} size="large" tip="Cargando grilla…">
                <div className="sd sd-spin-body horarios-conflictos-page">
                    <Flex vertical gap={allSpacing.marginLG}>
                        <Alert
                            type="info"
                            showIcon
                            title="Tres formas de resolver"
                            description={
                                <Flex vertical gap={4}>
                                    <Text>
                                        1. <Text strong>Reubicar</Text> — mové un bloque en rojo a otra franja libre
                                        (vista docente o paralelo).
                                    </Text>
                                    <Text>
                                        2. <Text strong>Intercambiar</Text> — en vista paralelo, soltá un bloque sobre
                                        otro del mismo paralelo para permutar horarios.
                                    </Text>
                                    <Text>
                                        3. <Text strong>Cambiar docente</Text> — si la misma persona no puede dictar
                                        dos materias a la vez, reasigná en Oferta académica.
                                    </Text>
                                </Flex>
                            }
                        />

                        <Card {...sectionCardProps}>
                            <Flex vertical gap={allSpacing.marginMD}>
                                <Flex wrap="wrap" gap={allSpacing.marginMD} align="flex-end">
                                    {docenteId && docenteNombre ? (
                                        <Flex vertical gap={4} style={{ minWidth: 280, flex: '1 1 280px' }}>
                                            <Text type="secondary">Docente con conflicto operativo</Text>
                                            <Text strong>{docenteNombre}</Text>
                                        </Flex>
                                    ) : null}
                                    {gestionVigente ? (
                                        <Text type="secondary">
                                            Gestión:{' '}
                                            <Text strong>
                                                {gestionVigente.nombre || gestionVigente.gestion || gestionVigente.id}
                                            </Text>
                                        </Text>
                                    ) : null}
                                </Flex>

                                {vistaOpciones.length > 1 ? (
                                    <Flex vertical gap={allSpacing.marginSM}>
                                        <Text type="secondary">Modo de grilla</Text>
                                        <Segmented
                                            value={vistaActivaKey}
                                            onChange={(key) =>
                                                setVistaModo(key === 'docente' ? 'docente' : Number(key))
                                            }
                                            options={vistaOpciones.map((o) => ({
                                                label: o.label,
                                                value: o.key,
                                            }))}
                                        />
                                    </Flex>
                                ) : null}

                                {paralelosInvolucrados.length ? (
                                    <Flex wrap="wrap" gap={allSpacing.marginSM}>
                                        {paralelosInvolucrados.map((p) => (
                                            <ActionButton
                                                key={`oferta-pg-${p.paraleloGestionId}`}
                                                permiso="institucional.oferta.paralelo-gestion"
                                                accion="EDITAR"
                                                variant="secondary"
                                                onClick={() => {
                                                    const target = buildOfertaParaleloDetalleFromHorarios(
                                                        p.paraleloGestionId,
                                                    );
                                                    navigate(target.pathname, { state: target.state });
                                                }}
                                            >
                                                Oferta — {p.paraleloNombre || `Paralelo #${p.paraleloGestionId}`}
                                            </ActionButton>
                                        ))}
                                    </Flex>
                                ) : null}

                                {error ? <Alert type="error" showIcon title={error} /> : null}

                                {!docenteId ? (
                                    <Text type="secondary">
                                        Abrí esta pantalla desde el panel lateral del tablero de horarios.
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
                                        turnoLabel={turnoVistaActiva}
                                        vistaLabel={vistaActivaLabel}
                                        vistaHint={vistaHint}
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
