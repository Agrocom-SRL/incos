/**
 * Listado de idiomas — tab «Idiomas» en ComplementariosPage.
 * Gemelo de `DiscapacidadesList.jsx`.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { TableListView } from '@organisms';
import { ActionButton } from '@atoms';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { useIdiomaContext } from '@application-configuracion/complementarios/hooks';
import { idiomaNuevaPath } from '@application-configuracion/complementarios/config/paths';
import { idiomasListNavigationState } from '@application-configuracion/complementarios/config/navigation';
import { createIdiomasTableColumns } from '@configuracion/complementarios/config/idiomasTableColumns';
import { allSpacing } from '@theme/tokens';
import '@configuracion/academico/styles/academico-form-page.css';

const IdiomasTabPanel = ({ embedded = false }) => {
  const navigate = useNavigate();
  const listNavState = useMemo(() => idiomasListNavigationState(), []);

  const {
    idiomas = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    refetch,
  } = useIdiomaContext();

  const tableColumns = useMemo(
    () => createIdiomasTableColumns({ navigate, listNavState, refetch }),
    [navigate, listNavState, refetch],
  );

  const nuevoIdiomaAction = (
    <ActionButton
      permiso="configuracion.complementario.idiomas"
      accion="CREAR"
      variant="primary"
      icon={<PlusOutlined />}
      onClick={() => navigate(idiomaNuevaPath, { state: listNavState })}
    >
      Nuevo idioma
    </ActionButton>
  );

  return (
    <Flex
      vertical
      gap={allSpacing.marginLG}
      className={embedded ? 'cfg-academico-tab-content' : undefined}
      style={{ width: '100%', minWidth: 0 }}
    >
      {!embedded ? <ListPanelHeader title="Idiomas" actions={nuevoIdiomaAction} /> : null}

      <TableListView
        embedded={embedded}
        data={idiomas}
        loading={loading}
        error={error}
        searchText={searchText}
        onSearchChange={(e) => setSearchText(e.target.value)}
        searchPlaceholder="Buscar por nombre o código ISO..."
        columns={tableColumns}
        rowKey={(record) => record.id}
        searchColSpan={10}
        searchStyle={{ maxWidth: 520 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} idiomas`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        loadingTip="Cargando idiomas..."
      />
    </Flex>
  );
};

export default IdiomasTabPanel;
