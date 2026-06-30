/**
 * Listado de pagos de aporte (Finanzas · FIN-PAG · LISTAR).
 *
 * Lenguaje visual de LicenciasListPage / CarrerasList: shell
 * Flex.page-container → PageHeaderArea(PageHeader) → DashboardPageShell → MainContent
 * → section.cfg-academico-workspace (ListPanelHeader + lede) → TableListView embedded.
 * El ESTADO del pago vive bajo el nombre del estudiante (PagoEstudianteCell), no en
 * columna propia.
 *
 * Página "dumb": solo compone template + organismos y consume el hook de pantalla.
 * No hace fetch ni orquesta (eso vive en provider + hooks/state).
 */

import { Flex, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { TableListView } from '@organisms';
import { ActionButton } from '@atoms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { usePagosListPage } from '@application-finanzas/hooks/state/usePagosListPage';
import { FINANZAS_PERMISOS } from '@application-finanzas/utils/finanzasPermisos';
import { allSpacing } from '@theme/tokens';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';
import '@finanzas/pagos/styles/pagos-list.css';

const { Paragraph } = Typography;

const PagosList = () => {
  const {
    pagos,
    loading,
    error,
    searchText,
    tableColumns,
    breadcrumbItems,
    handleRegistrar,
    handleSearchChange,
    tablePagination,
  } = usePagosListPage();

  const registrarAction = (
    <ActionButton
      permiso={FINANZAS_PERMISOS.pagoRegistrar}
      accion="CREAR"
      variant="primary"
      icon={<PlusOutlined />}
      onClick={handleRegistrar}
    >
      Registrar pago
    </ActionButton>
  );

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader title="Pagos de aporte" breadcrumbItems={breadcrumbItems} />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
            <section className="cfg-academico-workspace">
              <header className="cfg-academico-workspace__header">
                <ListPanelHeader title="Listado de pagos" actions={registrarAction} />
                <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                  Aportes académicos por estudiante y gestión: monto obligatorio, descuentos por
                  beca, total pagado y saldo pendiente. El estado del aporte aparece bajo el nombre
                  del estudiante.
                </Paragraph>
              </header>
              <div className="cfg-academico-tab-panel">
                <TableListView
                  embedded
                  tableClassName="fin-planilla"
                  data={pagos}
                  loading={loading}
                  error={error}
                  searchText={searchText}
                  onSearchChange={handleSearchChange}
                  searchPlaceholder="Buscar por estudiante, código o gestión…"
                  columns={tableColumns}
                  rowKey={(record) => record.id}
                  searchColSpan={10}
                  searchStyle={{ maxWidth: 520 }}
                  pagination={tablePagination}
                  loadingTip="Cargando pagos…"
                />
              </div>
            </section>
          </Flex>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default PagosList;
