import { Alert, Button, Flex, Segmented, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { MainContent, InfoSidebar, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { allSpacing } from '@theme/tokens';
import { useOfertaParalelosGestionState } from '@application-institucional/oferta';
import { DashboardPageShell } from '@presentation/modules/dashboard/components/organisms';
import '@presentation/styles/pages/detail-page.css';
import '../styles/oferta-academica-page.css';
import {
  OfertaAlertBanner,
  OfertaKpiStrip,
  OfertaSidebarResumen,
  OfertaStepParalelosSection,
  ParaleloGestionDrawer,
} from '../components';

const FILTRO_OPCIONES = [
  { label: 'Todos', value: 'todos' },
  { label: 'Pendientes', value: 'pendientes' },
  { label: 'Listos', value: 'listos' },
  { label: 'Oferta incompleta', value: 'sin_docente' },
];

const OfertaParalelosGestionPage = () => {
  const s = useOfertaParalelosGestionState();

  const breadcrumbItems = [
    { title: 'Inicio', href: '/' },
    { title: 'Institucional', href: '/institucional' },
    { title: 'Oferta Académica', href: '/institucional/oferta' },
    { title: s.gestionSeleccionada?.codigo ?? 'Gestión' },
    { title: s.planSeleccionado?.carreraCodigo ?? s.planSeleccionado?.carreraNombre ?? 'Plan' },
    { title: 'Paralelos' },
  ];

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title={s.pageTitle}
          breadcrumbItems={breadcrumbItems}
          actions={
            <Button icon={<ArrowLeftOutlined />} onClick={s.navigateBack}>
              Volver
            </Button>
          }
        />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Spin spinning={s.apiLoading} tip="Cargando paralelos...">
            <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
              {s.apiError ? <Alert type="error" showIcon message={s.apiError} /> : null}

              <OfertaAlertBanner step={2} kpis={s.kpis} gestionVigente />

              <OfertaKpiStrip kpis={s.kpis} variant="details" />

              <Segmented
                options={FILTRO_OPCIONES}
                value={s.filtroRapido}
                onChange={s.setFiltroRapido}
              />

              <OfertaStepParalelosSection
                loading={s.apiLoading}
                paralelosGestion={s.paralelosGestion}
                planSeleccionado={s.planSeleccionado}
                coberturaByParaleloId={{}}
                onGenerarParalelos={s.onGenerarParalelos}
                onPasarTodosOfertado={s.onPasarTodosOfertado}
                onNavigateDetalle={s.onNavigateDetalle}
              />
            </Flex>
          </Spin>
        </MainContent>

        <InfoSidebar>
          <OfertaSidebarResumen
            gestionSeleccionada={s.gestionSeleccionada}
            planSeleccionado={s.planSeleccionado}
            kpis={s.kpis}
            step={2}
          />
          <OfertaKpiStrip kpis={s.kpis} variant="total" />
        </InfoSidebar>
      </DashboardPageShell>

      <ParaleloGestionDrawer
        open={Boolean(s.drawerParaleloId)}
        paraleloId={s.drawerParaleloId}
        detalle={s.drawerDetalle}
        ofertaCursos={s.drawerOfertaCursos}
        asignaturasFaltantes={s.validacionPorId[s.drawerParaleloId]?.faltantes ?? []}
        aulas={s.aulas}
        onClose={s.closeDrawer}
        onRefresh={async () => {
          if (s.drawerParaleloId) {
            await s.openDrawer(s.drawerParaleloId);
            await s.loadParalelosGestion();
          }
        }}
        crearOfertaCursoManual={s.crearOfertaCursoManual}
        eliminarOfertaCurso={s.eliminarOfertaCurso}
        updateParaleloGestion={s.updateParaleloGestion}
      />
    </Flex>
  );
};

export default OfertaParalelosGestionPage;
