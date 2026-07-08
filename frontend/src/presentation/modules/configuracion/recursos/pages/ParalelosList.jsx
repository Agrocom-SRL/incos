/**
 * Listado de paralelos maestro — tab «Paralelos» en RecursosPage.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex } from 'antd';
import { TableListView } from '@organisms';
import { useParaleloContext } from '@application-configuracion/recursos/hooks';
import { paralelosListNavigationState } from '@application-configuracion/recursos/config/navigation';
import { createParalelosTableColumns } from '@configuracion/recursos/config/paralelosTableColumns';
import { catalogoEstadoRowClassName } from '@presentation/utils/tableColumns/createSimpleCatalogTableColumns';
import { allSpacing } from '@theme/tokens';
import '@configuracion/academico/styles/academico-form-page.css';

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
    toggleEstado,
  } = useParaleloContext();

  const tableColumns = useMemo(
    () =>
      createParalelosTableColumns({
        navigate,
        listNavState,
        refetch,
        toggleEstado,
      }),
    [navigate, listNavState, refetch, toggleEstado],
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
        rowClassName={catalogoEstadoRowClassName}
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
