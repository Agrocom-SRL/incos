import { Card, Empty, Flex, Typography, Divider } from 'antd';
import { allSpacing, componentConfig, allColors, typography, shadows } from '@theme/tokens';
import DocenteColorBar from '@docentes/components/atoms/DocenteColorBar';

const { Title, Text } = Typography;

/**
 * Molécula: "Mis cursos" del docente como lista legible (gemela de
 * `DashboardDocentesListCard`). Cada fila muestra la barra de color de la
 * carrera (color de negocio sanitizado por `DocenteColorBar`), la materia y su
 * contexto (carrera · año · paralelo · turno) y el número de estudiantes.
 * Solo presentación: recibe los cursos ya mapeados por `useDocenteHome`.
 */
const DashboardCursosDocenteCard = ({ cursos = [] }) => {
  const total = cursos.length;

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
          Mis cursos
        </Title>
        {total > 0 ? (
          <Text type="secondary" style={{ fontSize: `${typography.fontSizeSM}px`, flexShrink: 0 }}>
            {total} {total === 1 ? 'curso' : 'cursos'}
          </Text>
        ) : null}
      </Flex>
      <Divider style={{ margin: 0 }} />

      {total === 0 ? (
        <div style={{ padding: `${allSpacing.marginLG}px` }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Aún no tienes cursos asignados en la gestión vigente."
          />
        </div>
      ) : (
        <div className="estudiante-docentes-grid">
          {cursos.map((curso, index) => (
            <Flex
              key={curso.id ?? `curso-${index}`}
              align="center"
              gap={allSpacing.marginSM}
              style={{
                padding: `${allSpacing.marginSM}px ${allSpacing.marginLG}px`,
                borderBottom: `1px solid ${allColors.colorBorderSecondary}`,
              }}
            >
              <DocenteColorBar hex={curso.carreraColor} title={curso.carrera || undefined} />
              <Flex vertical style={{ flex: 1, minWidth: 0 }}>
                <Text
                  strong
                  ellipsis={{ tooltip: curso.materia }}
                  style={{
                    color: allColors.colorText,
                    fontSize: `${typography.fontSize}px`,
                    fontWeight: typography.fontWeightStrong,
                  }}
                >
                  {[curso.materiaSigla, curso.materia].filter(Boolean).join(' · ') || curso.materia}
                </Text>
                <Text
                  type="secondary"
                  ellipsis={{
                    tooltip: [curso.carrera, curso.periodo, curso.paralelo, curso.turno]
                      .filter(Boolean)
                      .join(' · '),
                  }}
                  style={{ fontSize: `${typography.fontSizeSM}px` }}
                >
                  {[curso.carrera, curso.periodo, curso.paralelo, curso.turno]
                    .filter(Boolean)
                    .join(' · ') || 'Sin contexto académico'}
                </Text>
              </Flex>
              <Text
                type="secondary"
                style={{ fontSize: `${typography.fontSizeSM}px`, flexShrink: 0 }}
              >
                {curso.estudiantes} {curso.estudiantes === 1 ? 'estudiante' : 'estudiantes'}
              </Text>
            </Flex>
          ))}
        </div>
      )}
    </Card>
  );
};

export default DashboardCursosDocenteCard;
