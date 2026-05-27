/**
 * Listado de materias — contenido del tab «Materias» en AcademicoPage.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { TableListView } from '@organisms';
import { Button } from '@atoms';
import { useMateriaContext } from '@application-configuracion/academico/hooks';
import { MATERIAS_REGISTRAR_PATH } from '@application-configuracion/academico/config/paths';
import { createMateriasTableColumns } from '@configuracion/academico/config/materiasTableColumns';

const MateriasList = () => {
  const navigate = useNavigate();
  const {
    materias = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
  } = useMateriaContext();

  const tableColumns = useMemo(() => createMateriasTableColumns(navigate), [navigate]);

  return (
    <TableListView
      data={materias}
      loading={loading}
      error={error}
      searchText={searchText}
      onSearchChange={(e) => setSearchText(e.target.value)}
      searchPlaceholder="Buscar por código, nombre, nombre corto o tipo..."
      columns={tableColumns}
      rowKey={(record) => record.id || record.codigo || Math.random()}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Total: ${total} materias`,
        pageSizeOptions: ['10', '20', '50', '100'],
      }}
      defaultSort={{ field: 'codigo', order: 'ascend' }}
      title="Materias"
      headerActions={
        <Button variant="primary" icon={<PlusOutlined />} onClick={() => navigate(MATERIAS_REGISTRAR_PATH)}>
          Nueva materia
        </Button>
      }
      loadingTip="Cargando materias..."
    />
  );
};

export default MateriasList;
