/**
 * Columnas de las tablas de la pantalla "Config. de pagos" (Finanzas):
 * bancos autorizados y cuentas de pago.
 *
 * Las celdas usan `TableCell` (tamaños vía token, sin `fontSize` literal). La
 * acción de editar y el switch de activo se inyectan desde la página (envueltos en
 * `PermisoGuard configuracion.pagos EDITAR`), por eso reciben render externos:
 * la config no decide permisos.
 */

import { Button, Space, Switch, Tag } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { TableCell } from '@molecules';
import { Text } from '@atoms';

/** Etiqueta del método de pago asociado (por id) o guion. */
const renderMetodo = (metodoNombre) =>
  metodoNombre ? <Tag>{metodoNombre}</Tag> : <Text type="secondary">—</Text>;

/**
 * Columnas de la tabla de BANCOS autorizados.
 * @param {Object} args
 * @param {Function} args.onEditar - (banco) => void
 * @param {Function} args.onToggleActivo - (banco, activo) => void
 * @param {boolean} args.puedeEditar - permiso EDITAR (gobierna switch + botón).
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
    title: 'Código',
    dataIndex: 'codigo',
    key: 'codigo',
    render: (codigo) => <TableCell>{codigo || '—'}</TableCell>,
  },
  {
    title: 'Nombre',
    dataIndex: 'nombre',
    key: 'nombre',
    render: (nombre) => <TableCell>{nombre || '—'}</TableCell>,
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
    title: 'Activo',
    dataIndex: 'activo',
    key: 'activo',
    width: 110,
    align: 'center',
    render: (activo, record) => (
      <Switch
        checked={!!activo}
        disabled={!puedeEditar || saving}
        onChange={(checked) => onToggleActivo?.(record, checked)}
      />
    ),
  },
  {
    title: 'Acciones',
    key: 'acciones',
    width: 110,
    align: 'center',
    render: (_, record) => (
      <Space>
        <Button
          type="text"
          icon={<EditOutlined />}
          disabled={!puedeEditar}
          onClick={() => onEditar?.(record)}
        >
          Editar
        </Button>
      </Space>
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
    title: 'Titular',
    dataIndex: 'nombreTitular',
    key: 'nombreTitular',
    render: (nombreTitular) => <TableCell>{nombreTitular || '—'}</TableCell>,
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
    width: 80,
    align: 'center',
    render: (qrImagenUrl) =>
      qrImagenUrl ? <Tag color="success">Sí</Tag> : <Text type="secondary">—</Text>,
  },
  {
    title: 'Activo',
    dataIndex: 'activo',
    key: 'activo',
    width: 110,
    align: 'center',
    render: (activo, record) => (
      <Switch
        checked={!!activo}
        disabled={!puedeEditar || saving}
        onChange={(checked) => onToggleActivo?.(record, checked)}
      />
    ),
  },
  {
    title: 'Acciones',
    key: 'acciones',
    width: 110,
    align: 'center',
    render: (_, record) => (
      <Space>
        <Button
          type="text"
          icon={<EditOutlined />}
          disabled={!puedeEditar}
          onClick={() => onEditar?.(record)}
        >
          Editar
        </Button>
      </Space>
    ),
  },
];
