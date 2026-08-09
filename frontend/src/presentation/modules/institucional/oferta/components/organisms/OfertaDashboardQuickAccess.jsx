import { ArrowRightOutlined, BookOutlined } from '@ant-design/icons';
import { Card, Flex, Typography } from 'antd';
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
  planesPendientesCount = 0,
  onHabilitarTodosPlanes,
  onHabilitarPlanesVigentes,
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
        // Una carrera puede sumar planes activos (históricos con estudiantes en
        // curso) luego de habilitar el vigente: este botón habilita cualquier
        // pendiente y de una vez lleva a "Planes vigentes" (sin acción aparte).
        <Flex align="center" gap="small" wrap>
          <ActionButton
            permiso="institucional.oferta.gestion-plan"
            accion="CREAR"
            variant="primary"
            className="oferta-dashboard-cta-btn"
            icon={<BookOutlined />}
            disabled={!gestionVigente}
            loading={habilitandoPlanes}
            onClick={onHabilitarPlanesVigentes}
          >
            Habilitar planes vigentes
          </ActionButton>
          {planesPendientesCount > 0 ? (
            <Text type="secondary">
              Todavía {planesPendientesCount === 1 ? 'tiene 1 plan' : `tiene ${planesPendientesCount} planes`} por
              habilitar.
            </Text>
          ) : null}
        </Flex>
      )}

      {planesHabilitados.length > 0 ? (
        <>
          <Text type="secondary" className="oferta-dashboard-planes-hint">
            Paralelos por plan habilitado
          </Text>
          <Flex vertical gap={4} className="oferta-dashboard-planes-list">
            {planesHabilitados.map((plan) => {
              const label = plan.carreraNombre
                ? `${plan.carreraNombre} · ${plan.nombre ?? plan.planEstudioId}`
                : plan.nombre ?? `Plan #${plan.planEstudioId}`;
              return (
                <div key={plan.id} className="oferta-dashboard-planes-list__item">
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
                </div>
              );
            })}
          </Flex>
        </>
      ) : sinPlanesHabilitados ? (
        <Text type="secondary">
          Vincule todos los planes activos del catálogo académico a la gestión antes de generar
          paralelos.
        </Text>
      ) : null}
    </Flex>
  </Card>
);

export default OfertaDashboardQuickAccess;
