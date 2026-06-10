import { Card, Descriptions, Flex, Tag, Typography } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { ActionButton } from '@atoms';

const { Title } = Typography;

/**
 * Tarjeta resumen de la gestión vigente (solo lectura) + acceso a la página de
 * Control de bimestres. Las acciones (iniciar/cerrar) viven en esa página.
 * El acceso se guarda con `institucional.gestion.actual` + EDITAR (mismo permiso
 * que protege las acciones).
 */
const GestionActualCard = ({ gestionVigente, estadoLabel, estadoColor, onIrAControl }) => (
  <Card>
    <Flex vertical gap="middle">
      <Flex align="center" justify="space-between" wrap gap="middle">
        <Title level={4} style={{ margin: 0 }}>
          {gestionVigente?.nombre || 'Gestión vigente'}
          {gestionVigente?.anio ? ` (${gestionVigente.anio})` : ''}
        </Title>
        <Tag color={estadoColor}>{estadoLabel}</Tag>
      </Flex>

      <Descriptions column={1} size="small">
        <Descriptions.Item label="Código">{gestionVigente?.codigo || '—'}</Descriptions.Item>
      </Descriptions>

      <Flex>
        <ActionButton
          permiso="institucional.gestion.actual"
          accion="EDITAR"
          variant="primary"
          icon={<SettingOutlined />}
          onClick={onIrAControl}
        >
          Control de bimestres
        </ActionButton>
      </Flex>
    </Flex>
  </Card>
);

export default GestionActualCard;
