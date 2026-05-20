/**
 * KPIs del tablero de coordinación.
 */

import { Card, Col, Row, Statistic } from 'antd';
import {
  CheckCircleOutlined,
  FileExclamationOutlined,
  FormOutlined,
  TeamOutlined,
} from '@ant-design/icons';

const TableroMetricas = ({ metricas }) => {
  if (!metricas) return null;

  return (
    <Row gutter={[16, 16]} className="tablero-metricas">
      <Col xs={24} sm={12} lg={6}>
        <Card size="small" className="tablero-metricas__card">
          <Statistic
            title="Cursos al día"
            value={metricas.cursosCompletos}
            suffix={`/ ${metricas.cursosTotal}`}
            prefix={<CheckCircleOutlined className="tablero-metricas__icon--ok" />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card size="small" className="tablero-metricas__card">
          <Statistic
            title="Planes sin definir"
            value={metricas.planesSinDefinir}
            valueStyle={
              metricas.planesSinDefinir > 0 ? { color: '#b45309' } : undefined
            }
            prefix={<FormOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card size="small" className="tablero-metricas__card">
          <Statistic
            title="Notas faltantes"
            value={metricas.notasFaltantes}
            valueStyle={
              metricas.notasFaltantes > 0 ? { color: '#b45309' } : undefined
            }
            prefix={<FileExclamationOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card size="small" className="tablero-metricas__card">
          <Statistic
            title="Docentes con cuaderno activo"
            value={metricas.docentesActivos}
            prefix={<TeamOutlined className="tablero-metricas__icon--neutral" />}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default TableroMetricas;
