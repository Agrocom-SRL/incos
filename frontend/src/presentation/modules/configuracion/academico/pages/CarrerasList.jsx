/**
 * Listado de carreras — contenido del tab «Carreras» en AcademicoPage.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { TableListView } from '@organisms';
import { ActionButton } from '@atoms';
import { useCarreraContext } from '@application-configuracion/academico/hooks';
import { CARRERAS_REGISTRAR_PATH } from '@application-configuracion/academico/config/paths';
import { createCarrerasTableColumns } from '@configuracion/academico/config/carrerasTableColumns';

const CarrerasList = () => {
  const navigate = useNavigate();
  // CTA crear (se oculta si no tiene permiso)
  // Listado tab: el permiso de entrada se valida en el tab (AcademicoPage).
  // Aquí se refuerza por acción específica.
  const {
    carreras = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
  } = useCarreraContext();

  const tableColumns = useMemo(() => createCarrerasTableColumns(navigate), [navigate]);

  return (
    <TableListView
      data={carreras}
      loading={loading}
      error={error}
      searchText={searchText}
      onSearchChange={(e) => setSearchText(e.target.value)}
      searchPlaceholder="Buscar por código, nombre o título otorgado..."
      columns={tableColumns}
      rowKey={(record) => record.id || record.codigo || Math.random()}
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
          onClick={() => navigate(CARRERAS_REGISTRAR_PATH)}
        >
          Nueva carrera
        </ActionButton>
      }
      loadingTip="Cargando carreras..."
    />
  );
};

export default CarrerasList;
