import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarOutlined, ScheduleOutlined } from '@ant-design/icons';
import { Alert, Card, Flex, Modal, Select, Spin } from 'antd';
import { MainContent, InfoSidebar, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton } from '@atoms';
import { allSpacing, allColors, componentConfig, shadows } from '@theme/tokens';
import { useOfertaAcademicaWizardState } from '@application-institucional/oferta';
import { DashboardPageShell } from '@presentation/modules/dashboard/components/organisms';
import '@presentation/styles/pages/detail-page.css';
import '../styles/oferta-academica-page.css';
import {
  OfertaAlertBanner,
  OfertaFlowSteps,
  OfertaKpiStrip,
  OfertaOperativaBanner,
  OfertaSidebarResumen,
  OfertaStepGestionSection,
  OfertaStepPlanesSection,
  OfertaStepParalelosSection,
  ParaleloGestionDrawer,
} from '../components';

const sectionCardProps = {
  className: 'oferta-wizard-card',
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

const STEP_TITLES = [
  'Paso 1 — Gestión académica',
  'Paso 2 — Planes habilitados',
  'Paso 3 — Paralelos y oferta',
];

const OfertaAcademicaWizardPage = () => {
  const w = useOfertaAcademicaWizardState();
  const navigate = useNavigate();

  const breadcrumbItems = [
    { title: 'Inicio', href: '/' },
    { title: 'Institucional', href: '/institucional' },
    { title: 'Oferta Académica' },
  ];

  const stepExtra = useMemo(() => {
    if (w.step === 1) {
      return (
        <ActionButton
          permiso="institucional.oferta.gestion-plan"
          accion="CREAR"
          onClick={w.openHabilitarPlanModal}
          disabled={!w.selectedGestionId}
        >
          Habilitar plan
        </ActionButton>
      );
    }
    if (w.step === 2) {
      return null;
    }
    return null;
  }, [w.step, w.selectedGestionId, w.openHabilitarPlanModal]);

  const stepCardTitle = useMemo(() => {
    const base = STEP_TITLES[w.step] ?? STEP_TITLES[0];
    if (w.step === 2 && w.planSeleccionado) {
      return `${base} (plan #${w.planSeleccionado.planEstudioId})`;
    }
    return base;
  }, [w.step, w.planSeleccionado]);

  const paralelosColumnsCtx = useMemo(
    () => ({
      turnos: w.TURNOS,
      aulas: w.aulas,
      validacionPorId: w.validacionPorId,
      onCambiarTurno: w.onCambiarTurno,
      onUpdateAula: w.onUpdateAula,
      onGenerarOferta: w.onGenerarOferta,
      onOpenDrawer: w.openDrawer,
      onPasarOfertado: w.onPasarOfertado,
    }),
    [
      w.TURNOS,
      w.aulas,
      w.validacionPorId,
      w.onCambiarTurno,
      w.onUpdateAula,
      w.onGenerarOferta,
      w.openDrawer,
      w.onPasarOfertado,
    ]
  );

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title={w.pageTitle}
          breadcrumbItems={breadcrumbItems}
          actions={
            <Flex wrap="wrap" gap={allSpacing.marginSM} justify="flex-end">
              <ActionButton
                permiso="institucional.gestion.horarios"
                accion="LISTAR"
                variant="default"
                icon={<ScheduleOutlined />}
                onClick={() => navigate('/institucional/horarios')}
              >
                Gestión de horarios
              </ActionButton>
              <ActionButton
                permiso="institucional.oferta.gestion-plan"
                accion="ACTIVAR"
                variant="primary"
                icon={<CalendarOutlined />}
                disabled={!w.selectedGestionId}
                onClick={w.onMarcarVigente}
              >
                Marcar vigente
              </ActionButton>
            </Flex>
          }
        />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Spin spinning={w.apiLoading} tip="Cargando oferta académica...">
            <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
              {w.apiError ? <Alert type="error" showIcon title={w.apiError} /> : null}

              <OfertaOperativaBanner />

              <OfertaAlertBanner
                step={w.step}
                kpis={w.kpis}
                gestionVigente={w.gestionSeleccionada?.vigente}
                onGoToPlanes={() => w.goToStep(1)}
              />

              <OfertaFlowSteps
                currentStep={w.step}
                canGoToStep={w.canGoToStep}
                onGoToStep={w.goToStep}
              />

              <OfertaKpiStrip kpis={w.kpis} variant="details" />

              <Card title={stepCardTitle} extra={stepExtra} {...sectionCardProps}>
                {w.step === 0 ? (
                  <OfertaStepGestionSection
                    gestiones={w.gestiones}
                    selectedGestionId={w.selectedGestionId}
                    gestionSeleccionada={w.gestionSeleccionada}
                    onSelectGestion={w.setSelectedGestionId}
                    onMarcarVigente={w.onMarcarVigente}
                    onContinuar={() => w.setStep(1)}
                  />
                ) : null}

                {w.step === 1 ? (
                  <OfertaStepPlanesSection
                    loading={w.apiLoading}
                    planesHabilitados={w.planesHabilitados}
                    onSelectPlan={w.selectPlanYContinuar}
                  />
                ) : null}

                {w.step === 2 ? (
                  <OfertaStepParalelosSection
                    loading={w.apiLoading}
                    paralelosGestion={w.paralelosGestion}
                    planSeleccionado={w.planSeleccionado}
                    columnsCtx={paralelosColumnsCtx}
                    onGenerarParalelos={w.onGenerarParalelos}
                    onPasarTodosOfertado={w.onPasarTodosOfertado}
                    onOpenDrawer={w.openDrawer}
                  />
                ) : null}
              </Card>
            </Flex>
          </Spin>
        </MainContent>

        <InfoSidebar>
          <OfertaSidebarResumen
            gestionSeleccionada={w.gestionSeleccionada}
            planSeleccionado={w.planSeleccionado}
            kpis={w.kpis}
            step={w.step}
          />
          <OfertaKpiStrip kpis={w.kpis} variant="total" />
        </InfoSidebar>
      </DashboardPageShell>

      <Modal
        title="Habilitar plan de estudio"
        open={w.modalHabilitarPlan}
        onCancel={() => w.setModalHabilitarPlan(false)}
        footer={null}
        destroyOnClose
      >
        <Select
          showSearch
          placeholder="Plan vigente"
          style={{ width: '100%' }}
          optionFilterProp="label"
          options={w.planesVigentes
            .filter((p) => p.vigente !== false)
            .map((p) => ({
              value: p.id,
              label: p.nombre ?? p.codigo ?? `Plan #${p.id}`,
            }))}
          onChange={(planId) => w.onHabilitarPlan(planId)}
        />
      </Modal>

      <ParaleloGestionDrawer
        open={Boolean(w.drawerParaleloId)}
        paraleloId={w.drawerParaleloId}
        detalle={w.drawerDetalle}
        ofertaCursos={w.drawerOfertaCursos}
        asignaturasFaltantes={w.validacionPorId[w.drawerParaleloId]?.faltantes ?? []}
        aulas={w.aulas}
        onClose={w.closeDrawer}
        onRefresh={async () => {
          if (w.drawerParaleloId) {
            await w.openDrawer(w.drawerParaleloId);
            await w.loadParalelosGestion();
          }
        }}
        crearOfertaCursoManual={w.crearOfertaCursoManual}
        eliminarOfertaCurso={w.eliminarOfertaCurso}
        updateParaleloGestion={w.updateParaleloGestion}
      />
    </Flex>
  );
};

export default OfertaAcademicaWizardPage;
