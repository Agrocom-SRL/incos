import { Checkbox, Empty, Table, Tooltip, Typography } from 'antd';

/** Orden de columnas: capa Acceso (1) + Operaciones (5) + Flujos (3) */
const ACCIONES_GRILLA = [
  { key: 'LISTAR', header: 'LISTAR', capa: 'acceso' },
  { key: 'DETALLE', header: 'DETALLE', capa: 'ops' },
  { key: 'CREAR', header: 'CREAR', capa: 'ops' },
  { key: 'EDITAR', header: 'EDITAR', capa: 'ops' },
  { key: 'ELIMINAR', header: 'ELIMINAR', capa: 'ops' },
  { key: 'ACTIVAR', header: 'ACTIVAR', capa: 'ops' },
  { key: 'APROBAR', header: 'APROBAR', capa: 'flujos' },
  { key: 'EXPORTAR', header: 'EXPORTAR', capa: 'flujos' },
  { key: 'GENERAR_PDF', header: 'PDF', capa: 'flujos' },
];

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

/** Cabecera de cada capa: tinte semántico desde tokens del tema (sin CSS propio). */
const CAPA_HEADER_STYLE = {
  acceso: { background: 'var(--color-info-bg)', color: 'var(--color-info-text)' },
  ops: { background: 'var(--color-success-bg)', color: 'var(--color-success-text)' },
  flujos: { background: 'var(--color-warning-bg)', color: 'var(--color-warning-text)' },
};

/**
 * Nombre amigable del grupo: viene del backend (`grupo.grupoNombre`), tabla `grupos_ui`
 * (fuente única; sembrada por módulo). Fallback al código `grupoUi` si faltara la fila.
 */
function labelGrupoUi(grupo) {
  return grupo?.grupoNombre || String(grupo?.grupoUi || '');
}

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
