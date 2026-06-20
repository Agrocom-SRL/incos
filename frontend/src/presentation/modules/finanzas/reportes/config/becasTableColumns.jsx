/**
 * Columnas de la planilla de control de becas por carrera (reporte read-only).
 *
 * Réplica de la PLANILLA oficial del instituto, con cabecera en VERDE primario
 * (el kit `finanzas-planilla.css` la pinta vía la clase `fin-planilla`).
 *
 * `createBecasTableColumns(porcentajes)` arma:
 *   - columnas FIJAS de identidad (Nº, Carrera, Modalidad, Nº matriculados),
 *   - un bloque AGRUPADO "Número de estudiantes con beca por tipo" con una
 *     columna por tramo de beca (Beca 25% · 50% · 75% · 100% · …),
 *   - columnas de cierre (Total con beca, % con beca, % cobertura, Observaciones).
 *
 * Los tramos NO se hardcodean en cuanto a DATOS: el backend deriva `porcentajes`
 * dinámicamente (solo los tramos con becas reales). Para que la planilla SIEMPRE
 * muestre el bloque oficial completo (25/50/75/100) aunque un tramo no tenga
 * beneficiados, se fusionan los TRAMOS_CANONICOS con los que reporta el backend:
 * los canónicos se muestran siempre (en 0 si no hay datos) y cualquier tramo
 * extra que el backend envíe se añade tras ellos (no se pierde información).
 *
 * Celdas con `TableCell`; nombres de carrera tal cual vienen (no aplica orden de
 * persona). La fila de TOTALES se pinta con `Table.Summary` en la página.
 */

import { TableCell } from '@molecules';
import { Text } from '@atoms';
import StatusPill from '@atoms/StatusPill';
import { becaPorcentajeKey, becaPorcentajeLabel } from '@application-finanzas/mappers/becasReporteMapper';
import { getCoberturaPillClass } from '@application-finanzas/utils/becasReportePills';

/** Tramos de beca de la planilla oficial: se muestran SIEMPRE como columnas. */
export const TRAMOS_CANONICOS = [25, 50, 75, 100];

const formatPorcentaje = (value) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return `${safe.toLocaleString('es-BO', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
};

/**
 * Fusiona los tramos canónicos (siempre presentes) con los que reporta el
 * backend, preservando el orden canónico y añadiendo extras al final.
 * @param {number[]} porcentajes - Tramos con datos reportados por el backend.
 * @returns {number[]} Tramos a renderizar como columnas.
 */
export const resolveTramos = (porcentajes = []) => {
  const reportados = Array.isArray(porcentajes)
    ? porcentajes.map((p) => Number(p)).filter((p) => Number.isFinite(p) && p > 0)
    : [];
  const extras = reportados
    .filter((p) => !TRAMOS_CANONICOS.includes(p))
    .sort((a, b) => a - b);
  return [...TRAMOS_CANONICOS, ...extras];
};

/** Render de un conteo entero centrado (0 se atenúa para reducir ruido visual). */
const renderConteo = (value) => {
  const n = Number(value) || 0;
  return (
    <Text type={n === 0 ? 'secondary' : 'default'}>{n}</Text>
  );
};

/**
 * @param {number[]} porcentajes - Tramos de beca reportados por el backend.
 * @returns {Array} Columnas de AntD Table (con bloque agrupado para los tramos).
 */
export const createBecasTableColumns = (porcentajes = []) => {
  const tramos = resolveTramos(porcentajes);

  const columnasFijasIzquierda = [
    {
      title: 'Nº',
      key: 'nro',
      width: 56,
      align: 'center',
      fixed: 'left',
      render: (_value, _record, index) => index + 1,
    },
    {
      title: 'Carrera',
      key: 'carrera',
      fixed: 'left',
      ellipsis: true,
      className: 'becas-col-carrera',
      render: (_, record) => (
        <TableCell subtext={record.carreraCodigo || null}>
          {record.carreraNombre || 'Sin nombre'}
        </TableCell>
      ),
    },
    {
      title: 'Modalidad',
      key: 'modalidad',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <TableCell align="center">{record.modalidad || '—'}</TableCell>
      ),
    },
    {
      title: 'Nº total de estudiantes matriculados',
      key: 'totalMatriculados',
      width: 150,
      align: 'center',
      className: 'fin-num fin-num--center',
      render: (_, record) => (
        <span className="fin-num--strong">{record.totalMatriculados || 0}</span>
      ),
    },
  ];

  // Bloque AGRUPADO: "Número de estudiantes con beca por tipo".
  const columnaGrupoBecas = {
    title: 'Número de estudiantes con beca por tipo',
    key: 'becasPorTipo',
    children: tramos.map((porcentaje) => {
      const key = becaPorcentajeKey(porcentaje);
      return {
        title: becaPorcentajeLabel(porcentaje),
        key,
        width: 100,
        align: 'center',
        className: 'fin-num fin-num--center',
        render: (_, record) => renderConteo(record.becasPorPorcentaje?.[key]),
      };
    }),
  };

  const columnasFijasDerecha = [
    {
      title: 'Total estudiantes con beca',
      key: 'totalConBeca',
      width: 130,
      align: 'center',
      className: 'fin-num fin-num--center',
      render: (_, record) => (
        <span className="fin-num--strong">{record.totalConBeca || 0}</span>
      ),
    },
    {
      title: '% de estudiantes con beca',
      key: 'porcentajeConBeca',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <StatusPill
          label={formatPorcentaje(record.porcentajeConBeca)}
          className={getCoberturaPillClass(record.porcentajeConBeca)}
        />
      ),
    },
    {
      title: '% de cobertura por carrera',
      key: 'porcentajeCobertura',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <StatusPill
          label={formatPorcentaje(record.porcentajeCobertura)}
          className={getCoberturaPillClass(record.porcentajeCobertura)}
        />
      ),
    },
    {
      title: 'Observaciones',
      key: 'observaciones',
      width: 160,
      align: 'left',
      render: (_, record) => (
        <span className="becas-obs">{record.observaciones || '—'}</span>
      ),
    },
  ];

  return [...columnasFijasIzquierda, columnaGrupoBecas, ...columnasFijasDerecha];
};

export { formatPorcentaje };

export default createBecasTableColumns;
