/**
 * Listado de carreras — tab «Carreras» en AcademicoPage.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { TableListView } from '@organisms';
import { ActionButton } from '@atoms';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { useCarreraContext } from '@application-configuracion/academico/hooks';
import { carreraNuevaPath } from '@application-configuracion/academico/config/paths';
import { carrerasListNavigationState } from '@application-configuracion/academico/config/academicoNavigation';
import { createCarrerasTableColumns } from '@configuracion/academico/config/carrerasTableColumns';
import { allSpacing } from '@theme/tokens';
import '../styles/academico-form-page.css';

const CarrerasList = ({ embedded = false }) => {
  const navigate = useNavigate();
  const listNavState = useMemo(() => carrerasListNavigationState(), []);

  const {
    carreras = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    refetch,
  } = useCarreraContext();

  const tableColumns = useMemo(
    () =>
      createCarrerasTableColumns({
        navigate,
        listNavState,
        refetch,
      }),
    [navigate, listNavState, refetch],
  );

  const nuevaCarreraAction = (
    <ActionButton
      permiso="configuracion.carrera"
      accion="CREAR"
      variant="primary"
      icon={<PlusOutlined />}
      onClick={() => navigate(carreraNuevaPath, { state: listNavState })}
    >
      Nueva carrera
    </ActionButton>
  );

  return (
    <Flex
      vertical
      gap={allSpacing.marginLG}
      className={embedded ? 'cfg-academico-tab-content' : undefined}
      style={{ width: '100%', minWidth: 0 }}
    >
      {!embedded ? (
        <ListPanelHeader title="Carreras" actions={nuevaCarreraAction} />
      ) : null}

      <TableListView
        embedded={embedded}
        data={carreras}
        loading={loading}
        error={error}
        searchText={searchText}
        onSearchChange={(e) => setSearchText(e.target.value)}
        searchPlaceholder="Buscar por código, nombre, área o título..."
        columns={tableColumns}
        rowKey={(record) => record.id || record.codigo}
        searchColSpan={10}
        searchStyle={{ maxWidth: 520 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} carreras`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        loadingTip="Cargando carreras..."
      />
    </Flex>
  );
};

export default CarrerasList;
