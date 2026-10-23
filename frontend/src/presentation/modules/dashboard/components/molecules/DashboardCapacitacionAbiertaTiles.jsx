import { Flex, Typography } from 'antd';
import { CalendarOutlined, ReadOutlined, RightOutlined } from '@ant-design/icons';
import { allSpacing, allColors, typography } from '@theme/tokens';

const { Text } = Typography;

/**
 * Molécula: cuadros de acceso directo a inscribir en los cursos de capacitación
 * DISPONIBLES, pensados para ir DENTRO del banner de bienvenida (`children`).
 *
 * Cada cuadro es un contenedor clickeable con un ícono de curso, solo el nombre y la fecha de
 * inicio, y la llamada «Inscribir». Sin cursos no dibuja nada. Solo presentación +
 * navegación: recibe los cursos ya mapeados y `onInscribir`; no llama hooks de fetch.
 */
const DashboardCapacitacionAbiertaTiles = ({ cursos = [], onInscribir }) => {
  if (cursos.length === 0) return null;

  return (
    <Flex gap={allSpacing.margin} wrap>
      {cursos.map((curso) => (
        <Flex
          key={curso.id}
          align="center"
          gap={allSpacing.margin}
          role="button"
          tabIndex={0}
          onClick={() => onInscribir?.(curso)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onInscribir?.(curso);
            }
          }}
          style={{
            flex: '1 1 280px',
            maxWidth: 420,
            minWidth: 0,
            padding: `${allSpacing.paddingSM}px ${allSpacing.padding}px`,
            border: `1px solid ${allColors.colorBorder}`,
            borderRadius: `${allSpacing.borderRadiusMD}px`,
            backgroundColor: allColors.colorBgContainer,
            cursor: 'pointer',
            transition: `border-color ${allSpacing.motionDurationMid} ${allSpacing.motionEaseOut}, background-color ${allSpacing.motionDurationMid} ${allSpacing.motionEaseOut}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = allColors.colorPrimary;
            e.currentTarget.style.backgroundColor = allColors.colorPrimaryBg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = allColors.colorBorder;
            e.currentTarget.style.backgroundColor = allColors.colorBgContainer;
          }}
        >
          <Flex
            align="center"
            justify="center"
            style={{
              width: allSpacing.controlHeightLG,
              height: allSpacing.controlHeightLG,
              borderRadius: `${allSpacing.borderRadiusMD}px`,
              backgroundColor: allColors.colorPrimaryBg,
              color: allColors.colorPrimary,
              fontSize: `${typography.fontSizeXL}px`,
              flexShrink: 0,
            }}
          >
            <ReadOutlined />
          </Flex>
          <Flex vertical style={{ flex: 1, minWidth: 0 }}>
            <Text strong ellipsis={{ tooltip: curso.titulo }}>
              {curso.titulo}
            </Text>
            {curso.fechaInicioLabel ? (
              <Text type="secondary">
                <CalendarOutlined /> Inicia {curso.fechaInicioLabel}
              </Text>
            ) : null}
          </Flex>
          <Flex align="center" gap={allSpacing.marginXS} style={{ color: allColors.colorPrimary }}>
            <Text
              style={{
                color: allColors.colorPrimary,
                fontSize: `${typography.fontSizeSM}px`,
                fontWeight: typography.fontWeightStrong,
              }}
            >
              Inscribir
            </Text>
            <RightOutlined style={{ fontSize: `${typography.fontSizeXS}px` }} />
          </Flex>
        </Flex>
      ))}
    </Flex>
  );
};

export default DashboardCapacitacionAbiertaTiles;
