/**
 * Panel del tab «Cuentas de pago» (Config. de pagos · Finanzas).
 *
 * Tabla de cuentas con el lenguaje visual canónico (TableListView embebido, como
 * PagosList / CarrerasList / licencias): buscador a la derecha + columnas con
 * numeración, identidad «Cuenta» (número + banco), titular con método debajo,
 * contacto (celular + QR), concurrencia «Pagos recibidos», toggle de la columna
 * "Estado" (`useToggleEstadoCatalogo`, PATCH /:id/estado, ACTIVAR) y
 * `TableActions` (ver/editar/eliminar). El alta ("Agregar cuenta") vive en la
 * cabecera del workspace (la monta la página). Ver/editar navegan a páginas
 * completas (`CuentaDetailPage`/`CuentaFormPage`, esta última con la subida
 * del QR). Recibe props ya mapeadas; no hace fetch (eliminar y refetch salen
 * del contexto). El filtro por texto es local (catálogo corto, sin
 * paginación). Filas inactivas atenuadas (`catalogoEstadoRowClassName`).
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableListView } from '@organisms';
import { usePermiso } from '@application-auth';
import { useToggleEstadoCatalogo } from '@application-shared/hooks';
import { useConfigPagosContext } from '@application-finanzas/hooks/context/useConfigPagosContext';
import { catalogoEstadoRowClassName } from '@presentation/utils/tableColumns/createSimpleCatalogTableColumns';
import { createCuentasColumns } from '@finanzas/configuracion/config/configPagosColumns';
import { CONFIG_PAGOS_PERMISO } from '@finanzas/configuracion/config/configPagosPermisos';
import { cuentaDetallePath, cuentaEditarPath } from '@application-finanzas/config/paths';

/** Normaliza para comparar sin acentos ni mayúsculas. */
const normalizar = (valor) =>
  String(valor ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

const CuentasTabPanel = ({
  cuentas = [],
  loading = false,
  error = null,
  saving,
  metodoNombrePorId,
}) => {
  const navigate = useNavigate();
  const { refetch, eliminarCuenta } = useConfigPagosContext();
  const puedeEditar = usePermiso(CONFIG_PAGOS_PERMISO, 'EDITAR');
  const [searchText, setSearchText] = useState('');

  // Toggle rápido activo/inactivo (columna "Estado" del listado)
  const toggleEstado = useToggleEstadoCatalogo({
    useCaseKey: 'cambiarEstadoCuentaPago',
    entidad: 'la cuenta',
    refetch,
  });

  const columns = createCuentasColumns({
    onVer: (record) => navigate(cuentaDetallePath(record.id)),
    onEditar: (record) => navigate(cuentaEditarPath(record.id)),
    puedeEditar,
    metodoNombrePorId,
    refetch,
    eliminarCuenta,
    onToggleEstado: toggleEstado,
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
        loading={loading || saving}
        error={error}
        searchText={searchText}
        onSearchChange={(event) => setSearchText(event.target.value)}
        searchPlaceholder="Buscar por titular, cuenta, banco o método…"
        columns={columns}
        rowKey="id"
        rowClassName={catalogoEstadoRowClassName}
        searchColSpan={10}
        searchStyle={{ maxWidth: 520 }}
        pagination={false}
        loadingTip={saving ? 'Guardando…' : 'Cargando cuentas…'}
      />
    </div>
  );
};

export default CuentasTabPanel;
