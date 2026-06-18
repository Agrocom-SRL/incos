/**
 * Organismo: leyenda de alertas + observaciones generales de la planilla.
 *
 * Reúne en una `Card` la leyenda de estados (reutilizando el átomo
 * `EstadoCobranzaTag` para que el color coincida exactamente con la columna
 * Estado) y un listado de observaciones generales (texto fijo breve).
 *
 * Recibe `leyenda` y `observaciones` ya construidas por el hook de estado; no
 * hace fetch. Espaciado vía `allSpacing`; sin #hex.
 */

import { Card, Col, Flex, Row, Typography } from 'antd';
import EstadoCobranzaTag from '@finanzas/reportes/components/atoms/EstadoCobranzaTag';
import { allSpacing } from '@theme/tokens';

const { Text } = Typography;

const CuentasPorCobrarLeyenda = ({ leyenda = [], observaciones = [] }) => (
  <Row gutter={[allSpacing.marginLG, allSpacing.marginLG]}>
    <Col xs={24} xl={10}>
      <Card variant="outlined" title="Leyenda de alertas" size="small">
        <Flex vertical gap={allSpacing.marginSM} style={{ width: '100%' }}>
          {leyenda.map((item) => (
            <Flex key={item.key} align="center" gap={allSpacing.marginSM} wrap="wrap">
              <EstadoCobranzaTag estado={item.estado} />
              <Text type="secondary">{item.descripcion}</Text>
            </Flex>
          ))}
        </Flex>
      </Card>
    </Col>

    <Col xs={24} xl={14}>
      <Card variant="outlined" title="Observaciones generales" size="small">
        <Flex vertical gap={allSpacing.marginXS} style={{ width: '100%' }}>
          {observaciones.map((texto, index) => (
            <Flex key={index} align="baseline" gap={allSpacing.marginXS}>
              <Text type="secondary">•</Text>
              <Text type="secondary">{texto}</Text>
            </Flex>
          ))}
        </Flex>
      </Card>
    </Col>
  </Row>
);

export default CuentasPorCobrarLeyenda;
