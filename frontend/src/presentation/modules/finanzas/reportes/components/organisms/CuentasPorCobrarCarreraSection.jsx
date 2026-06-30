/**
 * Organismo: sección de una carrera en la planilla de cuentas por cobrar.
 *
 * Cada carrera es una `Card` con UNA planilla densa (kit `fin-planilla`) que,
 * fiel a la planilla oficial del instituto, agrupa por PARALELO:
 *   - una fila de cabecera de paralelo (`fin-planilla__row-grupo`) con Nº de
 *     estudiantes matriculados, monto máximo por estudiante y monto máximo por
 *     paralelo;
 *   - las filas de estudiante (zebra + hover, columnas numéricas `fin-num`);
 *   - al pie, una fila de TOTALES de la carrera (`fin-planilla__row-total`).
 *
 * El agrupado se logra aplanando los paralelos en un único `dataSource` con
 * filas sintéticas (`__tipo`: grupo | estudiante | total) y envolviendo el
 * `render`/`onCell` de las columnas para que las filas de grupo y total ocupen
 * el ancho completo. Solo presentación: recibe props ya mapeadas, sin fetch.
 */

import { Card, Flex, Table, Tag, Typography } from 'antd';
import { formatBs, formatPorcentaje } from '@finanzas/reportes/config/cuentasPorCobrarColumns';
import { allSpacing } from '@theme/tokens';
import '@finanzas/reportes/styles/finanzas-planilla.css';

const { Title } = Typography;

/** Celda invisible (las filas de grupo/total se pintan en una sola celda ancha). */
const HIDDEN_CELL = { props: { colSpan: 0 }, children: null };

/**
 * Aplana paralelos[] → filas con `__tipo`. La primera fila de cada paralelo es
 * su cabecera de grupo; al final, la fila de totales de la carrera.
 */
const buildRows = (carrera) => {
  const paralelos = Array.isArray(carrera.paralelos) ? carrera.paralelos : [];
  const rows = [];

  paralelos.forEach((paralelo) => {
    const pid = paralelo.paraleloId ?? paralelo.paralelo;
    rows.push({ __tipo: 'grupo', __key: `grupo-${pid}`, paralelo });
    (paralelo.estudiantes || []).forEach((estudiante, index) => {
      rows.push({
        ...estudiante,
        __tipo: 'estudiante',
        __key: `est-${pid}-${estudiante.pagoAporteId ?? estudiante.estudianteId ?? index}`,
        __nro: index + 1,
      });
    });
  });

  rows.push({ __tipo: 'total', __key: `total-${carrera.carreraId ?? carrera.carreraNombre}`, carrera });
  return rows;
};

/** Banda de cabecera de un paralelo (Nº matriculados · máximos), en una celda ancha. */
const renderGrupo = (paralelo, colSpan) => ({
  children: (
    <Flex align="center" justify="space-between" wrap="wrap" gap={allSpacing.marginSM}>
      <span className="cobranza-grupo__titulo">
        Paralelo {paralelo.paralelo}
        {paralelo.turno ? <span className="cobranza-grupo__turno"> · {paralelo.turno}</span> : null}
      </span>
      <span className="cobranza-grupo__metricas">
        Nº matriculados: <strong>{paralelo.totalMatriculados || 0}</strong>
        <span className="cobranza-grupo__sep">|</span>
        Monto máximo por paralelo: <strong>{formatBs(paralelo.montoMaximoTotal)} Bs</strong>
      </span>
    </Flex>
  ),
  props: { colSpan },
});

/** Fila de TOTALES de la carrera (resumen al pie), en una celda ancha. */
const renderTotal = (carrera, colSpan) => ({
  children: (
    <Flex align="center" justify="space-between" wrap="wrap" gap={allSpacing.marginSM}>
      <span className="cobranza-total__titulo">RESUMEN TOTAL — {carrera.carreraNombre}</span>
      <span className="cobranza-total__metricas">
        <span>
          Matriculados: <strong>{carrera.totalMatriculados || 0}</strong>
        </span>
        <span>
          Monto máximo: <strong>{formatBs(carrera.montoMaximoTotal)} Bs</strong>
        </span>
        <span>
          Cancelado: <strong>{formatBs(carrera.totalCancelado)} Bs</strong>
        </span>
        <span className="cobranza-total__pendiente">
          Pendiente: <strong>{formatBs(carrera.totalPendiente)} Bs</strong>
        </span>
        <span>
          % pendiente: <strong>{formatPorcentaje(carrera.porcentajePendiente)}</strong>
        </span>
      </span>
    </Flex>
  ),
  props: { colSpan },
});

/**
 * Envuelve cada columna base para que las filas de grupo/total ocupen el ancho
 * completo (primera columna) y se oculten en el resto. Las filas de estudiante
 * usan el `render` original; la columna Nº usa el contador por paralelo.
 */
const withGroupRows = (columns, totalLeafCols) =>
  columns.map((col, colIdx) => {
    const isFirst = colIdx === 0;
    return {
      ...col,
      render: (value, record) => {
        if (record.__tipo === 'grupo') {
          return isFirst ? renderGrupo(record.paralelo, totalLeafCols) : HIDDEN_CELL;
        }
        if (record.__tipo === 'total') {
          return isFirst ? renderTotal(record.carrera, totalLeafCols) : HIDDEN_CELL;
        }
        if (col.key === 'nro') return record.__nro;
        return col.render ? col.render(value, record, record.__nro - 1) : value;
      },
    };
  });

/** Nº de columnas hoja (Pagos realizados aporta 2 hijas). */
const countLeafColumns = (columns) =>
  columns.reduce((acc, col) => acc + (Array.isArray(col.children) ? col.children.length : 1), 0);

const CuentasPorCobrarCarreraSection = ({ carrera, columns }) => {
  if (!carrera) return null;

  const rows = buildRows(carrera);
  const totalLeafCols = countLeafColumns(columns);
  const wrappedColumns = withGroupRows(columns, totalLeafCols);

  return (
    <Card
      variant="outlined"
      title={
        <Flex align="center" justify="space-between" wrap="wrap" gap={allSpacing.marginSM}>
          <Title level={5} style={{ margin: 0 }}>
            {carrera.carreraNombre}
          </Title>
          {carrera.carreraCodigo ? <Tag>{carrera.carreraCodigo}</Tag> : null}
        </Flex>
      }
      styles={{ body: { padding: 0 } }}
    >
      <div className="fin-planilla-wrap">
        <Table
          className="fin-planilla"
          size="small"
          rowKey="__key"
          dataSource={rows}
          columns={wrappedColumns}
          pagination={false}
          scroll={{ x: 'max-content' }}
          rowClassName={(record) => {
            if (record.__tipo === 'grupo') return 'fin-planilla__row-grupo';
            if (record.__tipo === 'total') return 'fin-planilla__row-total';
            return '';
          }}
        />
      </div>
    </Card>
  );
};

export default CuentasPorCobrarCarreraSection;
