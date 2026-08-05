/**
 * Registro de ingresos (Finanzas · FIN-PAG · LISTAR).
 *
 * Lenguaje visual de LicenciasListPage / CarrerasList: shell
 * Flex.page-container → PageHeaderArea(PageHeader) → DashboardPageShell → MainContent
 * → section.cfg-academico-workspace (ListPanelHeader + lede) → TableListView embedded.
 *
 * Listado UNIFICADO de transacciones de ingreso (GET /api/v1/ingresos): une
 * aportes académicos y pagos de capacitación en un solo registro cronológico
 * (reemplaza al listado histórico de cabeceras agregadas por estudiante, que
 * ahora vive como reporte de solo lectura en Reportes → Cuentas por cobrar).
 * El ORIGEN de cada fila (Aporte/Capacitación) vive bajo el nombre de la
 * persona (IngresoPersonaCell), no en columna propia.
 *
 * Página "dumb": solo compone template + organismos y consume el hook de
 * pantalla. No hace fetch ni orquesta (eso vive en provider + hooks/state).
 */

import { Flex, Typography } from 'antd';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { TableListView } from '@organisms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { useIngresosListPage } from '@application-finanzas/hooks/state/useIngresosListPage';
import { allSpacing } from '@theme/tokens';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';
import '@finanzas/pagos/styles/pagos-list.css';

const { Paragraph } = Typography;

const PagosList = () => {
  const {
    ingresos,
    loading,
    error,
    searchText,
    tableColumns,
    breadcrumbItems,
    handleSearchChange,
    tablePagination,
  } = useIngresosListPage();

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader title="Registro de ingresos" breadcrumbItems={breadcrumbItems} />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
            <section className="cfg-academico-workspace">
              <header className="cfg-academico-workspace__header">
                <ListPanelHeader title="Ingresos registrados" />
                <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                  Transacciones de ingreso del instituto: aportes académicos y pagos de
                  capacitación en un mismo registro cronológico, con fecha, monto, método de
                  pago y N° de recibo. El origen de cada ingreso aparece bajo el nombre de la
                  persona.
                </Paragraph>
              </header>
              <div className="cfg-academico-tab-panel">
                <TableListView
                  embedded
                  data={ingresos}
                  loading={loading}
                  error={error}
                  searchText={searchText}
                  onSearchChange={handleSearchChange}
                  searchPlaceholder="Buscar por persona, código/CI o N° de recibo…"
                  columns={tableColumns}
                  rowKey={(record) => record.id}
                  searchColSpan={10}
                  searchStyle={{ maxWidth: 520 }}
                  pagination={tablePagination}
                  loadingTip="Cargando registro de ingresos…"
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
