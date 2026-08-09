/**
 * Columnas de la landing SIN contexto de `/inscribir` (B2, buscador de
 * estudiante). Calcadas de `historialSelectorColumns.jsx`, simplificadas:
 * sin columnas académicas (no aplican acá), acción única "Seleccionar".
 */

import { IdcardOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { ActionButton, IdentidadCelda, InfoLinesCell } from '@atoms';
import { NIVELACION_PERMISOS } from '@application-academico/nivelaciones/utils/nivelacionPermisos.js';

/**
 * @param {Object} params
 * @param {(estudiante: Object) => void} params.onSeleccionar
 */
export const createNivelacionSelectorColumns = ({ onSeleccionar }) => [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
  },
  {
    title: 'Estudiante',
    key: 'estudiante',
    ellipsis: true,
    sorter: (a, b) =>
      String(a.nombreCompleto || '').localeCompare(String(b.nombreCompleto || ''), 'es', {
        sensitivity: 'base',
      }),
    render: (_, record) => (
      <IdentidadCelda
        codigo={record.codigoEstudiante || null}
        nombre={(record.nombreCompleto || 'Sin nombre').toUpperCase()}
      />
    ),
  },
  {
    title: 'C.I.',
    key: 'ci',
    width: 140,
    render: (_, record) => (
      <InfoLinesCell lines={[{ icon: <IdcardOutlined />, label: record.ciCompleto ?? record.ci }]} />
    ),
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
        icon={<UserSwitchOutlined />}
        onClick={() => onSeleccionar?.(record)}
      >
        Seleccionar
      </ActionButton>
    ),
  },
];

export default createNivelacionSelectorColumns;
