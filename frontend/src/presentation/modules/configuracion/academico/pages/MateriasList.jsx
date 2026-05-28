/**
 * Listado de materias — tab «Materias» en AcademicoPage.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { TableListView } from '@organisms';
import { ActionButton } from '@atoms';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { useMateriaContext } from '@application-configuracion/academico/hooks';
import { materiaNuevaPath } from '@application-configuracion/academico/config/paths';
import { materiasListNavigationState } from '@application-configuracion/academico/config/academicoNavigation';
import { createMateriasTableColumns } from '@configuracion/academico/config/materiasTableColumns';
import { allSpacing } from '@theme/tokens';
import '../styles/academico-form-page.css';

const MateriasList = ({ embedded = false }) => {
  const navigate = useNavigate();
  const listNavState = useMemo(() => materiasListNavigationState(), []);

  const {
    materias = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    refetch,
  } = useMateriaContext();

  const tableColumns = useMemo(
    () =>
      createMateriasTableColumns({
        navigate,
        listNavState,
        refetch,
      }),
    [navigate, listNavState, refetch],
  );

  const nuevaMateriaAction = (
    <ActionButton
      permiso="configuracion.materia"
      accion="CREAR"
      variant="primary"
      icon={<PlusOutlined />}
      onClick={() => navigate(materiaNuevaPath, { state: listNavState })}
    >
      Nueva materia
    </ActionButton>
  );

  return (
    <Flex
      vertical
      gap={allSpacing.marginLG}
      className={embedded ? 'cfg-academico-tab-content' : undefined}
      style={{ width: '100%', minWidth: 0 }}
    >
      <ListPanelHeader title="Materias" actions={nuevaMateriaAction} />

      <TableListView
        embedded={embedded}
        data={materias}
        loading={loading}
        error={error}
        searchText={searchText}
        onSearchChange={(e) => setSearchText(e.target.value)}
        searchPlaceholder="Buscar por sigla, nombre o clasificación..."
        columns={tableColumns}
        rowKey={(record) => record.id || record.sigla}
        searchColSpan={10}
        searchStyle={{ maxWidth: 520 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} materias`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        loadingTip="Cargando materias..."
      />
    </Flex>
  );
};

export default MateriasList;
