/**
 * Listado de tipos de evaluación — tab «Tipos de evaluación» en RecursosPage.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex } from 'antd';
import { TableListView } from '@organisms';
import { useTipoEvaluacionContext } from '@application-configuracion/recursos/hooks';
import { tiposEvaluacionListNavigationState } from '@application-configuracion/recursos/config/navigation';
import { createTiposEvaluacionTableColumns } from '@configuracion/recursos/config/tiposEvaluacionTableColumns';
import { catalogoEstadoRowClassName } from '@presentation/utils/tableColumns/createSimpleCatalogTableColumns';
import { allSpacing } from '@theme/tokens';
import '@configuracion/academico/styles/academico-form-page.css';

const TiposEvaluacionList = ({ embedded = false }) => {
  const navigate = useNavigate();
  const listNavState = useMemo(() => tiposEvaluacionListNavigationState(), []);

  const {
    tiposEvaluacion = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    refetch,
    toggleEstado,
  } = useTipoEvaluacionContext();

  const tableColumns = useMemo(
    () => createTiposEvaluacionTableColumns({ navigate, listNavState, refetch, toggleEstado }),
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
        data={tiposEvaluacion}
        loading={loading}
        error={error}
        searchText={searchText}
        onSearchChange={(e) => setSearchText(e.target.value)}
        searchPlaceholder="Buscar por código, nombre o descripción..."
        columns={tableColumns}
        rowKey={(record) => record.id}
        rowClassName={catalogoEstadoRowClassName}
        searchColSpan={10}
        searchStyle={{ maxWidth: 520 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} tipos de evaluación`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        loadingTip="Cargando tipos de evaluación..."
      />
    </Flex>
  );
};

export default TiposEvaluacionList;
