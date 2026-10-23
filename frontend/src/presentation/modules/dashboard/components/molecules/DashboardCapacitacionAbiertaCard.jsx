import { Button, Card, Flex, Typography } from 'antd';
import { ReadOutlined, TeamOutlined, CalendarOutlined } from '@ant-design/icons';
import { StatusPill } from '@atoms';
import { allSpacing, allColors, componentConfig, typography, shadows } from '@theme/tokens';
import {
  formatEstadoCurso,
  getEstadoCursoPillClass,
} from '@application-capacitacion/utils/capacitacionPills';

const { Text } = Typography;

const MAX_CURSOS = 4;

/**
 * Molécula: acceso directo a inscribir en los cursos de capacitación DISPONIBLES
 * (dashboard administrativo).
 *
 * Lista los cursos que hoy aceptan inscripciones (estado efectivo ABIERTO o EN_CURSO) con
 * un botón «Inscribir» que abre el wizard con el curso ya elegido. Sin cursos
 * disponibles no se dibuja nada. Solo presentación + navegación: recibe los cursos ya
 * mapeados y los handlers; no llama hooks de fetch.
 */
const DashboardCapacitacionAbiertaCard = ({ cursos = [], onInscribir, onVerCursos }) => {
  if (cursos.length === 0) return null;

  const visibles = cursos.slice(0, MAX_CURSOS);
  const restantes = cursos.length - visibles.length;

  return (
    <Card
      style={{
        borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
        boxShadow: shadows.shadowElevation2,
        border: `1px solid ${allColors.colorBorder}`,
        backgroundColor: allColors.colorBgContainer,
      }}
      styles={{ body: { padding: `${componentConfig.Card.paddingLG}px` } }}
    >
      <Flex vertical gap={allSpacing.margin}>
        <Flex align="center" justify="space-between" gap={allSpacing.margin} wrap>
          <Flex align="center" gap={allSpacing.marginSM}>
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
              }}
            >
              <ReadOutlined />
            </Flex>
            <Text strong style={{ fontSize: `${typography.fontSizeLG}px` }}>
              Inscripciones de capacitación abiertas
            </Text>
          </Flex>
          {onVerCursos ? (
            <Button type="link" onClick={onVerCursos}>
              {restantes > 0 ? `Ver todos (+${restantes})` : 'Ver cursos'}
            </Button>
          ) : null}
        </Flex>

        <Flex vertical gap={allSpacing.marginSM}>
          {visibles.map((curso) => (
            <Flex
              key={curso.id}
              align="center"
              justify="space-between"
              gap={allSpacing.margin}
              wrap
              style={{
                padding: `${allSpacing.paddingSM}px ${allSpacing.padding}px`,
                border: `1px solid ${allColors.colorBorderSecondary}`,
                borderRadius: `${allSpacing.borderRadiusMD}px`,
              }}
            >
              <Flex vertical gap={allSpacing.marginXXS} style={{ minWidth: 0 }}>
                <Flex align="center" gap={allSpacing.marginXS} wrap>
                  <Text strong>{curso.titulo}</Text>
                  <StatusPill
                    label={formatEstadoCurso(curso.estado)}
                    className={getEstadoCursoPillClass(curso.estado)}
                  />
                </Flex>
                <Flex gap={allSpacing.margin} wrap>
                  {curso.fechasLabel ? (
                    <Text type="secondary">
                      <CalendarOutlined /> {curso.fechasLabel}
                    </Text>
                  ) : null}
                  <Text type="secondary">
                    <TeamOutlined />{' '}
                    {curso.cupoMaximo != null
                      ? `${curso.inscritosCount} / ${curso.cupoMaximo} inscritos`
                      : `${curso.inscritosCount} inscritos`}
                  </Text>
                </Flex>
              </Flex>
              <Button type="primary" onClick={() => onInscribir?.(curso)}>
                Inscribir
              </Button>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Card>
  );
};

export default DashboardCapacitacionAbiertaCard;
