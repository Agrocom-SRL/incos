/**
 * Panel del tab «Métodos de pago» (Config. de pagos · Finanzas).
 *
 * Tabla de métodos con el lenguaje visual canónico (TableListView embebido, como
 * BancosTabPanel / CuentasTabPanel / CarrerasList): columnas con numeración,
 * `IdentidadCelda` y `TableActions` (ver/editar). Sin crear/eliminar (los 4
 * métodos EFECTIVO/QR/TRANSFERENCIA/DEPOSITO son fijos). Ver navega a la ficha
 * de detalle (`MetodoDetailPage`), donde también se gestiona el toggle
 * activo/inactivo. Los controles se gobiernan por permiso EDITAR. Recibe props
 * ya mapeadas; no hace fetch.
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableListView } from '@organisms';
import { usePermiso } from '@application-auth';
import { createMetodosColumns } from '@finanzas/configuracion/config/configPagosColumns';
import { CONFIG_PAGOS_PERMISO } from '@finanzas/configuracion/config/configPagosPermisos';
import { metodoDetallePath } from '@application-finanzas/config/paths';
import MetodoDrawer from './MetodoDrawer.jsx';
import '../styles/config-pagos.css';

/** Normaliza para comparar sin acentos ni mayúsculas. */
const normalizar = (valor) =>
  String(valor ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

const MetodosTabPanel = ({
  metodos = [],
  saving,
  drawerAbierto,
  metodoEnEdicion,
  onAbrirDrawer,
  onCerrarDrawer,
  onGuardar,
}) => {
  const navigate = useNavigate();
  const puedeEditar = usePermiso(CONFIG_PAGOS_PERMISO, 'EDITAR');
  const [searchText, setSearchText] = useState('');

  const columns = createMetodosColumns({
    onVer: (record) => navigate(metodoDetallePath(record.id)),
    onEditar: onAbrirDrawer,
    puedeEditar,
  });

  const metodosFiltrados = useMemo(() => {
    const termino = normalizar(searchText);
    if (!termino) return metodos;
    return metodos.filter((metodo) =>
      [metodo.codigo, metodo.nombre].map(normalizar).some((campo) => campo.includes(termino)),
    );
  }, [metodos, searchText]);

  return (
    <div className="cfg-pagos-panel">
      <TableListView
        embedded
        data={metodosFiltrados}
        loading={saving}
        searchText={searchText}
        onSearchChange={(event) => setSearchText(event.target.value)}
        searchPlaceholder="Buscar por código o nombre…"
        columns={columns}
        rowKey="id"
        searchColSpan={10}
        searchStyle={{ maxWidth: 520 }}
        pagination={false}
        loadingTip="Guardando…"
      />

      <MetodoDrawer
        open={drawerAbierto}
        metodo={metodoEnEdicion}
        saving={saving}
        onGuardar={onGuardar}
        onCancelar={onCerrarDrawer}
      />
    </div>
  );
};

export default MetodosTabPanel;
