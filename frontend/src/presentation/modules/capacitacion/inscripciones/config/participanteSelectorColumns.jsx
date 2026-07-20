/**
 * Columnas del selector de participante del paso 1 "Inscribir participante"
 * (CAP), gemelo de `historialSelectorColumns.jsx` (Historial académico) —
 * mismo lenguaje visual (`IdentidadCelda`/`InfoLinesCell`), sin tabs por
 * carrera (los participantes no tienen carrera): una sola tabla plana, tanto
 * para la landing de sugeridos como para los resultados de búsqueda.
 *
 * `Contacto` reusa el mismo patrón de iconos que
 * `participantesTableColumns.jsx` (listado de participantes). `Curso actual`
 * es la columna propia de este selector: título de la inscripción vigente
 * del participante (`cursoActualTitulo`, `null` si no tiene una), para que el
 * staff vea de antemano si ya cursa algo antes de decidir la inscripción
 * nueva — `InfoLinesCell` ya muestra el guion cuando `label` es `null`.
 *
 * La acción única "Seleccionar" usa `variant="primary"` (verde institucional,
 * acción principal del paso) en vez de `variant="view"` — a diferencia de
 * "Ver historial", aquí sí se pide el permiso de creación de la inscripción
 * (`CAPACITACION_PERMISOS.inscripcion` / CREAR) porque toda la página ya está
 * gateada por ese permiso vía `PermisoGuard`.
 */

import { MailOutlined, PhoneOutlined, ReadOutlined } from '@ant-design/icons';
import { ActionButton, IdentidadCelda, InfoLinesCell } from '@atoms';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';

/**
 * @param {Object} params
 * @param {(participante: Object) => void} params.onSeleccionar - Selecciona el participante y avanza el wizard.
 * @returns {Array} Columnas para `TableListView` (sugeridos y resultados de búsqueda).
 */
export const createParticipanteSelectorColumns = ({ onSeleccionar }) => [
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
    ellipsis: true,
    render: (_, record) => (
      <IdentidadCelda
        codigo={record.ciCompleto || undefined}
        nombre={(record.nombreCompleto || 'Sin nombre').toUpperCase()}
      />
    ),
  },
  {
    title: 'Contacto',
    key: 'contacto',
    minWidth: 200,
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
    title: 'Curso actual',
    key: 'cursoActual',
    minWidth: 200,
    render: (_, record) => (
      <InfoLinesCell lines={[{ icon: <ReadOutlined />, label: record.cursoActualTitulo }]} />
    ),
  },
  {
    title: 'Acciones',
    key: 'acciones',
    width: 150,
    align: 'right',
    render: (_, record) => (
      <ActionButton
        permiso={CAPACITACION_PERMISOS.inscripcion}
        accion="CREAR"
        variant="primary"
        size="small"
        onClick={() => onSeleccionar?.(record)}
      >
        Seleccionar
      </ActionButton>
    ),
  },
];

export default createParticipanteSelectorColumns;
