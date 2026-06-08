import { useMemo } from 'react';
import { Alert, Flex, Spin, Tabs, Typography } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader, ListPanelHeader } from '@molecules';
import { useHorariosConflictosContext } from '@application-institucional/horarios/hooks/context/useHorariosConflictosContext';
import {
    isParaleloGestionHorarioEditable,
    isParaleloGestionPlanSemanalEditable,
} from '@application-institucional/horarios/utils/paraleloGestionHorarioEditable';
import HorariosConflictosPlanSection from '../components/organisms/HorariosConflictosPlanSection';
import ParaleloArmadoPlanSection from '../components/organisms/ParaleloArmadoPlanSection';
import '@configuracion/academico/styles/academico-form-page.css';
import '@presentation/styles/pages/detail-page.css';
import '../styles/gestion-horarios-page.css';

const { Paragraph, Text } = Typography;

const wrapTabPanel = (node) => (
    <div className="cfg-academico-tab-panel horarios-conflictos-tab-panel">{node}</div>
);

const GestionHorariosConflictosPage = () => {
    const {
        docenteId,
        docentesConConflictos,
        gestionVigente,
        loading,
        error,
        grilla,
        docenteDraftSchedules,
        conflictHorarioIds,
        horarioSlotIndex,
        paraleloStates,
        setParaleloDraftSchedules,
        persistLoading,
        onRequestPersist,
        validatePlacement,
        handleVolver,
        breadcrumbItems,
        pageTitle,
        vistaActivaKey,
        vistaOpciones,
        setVistaModo,
        turnoEfectivo,
        conflictoResuelto,
    } = useHorariosConflictosContext();

    const docenteNombre =
        grilla?.docenteNombre ||
        (docentesConConflictos || []).find((d) => Number(d.docenteId) === Number(docenteId))?.docenteNombre ||
        (docenteId ? `Docente #${docenteId}` : null);

    const gestionLabel = gestionVigente
        ? gestionVigente.nombre || gestionVigente.gestion || gestionVigente.id
        : null;

    const workspaceActions = (
        <button type="button" className="sd-btn sd-btn--outline" onClick={handleVolver}>
            <ArrowLeftOutlined /> Volver
        </button>
    );

    const workspaceDescription = useMemo(() => {
        if (conflictoResuelto) {
            return [
                docenteNombre ? `Docente: ${docenteNombre}` : null,
                gestionLabel ? `Gestión: ${gestionLabel}` : null,
                'No quedan solapes de horario para este docente en la gestión vigente.',
            ]
                .filter(Boolean)
                .join(' · ');
        }
        const partes = [];
        if (docenteId && docenteNombre) {
            partes.push(`Docente con conflicto operativo: ${docenteNombre}`);
        }
        if (gestionLabel) {
            partes.push(`Gestión: ${gestionLabel}`);
        }
        partes.push(
            'Las celdas en rojo marcan la misma franja horaria en choque. Reubicá un bloque en la pestaña del paralelo y guardá para resolver el solape.',
        );
        return partes.join(' · ');
    }, [conflictoResuelto, docenteId, docenteNombre, gestionLabel]);

    const docentePlanPanel = useMemo(
        () => (
            <HorariosConflictosPlanSection
                schedules={docenteDraftSchedules}
                onSchedulesChange={() => { }}
                conflictHorarioIds={conflictHorarioIds}
                horarioSlotIndex={horarioSlotIndex}
                editable={false}
                showSave={false}
                turnoLabel={turnoEfectivo}
                headerMinimal
                docenteConflictMode={!conflictoResuelto}
            />
        ),
        [
            docenteDraftSchedules,
            conflictHorarioIds,
            horarioSlotIndex,
            turnoEfectivo,
            conflictoResuelto,
        ],
    );

    const tabItems = useMemo(() => {
        if (!docenteId) return [];

        return vistaOpciones.map((opcion) => {
            const isDocente = opcion.key === 'docente';
            const pgId = isDocente ? null : Number(opcion.key);
            const paraleloState = pgId != null ? paraleloStates[pgId] : null;
            const schedules = isDocente
                ? docenteDraftSchedules
                : (paraleloState?.draftSchedules ?? []);
            const turnoLabel = isDocente
                ? turnoEfectivo
                : (paraleloState?.turno ?? turnoEfectivo);

            const estadoPg = paraleloState?.paraleloGestionEstado ?? null;
            const planEditable = isParaleloGestionPlanSemanalEditable(estadoPg);
            const horEditable = isParaleloGestionHorarioEditable(estadoPg);

            const panelLoading = !isDocente && Boolean(paraleloState?.loading);
            const panelError = !isDocente ? paraleloState?.error : null;

            return {
                key: String(opcion.key),
                label: (
                    <span className="sd-tab-label">
                        {isDocente ? <UserOutlined /> : <TeamOutlined />}
                        {opcion.label}
                    </span>
                ),
                children: wrapTabPanel(
                    panelLoading ? (
                        <Flex justify="center" style={{ padding: 24 }}>
                            <Spin tip="Cargando grilla…" />
                        </Flex>
                    ) : panelError ? (
                        <Alert type="error" showIcon title={panelError} />
                    ) : isDocente ? (
                        docentePlanPanel
                    ) : (
                        <ParaleloArmadoPlanSection
                            schedules={schedules}
                            onSchedulesChange={(updater) => setParaleloDraftSchedules(pgId, updater)}
                            editable={planEditable}
                            allowDelete={horEditable}
                            soloReubicacion={planEditable && !horEditable}
                            turnoLabel={turnoLabel}
                            persistLoading={persistLoading}
                            onRequestPersist={() => onRequestPersist(pgId)}
                            validatePlacement={validatePlacement}
                            conflictHorarioIds={conflictHorarioIds}
                            horarioSlotIndex={horarioSlotIndex}
                            docenteConflictMode
                            headerMinimal
                        />
                    ),
                ),
            };
        });
    }, [
        docenteId,
        vistaOpciones,
        paraleloStates,
        docenteDraftSchedules,
        turnoEfectivo,
        conflictHorarioIds,
        horarioSlotIndex,
        setParaleloDraftSchedules,
        persistLoading,
        onRequestPersist,
        validatePlacement,
        docentePlanPanel,
    ]);

    const soloVistaDocente = tabItems.length === 1;

    return (
        <PageTemplate
            header={<PageHeader title={pageTitle} breadcrumbItems={breadcrumbItems} actions={workspaceActions} />}
            sidebar={null}
        >
            <Spin spinning={loading} size="large" tip="Cargando grilla…">
                <div className="sd sd-spin-body horarios-conflictos-page">
                    {error ? (
                        <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />
                    ) : null}

                    {!docenteId ? (
                        <Text type="secondary">
                            Abrí esta pantalla desde el panel lateral del tablero de horarios.
                        </Text>
                    ) : null}

                    {conflictoResuelto ? (
                        <Alert
                            type="success"
                            showIcon
                            icon={<CheckCircleOutlined />}
                            title="El docente ya no tiene choques de horario en esta gestión"
                            description="Podés volver al tablero de horarios o revisar la grilla semanal del docente abajo."
                        />
                    ) : null}

                    {docenteId ? (
                        <section className="cfg-academico-workspace horarios-conflictos-workspace">
                            <header className="cfg-academico-workspace__header">
                                <ListPanelHeader
                                    title={
                                        conflictoResuelto
                                            ? 'Conflicto resuelto'
                                            : 'Resolver conflictos de horario'
                                    }
                                />
                                <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                                    {workspaceDescription}
                                </Paragraph>
                            </header>

                            {soloVistaDocente ? (
                                wrapTabPanel(docentePlanPanel)
                            ) : (
                                <div className="sd-tabs-shell cfg-academico-tabs-shell">
                                    <Tabs
                                        className="sd-tabs cfg-academico-workspace__tabs horarios-conflictos-workspace__tabs"
                                        activeKey={vistaActivaKey}
                                        onChange={(key) =>
                                            setVistaModo(key === 'docente' ? 'docente' : Number(key))
                                        }
                                        items={tabItems}
                                        destroyOnHidden={false}
                                    />
                                </div>
                            )}
                        </section>
                    ) : null}
                </div>
            </Spin>
        </PageTemplate>
    );
};

export default GestionHorariosConflictosPage;
