import { Checkbox, Empty, Table, Tooltip, Typography } from 'antd';
import {
  ACCIONES_GRILLA,
  ACCION_AYUDA,
  CAPA_HEADER_STYLE,
  labelGrupoUi,
} from '@modules/seguridad/roles/constants/permisosGrillaConfig.js';

function estaEnDelta(delta, grupo, accion) {
  const key = `${grupo.grupoUi}:${accion}`;
  if (Object.prototype.hasOwnProperty.call(delta, key)) {
    return delta[key].habilitado;
  }
  return undefined;
}

/**
 * Grilla de permisos por dominio: filas = grupos de sidebar, columnas = acciones por capas.
 * Usa AntD Table temada (column groups + columna fija), sin CSS propio.
 * @param {Array<{ grupoUi: string, rutaSidebar: string, codigos: string[], accionesValidas: string[], accionesAsignadas: string[] }>} grupos
 * @param {Record<string, { permiso_codigo: string, accion: string, habilitado: boolean }>} delta
 */
export default function PermisosDominioPicker({
  grupos = [],
  delta = {},
  toggleAccion,
  disabled = false,
}) {
  if (!grupos.length) {
    return <Empty description="Sin permisos para este dominio." />;
  }

  const renderCelda = (accion) => (_, grupo) => {
    if (!(grupo.accionesValidas || []).includes(accion)) {
      return <Typography.Text type="secondary" aria-label="No aplica">—</Typography.Text>;
    }
    const asignada =
      estaEnDelta(delta, grupo, accion) ?? (grupo.accionesAsignadas || []).includes(accion);
    return (
      <Checkbox checked={asignada} disabled={disabled} onChange={() => toggleAccion(grupo, accion)} />
    );
  };

  const accionColumna = ({ key, header, capa }) => ({
    title: (
      <Tooltip title={ACCION_AYUDA[key] || key}>
        <span>{header}</span>
      </Tooltip>
    ),
    key,
    align: 'center',
    width: 78,
    onHeaderCell: () => ({ style: CAPA_HEADER_STYLE[capa] }),
    render: renderCelda(key),
  });

  const capaColumna = (capa, title) => ({
    title,
    align: 'center',
    onHeaderCell: () => ({ style: CAPA_HEADER_STYLE[capa] }),
    children: ACCIONES_GRILLA.filter((a) => a.capa === capa).map(accionColumna),
  });

  const columns = [
    {
      title: 'Funcionalidad',
      key: 'func',
      fixed: 'left',
      width: 240,
      render: (_, grupo) => (
        <div>
          <Typography.Text strong>{labelGrupoUi(grupo)}</Typography.Text>
          <div>
            <Typography.Text type="secondary" style={{ fontSize: 'var(--font-size-sm)' }}>
              {grupo.rutaSidebar || '—'}
            </Typography.Text>
          </div>
        </div>
      ),
    },
    capaColumna('acceso', 'Acceso'),
    capaColumna('ops', 'Operaciones'),
    capaColumna('flujos', 'Flujos'),
  ];

  return (
    <Table
      className="seg-permisos-grilla"
      size="small"
      bordered
      pagination={false}
      scroll={{ x: 'max-content' }}
      rowKey={(grupo) => `${grupo.grupoUi}:${grupo.rutaSidebar || ''}`}
      dataSource={grupos}
      columns={columns}
    />
  );
}
