/**
 * DocentesList — listado de docentes (Page + TableListView, mismo patrón que EstudiantesList).
 */

import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { Grid } from 'antd';
import { PageTemplate } from '@templates';
import { TableListView } from '@organisms';
import { PageHeader } from '@molecules';
import { ActionButton } from '@atoms';
import { useDocentesListContext } from '@application-docentes/hooks';
import { createDocentesTableColumns } from '@docentes/config';

const DocentesList = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const screens = Grid.useBreakpoint();
  const isSmall = !screens.lg;

  const {
    docentes = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    refetch,
    deleteDocente,
  } = useDocentesListContext();

  const tableColumns = useMemo(
    () =>
      createDocentesTableColumns(navigate, refetch, deleteDocente, {
        isSmall,
        returnListPath: pathname,
      }),
    [navigate, refetch, deleteDocente, isSmall, pathname]
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Docentes' },
    ],
    []
  );

  const handleNuevoDocente = () => {
    navigate('/docentes/registrar', {
      state: { returnListPath: pathname, menuSidebarKey: 'DOC-LIST' },
    });
  };

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Lista de Docentes"
          breadcrumbItems={breadcrumbItems}
          actions={
            <ActionButton
              permiso="docentes.crear"
              accion="CREAR"
              variant="primary"
              icon={<PlusOutlined />}
              onClick={handleNuevoDocente}
            >
              Registrar docente
            </ActionButton>
          }
        />
      }
      sidebar={null}
    >
      <TableListView
        data={docentes}
        loading={loading}
        error={error}
        searchText={searchText}
        onSearchChange={(e) => setSearchText(e.target.value)}
        searchPlaceholder="Buscar por nombre, CI, contacto, dirección, título, usuario, observaciones..."
        columns={tableColumns}
        rowKey={(record) => record.id || Math.random()}
        tableClassName="data-table--docentes"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} docentes`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        defaultSort={{
          field: 'createdAt',
          order: 'descend',
        }}
        loadingTip="Cargando docentes..."
      />
    </PageTemplate>
  );
};

export default DocentesList;
