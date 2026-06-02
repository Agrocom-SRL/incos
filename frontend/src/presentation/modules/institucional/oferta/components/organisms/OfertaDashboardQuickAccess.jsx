import { ArrowRightOutlined, BookOutlined } from '@ant-design/icons';
import { Card, Flex, List, Typography } from 'antd';
import { ActionButton } from '@atoms';
import { componentConfig, shadows, allColors } from '@theme/tokens';

const { Text } = Typography;

const cardProps = {
  className: 'oferta-dashboard-actions-card',
  style: {
    borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
    boxShadow: shadows.shadowElevation2,
    border: `1px solid ${allColors.colorBorder}`,
  },
};

const OfertaDashboardQuickAccess = ({
  gestionVigente,
  planesHabilitados,
  onPlanesVigente,
  onParalelosPlan,
}) => (
  <Card title="Acciones" {...cardProps}>
    <Flex vertical gap="middle">
      <ActionButton
        permiso="institucional.oferta.gestion-plan"
        accion="LISTAR"
        variant="primary"
        className="oferta-dashboard-cta-btn"
        icon={<BookOutlined />}
        disabled={!gestionVigente}
        onClick={onPlanesVigente}
      >
        Planes vigentes
      </ActionButton>

      {planesHabilitados.length > 0 ? (
        <>
          <Text type="secondary" className="oferta-dashboard-planes-hint">
            Paralelos por plan habilitado
          </Text>
          <List
            size="small"
            className="oferta-dashboard-planes-list"
            dataSource={planesHabilitados}
            renderItem={(plan) => {
              const label = plan.carreraNombre
                ? `${plan.carreraNombre} · ${plan.nombre ?? plan.planEstudioId}`
                : plan.nombre ?? `Plan #${plan.planEstudioId}`;
              return (
                <List.Item className="oferta-dashboard-planes-list__item">
                  <ActionButton
                    permiso="institucional.oferta.gestion-plan"
                    accion="LISTAR"
                    type="link"
                    className="oferta-dashboard-plan-link"
                    icon={<ArrowRightOutlined />}
                    onClick={() => onParalelosPlan(plan.id)}
                  >
                    {label}
                  </ActionButton>
                </List.Item>
              );
            }}
          />
        </>
      ) : (
        <Text type="secondary">Habilite al menos un plan en la gestión vigente.</Text>
      )}
    </Flex>
  </Card>
);

export default OfertaDashboardQuickAccess;
