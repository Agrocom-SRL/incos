/**
 * Listado de aulas — tab «Aulas» en RecursosPage.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex } from 'antd';
import { TableListView } from '@organisms';
import { useAulaContext } from '@application-configuracion/recursos/hooks';
import { aulasListNavigationState } from '@application-configuracion/recursos/config/navigation';
import { createAulasTableColumns } from '@configuracion/recursos/config/aulasTableColumns';
import { allSpacing } from '@theme/tokens';
import '@configuracion/academico/styles/academico-form-page.css';

const AulasList = ({ embedded = false }) => {
  const navigate = useNavigate();
  const listNavState = useMemo(() => aulasListNavigationState(), []);

  const {
    aulas = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    refetch,
  } = useAulaContext();

  const tableColumns = useMemo(
    () => createAulasTableColumns({ navigate, listNavState, refetch }),
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
        data={aulas}
        loading={loading}
        error={error}
        searchText={searchText}
        onSearchChange={(e) => setSearchText(e.target.value)}
        searchPlaceholder="Buscar por código, nombre, categoría u observaciones..."
        columns={tableColumns}
        rowKey={(record) => record.id}
        searchColSpan={10}
        searchStyle={{ maxWidth: 520 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} aulas`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        loadingTip="Cargando aulas..."
      />
    </Flex>
  );
};

export default AulasList;
