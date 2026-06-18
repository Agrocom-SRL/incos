/**
 * Átomo: etiqueta de estado de cobranza de un estudiante (planilla read-only).
 *
 * Mapea los 4 estados del backend a un TOKEN de estado de AntD (sin #hex):
 *   AL_DIA         → success (verde)   · "Al día"
 *   PROXIMA        → warning (ámbar)    · "Próxima"
 *   VENCIDA        → error   (rojo)     · "Vencida"
 *   SIN_COMPROMISO → default (neutral)  · "Sin compromiso"
 *
 * El indicador de color es un punto (token) + etiqueta, dentro de un `Tag`
 * con preset de estado de AntD (que ya deriva su color del theme). El tono del
 * punto se lee de `theme.useToken()` para garantizar coherencia light/dark.
 */

import { Flex, Tag, theme } from 'antd';
import { allSpacing } from '@theme/tokens';

/**
 * Configuración por estado: `color` = preset de Tag (estado AntD); `tokenKey` =
 * clave del token de color para el punto indicador; `label` = etiqueta visible.
 */
const ESTADO_CONFIG = {
  AL_DIA: { color: 'success', tokenKey: 'colorSuccess', label: 'Al día' },
  PROXIMA: { color: 'warning', tokenKey: 'colorWarning', label: 'Próxima' },
  VENCIDA: { color: 'error', tokenKey: 'colorError', label: 'Vencida' },
  SIN_COMPROMISO: { color: 'default', tokenKey: 'colorTextSecondary', label: 'Sin compromiso' },
};

/** Resuelve la config de un estado, cayendo a SIN_COMPROMISO si es desconocido. */
const getEstadoCobranzaConfig = (estado) =>
  ESTADO_CONFIG[estado] || ESTADO_CONFIG.SIN_COMPROMISO;

const EstadoCobranzaTag = ({ estado }) => {
  const { token } = theme.useToken();
  const config = getEstadoCobranzaConfig(estado);

  return (
    <Tag color={config.color} style={{ marginInlineEnd: 0 }}>
      <Flex align="center" gap={allSpacing.marginXS}>
        <span
          aria-hidden="true"
          style={{
            width: allSpacing.marginSM,
            height: allSpacing.marginSM,
            borderRadius: '50%',
            backgroundColor: token[config.tokenKey],
            display: 'inline-block',
            flex: 'none',
          }}
        />
        {config.label}
      </Flex>
    </Tag>
  );
};

export default EstadoCobranzaTag;
