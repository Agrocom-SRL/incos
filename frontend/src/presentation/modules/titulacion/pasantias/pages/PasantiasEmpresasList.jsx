/**
 * Catálogo de empresas de pasantía (Titulación · TIT · empresa·LISTAR).
 *
 * ABM de catálogo con el shell de listado del sistema (workspace +
 * TableListView embedded) y toggle rápido de estado (`EstadoTogglePill` en
 * las columnas — filas inactivas atenuadas en gris vía
 * `catalogoEstadoRowClassName`, nunca rojo). Alta/edición en páginas
 * completas (sin modales de formulario).
 *
 * Página "dumb": solo compone; la orquestación vive en
 * `usePasantiasEmpresasListPage`.
 */

import { Flex, Typography } from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { TableListView } from '@organisms';
import { ActionButton, BackButton } from '@atoms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { catalogoEstadoRowClassName } from '@presentation/utils/tableColumns/createSimpleCatalogTableColumns';
import { usePasantiasEmpresasListPage } from '@application-titulacion/pasantias/hooks/state/usePasantiasEmpresasListPage';
import { TITULACION_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';
import { allSpacing } from '@theme/tokens';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph } = Typography;

const PasantiasEmpresasList = () => {
  const {
    empresas,
    loading,
    error,
    searchText,
    handleSearchChange,
    tableColumns,
    breadcrumbItems,
    handleRegistrar,
    handleVolver,
  } = usePasantiasEmpresasListPage();

  const registrarAction = (
    <ActionButton
      permiso={TITULACION_PERMISOS.pasantiaEmpresa}
      accion="CREAR"
      variant="primary"
      icon={<PlusOutlined />}
      onClick={handleRegistrar}
    >
      Nueva empresa
    </ActionButton>
  );

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title="Empresas de pasantía"
          breadcrumbItems={breadcrumbItems}
          actions={
            <BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver}>
              Volver a pasantías
            </BackButton>
          }
        />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
            <section className="cfg-academico-workspace">
              <header className="cfg-academico-workspace__header">
                <ListPanelHeader title="Catálogo de empresas" actions={registrarAction} />
                <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                  Empresas receptoras de pasantía verificadas por el instituto. Las empresas
                  inactivas se conservan por trazabilidad y no aparecen al registrar nuevos
                  trámites; use el interruptor de estado para reactivarlas.
                </Paragraph>
              </header>
              <div className="cfg-academico-tab-panel">
                <TableListView
                  embedded
                  data={empresas}
                  loading={loading}
                  error={error}
                  searchText={searchText}
                  onSearchChange={handleSearchChange}
                  searchPlaceholder="Buscar por nombre, NIT o sector…"
                  columns={tableColumns}
                  rowKey={(record) => record.id}
                  rowClassName={catalogoEstadoRowClassName}
                  searchColSpan={10}
                  searchStyle={{ maxWidth: 520 }}
                  loadingTip="Cargando empresas…"
                  emptyText="Aún no hay empresas registradas en el catálogo."
                />
              </div>
            </section>
          </Flex>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default PasantiasEmpresasList;
