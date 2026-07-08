/**
 * Panel del tab «Becas y descuentos» (Config. de pagos · Finanzas).
 *
 * Auto-contenido: monta su propio `BecaDescuentoProvider` (catálogo maestro,
 * independiente de métodos/bancos/cuentas) y renderiza el listado
 * DIRECTAMENTE en el panel — no es una ruta propia. El botón "Nueva beca o
 * descuento" vive en la cabecera de la card (`panelActions` de
 * `ConfigPagosPage`, igual que "Agregar banco"/"Agregar cuenta"), no dentro
 * de este panel. Solo alta/edición/detalle son páginas de navegación
 * completa (ver `routes.jsx`: FIN-CFG-BECAS-NUEVA/EDITAR/DETALLE).
 */

import { useNavigate } from 'react-router-dom';
import { TableListView } from '@organisms';
import { BecaDescuentoProvider } from '@application-finanzas/becas-descuentos/providers/BecaDescuentoProvider';
import { useBecaDescuentoListPage } from '@application-finanzas/becas-descuentos/hooks/state/useBecaDescuentoListPage';
import { catalogoEstadoRowClassName } from '@presentation/utils/tableColumns/createSimpleCatalogTableColumns';
import { createBecaDescuentoCatalogoColumns } from '@finanzas/configuracion/config/becaDescuentoCatalogoColumns';
import {
  becaDescuentoDetallePath,
  becaDescuentoEditarPath,
} from '@application-finanzas/config/paths';

const BecaDescuentoTabContent = () => {
  const navigate = useNavigate();
  const {
    becasDescuentos,
    loading,
    error,
    refetch,
    eliminar,
    searchText,
    setSearchText,
    toggleEstado,
  } = useBecaDescuentoListPage();

  const columns = createBecaDescuentoCatalogoColumns({
    onVer: (record) => navigate(becaDescuentoDetallePath(record.id)),
    onEditar: (record) => navigate(becaDescuentoEditarPath(record.id)),
    eliminarBeca: eliminar,
    refetch,
    onToggleEstado: toggleEstado,
  });

  return (
    <div className="cfg-pagos-panel">
      <TableListView
        embedded
        data={becasDescuentos}
        loading={loading}
        error={error}
        searchText={searchText}
        onSearchChange={(event) => setSearchText(event.target.value)}
        searchPlaceholder="Buscar por nombre, código o descripción…"
        columns={columns}
        rowKey="id"
        rowClassName={catalogoEstadoRowClassName}
        searchColSpan={10}
        searchStyle={{ maxWidth: 520 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} becas y descuentos`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        loadingTip="Cargando becas y descuentos..."
      />
    </div>
  );
};

const BecasDescuentosTabPanel = () => (
  <BecaDescuentoProvider>
    <BecaDescuentoTabContent />
  </BecaDescuentoProvider>
);

export default BecasDescuentosTabPanel;
