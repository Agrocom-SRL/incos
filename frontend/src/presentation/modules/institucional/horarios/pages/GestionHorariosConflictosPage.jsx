import { useMemo } from 'react';
import { Alert, Flex, Spin, Tabs, Typography } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader, ListPanelHeader } from '@molecules';
import { Spinner } from '@atoms';
import { useHorariosConflictosContext } from '@application-institucional/horarios/hooks/context/useHorariosConflictosContext';
import {
    conflictHorarioIdsForParaleloTab,
    solapeParaleloHorarioKeySet,
} from '@application-institucional/horarios/utils/resolveParalelosTabsConflicto';
import { buildBulkAsignacionHorarioItems } from '@application-institucional/horarios/utils/buildBulkAsignacionHorarioItems';
import {
    ayudaConflictoParalelo,
    buildBloqueMateriaNombreMap,
    lineasConflictoDocente,
} from '@application-institucional/horarios/utils/conflictoGuia';
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

    const solapeParaleloHorarioKeys = useMemo(
        () => solapeParaleloHorarioKeySet(grilla?.solapeParaleloHorarioKeys ?? []),
        [grilla?.solapeParaleloHorarioKeys],
    );

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
            'Las celdas en rojo marcan la misma franja horaria en choque. Reubique un bloque en la pestaña del paralelo y guarde para resolver el solape.',
        );
        return partes.join(' · ');
    }, [conflictoResuelto, docenteId, docenteNombre, gestionLabel]);

    const paresConflicto = useMemo(() => grilla?.paresConflicto ?? [], [grilla?.paresConflicto]);

    const bloqueNombreMap = useMemo(() => {
        const listasParalelo = Object.values(paraleloStates || {}).map(
            (s) => s?.draftSchedules ?? [],
        );
        return buildBloqueMateriaNombreMap(docenteDraftSchedules, ...listasParalelo);
    }, [docenteDraftSchedules, paraleloStates]);

    const lineasDocente = useMemo(
        () => lineasConflictoDocente(paresConflicto, bloqueNombreMap),
        [paresConflicto, bloqueNombreMap],
    );

    const docentePlanPanel = useMemo(
        () => (
            <Flex vertical gap={12}>
                {!conflictoResuelto ? (
                    <Alert
                        type="info"
                        showIcon
                        title="Esta vista del docente es de solo lectura"
                        description={
                            <>
                                Muestra la semana completa del docente; las celdas en rojo son las
                                franjas en choque. El choque se resuelve en las pestañas de paralelo de
                                arriba: abra una y mueva uno de los bloques en rojo a una franja libre.
                                {lineasDocente.length ? (
                                    <ul style={{ margin: '8px 0 0', paddingInlineStart: 18 }}>
                                        {lineasDocente.map((linea, idx) => (
                                            <li key={idx}>{linea}</li>
                                        ))}
                                    </ul>
                                ) : null}
                            </>
                        }
                    />
                ) : null}
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
            </Flex>
        ),
        [
            docenteDraftSchedules,
            conflictHorarioIds,
            horarioSlotIndex,
            turnoEfectivo,
            conflictoResuelto,
            lineasDocente,
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

            const dirtyParalelo =
                isDocente || !paraleloState
                    ? false
                    : (() => {
                          const { items } = buildBulkAsignacionHorarioItems(
                              paraleloState.serverSchedules ?? [],
                              paraleloState.draftSchedules ?? [],
                              paraleloState.horarioSlotIndex ?? null,
                          );
                          const relevantes = horEditable
                              ? items
                              : items.filter((it) => String(it.op).toLowerCase() === 'update');
                          return relevantes.length > 0;
                      })();

            const conflictIdsParalelo = (() => {
                const scoped = conflictHorarioIdsForParaleloTab(
                    pgId,
                    grilla?.paresConflicto ?? [],
                    solapeParaleloHorarioKeys,
                );
                return scoped.size > 0 ? scoped : conflictHorarioIds;
            })();

            const autoAyudaPorSlot =
                isDocente || conflictoResuelto
                    ? null
                    : ayudaConflictoParalelo(paresConflicto, pgId, bloqueNombreMap).reduce(
                          (map, r) => {
                              const nodo = (
                                  <span>
                                      <strong>{r.miNombre}</strong> choca con{' '}
                                      <strong>{r.otroNombre}</strong>
                                      {r.otroParalelo ? ` (paralelo ${r.otroParalelo})` : ''} ·{' '}
                                      {r.franja}. Para resolverlo: mueva este bloque a una franja
                                      libre, intercámbielo con otra materia, o elimínelo; luego
                                      guarde.
                                  </span>
                              );
                              map.set(r.slotKey, map.has(r.slotKey) ? map.get(r.slotKey) : nodo);
                              return map;
                          },
                          new Map(),
                      );
            const autoAyudaVisible = !isDocente && String(opcion.key) === vistaActivaKey;

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
                            <Spinner size="default" text="Cargando grilla…" />
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
                            conflictHorarioIds={conflictIdsParalelo}
                            horarioSlotIndex={horarioSlotIndex}
                            docenteConflictMode
                            headerMinimal
                            dirty={dirtyParalelo}
                            autoAyudaPorSlot={autoAyudaPorSlot}
                            autoAyudaVisible={autoAyudaVisible}
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
        solapeParaleloHorarioKeys,
        grilla?.paresConflicto,
        paresConflicto,
        bloqueNombreMap,
        vistaActivaKey,
        conflictoResuelto,
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
                            Abra esta pantalla desde el panel lateral del tablero de horarios.
                        </Text>
                    ) : null}

                    {conflictoResuelto ? (
                        <Alert
                            type="success"
                            showIcon
                            icon={<CheckCircleOutlined />}
                            title="El docente ya no tiene choques de horario en esta gestión"
                            description="Puede volver al tablero de horarios o revisar la grilla semanal del docente abajo."
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
