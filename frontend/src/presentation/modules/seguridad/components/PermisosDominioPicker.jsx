import { useMemo } from 'react';
import { Checkbox, Collapse, Table, Tag } from 'antd';
import '@modules/seguridad/styles/seguridad.css';

const ACCIONES = ['VER', 'CREAR', 'EDITAR', 'ELIMINAR', 'APROBAR', 'EXPORTAR'];

function toSet(asignacionesActuales) {
  const s = new Set();
  (asignacionesActuales || []).forEach((a) => s.add(`${a.permiso_id}:${a.accion}`));
  return s;
}

function hasAsignacion(set, permisoId, accion) {
  return set.has(`${permisoId}:${accion}`);
}

export default function PermisosDominioPicker({
  permisosAgrupados = {},
  asignacionesActuales = [],
  onChange,
  disabled = false,
}) {
  const asignacionesSet = useMemo(() => toSet(asignacionesActuales), [asignacionesActuales]);

  const onToggle = (permisoId, accion, checked) => {
    if (disabled) return;
    const next = new Set(asignacionesSet);
    const key = `${permisoId}:${accion}`;
    if (checked) next.add(key);
    else next.delete(key);
    onChange(
      [...next].map((k) => {
        const [id, ac] = k.split(':');
        return { permiso_id: Number(id), accion: ac };
      })
    );
  };

  const dominios = Object.keys(permisosAgrupados).sort();

  const panels = dominios.map((dominio) => {
    const rows = permisosAgrupados[dominio] || [];
    const activeCount = rows.reduce((acc, p) => (
      acc + ACCIONES.filter((a) => hasAsignacion(asignacionesSet, p.id, a)).length
    ), 0);

    const columns = [
      {
        title: 'Permiso',
        dataIndex: 'nombre',
        key: 'nombre',
        width: '60%',
        render: (_, p) => (
          <div>
            <div className="seg-picker__permiso">{p.nombre}</div>
            <div className="seg-picker__codigo">{p.codigo}</div>
          </div>
        ),
      },
      ...ACCIONES.map((accion) => ({
        title: <Tag color="default">{accion}</Tag>,
        key: accion,
        width: 90,
        align: 'center',
        render: (_, p) => (
          <Checkbox
            disabled={disabled}
            checked={hasAsignacion(asignacionesSet, p.id, accion)}
            onChange={(e) => onToggle(p.id, accion, e.target.checked)}
          />
        ),
      })),
    ];

    return {
      key: dominio,
      label: (
        <div className="seg-picker__panel-head">
          <span>{dominio}</span>
          <Tag>{activeCount} activos</Tag>
        </div>
      ),
      children: (
        <Table
          rowKey="id"
          size="small"
          pagination={false}
          dataSource={rows}
          columns={columns}
        />
      ),
    };
  });

  return (
    <div className="seg-picker">
      <Collapse items={panels} defaultActiveKey={dominios.slice(0, 1)} />
    </div>
  );
}
