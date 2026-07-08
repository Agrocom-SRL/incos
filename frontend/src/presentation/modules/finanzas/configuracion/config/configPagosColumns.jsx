/**
 * Columnas de las tablas de "Config. de pagos" (Finanzas): métodos de pago,
 * bancos autorizados y cuentas de pago.
 *
 * Lenguaje visual canónico (CarrerasList / CFG Documentación): identidad con
 * `IdentidadCelda`, celdas apiladas con `InfoLinesCell` (átomos del módulo:
 * `ConcurrenciaCell`, `CuentaTitularCell`, `CuentaContactoCell`), pills con
 * variantes globales `cfg-materia-pill--*` y acciones con `TableActions`.
 * La config no decide permisos: recibe `puedeEditar` ya resuelto y los
 * handlers desde el panel.
 *
 * Columna "Estado" = toggle rápido activo/inactivo (`createCatalogoEstadoColumn`,
 * PATCH /:id/estado, acción ACTIVAR) — la ficha de detalle conserva su propio
 * toggle, pero el listado también lo expone. Columna de concurrencia (NO se
 * llama "Usos"): «Pagos registrados» (métodos), «Transacciones» (bancos) y
 * «Pagos recibidos» (cuentas), con los conteos `cantidadPagos`/`cantidadCuentas`
 * del backend. Bancos y cuentas tienen ficha + eliminar real; métodos (catálogo
 * fijo de 4) solo ver+editar, sin eliminar (no hay DELETE en backend).
 */

import { CreditCardOutlined, DollarOutlined } from '@ant-design/icons';
import { IdentidadCelda, StatusPill, Text } from '@atoms';
import { TableActions } from '@molecules';
import { createCatalogoEstadoColumn } from '@presentation/utils/tableColumns/createSimpleCatalogTableColumns';
import ConcurrenciaCell from '@finanzas/configuracion/components/atoms/ConcurrenciaCell';
import CuentaTitularCell from '@finanzas/configuracion/components/atoms/CuentaTitularCell';
import CuentaContactoCell from '@finanzas/configuracion/components/atoms/CuentaContactoCell';
import { CFG_PAGOS_PILL_METODO } from './configPagosPills';
import { CONFIG_PAGOS_PERMISO } from './configPagosPermisos';

/** Columna inicial de numeración (misma def que la referencia CarrerasList). */
const nroColumn = {
  title: '#',
  key: 'nro',
  width: 56,
  align: 'center',
  render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
};

/**
 * Pill del método de pago aceptado (variante info del sistema; hoy la FK
 * `metodo_pago_id` es única → una pill por fila) o guion.
 */
const renderMetodo = (metodoNombre) =>
  metodoNombre ? (
    <StatusPill label={metodoNombre} className={CFG_PAGOS_PILL_METODO} />
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
 * @param {Function} [args.onToggleEstado] - (record, nuevoActivo) => Promise (toggle de la columna Estado)
 */
export const createBancosColumns = ({
  onVer,
  onEditar,
  puedeEditar,
  metodoNombrePorId,
  refetch,
  eliminarBanco,
  onToggleEstado,
}) => [
  nroColumn,
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
    title: 'Método aceptado',
    dataIndex: 'metodoPagoId',
    key: 'metodoPagoId',
    width: 170,
    render: (metodoPagoId) => renderMetodo(metodoNombrePorId?.(metodoPagoId)),
  },
  {
    title: 'Transacciones',
    key: 'transacciones',
    width: 170,
    render: (_, record) => (
      <ConcurrenciaCell
        lineas={[
          {
            key: 'pagos',
            icon: <DollarOutlined />,
            cantidad: record.cantidadPagos,
            singular: 'pago',
            plural: 'pagos',
          },
          {
            key: 'cuentas',
            icon: <CreditCardOutlined />,
            cantidad: record.cantidadCuentas,
            singular: 'cuenta',
            plural: 'cuentas',
          },
        ]}
      />
    ),
    sorter: true,
    sortCompare: (a, b) => (Number(a.cantidadPagos) || 0) - (Number(b.cantidadPagos) || 0),
  },
  ...(onToggleEstado
    ? [createCatalogoEstadoColumn({ permisoCodigo: CONFIG_PAGOS_PERMISO, onToggle: onToggleEstado })]
    : []),
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
 * @param {Function} [args.onToggleEstado] - (record, nuevoActivo) => Promise (toggle de la columna Estado)
 */
export const createCuentasColumns = ({
  onVer,
  onEditar,
  puedeEditar,
  metodoNombrePorId,
  refetch,
  eliminarCuenta,
  onToggleEstado,
}) => [
  nroColumn,
  {
    title: 'Cuenta',
    dataIndex: 'numeroCuenta',
    key: 'cuenta',
    ellipsis: true,
    // Número de cuenta en el slot código (arriba) + banco en el slot nombre (abajo).
    render: (_numeroCuenta, record) => (
      <IdentidadCelda
        codigo={record.numeroCuenta}
        nombre={(record.bancoNombre || 'Sin banco').toUpperCase()}
      />
    ),
    sorter: true,
    sortCompare: (a, b) =>
      (a.bancoNombre || '').localeCompare(b.bancoNombre || '', 'es', { sensitivity: 'base' }),
  },
  {
    title: 'Titular',
    dataIndex: 'nombreTitular',
    key: 'titular',
    render: (_titular, record) => (
      <CuentaTitularCell
        titular={record.nombreTitular}
        metodoNombre={metodoNombrePorId?.(record.metodoPagoId)}
      />
    ),
    sorter: true,
    sortCompare: (a, b) =>
      (a.nombreTitular || '').localeCompare(b.nombreTitular || '', 'es', { sensitivity: 'base' }),
  },
  {
    title: 'Contacto',
    key: 'contacto',
    width: 170,
    render: (_, record) => (
      <CuentaContactoCell numeroCelular={record.numeroCelular} tieneQr={Boolean(record.qrImagenUrl)} />
    ),
  },
  {
    title: 'Pagos recibidos',
    key: 'pagosRecibidos',
    width: 160,
    render: (_, record) => (
      <ConcurrenciaCell
        lineas={[
          {
            key: 'pagos',
            icon: <DollarOutlined />,
            cantidad: record.cantidadPagos,
            singular: 'pago',
            plural: 'pagos',
          },
        ]}
      />
    ),
    sorter: true,
    sortCompare: (a, b) => (Number(a.cantidadPagos) || 0) - (Number(b.cantidadPagos) || 0),
  },
  ...(onToggleEstado
    ? [createCatalogoEstadoColumn({ permisoCodigo: CONFIG_PAGOS_PERMISO, onToggle: onToggleEstado })]
    : []),
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
 * TRANSFERENCIA/DEPOSITO). Deliberadamente SIN eliminar (no hay DELETE en
 * backend): solo ver y editar nombre, más el toggle de la columna Estado.
 * @param {Object} args
 * @param {Function} args.onVer - (metodo) => void (navega a la ficha de detalle)
 * @param {Function} args.onEditar - (metodo) => void (abre drawer)
 * @param {boolean} args.puedeEditar - permiso EDITAR (gobierna acciones).
 * @param {Function} [args.onToggleEstado] - (record, nuevoActivo) => Promise (toggle de la columna Estado)
 */
export const createMetodosColumns = ({ onVer, onEditar, puedeEditar, onToggleEstado }) => [
  nroColumn,
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
    title: 'Pagos registrados',
    key: 'pagosRegistrados',
    width: 180,
    render: (_, record) => (
      <ConcurrenciaCell
        lineas={[
          {
            key: 'pagos',
            icon: <DollarOutlined />,
            cantidad: record.cantidadPagos,
            singular: 'pago',
            plural: 'pagos',
          },
        ]}
      />
    ),
    sorter: true,
    sortCompare: (a, b) => (Number(a.cantidadPagos) || 0) - (Number(b.cantidadPagos) || 0),
  },
  ...(onToggleEstado
    ? [createCatalogoEstadoColumn({ permisoCodigo: CONFIG_PAGOS_PERMISO, onToggle: onToggleEstado })]
    : []),
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
