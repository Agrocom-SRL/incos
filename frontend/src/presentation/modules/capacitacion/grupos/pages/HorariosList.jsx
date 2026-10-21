/**
 * Tab «Horarios» de Grupos (Capacitación · CAP-GRUPOS · LISTAR): tabla del
 * catálogo de horarios, embebida en el workspace de `GruposPage` (variante
 * `embedded`, como `ParalelosList` en CFG Recursos). El botón «Nuevo horario»
 * vive en el header del tab; editar/eliminar en la fila.
 */

import { TableListView } from '@organisms';
import { useHorariosListPage } from '@application-capacitacion/grupos/hooks/state/useHorariosListPage';

const HorariosList = () => {
  const { horarios, loading, error, searchText, tableColumns, handleSearchChange, tablePagination } =
    useHorariosListPage();

  return (
    <TableListView
      embedded
      data={horarios}
      loading={loading}
      error={error}
      searchText={searchText}
      onSearchChange={handleSearchChange}
      searchPlaceholder="Buscar por día u hora…"
      columns={tableColumns}
      rowKey={(record) => record.id}
      searchColSpan={10}
      searchStyle={{ maxWidth: 520 }}
      pagination={tablePagination}
      loadingTip="Cargando horarios…"
      emptyText="Aún no hay horarios de capacitación. Cree el primero con «Nuevo horario»."
    />
  );
};

export default HorariosList;
