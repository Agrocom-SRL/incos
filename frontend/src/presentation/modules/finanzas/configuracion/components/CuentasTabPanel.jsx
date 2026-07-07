/**
 * Panel del tab «Cuentas de pago» (Config. de pagos · Finanzas).
 *
 * Tabla de cuentas con el lenguaje visual canónico (TableListView embebido, como
 * PagosList / CarrerasList / licencias): buscador a la derecha + columnas con
 * numeración, `IdentidadCelda`, indicador de QR y `TableActions` (ver/editar/
 * eliminar). El alta ("Agregar cuenta") vive en la cabecera del workspace (la
 * monta la página). El drawer de alta/edición incluye la subida del QR. Ver
 * navega a la ficha de detalle (`CuentaDetailPage`), donde también se gestiona
 * el toggle activo/inactivo. Recibe props ya mapeadas; no hace fetch (eliminar y
 * refetch salen del contexto). El filtro por texto es local (catálogo corto,
 * sin paginación).
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableListView } from '@organisms';
import { usePermiso } from '@application-auth';
import { useConfigPagosContext } from '@application-finanzas/hooks/context/useConfigPagosContext';
import { createCuentasColumns } from '@finanzas/configuracion/config/configPagosColumns';
import { CONFIG_PAGOS_PERMISO } from '@finanzas/configuracion/config/configPagosPermisos';
import { cuentaDetallePath } from '@application-finanzas/config/paths';
import CuentaDrawer from './CuentaDrawer.jsx';

/** Normaliza para comparar sin acentos ni mayúsculas. */
const normalizar = (valor) =>
  String(valor ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

const CuentasTabPanel = ({
  cuentas = [],
  metodos = [],
  bancos = [],
  saving,
  metodoNombrePorId,
  drawerAbierto,
  cuentaEnEdicion,
  onAbrirDrawer,
  onCerrarDrawer,
  onGuardar,
}) => {
  const navigate = useNavigate();
  const { refetch, eliminarCuenta } = useConfigPagosContext();
  const puedeEditar = usePermiso(CONFIG_PAGOS_PERMISO, 'EDITAR');
  const [searchText, setSearchText] = useState('');

  const columns = createCuentasColumns({
    onVer: (record) => navigate(cuentaDetallePath(record.id)),
    onEditar: onAbrirDrawer,
    puedeEditar,
    metodoNombrePorId,
    refetch,
    eliminarCuenta,
  });

  const cuentasFiltradas = useMemo(() => {
    const termino = normalizar(searchText);
    if (!termino) return cuentas;
    return cuentas.filter((cuenta) =>
      [
        cuenta.nombreTitular,
        cuenta.numeroCuenta,
        cuenta.bancoNombre,
        metodoNombrePorId?.(cuenta.metodoPagoId),
      ]
        .map(normalizar)
        .some((campo) => campo.includes(termino)),
    );
  }, [cuentas, searchText, metodoNombrePorId]);

  return (
    <div className="cfg-pagos-panel">
      <TableListView
        embedded
        data={cuentasFiltradas}
        loading={saving}
        searchText={searchText}
        onSearchChange={(event) => setSearchText(event.target.value)}
        searchPlaceholder="Buscar por titular, cuenta, banco o método…"
        columns={columns}
        rowKey="id"
        searchColSpan={10}
        searchStyle={{ maxWidth: 520 }}
        pagination={false}
        loadingTip="Guardando…"
      />

      <CuentaDrawer
        open={drawerAbierto}
        cuenta={cuentaEnEdicion}
        metodos={metodos}
        bancos={bancos}
        saving={saving}
        onGuardar={onGuardar}
        onCancelar={onCerrarDrawer}
      />
    </div>
  );
};

export default CuentasTabPanel;
