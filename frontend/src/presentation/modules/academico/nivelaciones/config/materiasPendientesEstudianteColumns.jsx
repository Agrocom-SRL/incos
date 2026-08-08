/**
 * Columnas de la tabla de materias pendientes/arrastradas de un estudiante
 * (B2, landing sin contexto — cierre del "Gap 2"). Cada fila es clicable:
 * abre `EventoHistorialDrawer` en modo `crear` con el ancla real de esa
 * materia (`subjectEnrollmentId` XOR `enrollmentId`+`planSubjectId`).
 */

import { BookOutlined } from '@ant-design/icons';
import { ActionButton, InfoLinesCell, StatusPill } from '@atoms';
import { NIVELACION_PERMISOS } from '@application-academico/nivelaciones/utils/nivelacionPermisos.js';
import {
  formatEstadoHistorial,
  getEstadoHistorialPillClass,
} from '@application-academico/nivelaciones/utils/nivelacionEstados.js';

/**
 * @param {Object} params
 * @param {(materia: Object) => void} params.onSeleccionar
 */
export const createMateriasPendientesEstudianteColumns = ({ onSeleccionar }) => [
  {
    title: 'Materia',
    key: 'materia',
    render: (_, record) => (
      <InfoLinesCell
        lines={[
          {
            icon: <BookOutlined />,
            label: [record.asignaturaSigla, record.asignaturaNombre].filter(Boolean).join(' — '),
          },
        ]}
      />
    ),
  },
  {
    title: 'Tipo de evento',
    key: 'tipoEvento',
    width: 220,
    render: (_, record) => (
      <StatusPill
        label={formatEstadoHistorial(record.evento?.stateType)}
        className={getEstadoHistorialPillClass(record.evento?.stateType)}
      />
    ),
  },
  {
    title: 'Fecha de transición',
    key: 'transitionDate',
    width: 150,
    render: (_, record) => record.evento?.transitionDate || '—',
  },
  {
    title: 'Acciones',
    key: 'acciones',
    width: 170,
    align: 'right',
    render: (_, record) => (
      <ActionButton
        permiso={NIVELACION_PERMISOS.inscribir}
        accion="CREAR"
        variant="view"
        size="small"
        onClick={() => onSeleccionar?.(record)}
      >
        Registrar evento
      </ActionButton>
    ),
  },
];

export default createMateriasPendientesEstudianteColumns;
