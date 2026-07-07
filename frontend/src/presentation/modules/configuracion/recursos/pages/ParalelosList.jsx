/**
 * Listado de paralelos maestro — tab «Paralelos» en AcademicoPage.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex } from 'antd';
import { TableListView } from '@organisms';
import { useParaleloContext } from '@application-configuracion/academico/hooks';
import { paralelosListNavigationState } from '@application-configuracion/academico/config/academicoNavigation';
import { createParalelosTableColumns } from '@configuracion/academico/config/paralelosTableColumns';
import { allSpacing } from '@theme/tokens';
import '../styles/academico-form-page.css';

const ParalelosList = ({ embedded = false }) => {
  const navigate = useNavigate();
  const listNavState = useMemo(() => paralelosListNavigationState(), []);

  const {
    paralelos = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    refetch,
  } = useParaleloContext();

  const tableColumns = useMemo(
    () =>
      createParalelosTableColumns({
        navigate,
        listNavState,
        refetch,
      }),
    [navigate, listNavState, refetch],
  );

  return (
    <Flex
      vertical
      gap={allSpacing.marginLG}
      className={embedded ? 'cfg-academico-tab-content' : undefined}
      style={{ width: '100%', minWidth: 0 }}
    >
      <TableListView
        embedded={embedded}
        data={paralelos}
        loading={loading}
        error={error}
        searchText={searchText}
        onSearchChange={(e) => setSearchText(e.target.value)}
        searchPlaceholder="Buscar por nombre, carrera, periodo o turno..."
        columns={tableColumns}
        rowKey={(record) => record.id}
        searchColSpan={10}
        searchStyle={{ maxWidth: 520 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} paralelos`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        loadingTip="Cargando paralelos..."
      />
    </Flex>
  );
};

export default ParalelosList;
