/**
 * Panel del tab «Bancos autorizados» (Config. de pagos · Finanzas).
 *
 * Tabla de bancos con el lenguaje visual canónico (TableListView embebido, como
 * PagosList / CarrerasList / licencias): buscador a la derecha + columnas con
 * numeración, `StatusPill` de estado y `TableActions` (editar + activar/desactivar).
 * El alta ("Agregar banco") vive en la cabecera del workspace (la monta la página).
 * "Quitar" un banco = desactivarlo, no hay eliminar. Recibe props ya mapeadas; no
 * hace fetch. El filtro por texto es local (catálogo corto, sin paginación).
 */

import { useMemo, useState } from 'react';
import { TableListView } from '@organisms';
import { usePermiso } from '@application-auth';
import { createBancosColumns } from '@finanzas/configuracion/config/configPagosColumns';
import { CONFIG_PAGOS_PERMISO } from '@finanzas/configuracion/config/configPagosPermisos';
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
  onToggleActivo,
}) => {
  const puedeEditar = usePermiso(CONFIG_PAGOS_PERMISO, 'EDITAR');
  const [searchText, setSearchText] = useState('');

  const columns = createBancosColumns({
    onEditar: onAbrirDrawer,
    onToggleActivo,
    puedeEditar,
    saving,
    metodoNombrePorId,
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
