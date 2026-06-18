/**
 * Organismo: distribución de becas por tramo (sustituto del donut).
 *
 * El repo NO tiene librería de gráficos instalada (sin recharts / @ant-design/plots).
 * Para no añadir una dependencia nueva, la distribución se representa de forma
 * pragmática y consistente con el sistema:
 *   - Un `Progress` CIRCULAR central = % de matriculados con beca (cobertura global).
 *   - Una lista de `Progress` lineales, uno por tramo de beca, mostrando
 *     beneficiados y su % del total con beca.
 *
 * Los tramos se derivan de `distribucion` (que el backend arma desde `porcentajes`),
 * NO se hardcodean. Colores por token de marca (sin #hex). Espaciado por `allSpacing`.
 */

import { Card, Empty, Flex, Progress, Statistic, Typography, theme } from 'antd';
import { allSpacing } from '@theme/tokens';

const { Text } = Typography;

const formatPorcentaje = (value) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return safe.toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

const BecasDistribucion = ({ distribucion = [], totalConBeca = 0, porcentajeConBeca = 0 }) => {
  const { token } = theme.useToken();

  // Paleta de acento derivada del theme (sin literales): un tono por tramo.
  const tonos = [
    token.colorPrimary,
    token.colorSuccess,
    token.colorWarning,
    token.colorInfo,
    token.colorError,
  ];

  const tramos = Array.isArray(distribucion) ? distribucion : [];
  const hayDatos = tramos.some((t) => (t?.beneficiados || 0) > 0);

  return (
    <Card variant="outlined" title="Distribución por tipo de beca">
      {hayDatos ? (
        <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%' }}>
          <Flex align="center" justify="center" gap={allSpacing.marginLG} wrap="wrap">
            <Progress
              type="circle"
              percent={Math.round(Number(porcentajeConBeca) || 0)}
              strokeColor={token.colorPrimary}
              format={(percent) => (
                <Flex vertical align="center" gap={allSpacing.marginXS}>
                  <Statistic value={totalConBeca || 0} valueStyle={{ color: token.colorPrimary }} />
                  <Text type="secondary">{percent}% con beca</Text>
                </Flex>
              )}
            />
          </Flex>

          <Flex vertical gap={allSpacing.margin} style={{ width: '100%' }}>
            {tramos.map((tramo, index) => {
              const color = tonos[index % tonos.length];
              const pct = Number(tramo.porcentajeDelTotalConBeca) || 0;
              return (
                <Flex key={tramo.porcentaje} vertical gap={allSpacing.marginXS}>
                  <Flex align="center" justify="space-between" gap={allSpacing.marginSM}>
                    <Text strong>{tramo.etiqueta}</Text>
                    <Text type="secondary">
                      {tramo.beneficiados} {tramo.beneficiados === 1 ? 'beneficiado' : 'beneficiados'}{' '}
                      · {formatPorcentaje(pct)}%
                    </Text>
                  </Flex>
                  <Progress
                    percent={Math.round(pct)}
                    strokeColor={color}
                    showInfo={false}
                    aria-label={`${tramo.etiqueta}: ${tramo.beneficiados} beneficiados`}
                  />
                </Flex>
              );
            })}
          </Flex>
        </Flex>
      ) : (
        <Empty description="Sin becas otorgadas en la gestión" />
      )}
    </Card>
  );
};

export default BecasDistribucion;
