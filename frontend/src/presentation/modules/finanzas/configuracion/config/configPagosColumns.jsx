/**
 * Columnas de las tablas de "Config. de pagos" (Finanzas): métodos de pago,
 * bancos autorizados y cuentas de pago.
 *
 * Lenguaje visual canónico (CarrerasList / licencias): identidad con
 * `IdentidadCelda`, datos apilados en una misma columna cuando se consolidan
 * (Ant Design `Flex`) y acciones con `TableActions` (ver/editar/eliminar).
 * Máximo 4 columnas por tabla, sin `fixed`. La config no decide permisos:
 * recibe `puedeEditar` ya resuelto y los handlers desde el panel.
 *
 * El toggle activo/inactivo YA NO vive en la tabla: se gestiona desde la
 * ficha de detalle de cada banco/cuenta/método (`BancoDetailPage` /
 * `CuentaDetailPage` / `MetodoDetailPage`). Por eso las 3 tablas pierden la
 * columna "Estado" (se ve en la ficha) y ganan `IdentidadCelda` en su lugar.
 * Bancos y cuentas tienen ficha + eliminar real; métodos (catálogo fijo de 4)
 * solo tienen ficha de ver+editar, sin eliminar.
 */

import { Flex } from 'antd';
import { IdentidadCelda, StatusPill, Text } from '@atoms';
import { TableActions, TableCell } from '@molecules';
import { CFG_PAGOS_PILL_NEUTRAL } from './configPagosPills';
import { CONFIG_PAGOS_PERMISO } from './configPagosPermisos';

/** Etiqueta del método de pago asociado (por id) o guion. */
const renderMetodo = (metodoNombre) =>
  metodoNombre ? (
    <StatusPill label={metodoNombre} className={CFG_PAGOS_PILL_NEUTRAL} />
  ) : (
    <Text type="secondary">—</Text>
  );

/**
 * Columnas de la tabla de BANCOS autorizados.
 * @param {Object} args
 * @param {Function} args.onVer - (banco) => void (navega a la ficha de detalle)
 * @param {Function} args.onEditar - (banco) => void (abre drawer)
 * @param {boolean} args.puedeEditar - permiso EDITAR (gobierna acciones).
 * @param {Function} args.metodoNombrePorId - (id) => string|null
 * @param {Function} [args.refetch] - recarga el catálogo tras eliminar.
 * @param {Function} [args.eliminarBanco] - (id) => Promise<{success, error?}>
 */
export const createBancosColumns = ({
  onVer,
  onEditar,
  puedeEditar,
  metodoNombrePorId,
  refetch,
  eliminarBanco,
}) => [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
  },
  {
    title: 'Identidad',
    dataIndex: 'nombre',
    key: 'identidad',
    ellipsis: true,
    render: (_nombre, record) => (
      <IdentidadCelda codigo={record.codigo} nombre={(record.nombre || '—').toUpperCase()} />
    ),
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
    title: 'Acciones',
    key: 'acciones',
    width: 150,
    align: 'right',
    render: (_, record) => (
      <TableActions
        record={record}
        refetch={refetch}
        onView={() => onVer?.(record)}
        onEdit={() => onEditar?.(record)}
        editTitle="Editar banco"
        editDisabled={!puedeEditar}
        deleteFn={eliminarBanco ? (id) => eliminarBanco(id) : null}
        itemName={record.nombre ? `el banco ${record.nombre}` : 'este banco'}
        permisos={{
          ver: { codigo: CONFIG_PAGOS_PERMISO, accion: 'DETALLE' },
          editar: { codigo: CONFIG_PAGOS_PERMISO, accion: 'EDITAR' },
          eliminar: { codigo: CONFIG_PAGOS_PERMISO, accion: 'ELIMINAR' },
        }}
      />
    ),
  },
];

/**
 * Columnas de la tabla de CUENTAS de pago.
 * @param {Object} args - mismas dependencias que bancos.
 * @param {Function} [args.eliminarCuenta] - (id) => Promise<{success, error?}>
 */
export const createCuentasColumns = ({
  onVer,
  onEditar,
  puedeEditar,
  metodoNombrePorId,
  refetch,
  eliminarCuenta,
}) => [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
  },
  {
    title: 'Identidad',
    dataIndex: 'numeroCuenta',
    key: 'identidad',
    ellipsis: true,
    render: (_numeroCuenta, record) => (
      <IdentidadCelda codigo={record.numeroCuenta} nombre={(record.nombreTitular || '—').toUpperCase()} />
    ),
    sorter: true,
    sortCompare: (a, b) =>
      (a.nombreTitular || '').localeCompare(b.nombreTitular || '', 'es', { sensitivity: 'base' }),
  },
  {
    title: 'Banco y método',
    dataIndex: 'bancoNombre',
    key: 'bancoNombre',
    render: (bancoNombre, record) => (
      <Flex vertical align="flex-start" gap={4}>
        <Text ellipsis>{bancoNombre || <Text type="secondary">—</Text>}</Text>
        {renderMetodo(metodoNombrePorId?.(record.metodoPagoId))}
        {record.qrImagenUrl ? (
          <StatusPill label="QR cargado" className={CFG_PAGOS_PILL_NEUTRAL} />
        ) : null}
      </Flex>
    ),
    sorter: true,
    sortCompare: (a, b) =>
      (a.bancoNombre || '').localeCompare(b.bancoNombre || '', 'es', { sensitivity: 'base' }),
  },
  {
    title: 'Acciones',
    key: 'acciones',
    width: 150,
    align: 'right',
    render: (_, record) => (
      <TableActions
        record={record}
        refetch={refetch}
        onView={() => onVer?.(record)}
        onEdit={() => onEditar?.(record)}
        editTitle="Editar cuenta"
        editDisabled={!puedeEditar}
        deleteFn={eliminarCuenta ? (id) => eliminarCuenta(id) : null}
        itemName={record.nombreTitular ? `la cuenta de ${record.nombreTitular}` : 'esta cuenta'}
        permisos={{
          ver: { codigo: CONFIG_PAGOS_PERMISO, accion: 'DETALLE' },
          editar: { codigo: CONFIG_PAGOS_PERMISO, accion: 'EDITAR' },
          eliminar: { codigo: CONFIG_PAGOS_PERMISO, accion: 'ELIMINAR' },
        }}
      />
    ),
  },
];

/**
 * Columnas de la tabla de MÉTODOS de pago (catálogo fijo: EFECTIVO/QR/
 * TRANSFERENCIA/DEPOSITO). Sin eliminar: solo ver y editar nombre (el estado
 * activo/inactivo se gestiona desde la ficha de detalle).
 * @param {Object} args
 * @param {Function} args.onVer - (metodo) => void (navega a la ficha de detalle)
 * @param {Function} args.onEditar - (metodo) => void (abre drawer)
 * @param {boolean} args.puedeEditar - permiso EDITAR (gobierna acciones).
 */
export const createMetodosColumns = ({ onVer, onEditar, puedeEditar }) => [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
  },
  {
    title: 'Identidad',
    dataIndex: 'nombre',
    key: 'identidad',
    ellipsis: true,
    render: (_nombre, record) => (
      <IdentidadCelda codigo={record.codigo} nombre={(record.nombre || '—').toUpperCase()} />
    ),
    sorter: true,
    sortCompare: (a, b) =>
      (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' }),
  },
  {
    title: 'Acciones',
    key: 'acciones',
    width: 130,
    align: 'right',
    render: (_, record) => (
      <TableActions
        record={record}
        onView={() => onVer?.(record)}
        onEdit={() => onEditar?.(record)}
        editTitle="Editar método"
        editDisabled={!puedeEditar}
        permisos={{
          ver: { codigo: CONFIG_PAGOS_PERMISO, accion: 'DETALLE' },
          editar: { codigo: CONFIG_PAGOS_PERMISO, accion: 'EDITAR' },
        }}
      />
    ),
  },
];
