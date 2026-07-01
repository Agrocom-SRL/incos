import { Card, Flex, Typography, Avatar, Divider } from 'antd';
import { allSpacing, componentConfig, allColors, typography, shadows } from '@theme/tokens';
import { dashboardAvatarUrl } from '../../utils/dashboardAvatarUrl';

const { Title, Text } = Typography;

/**
 * Molécula: "Mis docentes" como lista legible (no solo avatares + contador).
 *
 * Cada fila muestra el avatar, el nombre del docente (orden institucional, ya
 * formateado en backend) y las materias que dicta (`description`). Pensada para
 * llenar la columna principal del inicio del estudiante. Solo presentación.
 */
const DashboardDocentesListCard = ({ docentes = [] }) => {
  const total = docentes.length;

  return (
    <Card
      style={{
        borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
        boxShadow: shadows.shadowElevation2,
        border: `1px solid ${allColors.colorBorder}`,
        backgroundColor: allColors.colorBgContainer,
        overflow: 'hidden',
      }}
      styles={{ body: { padding: 0 } }}
    >
      <Flex
        justify="space-between"
        align="center"
        gap={allSpacing.margin}
        style={{ padding: `${allSpacing.margin}px ${allSpacing.marginLG}px` }}
      >
        <Title
          level={4}
          style={{
            color: allColors.colorPrimary,
            fontSize: `${typography.fontSizeHeading4}px`,
            fontWeight: typography.fontWeightStrong,
            margin: 0,
          }}
        >
          Mis docentes
        </Title>
        {total > 0 ? (
          <Text type="secondary" style={{ fontSize: `${typography.fontSizeSM}px`, flexShrink: 0 }}>
            {total} {total === 1 ? 'docente' : 'docentes'}
          </Text>
        ) : null}
      </Flex>
      <Divider style={{ margin: 0 }} />

      {total === 0 ? (
        <Text
          type="secondary"
          style={{
            display: 'block',
            padding: `${allSpacing.marginLG}px`,
            fontSize: `${typography.fontSizeSM}px`,
          }}
        >
          Aún no tienes docentes asignados en tu inscripción vigente.
        </Text>
      ) : (
        <div className="estudiante-docentes-grid">
          {docentes.map((docente, index) => (
            <Flex
              key={docente.id ?? `docente-${index}`}
              align="center"
              gap={allSpacing.marginSM}
              style={{
                padding: `${allSpacing.marginSM}px ${allSpacing.marginLG}px`,
                borderBottom: `1px solid ${allColors.colorBorderSecondary}`,
              }}
            >
              <Avatar
                src={dashboardAvatarUrl(docente.avatarSeed)}
                size={38}
                style={{
                  flexShrink: 0,
                  backgroundColor: allColors.colorBgElevated,
                  border: `1px solid ${allColors.colorBorderSecondary}`,
                }}
              />
              <Flex vertical style={{ flex: 1, minWidth: 0 }}>
                <Text
                  strong
                  ellipsis={{ tooltip: docente.name }}
                  style={{
                    color: allColors.colorText,
                    fontSize: `${typography.fontSize}px`,
                    fontWeight: typography.fontWeightStrong,
                  }}
                >
                  {docente.name}
                </Text>
                <Text
                  type="secondary"
                  ellipsis={{ tooltip: docente.description }}
                  style={{ fontSize: `${typography.fontSizeSM}px` }}
                >
                  {docente.description ? docente.description : 'Sin materias registradas'}
                </Text>
              </Flex>
            </Flex>
          ))}
        </div>
      )}
    </Card>
  );
};

export default DashboardDocentesListCard;
