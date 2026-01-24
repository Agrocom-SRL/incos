/**
 * GuardiansSection - Organism para mostrar la sección de apoderados/contactos de emergencia
 * 
 * Single Responsibility: Mostrar todos los apoderados/contactos de emergencia del estudiante
 * 
 * Atomic Design: Organism
 * - Combina molecules (StudentInfoItem) y atoms (Card, Row, Col, Divider)
 * 
 * @param {Array} guardians - Array de apoderados/contactos de emergencia
 */

import { Row, Col, Divider } from 'antd';
import { 
  UserOutlined,
  PhoneOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { Card } from '@atoms';
import { StudentInfoItem } from '../molecules';

const GuardiansSection = ({ guardians }) => {
  if (!guardians || guardians.length === 0) return null;

  return (
    <Card
      title="Apoderados / Contactos de Emergencia"
      style={{ marginBottom: '24px' }}
      headerColor="primary"
    >
      {guardians.map((guardian, index) => (
        <div key={guardian.id || index}>
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12}>
              <StudentInfoItem
                icon={<UserOutlined style={{ fontSize: '24px', color: '#fff' }} />}
                label="Tipo de Parentesco"
                value={guardian.relationshipTypeName || guardian.relationshipTypeId}
              />
            </Col>
            <Col xs={24} sm={12}>
              <StudentInfoItem
                icon={<UserOutlined style={{ fontSize: '24px', color: '#fff' }} />}
                label="Nombres"
                value={guardian.firstName || guardian.nombres}
              />
            </Col>
            <Col xs={24} sm={12}>
              <StudentInfoItem
                icon={<UserOutlined style={{ fontSize: '24px', color: '#fff' }} />}
                label="Apellidos"
                value={guardian.lastName || guardian.apellidos}
              />
            </Col>
            <Col xs={24} sm={12}>
              <StudentInfoItem
                icon={<PhoneOutlined style={{ fontSize: '24px', color: '#fff' }} />}
                label="Celular 1"
                value={guardian.cellphone1 || guardian.celular1}
              />
            </Col>
            <Col xs={24} sm={12}>
              <StudentInfoItem
                icon={<PhoneOutlined style={{ fontSize: '24px', color: '#fff' }} />}
                label="Celular 2"
                value={guardian.cellphone2 || guardian.celular2}
              />
            </Col>
            <Col xs={24} sm={12}>
              <StudentInfoItem
                icon={<TeamOutlined style={{ fontSize: '24px', color: '#fff' }} />}
                label="Vive con Estudiante"
                value={guardian.livesWithStudent ? 'Sí' : 'No'}
              />
            </Col>
          </Row>
          {index < guardians.length - 1 && (
            <Divider style={{ margin: '24px 0' }} />
          )}
        </div>
      ))}
    </Card>
  );
};

export default GuardiansSection;
