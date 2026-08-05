/**
 * Listado de libros de registro (P1 — patrón CFG carreras/Docentes).
 */

import { Flex, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { TableListView } from '@organisms';
import { ActionButton } from '@atoms';
import { useLibrosList } from '@application-academico/libros/hooks';
import { LIBROS_PERMISOS } from '@application-academico/libros/utils/librosPermisos';
import { allSpacing } from '@theme/tokens';
import AbrirLibroModal from '../components/organisms/AbrirLibroModal.jsx';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph } = Typography;

const LibrosListPage = () => {
  const {
    libros,
    loading,
    error,
    searchText,
    handleSearchChange,
    tableColumns,
    breadcrumbItems,
    modalOpen,
    abrirModal,
    cerrarModal,
    handleAbrirLibro,
    abriendo,
    gestiones,
    loadingGestiones,
  } = useLibrosList();

  const listaAcciones = (
    <Flex gap={allSpacing.marginSM} wrap="wrap">
      <ActionButton
        permiso={LIBROS_PERMISOS.libro}
        accion="CREAR"
        variant="primary"
        icon={<PlusOutlined />}
        onClick={abrirModal}
      >
        Abrir libro
      </ActionButton>
    </Flex>
  );

  return (
    <PageTemplate header={<PageHeader breadcrumbItems={breadcrumbItems} />} sidebar={null}>
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        <section className="cfg-academico-workspace">
          <header className="cfg-academico-workspace__header">
            <ListPanelHeader title="Libros de registro" actions={listaAcciones} />
            <Paragraph type="secondary" className="cfg-academico-workspace__desc">
              Libros físicos del centralizador de calificaciones: uno por gestión, compartido
              por las 3 carreras del instituto, con sus folios (páginas de hasta 10 estudiantes)
              generados por paralelo.
            </Paragraph>
          </header>
          <div className="cfg-academico-tab-panel">
            <TableListView
              embedded
              data={libros}
              loading={loading}
              error={error}
              searchText={searchText}
              onSearchChange={handleSearchChange}
              searchPlaceholder="Buscar por número de libro, gestión o código de registro..."
              columns={tableColumns}
              rowKey="id"
              searchColSpan={10}
              searchStyle={{ maxWidth: 520 }}
              pagination={false}
              loadingTip="Cargando libros de registro..."
              emptyText="Aún no se abrió ningún libro de registro."
            />
          </div>
        </section>
      </Flex>

      <AbrirLibroModal
        open={modalOpen}
        gestiones={gestiones}
        loadingCatalogos={loadingGestiones}
        guardando={abriendo}
        onGuardar={handleAbrirLibro}
        onCancelar={cerrarModal}
      />
    </PageTemplate>
  );
};

export default LibrosListPage;
