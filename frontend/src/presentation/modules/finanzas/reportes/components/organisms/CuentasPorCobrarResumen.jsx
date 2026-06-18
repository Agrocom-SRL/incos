/**
 * Organismo: resumen general de la planilla de cuentas por cobrar.
 *
 * Pinta el resumen total de TODAS las carreras como tarjetas `Statistic`
 * (matriculados, monto máximo, total cancelado, % pendiente) y un bloque
 * DESTACADO con el "Monto total pendiente por cobrar (todas las carreras)",
 * que es el dato principal de la planilla.
 *
 * Recibe `resumen` ya mapeado; no hace fetch. Colores de acento vía
 * `theme.useToken()` (sin #hex); espaciado vía `allSpacing`.
 */

import { Card, Col, Flex, Row, Statistic, Typography, theme } from 'antd';
import {
  BankOutlined,
  CheckCircleOutlined,
  PercentageOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { formatBs, formatPorcentaje } from '@finanzas/reportes/config/cuentasPorCobrarColumns';
import { allSpacing } from '@theme/tokens';

const { Text, Title } = Typography;

const CuentasPorCobrarResumen = ({ resumen }) => {
  const { token } = theme.useToken();
  const data = resumen || {};

  const items = [
    {
      key: 'matriculados',
      title: 'Total matriculados',
      value: data.totalMatriculados || 0,
      icon: <TeamOutlined />,
      color: token.colorText,
    },
    {
      key: 'maximo',
      title: 'Monto máximo total (Bs)',
      value: formatBs(data.montoMaximoTotal),
      icon: <BankOutlined />,
      color: token.colorText,
    },
    {
      key: 'cancelado',
      title: 'Total cancelado (Bs)',
      value: formatBs(data.totalCancelado),
      icon: <CheckCircleOutlined />,
      color: token.colorSuccess,
    },
    {
      key: 'porcentaje',
      title: '% pendiente',
      value: formatPorcentaje(data.porcentajePendiente),
      icon: <PercentageOutlined />,
      color: token.colorWarning,
    },
  ];

  return (
    <Row gutter={[allSpacing.marginLG, allSpacing.marginLG]}>
      <Col xs={24} xl={16}>
        <Row gutter={[allSpacing.margin, allSpacing.margin]}>
          {items.map((item) => (
            <Col key={item.key} xs={24} sm={12}>
              <Card variant="outlined" size="small">
                <Statistic
                  title={item.title}
                  value={item.value}
                  prefix={item.icon}
                  valueStyle={{ color: item.color }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Col>

      <Col xs={24} xl={8}>
        <Card
          variant="outlined"
          style={{
            height: '100%',
            borderColor: token.colorError,
            background: token.colorErrorBg,
          }}
        >
          <Flex vertical align="center" justify="center" gap={allSpacing.marginSM} style={{ height: '100%' }}>
            <Text strong style={{ textAlign: 'center', color: token.colorErrorText }}>
              Monto total pendiente por cobrar (todas las carreras)
            </Text>
            <Title level={2} style={{ margin: 0, color: token.colorError }}>
              {formatBs(data.totalPendientePorCobrar)}
            </Title>
            <Text type="secondary">Bs</Text>
          </Flex>
        </Card>
      </Col>
    </Row>
  );
};

export default CuentasPorCobrarResumen;
