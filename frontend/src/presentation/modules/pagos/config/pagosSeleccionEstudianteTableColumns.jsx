/**
 * pagosSeleccionEstudianteTableColumns - Columnas de la tabla de selección de
 * estudiante en "Registrar pago" (PagosRegistrarSeleccion).
 *
 * Mismo lenguaje visual que el listado de Finanzas (`pagos/config/tableColumns.jsx`):
 * `IdentidadCelda` para la identidad del estudiante, `InfoLinesCell` para celdas
 * multi-línea (contacto, fecha) y `StatusPill` para el estado del aporte. Anchos
 * fijos en todas las columnas para que la tabla use scroll horizontal en vez de
 * comprimir el texto en pantallas angostas.
 */

import { BookOutlined, CalendarOutlined, IdcardOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Flex } from 'antd';
import dayjs from 'dayjs';
import { IdentidadCelda, InfoLinesCell, StatusPill } from '@atoms';
import { ActionButton } from '@atoms';

const formatFechaCreacion = (fecha) => {
  if (!fecha) return '—';
  const d = dayjs(fecha);
  return d.isValid() ? d.format('DD/MM/YYYY HH:mm') : String(fecha);
};

const formatBs = (v) => `Bs. ${Number(v ?? 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * @param {Object} options
 * @param {(studentId: number) => void} options.onRegistrarPago
 */
export const createPagosSeleccionEstudianteTableColumns = ({ onRegistrarPago }) => [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
  },
  {
    title: 'Fecha de registro',
    key: 'created_at',
    width: 150,
    render: (_, r) => (
      <InfoLinesCell lines={[{ icon: <CalendarOutlined />, label: formatFechaCreacion(r.createdAt) }]} />
    ),
  },
  {
    title: 'Estudiante',
    key: 'nombre',
    width: 240,
    fixed: 'left',
    render: (_, r) => (
      <IdentidadCelda
        codigo={r.codigoEstudiante || null}
        nombre={(r.nombreCompleto || r.codigoEstudiante || 'Sin nombre').toUpperCase()}
      />
    ),
    sorter: (a, b) => (a.nombreCompleto ?? '').localeCompare(b.nombreCompleto ?? ''),
  },
  {
    title: 'Contacto',
    key: 'contacto',
    width: 200,
    render: (_, r) => (
      <InfoLinesCell
        lines={[
          { icon: <IdcardOutlined />, label: r.ci ? `CI ${r.ci}` : null },
          { icon: <MailOutlined />, label: r.emailPersonal },
          { icon: <PhoneOutlined />, label: r.celular },
          { icon: <PhoneOutlined />, label: r.telefonoFijo },
        ]}
      />
    ),
  },
  {
    title: 'Carrera',
    key: 'carrera',
    width: 180,
    ellipsis: true,
    render: (_, r) => <InfoLinesCell lines={[{ icon: <BookOutlined />, label: r.carreraNombre }]} />,
  },
  {
    title: 'Aporte',
    key: 'aporte',
    width: 190,
    render: (_, r) => {
      const cub = r?.aporteRegistro?.aporteTotalmenteCubierto;
      const saldoPendiente = Number(r?.aporteRegistro?.saldoPendienteTotal ?? 0);
      if (cub) {
        return (
          <Flex vertical gap={4}>
            <StatusPill label="Sin saldo pendiente" className="cfg-materia-pill cfg-materia-pill--success" />
            <InfoLinesCell lines={[{ label: `Saldo: ${formatBs(0)}` }]} />
          </Flex>
        );
      }
      if (!r?.aporteRegistro?.tieneCabeceraAporte) {
        return <StatusPill label="Primera cuota" className="cfg-materia-pill cfg-materia-pill--default" />;
      }
      return (
        <Flex vertical gap={4}>
          <StatusPill label="Con saldo" className="cfg-materia-pill cfg-materia-pill--warning" />
          <InfoLinesCell lines={[{ label: `Saldo: ${formatBs(saldoPendiente)}` }]} />
        </Flex>
      );
    },
  },
  {
    title: '',
    key: 'accion',
    width: 160,
    align: 'right',
    render: (_, r) => {
      const cub = r?.aporteRegistro?.aporteTotalmenteCubierto;
      if (cub) return null;
      return (
        <ActionButton
          permiso="finanzas.pago.registrar"
          accion="CREAR"
          variant="primary"
          size="small"
          onClick={() => onRegistrarPago(r.id)}
        >
          Registrar pago
        </ActionButton>
      );
    },
  },
];
