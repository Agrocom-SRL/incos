/**
 * Listado de apoderados (tipos de parentesco) — tab «Apoderados» en ComplementariosPage.
 * Gemelo de `DiscapacidadesList.jsx`.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { TableListView } from '@organisms';
import { ActionButton } from '@atoms';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { useApoderadoContext } from '@application-configuracion/complementarios/hooks';
import { apoderadoNuevaPath } from '@application-configuracion/complementarios/config/paths';
import { apoderadosListNavigationState } from '@application-configuracion/complementarios/config/navigation';
import { createApoderadosTableColumns } from '@configuracion/complementarios/config/apoderadosTableColumns';
import { catalogoEstadoRowClassName } from '@presentation/utils/tableColumns/createSimpleCatalogTableColumns';
import { allSpacing } from '@theme/tokens';
import '@configuracion/academico/styles/academico-form-page.css';

const ApoderadosTabPanel = ({ embedded = false }) => {
  const navigate = useNavigate();
  const listNavState = useMemo(() => apoderadosListNavigationState(), []);

  const {
    apoderados = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    refetch,
    toggleEstado,
  } = useApoderadoContext();

  const tableColumns = useMemo(
    () => createApoderadosTableColumns({ navigate, listNavState, refetch, toggleEstado }),
    [navigate, listNavState, refetch, toggleEstado],
  );

  const nuevoApoderadoAction = (
    <ActionButton
      permiso="configuracion.complementario.apoderados"
      accion="CREAR"
      variant="primary"
      icon={<PlusOutlined />}
      onClick={() => navigate(apoderadoNuevaPath, { state: listNavState })}
    >
      Nuevo apoderado
    </ActionButton>
  );

  return (
    <Flex
      vertical
      gap={allSpacing.marginLG}
      className={embedded ? 'cfg-academico-tab-content' : undefined}
      style={{ width: '100%', minWidth: 0 }}
    >
      {!embedded ? <ListPanelHeader title="Apoderados" actions={nuevoApoderadoAction} /> : null}

      <TableListView
        embedded={embedded}
        data={apoderados}
        loading={loading}
        error={error}
        searchText={searchText}
        onSearchChange={(e) => setSearchText(e.target.value)}
        searchPlaceholder="Buscar por nombre o descripción..."
        columns={tableColumns}
        rowKey={(record) => record.id}
        rowClassName={catalogoEstadoRowClassName}
        searchColSpan={10}
        searchStyle={{ maxWidth: 520 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} apoderados`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        loadingTip="Cargando apoderados..."
      />
    </Flex>
  );
};

export default ApoderadosTabPanel;
