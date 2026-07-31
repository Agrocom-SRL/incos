/**
 * Listado de proyectos de grado (Titulación · TIT-PROYECTOS · LISTAR).
 *
 * Lenguaje visual de CursosCapacitacionList (CAP): shell
 * Flex.page-container → PageHeaderArea(PageHeader) → DashboardPageShell → MainContent
 * → section.cfg-academico-workspace (ListPanelHeader + lede) → TableListView embedded.
 * Filtros carrera/modalidad/estado en cliente (dataset completo, modo loadAll)
 * como `headerActions` de la tabla.
 *
 * Página "dumb": solo compone template + organismos y consume el hook de pantalla.
 */

import { Flex, Select, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { TableListView } from '@organisms';
import { ActionButton } from '@atoms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { useProyectosGradoListPage } from '@application-titulacion/proyectos-grado/hooks/state/useProyectosGradoListPage';
import { TITULACION_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';
import { allSpacing } from '@theme/tokens';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph } = Typography;

const ProyectosGradoList = () => {
  const {
    proyectos,
    loading,
    error,
    searchText,
    filtros,
    setFiltro,
    carreraOptions,
    modalidadOptions,
    loadingModalidades,
    estadoOptions,
    tableColumns,
    breadcrumbItems,
    handleRegistrar,
    handleSearchChange,
    tablePagination,
  } = useProyectosGradoListPage();

  const registrarAction = (
    <ActionButton
      permiso={TITULACION_PERMISOS.proyecto}
      accion="CREAR"
      variant="primary"
      icon={<PlusOutlined />}
      onClick={handleRegistrar}
    >
      Nuevo proyecto
    </ActionButton>
  );

  const filtrosActions = (
    <Flex wrap gap="small" justify="flex-end" align="center">
      <Select
        allowClear
        options={carreraOptions}
        value={filtros.carreraId}
        onChange={(value) => setFiltro('carreraId', value)}
        placeholder="Carrera"
        style={{ minWidth: 180 }}
        aria-label="Filtrar por carrera"
      />
      <Select
        allowClear
        options={modalidadOptions}
        loading={loadingModalidades}
        value={filtros.modalidadId}
        onChange={(value) => setFiltro('modalidadId', value)}
        placeholder="Modalidad"
        style={{ minWidth: 180 }}
        aria-label="Filtrar por modalidad"
      />
      <Select
        allowClear
        options={estadoOptions}
        value={filtros.estado}
        onChange={(value) => setFiltro('estado', value)}
        placeholder="Estado"
        style={{ minWidth: 160 }}
        aria-label="Filtrar por estado"
      />
    </Flex>
  );

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader title="Proyectos de grado" breadcrumbItems={breadcrumbItems} />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
            <section className="cfg-academico-workspace">
              <header className="cfg-academico-workspace__header">
                <ListPanelHeader title="Lista de proyectos" actions={registrarAction} />
                <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                  Proyectos de titulación por modalidad de grado, con su tutor, integrantes y
                  avance de tutoría. Desde la ficha de cada proyecto se gestionan integrantes,
                  bitácora, avances y dictámenes.
                </Paragraph>
              </header>
              <div className="cfg-academico-tab-panel">
                <TableListView
                  embedded
                  data={proyectos}
                  loading={loading}
                  error={error}
                  searchText={searchText}
                  onSearchChange={handleSearchChange}
                  searchPlaceholder="Buscar por título, integrante o tutor…"
                  columns={tableColumns}
                  rowKey={(record) => record.id}
                  searchColSpan={10}
                  searchStyle={{ maxWidth: 520 }}
                  pagination={tablePagination}
                  loadingTip="Cargando proyectos…"
                  emptyText="Aún no hay proyectos de grado registrados."
                  headerActions={filtrosActions}
                />
              </div>
            </section>
          </Flex>
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default ProyectosGradoList;
