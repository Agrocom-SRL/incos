/**
 * Listado de estados civiles — tab «Estados civiles» en ComplementariosPage.
 * Gemelo de `IdiomasTabPanel.jsx`.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { TableListView } from '@organisms';
import { ActionButton } from '@atoms';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { useEstadoCivilContext } from '@application-configuracion/complementarios/hooks';
import { estadoCivilNuevaPath } from '@application-configuracion/complementarios/config/paths';
import { estadosCivilesListNavigationState } from '@application-configuracion/complementarios/config/navigation';
import { createEstadosCivilesTableColumns } from '@configuracion/complementarios/config/estadosCivilesTableColumns';
import { allSpacing } from '@theme/tokens';
import '@configuracion/academico/styles/academico-form-page.css';

const EstadosCivilesTabPanel = ({ embedded = false }) => {
  const navigate = useNavigate();
  const listNavState = useMemo(() => estadosCivilesListNavigationState(), []);

  const {
    estadosCiviles = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    refetch,
  } = useEstadoCivilContext();

  const tableColumns = useMemo(
    () => createEstadosCivilesTableColumns({ navigate, listNavState, refetch }),
    [navigate, listNavState, refetch],
  );

  const nuevoEstadoCivilAction = (
    <ActionButton
      permiso="configuracion.complementario.estado-civil"
      accion="CREAR"
      variant="primary"
      icon={<PlusOutlined />}
      onClick={() => navigate(estadoCivilNuevaPath, { state: listNavState })}
    >
      Nuevo estado civil
    </ActionButton>
  );

  return (
    <Flex
      vertical
      gap={allSpacing.marginLG}
      className={embedded ? 'cfg-academico-tab-content' : undefined}
      style={{ width: '100%', minWidth: 0 }}
    >
      {!embedded ? <ListPanelHeader title="Estados civiles" actions={nuevoEstadoCivilAction} /> : null}

      <TableListView
        embedded={embedded}
        data={estadosCiviles}
        loading={loading}
        error={error}
        searchText={searchText}
        onSearchChange={(e) => setSearchText(e.target.value)}
        searchPlaceholder="Buscar por nombre o abreviatura..."
        columns={tableColumns}
        rowKey={(record) => record.id}
        searchColSpan={10}
        searchStyle={{ maxWidth: 520 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} estados civiles`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        loadingTip="Cargando estados civiles..."
      />
    </Flex>
  );
};

export default EstadosCivilesTabPanel;
