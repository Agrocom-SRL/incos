import { useMemo } from 'react';
import { Checkbox, Collapse, Table, Tag } from 'antd';
import '@modules/seguridad/styles/seguridad.css';

// Orden canónico de columnas; luego se filtra por dominio según acciones_validas.
const ACCIONES = ['VER', 'CREAR', 'EDITAR', 'ELIMINAR', 'APROBAR', 'EXPORTAR'];

function toSet(asignacionesActuales) {
  const s = new Set();
  (asignacionesActuales || []).forEach((a) => s.add(`${a.permiso_id}:${a.accion}`));
  return s;
}

function hasAsignacion(set, permisoId, accion) {
  return set.has(`${permisoId}:${accion}`);
}

function setToAsignaciones(set) {
  return [...set].map((k) => {
    const [id, ac] = k.split(':');
    return { permiso_id: Number(id), accion: ac };
  });
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
    onChange(setToAsignaciones(next));
  };

  const onToggleFila = (permisoId, checked) => {
    if (disabled) return;
    const next = new Set(asignacionesSet);
    const permiso = Object.values(permisosAgrupados)
      .flat()
      .find((p) => p.id === permisoId);
    const acciones = permiso?.acciones_validas || [];
    acciones.forEach((accion) => {
      const key = `${permisoId}:${accion}`;
      if (checked) next.add(key);
      else next.delete(key);
    });
    onChange(setToAsignaciones(next));
  };

  const onToggleColumna = (rows, accion, checked) => {
    if (disabled) return;
    const next = new Set(asignacionesSet);
    rows.forEach((p) => {
      if (!(p.acciones_validas || []).includes(accion)) return;
      const key = `${p.id}:${accion}`;
      if (checked) next.add(key);
      else next.delete(key);
    });
    onChange(setToAsignaciones(next));
  };

  const onToggleDominio = (rows, checked) => {
    if (disabled) return;
    const next = new Set(asignacionesSet);
    rows.forEach((p) => {
      (p.acciones_validas || []).forEach((accion) => {
        const key = `${p.id}:${accion}`;
        if (checked) next.add(key);
        else next.delete(key);
      });
    });
    onChange(setToAsignaciones(next));
  };

  const dominios = Object.keys(permisosAgrupados).sort();

  const panels = dominios.map((dominio) => {
    const rows = permisosAgrupados[dominio] || [];
    const accionesDelDominio = ACCIONES.filter((accion) => rows.some((p) => (
      (p.acciones_validas || []).includes(accion)
    )));
    const activeCount = rows.reduce((acc, p) => (
      acc + (p.acciones_validas || []).filter((a) => hasAsignacion(asignacionesSet, p.id, a)).length
    ), 0);
    const totalCount = rows.reduce((acc, p) => acc + (p.acciones_validas || []).length, 0);
    const allDominioChecked = totalCount > 0 && activeCount === totalCount;
    const dominioIndeterminate = activeCount > 0 && activeCount < totalCount;

    const columns = [
      {
        title: 'Permiso (todas)',
        dataIndex: 'nombre',
        key: 'nombre',
        width: '60%',
        render: (_, p) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Checkbox
              disabled={disabled}
              checked={(p.acciones_validas || []).every((accion) => (
                hasAsignacion(asignacionesSet, p.id, accion)
              ))}
              indeterminate={
                (p.acciones_validas || []).some((accion) => (
                  hasAsignacion(asignacionesSet, p.id, accion)
                )) &&
                !(p.acciones_validas || []).every((accion) => (
                  hasAsignacion(asignacionesSet, p.id, accion)
                ))
              }
              onChange={(e) => onToggleFila(p.id, e.target.checked)}
            />
            <div>
              <div className="seg-picker__permiso">{p.nombre}</div>
              <div className="seg-picker__codigo">{p.codigo}</div>
            </div>
          </div>
        ),
      },
      ...accionesDelDominio.map((accion) => ({
        title: (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <Tag color="default">{accion}</Tag>
            <Checkbox
              disabled={disabled || rows.length === 0}
              checked={rows.length > 0 && rows.every((p) => (
                !(p.acciones_validas || []).includes(accion)
                  || hasAsignacion(asignacionesSet, p.id, accion)
              ))}
              indeterminate={
                rows.some((p) => (
                  (p.acciones_validas || []).includes(accion)
                    && hasAsignacion(asignacionesSet, p.id, accion)
                )) &&
                !rows.every((p) => (
                  !(p.acciones_validas || []).includes(accion)
                    || hasAsignacion(asignacionesSet, p.id, accion)
                ))
              }
              onChange={(e) => onToggleColumna(rows, accion, e.target.checked)}
            />
          </div>
        ),
        key: accion,
        width: 90,
        align: 'center',
        render: (_, p) => (
          (p.acciones_validas || []).includes(accion) ? (
            <Checkbox
              disabled={disabled}
              checked={hasAsignacion(asignacionesSet, p.id, accion)}
              onChange={(e) => onToggle(p.id, accion, e.target.checked)}
            />
          ) : (
            <span className="seg-picker__no-aplica">—</span>
          )
        ),
      })),
    ];

    return {
      key: dominio,
      label: (
        <div className="seg-picker__panel-head" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            onClick={(e) => e.stopPropagation()}
            role="button"
            tabIndex={-1}
          >
            <Checkbox
              disabled={disabled || rows.length === 0}
              checked={allDominioChecked}
              indeterminate={dominioIndeterminate}
              onChange={(e) => onToggleDominio(rows, e.target.checked)}
            />
          </span>
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
