/**
 * Columnas de la tabla de estudiantes de la ficha de sesión (módulo ACA ·
 * A9, dataKey `estudiantes`). Registro RÁPIDO en lote: asistencia (radio
 * botón), valoración de progreso (select del kit) y observación por alumno se
 * editan en memoria (`setEstudianteCampo`) y se guardan con un solo batch.
 *
 * En modo solo lectura (sin sesion·EDITAR o sesión cancelada) las mismas
 * celdas muestran pills/textos del kit en vez de editores.
 */

import { Input, Radio, Select } from 'antd';
import { IdentidadCelda, InfoLinesCell, StatusPill } from '@atoms';
import {
  PROGRESO_ESTUDIANTE_OPTIONS,
  formatOrigenEstudiante,
  formatProgresoEstudiante,
  getProgresoEstudiantePillClass,
} from '@application-academico/acompanamiento/utils/acompanamientoPills';

/** Clave estable del estudiante (id en filas persistidas; matrícula en nuevas). */
const estudianteKey = (record) => record.id ?? record.matriculaMateriaId;

const ASISTENCIA_OPTIONS = [
  { value: true, label: 'Asistió' },
  { value: false, label: 'Faltó' },
];

/** Pill de asistencia para el modo solo lectura (null = sin registrar). */
const asistenciaPill = (asistio) => {
  if (asistio === true) {
    return <StatusPill label="Asistió" className="cfg-materia-pill cfg-materia-pill--success" />;
  }
  if (asistio === false) {
    return <StatusPill label="Faltó" className="cfg-materia-pill cfg-materia-pill--danger" />;
  }
  return <StatusPill label="Sin registrar" className="cfg-materia-pill cfg-materia-pill--default" />;
};

export const createSesionEstudiantesColumns = ({ setEstudianteCampo, readOnly = false }) => [
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
    width: 240,
    render: (_, record) => (
      <IdentidadCelda nombre={(record.estudianteNombre || 'Sin nombre').toUpperCase()} />
    ),
    sorter: true,
    sortCompare: (a, b) =>
      (a.estudianteNombre || '').localeCompare(b.estudianteNombre || '', 'es', {
        sensitivity: 'base',
      }),
    defaultSortOrder: 'ascend',
  },
  {
    title: 'Origen',
    key: 'origen',
    width: 160,
    render: (_, record) => (
      <InfoLinesCell lines={[{ label: formatOrigenEstudiante(record.origen) }]} />
    ),
  },
  {
    title: 'Asistencia',
    key: 'asistio',
    width: 170,
    align: 'center',
    render: (_, record) =>
      readOnly ? (
        asistenciaPill(record.asistio)
      ) : (
        <Radio.Group
          size="small"
          optionType="button"
          buttonStyle="solid"
          options={ASISTENCIA_OPTIONS}
          value={record.asistio}
          onChange={(event) =>
            setEstudianteCampo(estudianteKey(record), 'asistio', event.target.value)
          }
        />
      ),
  },
  {
    title: 'Progreso',
    key: 'progreso',
    width: 170,
    align: 'center',
    render: (_, record) =>
      readOnly ? (
        <StatusPill
          label={formatProgresoEstudiante(record.progreso)}
          className={getProgresoEstudiantePillClass(record.progreso)}
        />
      ) : (
        <Select
          size="small"
          options={PROGRESO_ESTUDIANTE_OPTIONS}
          value={record.progreso ?? 'SIN_EVALUAR'}
          onChange={(value) => setEstudianteCampo(estudianteKey(record), 'progreso', value)}
          style={{ width: '100%' }}
          popupMatchSelectWidth={false}
        />
      ),
  },
  {
    title: 'Observaciones',
    key: 'observaciones',
    render: (_, record) =>
      readOnly ? (
        <InfoLinesCell lines={[{ label: record.observaciones }]} />
      ) : (
        <Input
          size="small"
          value={record.observaciones ?? ''}
          maxLength={500}
          placeholder="Observación del docente (opcional)"
          onChange={(event) =>
            setEstudianteCampo(estudianteKey(record), 'observaciones', event.target.value)
          }
        />
      ),
  },
];

export default createSesionEstudiantesColumns;
