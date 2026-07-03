import { Card, Empty, Flex, Typography, Divider } from 'antd';
import { allSpacing, componentConfig, allColors, typography, shadows } from '@theme/tokens';
import DocenteColorBar from '@docentes/components/atoms/DocenteColorBar';
import { groupCursosDocentePorCarrera } from '../../utils/groupCursosDocentePorCarrera';

const { Title, Text } = Typography;

/**
 * Molécula: "Mis cursos" del docente agrupados por CARRERA → PERIODO.
 *
 * Cabecera de grupo con dot del color de carrera (color de negocio sanitizado
 * por `groupCursosDocentePorCarrera`) + nombre; subgrupos por periodo
 * ("Primer Año"…); dentro, las filas de curso existentes (barra de color,
 * materia, paralelo · turno · horas/bloques si llegan, y nº de estudiantes).
 * Solo presentación: recibe los cursos ya mapeados por `useDocenteHome` y un
 * `headerAction` opcional (p. ej. link a "Mis asignaciones").
 */

/** Fila de curso (misma densidad visual que la lista plana anterior). */
const CursoRow = ({ curso }) => {
  const cargaLabel = [
    curso.horasSemana ? `${curso.horasSemana} h/sem` : null,
    curso.bloques ? `${curso.bloques} ${curso.bloques === 1 ? 'bloque' : 'bloques'}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const contexto = [curso.paralelo, curso.turno, cargaLabel || null].filter(Boolean).join(' · ');

  return (
    <Flex
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
          ellipsis={{ tooltip: contexto }}
          style={{ fontSize: `${typography.fontSizeSM}px` }}
        >
          {contexto || 'Sin contexto académico'}
        </Text>
      </Flex>
      <Text type="secondary" style={{ fontSize: `${typography.fontSizeSM}px`, flexShrink: 0 }}>
        {curso.estudiantes} {curso.estudiantes === 1 ? 'estudiante' : 'estudiantes'}
      </Text>
    </Flex>
  );
};

const DashboardCursosDocenteCard = ({ cursos = [], headerAction = null }) => {
  const total = cursos.length;
  const grupos = groupCursosDocentePorCarrera(cursos);

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
        wrap="wrap"
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
        <Flex align="center" gap={allSpacing.margin} style={{ flexShrink: 0 }}>
          {total > 0 ? (
            <Text type="secondary" style={{ fontSize: `${typography.fontSizeSM}px` }}>
              {total} {total === 1 ? 'curso' : 'cursos'}
            </Text>
          ) : null}
          {headerAction}
        </Flex>
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
        grupos.map((grupo) => (
          <div key={grupo.carrera}>
            {/* Cabecera de carrera: dot con el color de negocio sanitizado. */}
            <Flex
              align="center"
              gap={allSpacing.marginSM}
              style={{
                padding: `${allSpacing.marginSM}px ${allSpacing.marginLG}px`,
                backgroundColor: allColors.colorBgLayout,
                borderBottom: `1px solid ${allColors.colorBorderSecondary}`,
              }}
            >
              <span
                aria-hidden
                style={{
                  width: allSpacing.marginXS + 2,
                  height: allSpacing.marginXS + 2,
                  borderRadius: '50%',
                  flexShrink: 0,
                  backgroundColor: grupo.carreraColorHex || allColors.colorTextQuaternary,
                }}
              />
              <Text
                strong
                style={{
                  color: allColors.colorText,
                  fontSize: `${typography.fontSize}px`,
                  fontWeight: typography.fontWeightStrong,
                }}
              >
                {grupo.carrera}
              </Text>
            </Flex>

            {grupo.periodos.map((sub) => (
              <div key={`${grupo.carrera}-${sub.periodo}`}>
                <Text
                  type="secondary"
                  style={{
                    display: 'block',
                    padding: `${allSpacing.marginXS}px ${allSpacing.marginLG}px`,
                    fontSize: `${typography.fontSizeSM}px`,
                    fontWeight: typography.fontWeightStrong,
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                  }}
                >
                  {sub.periodo}
                </Text>
                <div className="estudiante-docentes-grid">
                  {sub.cursos.map((curso, index) => (
                    <CursoRow key={curso.id ?? `curso-${index}`} curso={curso} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </Card>
  );
};

export default DashboardCursosDocenteCard;
