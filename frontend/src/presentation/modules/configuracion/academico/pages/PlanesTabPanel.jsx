/**
 * Tab «Planes de estudio» — listado tipo tabla (mismo patrón que
 * `CarrerasList`/`MateriasList`): una fila por carrera con su plan vigente.
 *
 * Presentacional: el catálogo carreras+plan vigente y la búsqueda
 * (`usePlanesTabPanel`) se resuelven en `AcademicoPage`, que también
 * renderiza el botón de cabecera "Nuevo plan" en el `ListPanelHeader` del
 * workspace, junto a "Nueva carrera"/"Nueva materia".
 */

import { useMemo } from 'react';
import { TableListView } from '@organisms';
import {
  createPlanesTableColumns,
  planesRowClassName,
} from '@configuracion/academico/config/planesTableColumns';

const PlanesTabPanel = ({
  embedded = false,
  navigate,
  listNavState,
  carreras = [],
  loading = false,
  error = null,
  refetch,
  searchText = '',
  setSearchText,
  toggleEstadoPlan,
}) => {
  const tableColumns = useMemo(
    () =>
      createPlanesTableColumns({
        navigate,
        listNavState,
        refetch,
        onToggleEstado: toggleEstadoPlan,
      }),
    [navigate, listNavState, refetch, toggleEstadoPlan],
  );

  return (
    <TableListView
      embedded={embedded}
      data={carreras}
      loading={loading}
      error={error}
      searchText={searchText}
      onSearchChange={(e) => setSearchText(e.target.value)}
      searchPlaceholder="Buscar por código, nombre de carrera o RM..."
      columns={tableColumns}
      rowKey={(record) => record.id || record.codigo}
      rowClassName={planesRowClassName}
      searchColSpan={10}
      searchStyle={{ maxWidth: 520 }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Total: ${total} carreras`,
        pageSizeOptions: ['10', '20', '50', '100'],
      }}
      loadingTip="Cargando planes de estudio..."
    />
  );
};

export default PlanesTabPanel;
