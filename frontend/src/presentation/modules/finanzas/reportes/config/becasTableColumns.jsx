/**
 * Columnas de la planilla de control de becas por carrera (reporte read-only).
 *
 * `createBecasTableColumns(porcentajes)` arma columnas FIJAS + columnas DINÁMICAS
 * por cada tramo de beca recibido en `porcentajes` (p. ej. [25,50,75,100]). Los
 * tramos NO se hardcodean: si el instituto cambia los porcentajes, la tabla los
 * sigue. Celdas con `TableCell`; nombres de carrera tal cual vienen (no aplica
 * orden de persona). La fila de TOTALES se pinta con `Table.Summary` en la página.
 */

import { TableCell } from '@molecules';
import { Text } from '@atoms';
import { becaPorcentajeKey, becaPorcentajeLabel } from '@application-finanzas/mappers/becasReporteMapper';

const formatPorcentaje = (value) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return `${safe.toLocaleString('es-BO', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
};

/** Render de un conteo entero centrado (0 se atenúa para reducir ruido visual). */
const renderConteo = (value) => {
  const n = Number(value) || 0;
  return (
    <TableCell align="center">
      <Text type={n === 0 ? 'secondary' : 'default'}>{n}</Text>
    </TableCell>
  );
};

/**
 * @param {number[]} porcentajes - Tramos de beca a renderizar como columnas.
 * @returns {Array} Columnas de AntD Table.
 */
export const createBecasTableColumns = (porcentajes = []) => {
  const tramos = Array.isArray(porcentajes) ? porcentajes : [];

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
      render: (_, record) => (
        <TableCell subtext={record.carreraCodigo || null}>
          {record.carreraNombre || 'Sin nombre'}
        </TableCell>
      ),
    },
    {
      title: 'Modalidad',
      key: 'modalidad',
      width: 140,
      render: (_, record) => (
        <TableCell>{record.modalidad || '—'}</TableCell>
      ),
    },
    {
      title: 'Nº matriculados',
      key: 'totalMatriculados',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <TableCell align="center" strong>
          {record.totalMatriculados || 0}
        </TableCell>
      ),
    },
  ];

  const columnasDinamicas = tramos.map((porcentaje) => {
    const key = becaPorcentajeKey(porcentaje);
    return {
      title: becaPorcentajeLabel(porcentaje),
      key,
      width: 110,
      align: 'center',
      render: (_, record) => renderConteo(record.becasPorPorcentaje?.[key]),
    };
  });

  const columnasFijasDerecha = [
    {
      title: 'Total con beca',
      key: 'totalConBeca',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <TableCell align="center" strong>
          {record.totalConBeca || 0}
        </TableCell>
      ),
    },
    {
      title: '% con beca',
      key: 'porcentajeConBeca',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <TableCell align="center">{formatPorcentaje(record.porcentajeConBeca)}</TableCell>
      ),
    },
    {
      title: '% cobertura',
      key: 'porcentajeCobertura',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <TableCell align="center">{formatPorcentaje(record.porcentajeCobertura)}</TableCell>
      ),
    },
  ];

  return [...columnasFijasIzquierda, ...columnasDinamicas, ...columnasFijasDerecha];
};

export { formatPorcentaje };

export default createBecasTableColumns;
