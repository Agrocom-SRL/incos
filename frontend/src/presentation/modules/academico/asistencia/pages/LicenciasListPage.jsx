/**
 * Listado de licencias estudiantiles (ACA-ASI-LIC · LISTAR).
 * Header de página con breadcrumb + botón "Volver" (regresa al calendario del curso de donde
 * se entró, vía location.state.returnPath). Tabla con el lenguaje visual de CarrerasList.
 * La carga/decisión/cancelación vive en LicenciasProvider; la interacción en useLicenciasListPage.
 */

import { Flex, Select, Typography } from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { TableListView } from '@organisms';
import { ActionButton, BackButton, Text } from '@atoms';
import { DashboardPageShell } from '@presentation/modules/dashboard/components/organisms';
import { allSpacing } from '@theme/tokens';
import { createBreadcrumbItems } from '@presentation-utils/breadcrumbs/breadcrumbUtils';
import { useLicenciasListPage } from '@application-academico/asistencia/hooks/state/useLicenciasListPage.js';
import { ASISTENCIA_PERMISOS } from '@application-academico/asistencia/utils/asistenciaPermisos.js';
import { ESTADO_LICENCIA_OPTIONS } from '@application-academico/asistencia/utils/licenciasEstados.js';
import {
  ASISTENCIA_PATH,
  LICENCIA_SOLICITAR_PATH,
} from '@application-academico/asistencia/utils/asistenciaPaths.js';
import LicenciaDecisionDrawer from '@academico/asistencia/components/LicenciaDecisionDrawer.jsx';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';
import '../styles/licencias.css';

const { Paragraph } = Typography;

const TODOS_ESTADOS = '__TODOS__';

const LicenciasListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnPath = location.state?.returnPath || ASISTENCIA_PATH;

  const breadcrumbItems = useMemo(
    () => createBreadcrumbItems('ACA-ASI-LIC', 'ACA-ASI', null),
    [],
  );

  const {
    licencias,
    loading,
    error,
    estado,
    setEstado,
    searchText,
    handleSearchChange,
    tableColumns,
    puedeDecidir,
    puedeCancelar,
    drawerAbierto,
    licenciaActiva,
    cerrarDrawer,
    confirmarDecision,
    onCancelar,
    decidiendo,
    cancelando,
  } = useLicenciasListPage();

  const headerActions = (
    <Flex gap={allSpacing.marginSM} align="center" wrap="wrap" justify="flex-end">
      <Flex gap={allSpacing.marginXS} align="center">
        <Text type="secondary">Estado</Text>
        <Select
          value={estado ?? TODOS_ESTADOS}
          onChange={(value) => setEstado(value === TODOS_ESTADOS ? undefined : value)}
          style={{ minWidth: 180 }}
          options={[{ value: TODOS_ESTADOS, label: 'Todos los estados' }, ...ESTADO_LICENCIA_OPTIONS]}
        />
      </Flex>
      <ActionButton
        permiso={ASISTENCIA_PERMISOS.licenciaCrear}
        accion="CREAR"
        variant="primary"
        icon={<PlusOutlined />}
        onClick={() => navigate(LICENCIA_SOLICITAR_PATH)}
      >
        Solicitar licencia
      </ActionButton>
    </Flex>
  );

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title="Licencias estudiantiles"
          breadcrumbItems={breadcrumbItems}
          actions={
            <BackButton icon={<ArrowLeftOutlined />} onClick={() => navigate(returnPath)}>
              Volver
            </BackButton>
          }
        />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
            <section className="cfg-academico-workspace">
              <header className="cfg-academico-workspace__header">
                <ListPanelHeader title="Licencias estudiantiles" actions={headerActions} />
                <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                  Solicitudes de licencia de los estudiantes: carrera y paralelo, periodo, motivo y
                  estado de aprobación. El tope es de 15 días por gestión.
                </Paragraph>
              </header>
              <div className="cfg-academico-tab-panel">
                <TableListView
                  embedded
                  data={licencias}
                  loading={loading}
                  error={error}
                  searchText={searchText}
                  onSearchChange={handleSearchChange}
                  searchPlaceholder="Buscar por estudiante…"
                  columns={tableColumns}
                  rowKey={(record) => record.id}
                  searchColSpan={10}
                  searchStyle={{ maxWidth: 520 }}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total: ${total} licencias`,
                    pageSizeOptions: ['10', '20', '50', '100'],
                  }}
                  loadingTip="Cargando licencias…"
                />
              </div>
            </section>
          </Flex>
        </MainContent>
      </DashboardPageShell>

      <LicenciaDecisionDrawer
        open={drawerAbierto}
        licencia={licenciaActiva}
        puedeDecidir={puedeDecidir}
        puedeCancelar={puedeCancelar}
        guardando={decidiendo}
        cancelando={cancelando}
        onCerrar={cerrarDrawer}
        onDecidir={confirmarDecision}
        onCancelar={onCancelar}
      />
    </Flex>
  );
};

export default LicenciasListPage;
