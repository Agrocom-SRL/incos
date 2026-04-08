import { useEffect, useMemo, useState } from 'react';
import { Checkbox, Table, Tag, Tabs, Tooltip } from 'antd';
import {
  AppstoreOutlined,
  BankOutlined,
  BarChartOutlined,
  BookOutlined,
  DollarOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import '@modules/seguridad/styles/seguridad.css';

// Orden canónico de columnas; luego se filtra por dominio según acciones_validas.
const ACCIONES = [
  'LISTAR',
  'DETALLE',
  'CREAR',
  'EDITAR',
  'ELIMINAR',
  'ACTIVAR',
  'APROBAR',
  'EXPORTAR',
  'GENERAR_PDF',
];

/** Acentos e iconos por módulo (paleta Material-like, no solo verdes). */
const DOMINIO_TAB_META = {
  ACADEMICO: { Icon: BookOutlined, accent: '#1565c0' },
  DOCENTES: { Icon: TeamOutlined, accent: '#6a1b9a' },
  FINANZAS: { Icon: DollarOutlined, accent: '#f9a825' },
  INSTITUCIONAL: { Icon: BankOutlined, accent: '#3949ab' },
  MATRICULA: { Icon: IdcardOutlined, accent: '#00838f' },
  REPORTES: { Icon: BarChartOutlined, accent: '#ef6c00' },
  SEGURIDAD: { Icon: SafetyCertificateOutlined, accent: '#c62828' },
};

function metaDominio(codigo) {
  const key = String(codigo || '')
    .toUpperCase()
    .replace(/\s+/g, '_');
  return DOMINIO_TAB_META[key] || { Icon: AppstoreOutlined, accent: '#2e7d32' };
}

/** Colores de columna por tipo de acción */
const ACCION_TAG_COLOR = {
  LISTAR: 'blue',
  DETALLE: 'cyan',
  CREAR: 'cyan',
  EDITAR: 'orange',
  ELIMINAR: 'red',
  ACTIVAR: 'gold',
  APROBAR: 'purple',
  EXPORTAR: 'geekblue',
  GENERAR_PDF: 'volcano',
};

/** Texto breve al pasar el mouse: diferencia técnica CREAR vs EDITAR para quien configura roles */
const ACCION_AYUDA = {
  LISTAR: 'Ver listados y buscar; no implica abrir ficha ni modificar datos.',
  DETALLE: 'Abrir ficha o detalle de un registro concreto.',
  CREAR: 'Registrar registros nuevos (alta). No cubre modificar algo que ya existe.',
  EDITAR:
    'Guardar cambios sobre registros ya existentes (incluye el “Guardar” del formulario de edición). No es lo mismo que CREAR.',
  ELIMINAR: 'Borrar o anular registros según las reglas del módulo.',
  ACTIVAR: 'Activar o rehabilitar registros cuando el flujo lo permita.',
  APROBAR: 'Aprobar o rechazar solicitudes en flujos con validación.',
  EXPORTAR: 'Descargar reportes o exportaciones (p. ej. Excel) según el módulo.',
  GENERAR_PDF: 'Generar documentos PDF según el módulo.',
};

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

  const dominios = useMemo(
    () => Object.keys(permisosAgrupados).sort(),
    [permisosAgrupados]
  );
  const [activeDominio, setActiveDominio] = useState(() => dominios[0] || '');

  useEffect(() => {
    if (!dominios.length) {
      setActiveDominio('');
      return;
    }
    setActiveDominio((prev) => (prev && dominios.includes(prev) ? prev : dominios[0]));
  }, [dominios]);

  const inkAccent = metaDominio(activeDominio || dominios[0]).accent;

  const tabItems = dominios.map((dominio) => {
    const meta = metaDominio(dominio);
    const TabIcon = meta.Icon;
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
            <Tooltip title={ACCION_AYUDA[accion] || accion}>
              <Tag color={ACCION_TAG_COLOR[accion] || 'default'} style={{ cursor: 'help' }}>
                {accion}
              </Tag>
            </Tooltip>
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
        <span
          className="seg-picker__tab-label"
          style={{ '--seg-tab-accent': meta.accent }}
        >
          <span
            className="seg-picker__tab-checkbox"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            role="presentation"
          >
            <Checkbox
              disabled={disabled || rows.length === 0}
              checked={allDominioChecked}
              indeterminate={dominioIndeterminate}
              onChange={(e) => onToggleDominio(rows, e.target.checked)}
            />
          </span>
          <TabIcon className="seg-picker__tab-icon" aria-hidden />
          <span className="seg-picker__tab-title">{dominio}</span>
          <span
            className="seg-picker__tab-badge"
            style={{
              color: meta.accent,
              background: `${meta.accent}1f`,
              borderColor: `${meta.accent}55`,
            }}
          >
            {activeCount} activos
          </span>
        </span>
      ),
      children: (
        <div className="seg-picker__tab-panel">
          <Table
            rowKey="id"
            size="small"
            pagination={false}
            dataSource={rows}
            columns={columns}
            className="seg-picker__table"
          />
        </div>
      ),
    };
  });

  return (
    <div className="seg-picker seg-picker--material">
      {dominios.length === 0 ? (
        <div className="seg-picker__empty">Sin permisos en catálogo.</div>
      ) : (
        <div
          className="sd-tabs-shell seg-picker__tabs-shell"
          style={{ '--seg-ink': inkAccent }}
        >
          <Tabs
            className="sd-tabs seg-picker__tabs"
            items={tabItems}
            activeKey={activeDominio}
            onChange={setActiveDominio}
          />
        </div>
      )}
    </div>
  );
}
