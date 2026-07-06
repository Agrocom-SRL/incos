/**
 * Listado de tipos de discapacidad — tab «Discapacidad» en ComplementariosPage.
 * Gemelo de `academico/pages/MateriasList.jsx`.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { TableListView } from '@organisms';
import { ActionButton } from '@atoms';
import ListPanelHeader from '@molecules/ListPanelHeader';
import { useDiscapacidadContext } from '@application-configuracion/complementarios/hooks';
import { discapacidadNuevaPath } from '@application-configuracion/complementarios/config/paths';
import { discapacidadesListNavigationState } from '@application-configuracion/complementarios/config/navigation';
import { createDiscapacidadesTableColumns } from '@configuracion/complementarios/config/discapacidadesTableColumns';
import { allSpacing } from '@theme/tokens';
import '@configuracion/academico/styles/academico-form-page.css';

const DiscapacidadesList = ({ embedded = false }) => {
  const navigate = useNavigate();
  const listNavState = useMemo(() => discapacidadesListNavigationState(), []);

  const {
    discapacidades = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    refetch,
  } = useDiscapacidadContext();

  const tableColumns = useMemo(
    () => createDiscapacidadesTableColumns({ navigate, listNavState, refetch }),
    [navigate, listNavState, refetch],
  );

  const nuevoTipoAction = (
    <ActionButton
      permiso="configuracion.complementario.discapacidad"
      accion="CREAR"
      variant="primary"
      icon={<PlusOutlined />}
      onClick={() => navigate(discapacidadNuevaPath, { state: listNavState })}
    >
      Nuevo tipo de discapacidad
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
        <ListPanelHeader title="Tipos de discapacidad" actions={nuevoTipoAction} />
      ) : null}

      <TableListView
        embedded={embedded}
        data={discapacidades}
        loading={loading}
        error={error}
        searchText={searchText}
        onSearchChange={(e) => setSearchText(e.target.value)}
        searchPlaceholder="Buscar por nombre o descripción..."
        columns={tableColumns}
        rowKey={(record) => record.id}
        searchColSpan={10}
        searchStyle={{ maxWidth: 520 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} tipos de discapacidad`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        loadingTip="Cargando tipos de discapacidad..."
      />
    </Flex>
  );
};

export default DiscapacidadesList;
