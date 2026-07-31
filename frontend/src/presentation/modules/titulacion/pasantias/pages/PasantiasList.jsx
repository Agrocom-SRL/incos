/**
 * Listado de trámites de pasantía (Titulación · TUT-PASANTIAS · LISTAR).
 *
 * Lenguaje visual de ProyectosGradoList (TUT): shell
 * Flex.page-container → PageHeaderArea(PageHeader) → DashboardPageShell → MainContent
 * → section.cfg-academico-workspace (ListPanelHeader + lede) → TableListView embedded.
 * Filtros gestión/carrera/camino/estado en cliente (dataset completo, modo
 * loadAll) como `headerActions` de la tabla. Acceso al catálogo de empresas
 * en el PageHeader (acción secundaria, empresa·LISTAR).
 *
 * Página "dumb": solo compone template + organismos y consume el hook de pantalla.
 */

import { Flex, Select, Typography } from 'antd';
import { PlusOutlined, ShopOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { TableListView } from '@organisms';
import { ActionButton } from '@atoms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { usePasantiasListPage } from '@application-titulacion/pasantias/hooks/state/usePasantiasListPage';
import { TUTORIAS_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';
import { allSpacing } from '@theme/tokens';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph } = Typography;

const PasantiasList = () => {
  const {
    pasantias,
    loading,
    error,
    searchText,
    filtros,
    setFiltro,
    gestionOptions,
    carreraOptions,
    tipoOptions,
    estadoOptions,
    tableColumns,
    breadcrumbItems,
    handleRegistrar,
    handleVerEmpresas,
    handleSearchChange,
    tablePagination,
  } = usePasantiasListPage();

  const registrarAction = (
    <ActionButton
      permiso={TUTORIAS_PERMISOS.pasantia}
      accion="CREAR"
      variant="primary"
      icon={<PlusOutlined />}
      onClick={handleRegistrar}
    >
      Registrar trámite
    </ActionButton>
  );

  const empresasAction = (
    <ActionButton
      permiso={TUTORIAS_PERMISOS.pasantiaEmpresa}
      accion="LISTAR"
      variant="info"
      icon={<ShopOutlined />}
      onClick={handleVerEmpresas}
    >
      Catálogo de empresas
    </ActionButton>
  );

  const filtrosActions = (
    <Flex wrap gap="small" justify="flex-end" align="center">
      <Select
        allowClear
        options={gestionOptions}
        value={filtros.gestionId}
        onChange={(value) => setFiltro('gestionId', value)}
        placeholder="Gestión"
        style={{ minWidth: 140 }}
        aria-label="Filtrar por gestión"
      />
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
        options={tipoOptions}
        value={filtros.tipo}
        onChange={(value) => setFiltro('tipo', value)}
        placeholder="Camino"
        style={{ minWidth: 150 }}
        aria-label="Filtrar por camino"
      />
      <Select
        allowClear
        options={estadoOptions}
        value={filtros.estado}
        onChange={(value) => setFiltro('estado', value)}
        placeholder="Estado"
        style={{ minWidth: 150 }}
        aria-label="Filtrar por estado"
      />
    </Flex>
  );

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader title="Pasantías" breadcrumbItems={breadcrumbItems} actions={empresasAction} />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
            <section className="cfg-academico-workspace">
              <header className="cfg-academico-workspace__header">
                <ListPanelHeader title="Lista de trámites" actions={registrarAction} />
                <Paragraph type="secondary" className="cfg-academico-workspace__desc">
                  Trámites de práctica laboral por los caminos PASANTÍA (práctica nueva con
                  verificación de empresa) y CONVALIDACIÓN (reconocimiento de experiencia
                  laboral), según la R.M. 487/2023 (300–360 horas). Desde la ficha de cada
                  trámite se gestionan informes, seguimientos y transiciones de estado.
                </Paragraph>
              </header>
              <div className="cfg-academico-tab-panel">
                <TableListView
                  embedded
                  data={pasantias}
                  loading={loading}
                  error={error}
                  searchText={searchText}
                  onSearchChange={handleSearchChange}
                  searchPlaceholder="Buscar por estudiante, empresa o supervisor…"
                  columns={tableColumns}
                  rowKey={(record) => record.id}
                  searchColSpan={10}
                  searchStyle={{ maxWidth: 520 }}
                  pagination={tablePagination}
                  loadingTip="Cargando trámites…"
                  emptyText="Aún no hay trámites de pasantía registrados."
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

export default PasantiasList;
