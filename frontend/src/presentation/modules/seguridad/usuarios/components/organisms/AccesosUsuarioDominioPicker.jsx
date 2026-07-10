import { Checkbox, Empty, Spin, Table, Tooltip, Typography } from 'antd';
import { LockOutlined, StopOutlined } from '@ant-design/icons';
import {
  ACCIONES_GRILLA,
  ACCION_AYUDA,
  CAPA_HEADER_STYLE,
  labelGrupoUi,
} from '@modules/seguridad/roles/constants/permisosGrillaConfig.js';

/**
 * Grilla de ACCESOS RESUELTOS de un usuario: mismo layout de columnas/capas que
 * `PermisosDominioPicker` (grilla de un ROL) — filas = `grupos_ui`, columnas =
 * Acceso/Operaciones/Flujos — pero la celda tiene 4 estados en vez de 2, porque
 * un usuario puede tener overrides individuales sobre lo heredado del rol:
 *
 * - `heredado`: el rol ya lo asigna y no hay override → checkbox marcado, con candado
 *   (glifo, no solo color); clicable para crear un override REVOKE puntual sobre este usuario.
 * - `otorgado`: override GRANT (el usuario lo tiene aunque el rol no lo dé, o lo reafirma)
 *   → checkbox marcado + tinte verde.
 * - `revocado`: override REVOKE (el rol lo daría, pero se le quitó a este usuario puntual)
 *   → checkbox desmarcado + tinte rojo + glifo `StopOutlined` (la distinción con `ninguno`
 *   NO depende solo del color: a11y para daltonismo/bajo contraste).
 * - `ninguno`: ni el rol ni un override se lo dan → checkbox desmarcado, sin tinte ni glifo.
 *
 * Vive en `usuarios/` (no en `roles/`) porque su unidad de negocio es el usuario, no el
 * rol; reutiliza el catálogo de columnas/capas de `PermisosDominioPicker` en vez de
 * duplicarlo (única fuente para `ACCIONES_GRILLA`/`ACCION_AYUDA`/`CAPA_HEADER_STYLE`).
 *
 * @param {Array<{ grupoUi: string, grupoNombre?: string, rutaSidebar: string, codigos: string[], accionesValidas: string[], accionesAsignadas: string[] }>} grupos
 * @param {(grupo: object, accion: string) => 'heredado'|'otorgado'|'revocado'|'ninguno'} estadoCelda
 * @param {(grupo: object, accion: string) => ({ motivo?: string }|undefined)} [overrideDeCelda]
 * @param {(grupo: object, accion: string) => void} onToggle
 * @param {(grupo: object, accion: string) => boolean} [isToggling] celda con una alta/baja
 *   de override en curso (post-click) — feedback LOCAL (spinner + disabled) en vez del
 *   spinner de página completa.
 */
export default function AccesosUsuarioDominioPicker({
  grupos = [],
  estadoCelda,
  overrideDeCelda,
  onToggle,
  isToggling,
  disabled = false,
}) {
  if (!grupos.length) {
    return <Empty description="Sin permisos para este dominio." />;
  }

  const tooltipDe = (estado, override) => {
    if (estado === 'heredado') return 'Heredado del rol.';
    if (estado === 'otorgado') {
      return override?.motivo ? `Otorgado individualmente. Motivo: ${override.motivo}` : 'Otorgado individualmente.';
    }
    if (estado === 'revocado') {
      return override?.motivo ? `Revocado individualmente. Motivo: ${override.motivo}` : 'Revocado individualmente.';
    }
    return null;
  };

  const renderCelda = (accion) => (_, grupo) => {
    if (!(grupo.accionesValidas || []).includes(accion)) {
      return <Typography.Text type="secondary" aria-label="No aplica">—</Typography.Text>;
    }
    const estado = estadoCelda(grupo, accion);
    const override = overrideDeCelda?.(grupo, accion);
    const toggling = Boolean(isToggling?.(grupo, accion));
    const checked = estado === 'heredado' || estado === 'otorgado';
    const cellDisabled = disabled || toggling;
    const checkbox = (
      <Checkbox
        checked={checked}
        disabled={cellDisabled}
        onChange={() => !disabled && !toggling && onToggle(grupo, accion)}
      />
    );
    const claseCelda = ['seg-accesos-celda', toggling ? 'seg-accesos-celda--toggling' : null]
      .filter(Boolean)
      .join(' ');
    const spinner = toggling ? <Spin size="small" className="seg-accesos-celda__spin" aria-label="Guardando…" /> : null;

    if (estado === 'heredado') {
      return (
        <Tooltip title={tooltipDe(estado, override)}>
          <span className={`${claseCelda} seg-accesos-celda--heredado`}>
            {checkbox}
            <LockOutlined className="seg-accesos-celda__lock" />
          </span>
        </Tooltip>
      );
    }
    if (estado === 'otorgado') {
      return (
        <Tooltip title={tooltipDe(estado, override)}>
          <span className={`${claseCelda} seg-accesos-celda--otorgado`}>
            {checkbox}
            {spinner}
          </span>
        </Tooltip>
      );
    }
    if (estado === 'revocado') {
      return (
        <Tooltip title={tooltipDe(estado, override)}>
          <span className={`${claseCelda} seg-accesos-celda--revocado`}>
            {checkbox}
            {/* Glifo propio (no solo color) para distinguir "revocado" de "ninguno" — a11y. */}
            <StopOutlined className="seg-accesos-celda__stop" />
            {spinner}
          </span>
        </Tooltip>
      );
    }
    return (
      <span className={claseCelda}>
        {checkbox}
        {spinner}
      </span>
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
      className="seg-permisos-grilla seg-accesos-grilla"
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
