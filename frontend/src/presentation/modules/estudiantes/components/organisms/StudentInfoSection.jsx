/**
 * StudentInfoSection - Organism para mostrar la sección de información del estudiante
 * 
 * Single Responsibility: Mostrar toda la información del estudiante en una sección
 * 
 * Atomic Design: Organism
 * - Combina molecules (StudentInfoItem) y atoms (Card, Row, Col)
 * 
 * @param {Object} student - Objeto con información del estudiante
 * @param {string} student.codigoEstudiante - Código del estudiante
 * @param {string} student.nombreCompleto - Nombre completo
 * @param {string} student.ciCompleto - CI completo
 */

import { Row, Col } from 'antd';
import { BarcodeOutlined, UserOutlined, IdcardOutlined } from '@ant-design/icons';
import { Card } from '@atoms';
import { StudentInfoItem } from '../molecules';

const StudentInfoSection = ({ student }) => {
  if (!student) return null;

  return (
    <Card
      title="Información del estudiante"
      style={{ marginBottom: '24px' }}
      headerColor="primary"
    >
      <Row gutter={[24, 16]}>
        <Col xs={24} sm={12}>
          <StudentInfoItem
            icon={<BarcodeOutlined style={{ fontSize: '24px', color: '#fff' }} />}
            label="Código de estudiante"
            value={student.codigoEstudiante}
          />
        </Col>
        <Col xs={24} sm={12}>
          <StudentInfoItem
            icon={<UserOutlined style={{ fontSize: '24px', color: '#fff' }} />}
            label="Nombre completo"
            value={student.nombreCompleto}
          />
        </Col>
        <Col xs={24} sm={12}>
          <StudentInfoItem
            icon={<IdcardOutlined style={{ fontSize: '24px', color: '#fff' }} />}
            label="CI Completo"
            value={student.ciCompleto}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default StudentInfoSection;
