/**
 * Panel del tab «Métodos de pago» (Config. de pagos · Finanzas).
 *
 * Tabla de métodos con el lenguaje visual canónico (TableListView embebido, como
 * BancosTabPanel / CuentasTabPanel / CarrerasList): columnas con numeración,
 * `IdentidadCelda`, concurrencia «Pagos registrados», toggle de la columna
 * "Estado" (`useToggleEstadoCatalogo`, PATCH /:id/estado, ACTIVAR) y
 * `TableActions` (ver/editar). Sin crear/eliminar (los 4 métodos
 * EFECTIVO/QR/TRANSFERENCIA/DEPOSITO son fijos, sin DELETE en backend). Ver/
 * editar navegan a páginas completas (`MetodoDetailPage`/`MetodoFormPage`).
 * Los controles se gobiernan por permiso EDITAR/ACTIVAR. Recibe props ya
 * mapeadas; no hace fetch (refetch sale del contexto). Filas inactivas
 * atenuadas (`catalogoEstadoRowClassName`).
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableListView } from '@organisms';
import { usePermiso } from '@application-auth';
import { useToggleEstadoCatalogo } from '@application-shared/hooks';
import { useConfigPagosContext } from '@application-finanzas/hooks/context/useConfigPagosContext';
import { catalogoEstadoRowClassName } from '@presentation/utils/tableColumns/createSimpleCatalogTableColumns';
import { createMetodosColumns } from '@finanzas/configuracion/config/configPagosColumns';
import { CONFIG_PAGOS_PERMISO } from '@finanzas/configuracion/config/configPagosPermisos';
import { metodoDetallePath, metodoEditarPath } from '@application-finanzas/config/paths';
import '../styles/config-pagos.css';

/** Normaliza para comparar sin acentos ni mayúsculas. */
const normalizar = (valor) =>
  String(valor ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

const MetodosTabPanel = ({ metodos = [], loading = false, error = null, saving }) => {
  const navigate = useNavigate();
  const { refetch } = useConfigPagosContext();
  const puedeEditar = usePermiso(CONFIG_PAGOS_PERMISO, 'EDITAR');
  const [searchText, setSearchText] = useState('');

  // Toggle rápido activo/inactivo (columna "Estado" del listado)
  const toggleEstado = useToggleEstadoCatalogo({
    useCaseKey: 'cambiarEstadoMetodoPago',
    entidad: 'el método de pago',
    refetch,
  });

  const columns = createMetodosColumns({
    onVer: (record) => navigate(metodoDetallePath(record.id)),
    onEditar: (record) => navigate(metodoEditarPath(record.id)),
    puedeEditar,
    onToggleEstado: toggleEstado,
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
        loading={loading || saving}
        error={error}
        searchText={searchText}
        onSearchChange={(event) => setSearchText(event.target.value)}
        searchPlaceholder="Buscar por código o nombre…"
        columns={columns}
        rowKey="id"
        rowClassName={catalogoEstadoRowClassName}
        searchColSpan={10}
        searchStyle={{ maxWidth: 520 }}
        pagination={false}
        loadingTip={saving ? 'Guardando…' : 'Cargando métodos de pago…'}
      />
    </div>
  );
};

export default MetodosTabPanel;
