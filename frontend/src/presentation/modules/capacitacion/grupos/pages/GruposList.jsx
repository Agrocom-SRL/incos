/**
 * Tab «Grupos» de Grupos (Capacitación · CAP-GRUPOS · LISTAR): listado de solo
 * lectura de los grupos de todos los cursos, embebido en `GruposPage`. Filtros
 * por estado del curso y por curso en el `headerActions` de la tabla (mismo
 * patrón que el filtro de `InscripcionesCapacitacionList`).
 */

import { Flex, Select } from 'antd';
import { TableListView } from '@organisms';
import { allSpacing } from '@theme/tokens';
import { useGruposListPage } from '@application-capacitacion/grupos/hooks/state/useGruposListPage';
import { ESTADO_CURSO_OPTIONS } from '@application-capacitacion/utils/capacitacionPills';

const GruposList = () => {
  const {
    grupos,
    loading,
    error,
    searchText,
    tableColumns,
    handleSearchChange,
    tablePagination,
    estado,
    setEstado,
    cursoId,
    setCursoId,
    cursosOptions,
    loadingCursos,
  } = useGruposListPage();

  const filtros = (
    <Flex gap={allSpacing.marginSM} wrap>
      <Select
        allowClear
        value={estado ?? undefined}
        options={ESTADO_CURSO_OPTIONS}
        onChange={(value) => setEstado(value ?? null)}
        placeholder="Estado del curso"
        aria-label="Filtrar por estado del curso"
      />
      <Select
        allowClear
        showSearch
        optionFilterProp="label"
        value={cursoId ?? undefined}
        options={cursosOptions}
        loading={loadingCursos}
        onChange={(value) => setCursoId(value ?? null)}
        placeholder="Curso"
        aria-label="Filtrar por curso"
      />
    </Flex>
  );

  return (
    <TableListView
      embedded
      data={grupos}
      loading={loading}
      error={error}
      searchText={searchText}
      onSearchChange={handleSearchChange}
      searchPlaceholder="Buscar por curso o grupo…"
      columns={tableColumns}
      rowKey={(record) => record.id}
      searchColSpan={10}
      searchStyle={{ maxWidth: 520 }}
      pagination={tablePagination}
      loadingTip="Cargando grupos…"
      emptyText="No hay grupos que coincidan. Los grupos se crean desde el formulario de cada curso."
      headerActions={filtros}
    />
  );
};

export default GruposList;
