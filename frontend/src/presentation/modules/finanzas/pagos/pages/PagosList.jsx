/**
 * Listado de pagos de aporte (Finanzas) — patrón CFG académico / Docentes.
 *
 * Página "dumb": solo compone template + organismos y consume el hook de
 * pantalla. No hace fetch ni orquesta (eso vive en provider + hooks/state).
 */

import { Flex, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { TableListView } from '@organisms';
import { ActionButton } from '@atoms';
import { usePagosListPage } from '@application-finanzas/hooks/state/usePagosListPage';
import { allSpacing } from '@theme/tokens';
import '@configuracion/academico/styles/academico-form-page.css';

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
      permiso="finanzas.pago.registrar"
      accion="CREAR"
      variant="primary"
      icon={<PlusOutlined />}
      onClick={handleRegistrar}
    >
      Registrar pago
    </ActionButton>
  );

  return (
    <PageTemplate
      header={<PageHeader breadcrumbItems={breadcrumbItems} />}
      sidebar={null}
    >
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        <section className="cfg-academico-workspace">
          <header className="cfg-academico-workspace__header">
            <ListPanelHeader title="Listado de pagos" actions={registrarAction} />
            <Paragraph type="secondary" className="cfg-academico-workspace__desc">
              Aportes académicos por estudiante y gestión: monto obligatorio, descuentos por beca,
              total pagado y saldo pendiente.
            </Paragraph>
          </header>
          <div className="cfg-academico-tab-panel">
            <TableListView
              embedded
              data={pagos}
              loading={loading}
              error={error}
              searchText={searchText}
              onSearchChange={handleSearchChange}
              searchPlaceholder="Buscar por estudiante, código o gestión..."
              columns={tableColumns}
              rowKey={(record) => record.id}
              searchColSpan={10}
              searchStyle={{ maxWidth: 520 }}
              pagination={tablePagination}
              loadingTip="Cargando pagos..."
            />
          </div>
        </section>
      </Flex>
    </PageTemplate>
  );
};

export default PagosList;
