/**
 * Columnas del listado de participantes de capacitación (módulo CAP).
 *
 * Lenguaje visual de la referencia (CarrerasList/PagosList): numeración +
 * IdentidadCelda (CI arriba, nombre en orden APELLIDO_PATERNO APELLIDO_MATERNO
 * NOMBRES vía buildFullName del mapper) + InfoLinesCell + TableActions.
 *
 * El recurso no tiene ficha propia ni ELIMINAR (seed 65): la única acción de
 * fila es EDITAR (abre el modal de la pantalla). Orden en cliente (loadAll).
 */

import { CalendarOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { IdentidadCelda, InfoLinesCell } from '@atoms';
import { TableActions } from '@molecules';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';

export const createParticipantesTableColumns = ({ onEditar }) => {
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
      width: 280,
      render: (_, record) => (
        <div className="cfg-identidad-clamp2" title={record.nombreCompleto || undefined}>
          <IdentidadCelda
            codigo={record.ciCompleto || undefined}
            nombre={(record.nombreCompleto || 'Sin nombre').toUpperCase()}
          />
        </div>
      ),
      sorter: true,
      sortCompare: (a, b) =>
        (a.nombreCompleto || '').localeCompare(b.nombreCompleto || '', 'es', {
          sensitivity: 'base',
        }),
    },
    {
      title: 'Contacto',
      key: 'contacto',
      width: 240,
      render: (_, record) => (
        <InfoLinesCell
          lines={[
            record.celular ? { icon: <PhoneOutlined />, label: record.celular } : null,
            record.email ? { icon: <MailOutlined />, label: record.email } : null,
          ].filter(Boolean)}
        />
      ),
    },
    {
      title: 'Registro',
      key: 'registro',
      width: 160,
      render: (_, record) => (
        <InfoLinesCell
          lines={[
            record.registradoLabel
              ? { icon: <CalendarOutlined />, label: record.registradoLabel }
              : null,
          ].filter(Boolean)}
        />
      ),
      sorter: true,
      sortCompare: (a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 110,
      align: 'right',
      render: (_, record) => (
        <TableActions
          record={record}
          onEdit={() => onEditar(record)}
          editTitle="Editar participante"
          permisos={{
            editar: { codigo: CAPACITACION_PERMISOS.participante, accion: 'EDITAR' },
          }}
        />
      ),
    },
  ];
};
