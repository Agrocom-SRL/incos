/**
 * Organismo: tarjetas de resumen general de la planilla de becas.
 *
 * Recibe el `resumen` ya mapeado (total matriculados, total con beca, % con beca,
 * % sin beca) y lo pinta como cuatro `Statistic` en `Card`. No hace fetch ni
 * orquesta: solo presenta props ya mapeadas. Colores de acento vía
 * `theme.useToken()` (sin #hex). Espaciado vía tokens (`allSpacing`).
 */

import { Card, Col, Row, Statistic, theme } from 'antd';
import {
  BankOutlined,
  PercentageOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { allSpacing } from '@theme/tokens';

const formatPorcentaje = (value) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return safe.toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

const BecasResumenCards = ({ resumen }) => {
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
      key: 'conBeca',
      title: 'Total con beca',
      value: data.totalConBeca || 0,
      icon: <TrophyOutlined />,
      color: token.colorPrimary,
    },
    {
      key: 'porcentajeConBeca',
      title: '% con beca',
      value: formatPorcentaje(data.porcentajeConBeca),
      suffix: '%',
      icon: <PercentageOutlined />,
      color: token.colorSuccess,
    },
    {
      key: 'porcentajeSinBeca',
      title: '% sin beca',
      value: formatPorcentaje(data.porcentajeSinBeca),
      suffix: '%',
      icon: <BankOutlined />,
      color: token.colorTextSecondary,
    },
  ];

  return (
    <Row gutter={[allSpacing.margin, allSpacing.margin]}>
      {items.map((item) => (
        <Col key={item.key} xs={24} sm={12} xl={6}>
          <Card variant="outlined" size="small">
            <Statistic
              title={item.title}
              value={item.value}
              suffix={item.suffix}
              prefix={item.icon}
              valueStyle={{ color: item.color }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default BecasResumenCards;
