import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { TableListView } from '@organisms';
import { Button } from '@atoms';
import { useDiscapacidadContext } from '@application-configuracion/complementarios/hooks';
import { DISCAPACIDAD_REGISTRAR_PATH } from '@application-configuracion/complementarios/config/paths';
import { createDiscapacidadesTableColumns } from '@configuracion/complementarios/config/discapacidadesTableColumns';

const DiscapacidadesList = () => {
  const navigate = useNavigate();
  const {
    discapacidades = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
  } = useDiscapacidadContext();

  const tableColumns = useMemo(() => createDiscapacidadesTableColumns(navigate), [navigate]);

  return (
    <TableListView
      data={discapacidades}
      loading={loading}
      error={error}
      searchText={searchText}
      onSearchChange={(e) => setSearchText(e.target.value)}
      searchPlaceholder="Buscar por nombre o descripción..."
      columns={tableColumns}
      rowKey={(record) => record.id || Math.random()}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Total: ${total} tipos de discapacidad`,
        pageSizeOptions: ['10', '20', '50', '100'],
      }}
      defaultSort={{ field: 'nombre', order: 'ascend' }}
      title="Tipos de discapacidad"
      headerActions={
        <Button variant="primary" icon={<PlusOutlined />} onClick={() => navigate(DISCAPACIDAD_REGISTRAR_PATH)}>
          Nuevo tipo
        </Button>
      }
      loadingTip="Cargando tipos de discapacidad..."
    />
  );
};

export default DiscapacidadesList;
