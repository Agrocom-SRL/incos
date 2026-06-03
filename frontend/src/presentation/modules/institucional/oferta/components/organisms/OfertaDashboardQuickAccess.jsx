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
  sinPlanesHabilitados,
  habilitandoPlanes,
  onPlanesVigente,
  onHabilitarTodosPlanes,
  onParalelosPlan,
}) => (
  <Card title="Acciones" {...cardProps}>
    <Flex vertical gap="middle">
      {sinPlanesHabilitados ? (
        <ActionButton
          permiso="institucional.oferta.gestion-plan"
          accion="CREAR"
          variant="error"
          className="oferta-dashboard-cta-btn"
          icon={<BookOutlined />}
          disabled={!gestionVigente}
          loading={habilitandoPlanes}
          onClick={onHabilitarTodosPlanes}
        >
          Habilitar planes
        </ActionButton>
      ) : (
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
      )}

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
      ) : sinPlanesHabilitados ? (
        <Text type="secondary">
          Vincule todos los planes vigentes del catálogo académico a la gestión antes de generar
          paralelos.
        </Text>
      ) : null}
    </Flex>
  </Card>
);

export default OfertaDashboardQuickAccess;
