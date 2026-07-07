/**
 * Panel del tab «Becas y descuentos» (Config. de pagos · Finanzas).
 *
 * Auto-contenido: monta su propio `BecaDescuentoProvider` (catálogo maestro,
 * independiente de métodos/bancos/cuentas) y renderiza el listado
 * DIRECTAMENTE en el panel — no es una ruta propia. El botón "Nueva beca o
 * descuento" vive en el slot `headerActions` de `TableListView` (gobernado por
 * `ActionButton`, fail-closed por permiso). Solo alta/edición/detalle son
 * páginas de navegación completa (ver `routes.jsx`: FIN-CFG-BECAS-NUEVA/
 * EDITAR/DETALLE).
 */

import { useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import { TableListView } from '@organisms';
import { ActionButton } from '@atoms';
import { BecaDescuentoProvider } from '@application-finanzas/becas-descuentos/providers/BecaDescuentoProvider';
import { useBecaDescuentoListPage } from '@application-finanzas/becas-descuentos/hooks/state/useBecaDescuentoListPage';
import { createBecaDescuentoCatalogoColumns } from '@finanzas/configuracion/config/becaDescuentoCatalogoColumns';
import { BECA_DESCUENTO_PERMISO } from '@finanzas/configuracion/config/becaDescuentoPermisos';
import {
  becaDescuentoDetallePath,
  becaDescuentoEditarPath,
  becaDescuentoNuevaPath,
} from '@application-finanzas/config/paths';

const BecaDescuentoTabContent = () => {
  const navigate = useNavigate();
  const { becasDescuentos, loading, error, refetch, eliminar, searchText, setSearchText } =
    useBecaDescuentoListPage();

  const columns = createBecaDescuentoCatalogoColumns({
    onVer: (record) => navigate(becaDescuentoDetallePath(record.id)),
    onEditar: (record) => navigate(becaDescuentoEditarPath(record.id)),
    eliminarBeca: eliminar,
    refetch,
  });

  const nuevaAction = (
    <ActionButton
      permiso={BECA_DESCUENTO_PERMISO}
      accion="CREAR"
      variant="primary"
      icon={<PlusOutlined />}
      onClick={() => navigate(becaDescuentoNuevaPath)}
    >
      Nueva beca o descuento
    </ActionButton>
  );

  return (
    <div className="cfg-pagos-panel">
      <TableListView
        embedded
        headerActions={nuevaAction}
        data={becasDescuentos}
        loading={loading}
        error={error}
        searchText={searchText}
        onSearchChange={(event) => setSearchText(event.target.value)}
        searchPlaceholder="Buscar por nombre, código o descripción…"
        columns={columns}
        rowKey="id"
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
