/**
 * DatosPersonalesSection - Organism para mostrar la sección de datos personales del estudiante
 * 
 * Single Responsibility: Mostrar todos los datos personales del estudiante en una sección
 * 
 * Atomic Design: Organism
 * - Combina molecules (StudentInfoItem) y atoms (Card, Row, Col)
 * 
 * @param {Object} studentData - Objeto con datos personales del estudiante
 */

import { Row, Col } from 'antd';
import { 
  BarcodeOutlined, 
  UserOutlined, 
  IdcardOutlined,
  CalendarOutlined,
  ManOutlined,
  HeartOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { Card } from '@atoms';
import { StudentInfoItem } from '../molecules';

const DatosPersonalesSection = ({ studentData }) => {
  if (!studentData) return null;

  return (
    <Card
      title="DATOS PERSONALES"
      style={{ marginBottom: '24px' }}
      headerColor="primary"
    >
      <Row gutter={[24, 16]}>
        <Col xs={24} sm={12}>
          <StudentInfoItem
            icon={<BarcodeOutlined style={{ fontSize: '24px', color: '#fff' }} />}
            label="Código de Estudiante"
            value={studentData.codigoEstudiante}
          />
        </Col>
        <Col xs={24} sm={12}>
          <StudentInfoItem
            icon={<IdcardOutlined style={{ fontSize: '24px', color: '#fff' }} />}
            label="CI Completo"
            value={studentData.ciCompleto}
          />
        </Col>
        <Col xs={24} sm={12}>
          <StudentInfoItem
            icon={<UserOutlined style={{ fontSize: '24px', color: '#fff' }} />}
            label="Nombres"
            value={studentData.nombres}
          />
        </Col>
        <Col xs={24} sm={12}>
          <StudentInfoItem
            icon={<UserOutlined style={{ fontSize: '24px', color: '#fff' }} />}
            label="Apellido Paterno"
            value={studentData.apellidoPaterno}
          />
        </Col>
        <Col xs={24} sm={12}>
          <StudentInfoItem
            icon={<UserOutlined style={{ fontSize: '24px', color: '#fff' }} />}
            label="Apellido Materno"
            value={studentData.apellidoMaterno}
          />
        </Col>
        <Col xs={24} sm={12}>
          <StudentInfoItem
            icon={<UserOutlined style={{ fontSize: '24px', color: '#fff' }} />}
            label="Nombre Completo"
            value={studentData.nombreCompleto}
          />
        </Col>
        <Col xs={24} sm={12}>
          <StudentInfoItem
            icon={<CalendarOutlined style={{ fontSize: '24px', color: '#fff' }} />}
            label="Fecha de Nacimiento"
            value={studentData.fechaNacimiento}
          />
        </Col>
        <Col xs={24} sm={12}>
          <StudentInfoItem
            icon={<ManOutlined style={{ fontSize: '24px', color: '#fff' }} />}
            label="Género"
            value={studentData.genero}
          />
        </Col>
        <Col xs={24} sm={12}>
          <StudentInfoItem
            icon={<UserOutlined style={{ fontSize: '24px', color: '#fff' }} />}
            label="Estado Civil"
            value={studentData.estadoCivilName || studentData.estadoCivilId}
          />
        </Col>
        <Col xs={24} sm={12}>
          <StudentInfoItem
            icon={<HeartOutlined style={{ fontSize: '24px', color: '#fff' }} />}
            label="Tipo de Sangre"
            value={studentData.tipoSangre}
          />
        </Col>
        <Col xs={24} sm={12}>
          <StudentInfoItem
            icon={<MailOutlined style={{ fontSize: '24px', color: '#fff' }} />}
            label="Email Personal"
            value={studentData.emailPersonal}
          />
        </Col>
        <Col xs={24} sm={12}>
          <StudentInfoItem
            icon={<PhoneOutlined style={{ fontSize: '24px', color: '#fff' }} />}
            label="Celular"
            value={studentData.celular}
          />
        </Col>
        <Col xs={24} sm={12}>
          <StudentInfoItem
            icon={<PhoneOutlined style={{ fontSize: '24px', color: '#fff' }} />}
            label="Teléfono Fijo"
            value={studentData.telefonoFijo}
          />
        </Col>
        <Col xs={24}>
          <StudentInfoItem
            icon={<HomeOutlined style={{ fontSize: '24px', color: '#fff' }} />}
            label="Dirección"
            value={studentData.direccion}
          />
        </Col>
        <Col xs={24}>
          <StudentInfoItem
            icon={<EnvironmentOutlined style={{ fontSize: '24px', color: '#fff' }} />}
            label="Zona"
            value={studentData.zona}
          />
        </Col>
        <Col xs={24}>
          <StudentInfoItem
            icon={<EnvironmentOutlined style={{ fontSize: '24px', color: '#fff' }} />}
            label="Residencia Completa"
            value={studentData.residenceAddressComplete || 
                   (studentData.municipioResidenciaName ? 
                     `${studentData.municipioResidenciaName}${studentData.provinciaResidenciaName ? `, ${studentData.provinciaResidenciaName}` : ''}${studentData.departamentoResidenciaName ? `, ${studentData.departamentoResidenciaName}` : ''}` 
                     : null)}
          />
        </Col>
        {studentData.observaciones && (
          <Col xs={24}>
            <StudentInfoItem
              icon={<FileTextOutlined style={{ fontSize: '24px', color: '#fff' }} />}
              label="Observaciones"
              value={studentData.observaciones}
            />
          </Col>
        )}
      </Row>
    </Card>
  );
};

export default DatosPersonalesSection;
