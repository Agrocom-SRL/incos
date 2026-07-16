/**
 * Columnas del listado de inscripciones de capacitación (módulo CAP).
 *
 * Lenguaje visual de PagosList: numeración + IdentidadCelda (CI + nombre en
 * orden canónico, ya resuelto por el mapper vía buildFullName) + InfoLinesCell
 * + StatusPill de estado de pago (derivado por el backend). Montos Bs SIN
 * decimales (formatBs). Orden en cliente (modo loadAll del provider).
 */

import {
  BookOutlined,
  CalendarOutlined,
  DollarOutlined,
  NumberOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { StatusPill, IdentidadCelda, InfoLinesCell } from '@atoms';
import { TableActions } from '@molecules';
import { formatBs } from '@application/utils/formatters';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';
import {
  formatEstadoCurso,
  formatEstadoPagoCap,
  getEstadoPagoCapPillClass,
  getSaldoCapPillClass,
} from '@application-capacitacion/utils/capacitacionPills';
import { inscripcionCapDetallePath } from '@application-capacitacion/config/paths';

export const createInscripcionesCapTableColumns = ({
  navigate,
  listNavState,
  refetch,
  deleteFn,
}) => {
  return [
    {
      title: '#',
      key: 'nro',
      width: 56,
      align: 'center',
      render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
    },
    {
      title: 'Participante',
      key: 'participante',
      fixed: 'left',
      width: 260,
      render: (_, record) => (
        <div className="cfg-identidad-clamp2" title={record.participanteNombreCompleto || undefined}>
          <IdentidadCelda
            codigo={record.participanteCiCompleto || undefined}
            nombre={(record.participanteNombreCompleto || 'Sin nombre').toUpperCase()}
          />
        </div>
      ),
      sorter: true,
      sortCompare: (a, b) =>
        (a.participanteNombreCompleto || '').localeCompare(
          b.participanteNombreCompleto || '',
          'es',
          { sensitivity: 'base' },
        ),
    },
    {
      title: 'Curso',
      key: 'curso',
      width: 240,
      render: (_, record) => (
        <InfoLinesCell
          lines={[
            { icon: <BookOutlined />, label: record.capacitacionTitulo },
            record.capacitacionFechasLabel
              ? { icon: <CalendarOutlined />, label: record.capacitacionFechasLabel }
              : null,
            record.fechaInscripcionLabel
              ? { label: `Inscrito el ${record.fechaInscripcionLabel}` }
              : null,
          ].filter(Boolean)}
        />
      ),
      sorter: true,
      sortCompare: (a, b) =>
        (a.capacitacionTitulo || '').localeCompare(b.capacitacionTitulo || '', 'es', {
          sensitivity: 'base',
        }),
    },
    {
      title: 'Pagado',
      key: 'pagado',
      width: 190,
      render: (_, record) => (
        <InfoLinesCell
          lines={[
            {
              icon: <DollarOutlined />,
              label: `Bs ${formatBs(record.totalPagado)} de Bs ${formatBs(record.costo)}`,
            },
            {
              icon: <NumberOutlined />,
              label: `${record.pagosCount} ${record.pagosCount === 1 ? 'pago' : 'pagos'}`,
            },
          ]}
        />
      ),
      sorter: true,
      sortCompare: (a, b) => (Number(a.totalPagado) || 0) - (Number(b.totalPagado) || 0),
    },
    {
      title: 'Saldo',
      key: 'saldo',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <StatusPill
          label={record.saldo > 0 ? `Bs ${formatBs(record.saldo)}` : 'Saldado'}
          className={getSaldoCapPillClass(record.saldo)}
        />
      ),
      sorter: true,
      sortCompare: (a, b) => (Number(a.saldo) || 0) - (Number(b.saldo) || 0),
    },
    {
      title: 'Estado de pago',
      key: 'estadoPago',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <StatusPill
          label={formatEstadoPagoCap(record.estadoPago)}
          className={getEstadoPagoCapPillClass(record.estadoPago)}
        />
      ),
      sorter: true,
      sortCompare: (a, b) => (a.estadoPago || '').localeCompare(b.estadoPago || ''),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      fixed: 'right',
      width: 120,
      align: 'right',
      render: (_, record) => {
        const itemName = `la inscripción de ${record.participanteNombreCompleto}`;
        const itemDetails = [
          {
            label: 'Participante',
            value: record.participanteNombreCompleto,
            icon: <UserOutlined />,
          },
          { label: 'Curso', value: record.capacitacionTitulo, icon: <BookOutlined /> },
          {
            label: 'Estado del curso',
            value: formatEstadoCurso(record.capacitacionEstado),
          },
          {
            label: 'Total pagado',
            value: `Bs ${formatBs(record.totalPagado)}`,
            icon: <DollarOutlined />,
          },
        ].filter((d) => d.value != null && d.value !== '');

        return (
          <TableActions
            record={record}
            navigate={navigate}
            refetch={refetch}
            deleteFn={deleteFn}
            itemName={itemName}
            itemDetails={itemDetails}
            onView={() =>
              navigate(inscripcionCapDetallePath(record.id), { state: listNavState })
            }
            permisos={{
              ver: { codigo: CAPACITACION_PERMISOS.inscripcion, accion: 'DETALLE' },
              eliminar: { codigo: CAPACITACION_PERMISOS.inscripcion, accion: 'ELIMINAR' },
            }}
          />
        );
      },
    },
  ];
};
