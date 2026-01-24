/**
 * DocumentDeliveriesSection - Organism para mostrar la sección de documentos entregados
 * 
 * Single Responsibility: Mostrar todos los documentos entregados del estudiante
 * 
 * Atomic Design: Organism
 * - Combina molecules (StudentInfoItem) y atoms (Card, Row, Col, Divider)
 * 
 * @param {Array} documentDeliveries - Array de documentos entregados del estudiante
 */

import { Row, Col, Divider } from 'antd';
import { 
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileProtectOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { Card } from '@atoms';
import { StudentInfoItem } from '../molecules';

const DocumentDeliveriesSection = ({ documentDeliveries }) => {
  if (!documentDeliveries || documentDeliveries.length === 0) return null;

  return (
    <Card
      title="Documentos Entregados"
      style={{ marginBottom: '24px' }}
      headerColor="primary"
    >
      {documentDeliveries.map((doc, index) => (
        <div key={doc.id || index}>
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12}>
              <StudentInfoItem
                icon={<FileTextOutlined style={{ fontSize: '24px', color: '#fff' }} />}
                label="Documento"
                value={doc.documentacionName || doc.documentacionId}
              />
            </Col>
            <Col xs={24} sm={12}>
              <StudentInfoItem
                icon={<CheckCircleOutlined style={{ fontSize: '24px', color: '#fff' }} />}
                label="Entregado"
                value={doc.entregado ? 'Sí' : 'No'}
              />
            </Col>
            <Col xs={24} sm={12}>
              <StudentInfoItem
                icon={<ClockCircleOutlined style={{ fontSize: '24px', color: '#fff' }} />}
                label="En Trámite"
                value={doc.enTramite ? 'Sí' : 'No'}
              />
            </Col>
            <Col xs={24} sm={12}>
              <StudentInfoItem
                icon={<CalendarOutlined style={{ fontSize: '24px', color: '#fff' }} />}
                label="Fecha de Entrega"
                value={doc.fechaEntrega}
              />
            </Col>
            {doc.observaciones && (
              <Col xs={24}>
                <StudentInfoItem
                  icon={<FileTextOutlined style={{ fontSize: '24px', color: '#fff' }} />}
                  label="Observaciones"
                  value={doc.observaciones}
                />
              </Col>
            )}
          </Row>
          {index < documentDeliveries.length - 1 && (
            <Divider style={{ margin: '24px 0' }} />
          )}
        </div>
      ))}
    </Card>
  );
};

export default DocumentDeliveriesSection;
