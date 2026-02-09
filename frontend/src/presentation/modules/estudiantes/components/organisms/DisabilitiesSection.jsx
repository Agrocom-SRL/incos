/**
 * DisabilitiesSection - Organism para mostrar la sección de discapacidades del estudiante
 * 
 * Single Responsibility: Mostrar todas las discapacidades del estudiante
 * 
 * Atomic Design: Organism
 * - Combina molecules (StudentInfoItem) y atoms (Card, Row, Col, Divider)
 * 
 * @param {Array} disabilities - Array de discapacidades del estudiante
 */

import { Row, Col, Divider } from 'antd';
import { 
  InfoCircleOutlined,
  FileTextOutlined,
  AlertOutlined
} from '@ant-design/icons';
import { Card } from '@atoms';
import { StudentInfoItem } from '../molecules';

const DisabilitiesSection = ({ disabilities }) => {
  if (!disabilities || disabilities.length === 0) return null;

  return (
    <Card
      title="Discapacidades"
      style={{ marginBottom: '24px' }}
      headerColor="primary"
    >
      {disabilities.map((disability, index) => (
        <div key={disability.id || index}>
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12}>
              <StudentInfoItem
                icon={<InfoCircleOutlined style={{ fontSize: '24px', color: '#fff' }} />}
                label="Tipo de Discapacidad"
                value={disability.disabilityTypeName || disability.disabilityTypeId}
              />
            </Col>
            <Col xs={24} sm={12}>
              <StudentInfoItem
                icon={<AlertOutlined style={{ fontSize: '24px', color: '#fff' }} />}
                label="Grado"
                value={disability.disabilityDegree || disability.gradoDiscapacidad}
              />
            </Col>
            <Col xs={24}>
              <StudentInfoItem
                icon={<FileTextOutlined style={{ fontSize: '24px', color: '#fff' }} />}
                label="Descripción"
                value={disability.description || disability.descripcion}
              />
            </Col>
            {(disability.cause || disability.causa) && (
              <Col xs={24}>
                <StudentInfoItem
                  icon={<AlertOutlined style={{ fontSize: '24px', color: '#fff' }} />}
                  label="Causa"
                  value={disability.cause || disability.causa}
                />
              </Col>
            )}
          </Row>
          {index < disabilities.length - 1 && (
            <Divider style={{ margin: '24px 0' }} />
          )}
        </div>
      ))}
    </Card>
  );
};

export default DisabilitiesSection;
