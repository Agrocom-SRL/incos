/**
 * Columnas del listado de pagos de aporte (módulo Finanzas).
 *
 * Espejo de `docentesTableColumns`: columnas en archivo dedicado, celdas con
 * `TableCell`, acciones con `TableActions`. Permisos SOLO `finanzas.pago.*`
 * (NO `matricula.pago.aporte.*`, que es del legacy).
 *
 * Estados de aporte → Tag (color por preset AntD, sin #hex):
 *   PENDIENTE=warning · PARCIAL=processing · CANCELADO=success.
 */

import {
  CalendarOutlined,
  DollarOutlined,
  IdcardOutlined,
  NumberOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Tag } from 'antd';
import { TableCell, TableActions } from '@molecules';
import { Text } from '@atoms';
import { pagoDetallePath, PAGOS_LIST_PATH } from '@application-finanzas/config/paths';

/** Formatea un monto en bolivianos (Bs 1.234,50). */
const formatBolivianos = (value) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return `Bs ${safe.toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/** Mapa estado → { color de preset AntD, etiqueta }. */
const ESTADO_TAG = {
  PENDIENTE: { color: 'warning', label: 'Pendiente' },
  PARCIAL: { color: 'processing', label: 'Parcial' },
  CANCELADO: { color: 'success', label: 'Cancelado' },
};

const renderEstadoTag = (estado) => {
  const key = String(estado || '').toUpperCase();
  const cfg = ESTADO_TAG[key] || { color: 'default', label: estado || 'Sin estado' };
  return <Tag color={cfg.color}>{cfg.label}</Tag>;
};

const getGestionLabel = (record) => {
  const { nombre, anio } = record.gestion || {};
  return nombre || (anio != null ? String(anio) : null);
};

export const createPagosTableColumns = ({ navigate, listNavState, refetch }) => {
  return [
    {
      title: '#',
      key: 'nro',
      width: 56,
      align: 'center',
      render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
    },
    {
      title: 'Gestión',
      key: 'gestion',
      width: 140,
      render: (_, record) => (
        <TableCell subtext={record.gestion?.anio ? `Año ${record.gestion.anio}` : null}>
          {getGestionLabel(record)}
        </TableCell>
      ),
      sorter: true,
      sortCompare: (a, b) =>
        String(getGestionLabel(a) || '').localeCompare(String(getGestionLabel(b) || ''), 'es', {
          sensitivity: 'base',
        }),
    },
    {
      title: 'Estudiante',
      key: 'estudiante',
      fixed: 'left',
      ellipsis: true,
      render: (_, record) => (
        <TableCell subtext={record.estudiante?.codigoEstudiante || null}>
          {(record.estudiante?.nombreCompleto || 'Sin nombre').toUpperCase()}
        </TableCell>
      ),
      sorter: true,
      sortCompare: (a, b) =>
        String(a.estudiante?.nombreCompleto || '').localeCompare(
          String(b.estudiante?.nombreCompleto || ''),
          'es',
          { sensitivity: 'base' },
        ),
    },
    {
      title: 'Monto a pagar',
      key: 'montoObligatorio',
      width: 200,
      align: 'right',
      render: (_, record) => (
        <TableCell
          align="right"
          strong
          subtext={
            record.descuentoBeca > 0
              ? `Base ${formatBolivianos(record.montoBase)} · Beca -${formatBolivianos(record.descuentoBeca)}`
              : `Base ${formatBolivianos(record.montoBase)}`
          }
        >
          {formatBolivianos(record.montoObligatorio)}
        </TableCell>
      ),
      sorter: true,
      sortCompare: (a, b) => (a.montoObligatorio || 0) - (b.montoObligatorio || 0),
    },
    {
      title: 'Detalle del pago',
      key: 'totalPagado',
      width: 180,
      align: 'right',
      render: (_, record) => (
        <TableCell
          align="right"
          subtext={`${record.cantidadPagos} ${record.cantidadPagos === 1 ? 'pago' : 'pagos'}`}
        >
          {formatBolivianos(record.totalPagado)}
        </TableCell>
      ),
      sorter: true,
      sortCompare: (a, b) => (a.totalPagado || 0) - (b.totalPagado || 0),
    },
    {
      title: 'Saldo pendiente',
      key: 'saldoPendiente',
      width: 160,
      align: 'right',
      render: (_, record) => {
        const saldo = record.saldoPendiente || 0;
        return (
          <TableCell align="right">
            <Text strong type={saldo > 0 ? 'danger' : 'success'}>
              {formatBolivianos(saldo)}
            </Text>
          </TableCell>
        );
      },
      sorter: true,
      sortCompare: (a, b) => (a.saldoPendiente || 0) - (b.saldoPendiente || 0),
    },
    {
      title: 'Estado',
      key: 'estado',
      width: 130,
      align: 'center',
      render: (_, record) => renderEstadoTag(record.estado),
      sorter: true,
      sortCompare: (a, b) =>
        String(a.estado || '').localeCompare(String(b.estado || ''), 'es', { sensitivity: 'base' }),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 160,
      align: 'right',
      render: (_, record) => {
        const nombreCompleto = record.estudiante?.nombreCompleto || 'Sin nombre';
        const itemName = `el pago de ${nombreCompleto}`;
        const itemDetails = [
          { label: 'Estudiante', value: nombreCompleto, icon: <UserOutlined /> },
          {
            label: 'Código',
            value: record.estudiante?.codigoEstudiante,
            icon: <IdcardOutlined />,
          },
          { label: 'Gestión', value: getGestionLabel(record), icon: <CalendarOutlined /> },
          {
            label: 'Monto a pagar',
            value: formatBolivianos(record.montoObligatorio),
            icon: <DollarOutlined />,
          },
          {
            label: 'Total pagado',
            value: formatBolivianos(record.totalPagado),
            icon: <DollarOutlined />,
          },
          {
            label: 'Pagos',
            value: record.cantidadPagos != null ? String(record.cantidadPagos) : null,
            icon: <NumberOutlined />,
          },
        ].filter((d) => d.value != null && d.value !== '');

        return (
          <TableActions
            record={record}
            navigate={navigate}
            refetch={refetch}
            itemName={itemName}
            itemDetails={itemDetails}
            onView={() => navigate(pagoDetallePath(record.id), { state: listNavState })}
            onEdit={() =>
              navigate(pagoDetallePath(record.id), {
                state: { ...listNavState, returnListPath: PAGOS_LIST_PATH, modo: 'editar' },
              })
            }
            permisos={{
              ver: { codigo: 'finanzas.pago.ver', accion: 'DETALLE' },
              editar: { codigo: 'finanzas.pago.editar', accion: 'EDITAR' },
              eliminar: { codigo: 'finanzas.pago.editar', accion: 'ELIMINAR' },
            }}
          />
        );
      },
    },
  ];
};
