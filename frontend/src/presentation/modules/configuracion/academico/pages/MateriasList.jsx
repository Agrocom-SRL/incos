/**
 * Listado de materias — tab «Materias» en AcademicoPage.
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { TableListView } from '@organisms';
import { ActionButton } from '@atoms';
import { useMateriaContext } from '@application-configuracion/academico/hooks';
import { materiaNuevaPath } from '@application-configuracion/academico/config/paths';
import { materiasListNavigationState } from '@application-configuracion/academico/config/academicoNavigation';
import {
  CLASIFICACION_MATERIA_OPTIONS,
  TIPOS_MATERIA_OPTIONS,
} from '@application-configuracion/academico/config/materiaFormConstants';
import { createMateriasTableColumns } from '@configuracion/academico/config/materiasTableColumns';

const MateriasList = () => {
  const navigate = useNavigate();
  const listNavState = useMemo(() => materiasListNavigationState(), []);

  const {
    materias = [],
    loading = false,
    error = null,
    searchText = '',
    setSearchText,
    refetch,
    filterTipo,
    setFilterTipo,
    filterClasificacion,
    setFilterClasificacion,
    clasificacionesDisponibles,
  } = useMateriaContext();

  const clasificacionOptions = useMemo(() => {
    const fromData = clasificacionesDisponibles.map((c) => ({ value: c, label: c }));
    const known = new Set(fromData.map((o) => o.value));
    const extras = CLASIFICACION_MATERIA_OPTIONS.filter((o) => !known.has(o.value));
    return [...fromData, ...extras];
  }, [clasificacionesDisponibles]);

  const tableColumns = useMemo(
    () =>
      createMateriasTableColumns({
        navigate,
        listNavState,
        refetch,
      }),
    [navigate, listNavState, refetch],
  );

  const listFilters = (
    <Flex gap={8} wrap="wrap" style={{ marginBottom: 12 }}>
      <Select
        allowClear
        placeholder="Tipo"
        style={{ minWidth: 160 }}
        value={filterTipo}
        onChange={setFilterTipo}
        options={TIPOS_MATERIA_OPTIONS}
      />
      <Select
        allowClear
        placeholder="Clasificación"
        style={{ minWidth: 200 }}
        value={filterClasificacion}
        onChange={setFilterClasificacion}
        options={clasificacionOptions}
        showSearch
        optionFilterProp="label"
      />
    </Flex>
  );

  return (
    <>
      {listFilters}
      <TableListView
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
      defaultSort={{ field: 'sigla', order: 'ascend' }}
      title="Materias"
      headerActions={
        <ActionButton
          permiso="configuracion.materia"
          accion="CREAR"
          variant="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(materiaNuevaPath, { state: listNavState })}
        >
          Nueva materia
        </ActionButton>
      }
      loadingTip="Cargando materias..."
    />
    </>
  );
};

export default MateriasList;
