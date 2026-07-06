/**
 * Organismo: sección de una carrera en el reporte de becas (una pestaña por
 * carrera en `BecasReportePage`, mismo espíritu que
 * `CuentasPorCobrarCarreraSection`).
 *
 * Cada carrera es una `Card` con UNA planilla densa (kit `fin-planilla`) que
 * agrupa por PARALELO (sin nivel de periodo/año intermedio: el propio nombre
 * del paralelo ya lo distingue, p. ej. "PRIMERO A"):
 *   - una fila de cabecera de paralelo (`fin-planilla__row-grupo`) con Nº de
 *     matriculados, con beca y % de cobertura del paralelo;
 *   - las filas de ESTUDIANTE (grano individual: nombre, CI, tipo de beca,
 *     % beca, montos) — filas normales de la MISMA tabla, no una tabla anidada;
 *   - al pie, una fila de TOTALES de la carrera (`fin-planilla__row-total`).
 *
 * El agrupado se logra aplanando periodos→paralelos→estudiantes en un único
 * `dataSource` con filas sintéticas (`__tipo`: grupo | estudiante | total) y
 * envolviendo el `render` de las columnas para que las filas de grupo/total
 * ocupen el ancho completo (mismo patrón `colSpan` que Cuentas por Cobrar).
 * Solo presentación: recibe props ya mapeadas, sin fetch.
 */

import { Card, Flex, Table, Tag, Typography } from 'antd';
import StatusPill from '@atoms/StatusPill';
import { formatPorcentaje } from '@finanzas/reportes/config/becasTableColumns';
import { getCoberturaPillClass } from '@application-finanzas/utils/becasReportePills';
import { allSpacing } from '@theme/tokens';
import '@finanzas/reportes/styles/finanzas-planilla.css';

const { Title } = Typography;

/**
 * Aplana periodos → paralelos → estudiantes en filas con `__tipo`. La primera
 * fila de cada paralelo es su cabecera de grupo; al final, la fila de totales
 * de la carrera. El nivel PERIODO no se pinta (el nombre del paralelo ya
 * distingue el año, p. ej. "PRIMERO A").
 */
const buildRows = (carrera) => {
  const periodos = Array.isArray(carrera.children) ? carrera.children : [];
  const rows = [];

  periodos.forEach((periodo) => {
    const paralelos = Array.isArray(periodo.children) ? periodo.children : [];
    paralelos.forEach((paralelo) => {
      const pid = paralelo.paraleloId ?? paralelo.id;
      rows.push({ __tipo: 'grupo', __key: `grupo-${pid}`, paralelo });
      (paralelo.estudiantes || []).forEach((estudiante, index) => {
        rows.push({
          ...estudiante,
          __tipo: 'estudiante',
          __key: `est-${pid}-${estudiante.estudianteId ?? index}`,
          __nro: index + 1,
        });
      });
    });
  });

  rows.push({ __tipo: 'total', __key: `total-${carrera.carreraId ?? carrera.carreraNombre}`, carrera });
  return rows;
};

/** Banda de cabecera de un paralelo (matriculados · con beca · cobertura). */
const renderGrupo = (paralelo) => (
  <Flex align="center" justify="space-between" wrap="wrap" gap={allSpacing.marginSM}>
    <span className="cobranza-grupo__titulo">
      Paralelo {paralelo.paraleloNombre}
      {paralelo.paraleloTurno ? <span className="cobranza-grupo__turno"> · {paralelo.paraleloTurno}</span> : null}
    </span>
    <span className="cobranza-grupo__metricas">
      Nº matriculados: <strong>{paralelo.totalMatriculados || 0}</strong>
      <span className="cobranza-grupo__sep">|</span>
      Con beca: <strong>{paralelo.totalConBeca || 0}</strong>
      <span className="cobranza-grupo__sep">|</span>
      Cobertura:{' '}
      <StatusPill
        label={formatPorcentaje(paralelo.porcentajeCobertura)}
        className={getCoberturaPillClass(paralelo.porcentajeCobertura)}
      />
    </span>
  </Flex>
);

/** Fila de TOTALES de la carrera (resumen al pie). */
const renderTotal = (carrera) => (
  <Flex align="center" justify="space-between" wrap="wrap" gap={allSpacing.marginSM}>
    <span className="cobranza-total__titulo">RESUMEN TOTAL — {carrera.carreraNombre}</span>
    <span className="cobranza-total__metricas">
      <span>
        Matriculados: <strong>{carrera.totalMatriculados || 0}</strong>
      </span>
      <span>
        Con beca: <strong>{carrera.totalConBeca || 0}</strong>
      </span>
      <span>
        % con beca: <strong>{formatPorcentaje(carrera.porcentajeConBeca)}</strong>
      </span>
      <span>
        % cobertura: <strong>{formatPorcentaje(carrera.porcentajeCobertura)}</strong>
      </span>
    </span>
  </Flex>
);

/**
 * Envuelve cada columna base para que las filas de grupo/total ocupen el
 * ancho completo (primera columna) y se oculten en el resto. El colSpan se
 * fija por `onCell` (no devolviendo `props` desde `render`, deprecado en AntD
 * por el bug de render que produce celdas superpuestas). Las filas de
 * estudiante usan el `render` original; la columna Nº usa el contador por
 * paralelo (`__nro`), no el índice global de la tabla aplanada.
 */
const withGroupRows = (columns, totalLeafCols) =>
  columns.map((col, colIdx) => {
    const isFirst = colIdx === 0;
    return {
      ...col,
      onCell: (record) => {
        if (record.__tipo === 'grupo' || record.__tipo === 'total') {
          return { colSpan: isFirst ? totalLeafCols : 0 };
        }
        return col.onCell ? col.onCell(record) : {};
      },
      render: (value, record) => {
        if (record.__tipo === 'grupo') {
          return isFirst ? renderGrupo(record.paralelo) : null;
        }
        if (record.__tipo === 'total') {
          return isFirst ? renderTotal(record.carrera) : null;
        }
        if (col.key === 'nro') return record.__nro;
        return col.render ? col.render(value, record, record.__nro - 1) : value;
      },
    };
  });

const BecasCarreraSection = ({ carrera, columns }) => {
  if (!carrera) return null;

  const rows = buildRows(carrera);
  const totalLeafCols = columns.length;
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

export default BecasCarreraSection;
