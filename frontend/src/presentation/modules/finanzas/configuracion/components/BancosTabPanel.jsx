/**
 * Panel del tab «Bancos autorizados» (Config. de pagos · Finanzas).
 *
 * Tabla de bancos con el lenguaje visual canónico (TableListView embebido, como
 * PagosList / CarrerasList / licencias): buscador a la derecha + columnas con
 * numeración, `IdentidadCelda` y `TableActions` (ver/editar/eliminar). El alta
 * ("Agregar banco") vive en la cabecera del workspace (la monta la página). Ver
 * navega a la ficha de detalle (`BancoDetailPage`), donde también se gestiona el
 * toggle activo/inactivo. Recibe props ya mapeadas; no hace fetch (eliminar y
 * refetch salen del contexto). El filtro por texto es local (catálogo corto,
 * sin paginación).
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableListView } from '@organisms';
import { usePermiso } from '@application-auth';
import { useConfigPagosContext } from '@application-finanzas/hooks/context/useConfigPagosContext';
import { createBancosColumns } from '@finanzas/configuracion/config/configPagosColumns';
import { CONFIG_PAGOS_PERMISO } from '@finanzas/configuracion/config/configPagosPermisos';
import { bancoDetallePath } from '@application-finanzas/config/paths';
import BancoDrawer from './BancoDrawer.jsx';

/** Normaliza para comparar sin acentos ni mayúsculas. */
const normalizar = (valor) =>
  String(valor ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

const BancosTabPanel = ({
  bancos = [],
  metodos = [],
  saving,
  metodoNombrePorId,
  drawerAbierto,
  bancoEnEdicion,
  onAbrirDrawer,
  onCerrarDrawer,
  onGuardar,
}) => {
  const navigate = useNavigate();
  const { refetch, eliminarBanco } = useConfigPagosContext();
  const puedeEditar = usePermiso(CONFIG_PAGOS_PERMISO, 'EDITAR');
  const [searchText, setSearchText] = useState('');

  const columns = createBancosColumns({
    onVer: (record) => navigate(bancoDetallePath(record.id)),
    onEditar: onAbrirDrawer,
    puedeEditar,
    metodoNombrePorId,
    refetch,
    eliminarBanco,
  });

  const bancosFiltrados = useMemo(() => {
    const termino = normalizar(searchText);
    if (!termino) return bancos;
    return bancos.filter((banco) =>
      [banco.codigo, banco.nombre, metodoNombrePorId?.(banco.metodoPagoId)]
        .map(normalizar)
        .some((campo) => campo.includes(termino)),
    );
  }, [bancos, searchText, metodoNombrePorId]);

  return (
    <div className="cfg-pagos-panel">
      <TableListView
        embedded
        data={bancosFiltrados}
        loading={saving}
        searchText={searchText}
        onSearchChange={(event) => setSearchText(event.target.value)}
        searchPlaceholder="Buscar por código, nombre o método…"
        columns={columns}
        rowKey="id"
        searchColSpan={10}
        searchStyle={{ maxWidth: 520 }}
        pagination={false}
        loadingTip="Guardando…"
      />

      <BancoDrawer
        open={drawerAbierto}
        banco={bancoEnEdicion}
        metodos={metodos}
        saving={saving}
        onGuardar={onGuardar}
        onCancelar={onCerrarDrawer}
      />
    </div>
  );
};

export default BancosTabPanel;
