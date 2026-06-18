/**
 * Organismo: sección de una carrera en la planilla de cuentas por cobrar.
 *
 * Cada carrera es una `Card` con una sub-tabla por PARALELO (grano estudiante).
 * Antes de cada sub-tabla se pinta una cabecera de paralelo (Nº matriculados,
 * monto máximo total). Al pie de la sección, una fila de TOTALES de la carrera
 * (matriculados, monto máximo, cancelado, pendiente por cobrar, % pendiente).
 *
 * Recibe props ya mapeadas; no hace fetch ni orquesta. Colores de acento vía
 * `theme.useToken()` (sin #hex); espaciado vía `allSpacing`.
 */

import { Card, Col, Flex, Row, Statistic, Table, Tag, Typography, theme } from 'antd';
import { formatBs, formatPorcentaje } from '@finanzas/reportes/config/cuentasPorCobrarColumns';
import { allSpacing } from '@theme/tokens';

const { Text, Title } = Typography;

/** Cabecera de un paralelo: identificador + turno + matriculados + monto máximo. */
const ParaleloHeader = ({ paralelo }) => {
  const { token } = theme.useToken();
  return (
    <Flex
      align="center"
      justify="space-between"
      wrap="wrap"
      gap={allSpacing.marginSM}
      style={{
        padding: `${allSpacing.marginXS}px ${allSpacing.marginSM}px`,
        background: token.colorFillTertiary,
        borderRadius: token.borderRadius,
      }}
    >
      <Flex align="center" gap={allSpacing.marginSM} wrap="wrap">
        <Tag color="processing" style={{ marginInlineEnd: 0 }}>
          Paralelo {paralelo.paralelo}
        </Tag>
        {paralelo.turno ? <Text type="secondary">{paralelo.turno}</Text> : null}
      </Flex>
      <Flex align="center" gap={allSpacing.marginLG} wrap="wrap">
        <Text type="secondary">
          Nº matriculados: <Text strong>{paralelo.totalMatriculados || 0}</Text>
        </Text>
        <Text type="secondary">
          Monto máximo total: <Text strong>{formatBs(paralelo.montoMaximoTotal)} Bs</Text>
        </Text>
      </Flex>
    </Flex>
  );
};

/** Fila de TOTALES de la carrera (resumen al pie de la sección). */
const CarreraTotales = ({ carrera }) => {
  const { token } = theme.useToken();
  const items = [
    { key: 'matriculados', title: 'Nº matriculados', value: carrera.totalMatriculados || 0 },
    {
      key: 'maximo',
      title: 'Monto máximo total',
      value: `${formatBs(carrera.montoMaximoTotal)} Bs`,
    },
    {
      key: 'cancelado',
      title: 'Total cancelado',
      value: `${formatBs(carrera.totalCancelado)} Bs`,
      color: token.colorSuccess,
    },
    {
      key: 'pendiente',
      title: 'Total pendiente por cobrar',
      value: `${formatBs(carrera.totalPendiente)} Bs`,
      color: token.colorError,
    },
    {
      key: 'porcentaje',
      title: '% pendiente',
      value: formatPorcentaje(carrera.porcentajePendiente),
      color: token.colorWarning,
    },
  ];

  return (
    <Card variant="outlined" size="small" style={{ background: token.colorFillQuaternary }}>
      <Row gutter={[allSpacing.margin, allSpacing.margin]}>
        {items.map((item) => (
          <Col key={item.key} xs={12} md={8} xl={Math.floor(24 / items.length)}>
            <Statistic
              title={item.title}
              value={item.value}
              valueStyle={{ color: item.color || token.colorText, fontSize: token.fontSizeLG }}
            />
          </Col>
        ))}
      </Row>
    </Card>
  );
};

const CuentasPorCobrarCarreraSection = ({ carrera, columns }) => {
  if (!carrera) return null;
  const paralelos = Array.isArray(carrera.paralelos) ? carrera.paralelos : [];

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
    >
      <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%', minWidth: 0 }}>
        {paralelos.map((paralelo) => (
          <Flex
            key={paralelo.paraleloId ?? paralelo.paralelo}
            vertical
            gap={allSpacing.marginSM}
            style={{ width: '100%', minWidth: 0 }}
          >
            <ParaleloHeader paralelo={paralelo} />
            <Table
              size="small"
              bordered
              rowKey={(record) => record.pagoAporteId ?? record.estudianteId}
              dataSource={paralelo.estudiantes}
              columns={columns}
              pagination={false}
              scroll={{ x: 'max-content' }}
            />
          </Flex>
        ))}

        <CarreraTotales carrera={carrera} />
      </Flex>
    </Card>
  );
};

export default CuentasPorCobrarCarreraSection;
