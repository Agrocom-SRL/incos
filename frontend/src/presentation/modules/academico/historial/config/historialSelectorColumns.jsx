/**
 * Columnas del selector de estudiante del Historial académico (landing).
 *
 * COMPARTIDAS por las dos vistas de la landing: la lista completa (tabs por
 * carrera vía CarreraTabsListView) y los resultados de búsqueda de
 * `/estudiantes/search`. Columnas: # + identidad (código + nombre completo en
 * orden canónico, ya resuelto por los mappers vía buildFullName) + C.I. +
 * columnas académicas de la landing enriquecida (contrato en
 * `docs/plan/HISTORIAL-ACADEMICO.md` §"Landing enriquecida": ingreso, año en
 * curso, paralelo y promedio; `null` → "—") + acción única "Ver historial"
 * (permiso DETALLE del módulo — sin acciones de edición).
 *
 * Lenguaje visual = el de las tablas hermanas (estudiantes/matricula/becas):
 * icono+valor con `InfoLinesCell` (mismos iconos que matricula: Calendar para
 * gestión, Read para periodo, Apartment para paralelo) y tinte semántico del
 * promedio con clase de tono por línea (patrón `cfg-genero-tone`).
 *
 * La carrera NO es columna NI acento de color: en la lista completa es la
 * pestaña activa (CarreraTabsListView) y la búsqueda no la expone; la identidad
 * va en color de texto normal del theme.
 *
 * Responsive: las columnas académicas declaran `minWidth` (ancho mínimo del
 * colgroup, AntD 6) y colapsan por breakpoint (`responsive`) de menor a mayor
 * prioridad — ingreso primero, luego paralelo, año en curso y promedio;
 * identidad, C.I. y acciones no colapsan nunca.
 */

import {
  ApartmentOutlined,
  CalendarOutlined,
  FileSearchOutlined,
  IdcardOutlined,
  LineChartOutlined,
  ReadOutlined,
} from '@ant-design/icons';
import { ActionButton, IdentidadCelda, InfoLinesCell } from '@atoms';
import { NOTA_MINIMA_APROBACION_DEFAULT } from '@application-academico/calificaciones/utils/notaMinimaAprobacion.js';

/** Año en curso: nombre del periodo o, en su defecto, forma corta "1º/2º/3º". */
const periodoActualLabel = (record) => {
  if (record.periodoActualNombre) return record.periodoActualNombre;
  if (record.periodoActualNumero != null) return `${record.periodoActualNumero}º`;
  return null;
};

/**
 * @param {Object} params
 * @param {(estudiante: Object) => void} params.onVerHistorial - Navega al transcript.
 * @returns {Array} Columnas para DataTable (vía TableListView/CarreraTabsListView).
 */
export const createHistorialSelectorColumns = ({ onVerHistorial }) => [
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
    // Lista completa expone `ciCompleto`; la búsqueda expone `ci` (DTO de selección).
    // Icono Idcard = precedente del proyecto para documento de identidad
    // (licenciasTableColumns, LicenciaDecisionDrawer).
    render: (_, record) => (
      <InfoLinesCell lines={[{ icon: <IdcardOutlined />, label: record.ciCompleto ?? record.ci }]} />
    ),
  },
  {
    title: 'Ingreso',
    key: 'gestionIngresoAnio',
    minWidth: 104,
    // Menor prioridad: colapsa PRIMERO (visible solo desde xl).
    responsive: ['xl', 'xxl'],
    sorter: (a, b) => Number(a.gestionIngresoAnio || 0) - Number(b.gestionIngresoAnio || 0),
    render: (_, record) => (
      <InfoLinesCell lines={[{ icon: <CalendarOutlined />, label: record.gestionIngresoAnio }]} />
    ),
  },
  {
    title: 'Año en curso',
    key: 'periodoActual',
    minWidth: 132,
    responsive: ['md', 'lg', 'xl', 'xxl'],
    sorter: (a, b) => Number(a.periodoActualNumero || 0) - Number(b.periodoActualNumero || 0),
    render: (_, record) => (
      <InfoLinesCell lines={[{ icon: <ReadOutlined />, label: periodoActualLabel(record) }]} />
    ),
  },
  {
    title: 'Paralelo',
    key: 'paraleloActual',
    minWidth: 104,
    responsive: ['lg', 'xl', 'xxl'],
    render: (_, record) => (
      <InfoLinesCell lines={[{ icon: <ApartmentOutlined />, label: record.paraleloActual }]} />
    ),
  },
  {
    title: 'Promedio',
    key: 'promedioHistorial',
    minWidth: 112,
    responsive: ['sm', 'md', 'lg', 'xl', 'xxl'],
    sorter: (a, b) => Number(a.promedioHistorial ?? -1) - Number(b.promedioHistorial ?? -1),
    render: (_, record) => {
      const valor = Number(record.promedioHistorial);
      // InfoLinesCell sin líneas visibles ya muestra el guion (sin icono).
      if (record.promedioHistorial == null || !Number.isFinite(valor)) {
        return <InfoLinesCell lines={[]} />;
      }
      const promedio = Math.round(valor);
      const tone =
        promedio >= NOTA_MINIMA_APROBACION_DEFAULT
          ? 'historial-promedio-tone--aprobado'
          : 'historial-promedio-tone--riesgo';
      return (
        <InfoLinesCell
          lines={[{ icon: <LineChartOutlined />, label: promedio, className: tone }]}
        />
      );
    },
  },
  {
    title: 'Acciones',
    key: 'acciones',
    width: 170,
    align: 'right',
    render: (_, record) => (
      <ActionButton
        permiso="academico.historial.academico"
        accion="DETALLE"
        variant="view"
        size="small"
        icon={<FileSearchOutlined />}
        onClick={() => onVerHistorial?.(record)}
      >
        Ver historial
      </ActionButton>
    ),
  },
];

export default createHistorialSelectorColumns;
