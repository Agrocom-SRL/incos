import { Typography } from 'antd';
import { CalendarOutlined, ReadOutlined, RightOutlined } from '@ant-design/icons';
import { allSpacing, allColors, componentConfig, typography, shadows } from '@theme/tokens';

const { Text } = Typography;

const pad2 = (n) => String(n).padStart(2, '0');

/**
 * Molécula: lista numerada de accesos directos a inscribir en los cursos de capacitación
 * DISPONIBLES (dashboard), bajo el banner de bienvenida.
 *
 * Diseño «ordered list cards»: cada curso es una tarjeta clickeable con un bloque verde a la
 * izquierda (número 01, 02… y ícono de curso), el nombre y la fecha de inicio al centro y la
 * llamada «Inscribir» a la derecha; elevación suave que sube al pasar el mouse. Las tarjetas ocupan media
 * columna (2 por fila, como un col-6) dentro del contenido principal; la fecha va en la fuente de
 * código del tema (`fontFamilyCode`) para distinguirla del nombre. Sin cursos no dibuja nada.
 * Solo presentación + navegación: recibe los cursos ya mapeados y `onInscribir`; no llama hooks
 * de fetch.
 */
const DashboardCapacitacionAbiertaTiles = ({ cursos = [], onInscribir }) => {
  if (cursos.length === 0) return null;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: allSpacing.margin,
      }}
    >
      {cursos.map((curso, index) => (
        <div
          key={curso.id}
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
            display: 'flex',
            alignItems: 'stretch',
            minWidth: 0,
            minHeight: 120,
            overflow: 'hidden',
            cursor: 'pointer',
            backgroundColor: allColors.colorBgContainer,
            border: `1px solid ${allColors.colorBorder}`,
            borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
            boxShadow: shadows.shadowElevation2,
            transition: `transform ${allSpacing.motionDurationMid} ${allSpacing.motionEaseOut}, box-shadow ${allSpacing.motionDurationMid} ${allSpacing.motionEaseOut}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = shadows.shadowElevation3;
            e.currentTarget.style.transform = 'translateY(-3px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = shadows.shadowElevation2;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: allSpacing.marginXS,
              flexShrink: 0,
              width: 84,
              backgroundColor: allColors.colorPrimary,
              color: allColors.colorTextOnDark,
              borderRadius: `0 ${allSpacing.borderRadiusLG * 3}px ${allSpacing.borderRadiusLG * 3}px 0`,
            }}
          >
            <span
              style={{
                fontSize: `${typography.fontSizeHeading4}px`,
                fontWeight: typography.fontWeightStrong,
                lineHeight: 1,
              }}
            >
              {pad2(index + 1)}
            </span>
            <ReadOutlined style={{ fontSize: `${typography.fontSizeXL}px` }} />
          </div>

          <div
            style={{
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
              minWidth: 0,
              padding: `${allSpacing.paddingLG}px`,
            }}
          >
            <Text
              strong
              ellipsis={{ tooltip: curso.tituloCompleto }}
              style={{ color: allColors.colorPrimary, fontSize: `${typography.fontSizeLG}px` }}
            >
              {curso.tituloCompleto}
            </Text>
            {curso.fechaInicioLabel ? (
              <Text
                type="secondary"
                style={{ fontFamily: typography.fontFamilyCode, fontSize: `${typography.fontSizeSM}px` }}
              >
                <CalendarOutlined /> Inicia {curso.fechaInicioLabel}
              </Text>
            ) : null}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: allSpacing.marginXS,
              paddingRight: allSpacing.paddingLG,
              color: allColors.colorPrimary,
            }}
          >
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
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCapacitacionAbiertaTiles;
