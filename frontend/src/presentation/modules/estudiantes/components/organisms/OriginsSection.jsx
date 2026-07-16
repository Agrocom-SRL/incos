/**
 * OriginsSection - Organism para mostrar la sección de orígenes del estudiante
 * 
 * Single Responsibility: Mostrar todos los orígenes del estudiante
 * 
 * Atomic Design: Organism
 * - Combina molecules (StudentInfoItem) y atoms (Card, Row, Col, Divider)
 * 
 * @param {Array} origins - Array de orígenes del estudiante
 */

import { Row, Col, Divider } from 'antd';
import { 
  GlobalOutlined,
  EnvironmentOutlined,
  TranslationOutlined,
  StarOutlined
} from '@ant-design/icons';
import { Card } from '@atoms';
import { StudentInfoItem } from '../molecules';

const OriginsSection = ({ origins }) => {
  if (!origins || origins.length === 0) return null;

  return (
    <Card
      title="Orígenes"
      style={{ marginBottom: '24px' }}
      headerColor="primary"
    >
      {origins.map((origin, index) => (
        <div key={origin.id || index}>
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12}>
              <StudentInfoItem
                icon={<GlobalOutlined style={{ fontSize: '24px', color: '#fff' }} />}
                label="Tipo de origen"
                value={origin.originType || origin.tipoOrigen}
              />
            </Col>
            <Col xs={24} sm={12}>
              <StudentInfoItem
                icon={<StarOutlined style={{ fontSize: '24px', color: '#fff' }} />}
                label="Principal"
                value={origin.isPrincipal ? 'Sí' : 'No'}
              />
            </Col>
            <Col xs={24} sm={12}>
              <StudentInfoItem
                icon={<GlobalOutlined style={{ fontSize: '24px', color: '#fff' }} />}
                label="País"
                value={origin.countryName || origin.countryId}
              />
            </Col>
            <Col xs={24}>
              <StudentInfoItem
                icon={<EnvironmentOutlined style={{ fontSize: '24px', color: '#fff' }} />}
                label="Lugar de nacimiento"
                value={origin.originAddressComplete || origin.birthCity}
              />
            </Col>
            <Col xs={24} sm={12}>
              <StudentInfoItem
                icon={<TranslationOutlined style={{ fontSize: '24px', color: '#fff' }} />}
                label="Idioma materno"
                value={origin.motherTongueName || origin.motherTongueId}
              />
            </Col>
            <Col xs={24} sm={12}>
              <StudentInfoItem
                icon={<TranslationOutlined style={{ fontSize: '24px', color: '#fff' }} />}
                label="Idioma secundario"
                value={origin.secondaryLanguageName || origin.secondaryLanguageId}
              />
            </Col>
          </Row>
          {index < origins.length - 1 && (
            <Divider style={{ margin: '24px 0' }} />
          )}
        </div>
      ))}
    </Card>
  );
};

export default OriginsSection;
