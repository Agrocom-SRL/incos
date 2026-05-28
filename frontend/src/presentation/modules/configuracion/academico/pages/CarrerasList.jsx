/**
 * Listado de carreras — tab «Carreras» en AcademicoPage.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { TableListView } from '@organisms';
import { ActionButton } from '@atoms';
import { useCarreraContext } from '@application-configuracion/academico/hooks';
import { carreraNuevaPath } from '@application-configuracion/academico/config/paths';
import { carrerasListNavigationState } from '@application-configuracion/academico/config/academicoNavigation';
import { createCarrerasTableColumns } from '@configuracion/academico/config/carrerasTableColumns';

const CarrerasList = () => {
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

  return (
    <TableListView
      data={carreras}
      loading={loading}
      error={error}
      searchText={searchText}
      onSearchChange={(e) => setSearchText(e.target.value)}
      searchPlaceholder="Buscar por código, nombre o título otorgado..."
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
      defaultSort={{ field: 'codigo', order: 'ascend' }}
      title="Carreras"
      headerActions={
        <ActionButton
          permiso="configuracion.carrera"
          accion="CREAR"
          variant="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(carreraNuevaPath, { state: listNavState })}
        >
          Nueva carrera
        </ActionButton>
      }
      loadingTip="Cargando carreras..."
    />
  );
};

export default CarrerasList;
