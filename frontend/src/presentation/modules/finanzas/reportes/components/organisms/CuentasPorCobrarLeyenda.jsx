/**
 * Organismo: leyenda de alertas + observaciones generales de la planilla.
 *
 * Réplica de los bloques "LEYENDA DE ALERTAS" y "OBSERVACIONES GENERALES" de la
 * planilla oficial. La leyenda usa el mismo DOT de color que la columna Estado
 * (`fin-dot--*`) para que la correspondencia sea exacta. Las observaciones son
 * una lista limpia de texto fijo.
 *
 * Recibe `leyenda` y `observaciones` ya construidas por el hook de estado; no
 * hace fetch. Solo presentación (clases del kit + ajustes locales).
 */

import { Card, Col, Flex, Row, Typography } from 'antd';
import {
  formatEstadoCobranza,
  getEstadoDotClass,
} from '@application-finanzas/utils/cuentasPorCobrarPills';
import { allSpacing } from '@theme/tokens';
import '@finanzas/styles/finanzas-planilla.css';
import '@finanzas/reportes/styles/cuentas-por-cobrar.css';

const { Text } = Typography;

const CuentasPorCobrarLeyenda = ({ leyenda = [], observaciones = [] }) => (
  <Row gutter={[allSpacing.marginLG, allSpacing.marginLG]}>
    <Col xs={24} xl={10}>
      <Card variant="outlined" title="Leyenda de alertas" size="small">
        <Flex vertical gap={allSpacing.marginSM} style={{ width: '100%' }}>
          {leyenda.map((item) => (
            <Flex key={item.key} align="center" gap={allSpacing.marginSM} wrap="wrap">
              <span className="cobranza-leyenda__estado">
                <span className={`fin-dot ${getEstadoDotClass(item.estado)}`} aria-hidden />
                <span className="cobranza-leyenda__label">{formatEstadoCobranza(item.estado)}</span>
              </span>
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
