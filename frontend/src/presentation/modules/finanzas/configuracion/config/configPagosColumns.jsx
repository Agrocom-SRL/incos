/**
 * Columnas de las tablas de "Config. de pagos" (Finanzas): bancos autorizados y
 * cuentas de pago.
 *
 * Lenguaje visual canónico (CarrerasList / licencias): celdas `TableCell`,
 * estado con `StatusPill` (activo/inactivo) y acciones con `TableActions`
 * (editar + activar/desactivar como acción extra). La config no decide permisos:
 * recibe `puedeEditar` ya resuelto y los handlers desde la página.
 */

import { CheckCircleOutlined, EditOutlined, StopOutlined } from '@ant-design/icons';
import { TableActions, TableCell } from '@molecules';
import { Text } from '@atoms';
import StatusPill from '@atoms/StatusPill';
import { getActivoPill, CFG_PAGOS_PILL_NEUTRAL } from './configPagosPills';
import { CONFIG_PAGOS_PERMISO } from './configPagosPermisos';

/** Etiqueta del método de pago asociado (por id) o guion. */
const renderMetodo = (metodoNombre) =>
  metodoNombre ? (
    <StatusPill label={metodoNombre} className={CFG_PAGOS_PILL_NEUTRAL} />
  ) : (
    <Text type="secondary">—</Text>
  );

/** Acción extra de activar/desactivar para `TableActions` (gobernada por permiso EDITAR). */
const buildToggleAction = ({ record, onToggleActivo, puedeEditar, saving }) => {
  const activo = !!record.activo;
  return {
    key: 'toggle-activo',
    tooltip: activo ? 'Desactivar' : 'Activar',
    icon: activo ? <StopOutlined /> : <CheckCircleOutlined />,
    variant: activo ? 'warning' : 'success',
    disabled: !puedeEditar || saving,
    onClick: () => onToggleActivo?.(record, !activo),
  };
};

/**
 * Columnas de la tabla de BANCOS autorizados.
 * @param {Object} args
 * @param {Function} args.onEditar - (banco) => void (abre drawer)
 * @param {Function} args.onToggleActivo - (banco, activo) => void
 * @param {boolean} args.puedeEditar - permiso EDITAR (gobierna acciones).
 * @param {boolean} args.saving - deshabilita controles mientras guarda.
 * @param {Function} args.metodoNombrePorId - (id) => string|null
 */
export const createBancosColumns = ({
  onEditar,
  onToggleActivo,
  puedeEditar,
  saving,
  metodoNombrePorId,
}) => [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
  },
  {
    title: 'Código',
    dataIndex: 'codigo',
    key: 'codigo',
    render: (codigo) => <TableCell>{codigo || '—'}</TableCell>,
  },
  {
    title: 'Nombre',
    dataIndex: 'nombre',
    key: 'nombre',
    ellipsis: true,
    render: (nombre) => <TableCell>{nombre || '—'}</TableCell>,
    sorter: true,
    sortCompare: (a, b) =>
      (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' }),
  },
  {
    title: 'Método',
    dataIndex: 'metodoPagoId',
    key: 'metodoPagoId',
    render: (metodoPagoId) => (
      <TableCell>{renderMetodo(metodoNombrePorId?.(metodoPagoId))}</TableCell>
    ),
  },
  {
    title: 'Estado',
    dataIndex: 'activo',
    key: 'activo',
    width: 120,
    align: 'center',
    sorter: true,
    sortCompare: (a, b) => Number(!!a.activo) - Number(!!b.activo),
    render: (activo) => {
      const pill = getActivoPill(!!activo);
      return <StatusPill label={pill.label} className={pill.className} />;
    },
  },
  {
    title: 'Acciones',
    key: 'acciones',
    fixed: 'right',
    width: 130,
    align: 'right',
    render: (_, record) => (
      <TableActions
        record={record}
        onEdit={() => onEditar?.(record)}
        editTitle="Editar banco"
        editDisabled={!puedeEditar}
        extraActions={[buildToggleAction({ record, onToggleActivo, puedeEditar, saving })]}
        permisos={{
          editar: { codigo: CONFIG_PAGOS_PERMISO, accion: 'EDITAR' },
        }}
      />
    ),
  },
];

/**
 * Columnas de la tabla de CUENTAS de pago.
 * @param {Object} args - mismas dependencias que bancos.
 */
export const createCuentasColumns = ({
  onEditar,
  onToggleActivo,
  puedeEditar,
  saving,
  metodoNombrePorId,
}) => [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
  },
  {
    title: 'Titular',
    dataIndex: 'nombreTitular',
    key: 'nombreTitular',
    ellipsis: true,
    render: (nombreTitular) => <TableCell>{nombreTitular || '—'}</TableCell>,
    sorter: true,
    sortCompare: (a, b) =>
      (a.nombreTitular || '').localeCompare(b.nombreTitular || '', 'es', { sensitivity: 'base' }),
  },
  {
    title: 'N.° de cuenta',
    dataIndex: 'numeroCuenta',
    key: 'numeroCuenta',
    render: (numeroCuenta) => <TableCell>{numeroCuenta || '—'}</TableCell>,
  },
  {
    title: 'Banco',
    dataIndex: 'bancoNombre',
    key: 'bancoNombre',
    render: (bancoNombre) => (
      <TableCell>{bancoNombre || <Text type="secondary">—</Text>}</TableCell>
    ),
  },
  {
    title: 'Método',
    dataIndex: 'metodoPagoId',
    key: 'metodoPagoId',
    render: (metodoPagoId) => (
      <TableCell>{renderMetodo(metodoNombrePorId?.(metodoPagoId))}</TableCell>
    ),
  },
  {
    title: 'QR',
    dataIndex: 'qrImagenUrl',
    key: 'qrImagenUrl',
    width: 90,
    align: 'center',
    render: (qrImagenUrl) =>
      qrImagenUrl ? (
        <StatusPill label="Cargado" className={CFG_PAGOS_PILL_NEUTRAL} />
      ) : (
        <Text type="secondary">—</Text>
      ),
  },
  {
    title: 'Estado',
    dataIndex: 'activo',
    key: 'activo',
    width: 120,
    align: 'center',
    sorter: true,
    sortCompare: (a, b) => Number(!!a.activo) - Number(!!b.activo),
    render: (activo) => {
      const pill = getActivoPill(!!activo);
      return <StatusPill label={pill.label} className={pill.className} />;
    },
  },
  {
    title: 'Acciones',
    key: 'acciones',
    fixed: 'right',
    width: 130,
    align: 'right',
    render: (_, record) => (
      <TableActions
        record={record}
        onEdit={() => onEditar?.(record)}
        editTitle="Editar cuenta"
        editDisabled={!puedeEditar}
        extraActions={[buildToggleAction({ record, onToggleActivo, puedeEditar, saving })]}
        permisos={{
          editar: { codigo: CONFIG_PAGOS_PERMISO, accion: 'EDITAR' },
        }}
      />
    ),
  },
];
