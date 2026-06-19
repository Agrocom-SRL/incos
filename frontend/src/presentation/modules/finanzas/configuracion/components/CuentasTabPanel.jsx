/**
 * Panel del tab «Cuentas de pago» (Config. de pagos · Finanzas).
 *
 * Tabla de cuentas con el lenguaje visual canónico (TableListView embebido, como
 * PagosList / CarrerasList / licencias): buscador a la derecha + columnas con
 * numeración, `StatusPill` de estado, indicador de QR y `TableActions` (editar +
 * activar/desactivar). El alta ("Agregar cuenta") vive en la cabecera del workspace
 * (la monta la página). El drawer de alta/edición incluye la subida del QR. "Quitar"
 * una cuenta = desactivarla, no hay eliminar. Recibe props ya mapeadas; no hace fetch.
 * El filtro por texto es local (catálogo corto, sin paginación).
 */

import { useMemo, useState } from 'react';
import { TableListView } from '@organisms';
import { usePermiso } from '@application-auth';
import { createCuentasColumns } from '@finanzas/configuracion/config/configPagosColumns';
import { CONFIG_PAGOS_PERMISO } from '@finanzas/configuracion/config/configPagosPermisos';
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
  onToggleActivo,
}) => {
  const puedeEditar = usePermiso(CONFIG_PAGOS_PERMISO, 'EDITAR');
  const [searchText, setSearchText] = useState('');

  const columns = createCuentasColumns({
    onEditar: onAbrirDrawer,
    onToggleActivo,
    puedeEditar,
    saving,
    metodoNombrePorId,
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
