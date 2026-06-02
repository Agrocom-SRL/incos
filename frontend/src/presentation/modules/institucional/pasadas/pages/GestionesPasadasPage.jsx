import { Flex, Modal, Select, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { TableListView } from '@organisms';
import { ActionButton } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { useGestionesPasadasState } from '@application-institucional/pasadas';
import '@configuracion/academico/styles/academico-form-page.css';
import '@presentation/styles/pages/detail-page.css';

const { Paragraph } = Typography;

const GestionesPasadasPage = () => {
  const s = useGestionesPasadasState();

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title={s.pageTitle}
          breadcrumbItems={s.breadcrumbItems}
          actions={
            <ActionButton
              permiso="institucional.oferta.gestion-plan"
              accion="LISTAR"
              variant="back"
              icon={<ArrowLeftOutlined />}
              onClick={s.navigateOferta}
            >
              volver
            </ActionButton>
          }
        />
      </PageHeaderArea>

      <MainContent>
        <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
          <section className="cfg-academico-workspace">
            <header className="cfg-academico-workspace__header">
              <ListPanelHeader title="Gestiones registradas" />
              <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                Consulte las gestiones académicas del instituto. La gestión{' '}
                <strong>vigente</strong> concentra la oferta operativa: use{' '}
                <strong>Habilitar plan</strong> cuando la gestión vigente aún no tenga planes de
                estudio asociados; luego <strong>Ver planes</strong> para generar paralelos y
                oferta. Las gestiones anteriores quedan como referencia histórica.
              </Paragraph>
            </header>
            <div className="cfg-academico-tab-panel">
              <TableListView
                embedded
                data={s.gestiones}
                loading={s.apiLoading}
                error={s.apiError}
                searchText={s.searchText}
                onSearchChange={s.handleSearchChange}
                searchPlaceholder="Buscar por código, nombre o año..."
                columns={s.tableColumns}
                rowKey="id"
                searchColSpan={10}
                searchStyle={{ maxWidth: 520 }}
                tableClassName="data-table--gestiones-pasadas"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total: ${total} gestiones`,
                  pageSizeOptions: ['10', '20', '50', '100'],
                }}
                loadingTip="Cargando gestiones..."
              />
            </div>
          </section>
        </Flex>
      </MainContent>

      <Modal
        title="Habilitar plan de estudio"
        open={s.modalHabilitarPlan}
        onCancel={() => s.setModalHabilitarPlan(false)}
        footer={null}
        destroyOnHidden
      >
        <Select
          showSearch
          placeholder="Seleccione un plan vigente del catálogo"
          style={{ width: '100%' }}
          optionFilterProp="label"
          loading={s.habilitandoPlan}
          options={s.habilitarPlanModalOptions}
          onChange={(planId) => {
            if (planId != null) s.onHabilitarPlanSeleccion(planId);
          }}
        />
      </Modal>
    </Flex>
  );
};

export default GestionesPasadasPage;
