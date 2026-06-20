/**
 * Organismo: DISTRIBUCIÓN POR TIPO DE BECA (donut).
 *
 * El repo NO tiene librería de gráficos (sin recharts / @ant-design/plots). Para
 * no añadir una dependencia, el donut se dibuja con SVG nativo (arcos por
 * `stroke-dasharray`), un segmento por tramo de beca. La paleta es CATEGÓRICA y
 * VÍVIDA por tramo (verde · dorado · púrpura · rojo) para que cada tipo de beca
 * resalte y se distinga; vive en `becasTramoColors` (fuente única, por tokens).
 *
 * Centro del donut = total con beca + % de cobertura global. Debajo, una leyenda
 * con un swatch por tramo, su conteo de beneficiados y su % del total con beca.
 *
 * Los tramos se derivan de `distribucion` (que el backend arma desde `porcentajes`),
 * NO se hardcodean. Espaciado/escala por tokens y por las clases del kit.
 */

import { Card, Empty, Typography, theme } from 'antd';
import { getTramoColor } from '@finanzas/reportes/config/becasTramoColors';

const { Text } = Typography;

const RADIO = 54;
const GROSOR = 18;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;

const formatPorcentaje = (value) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return safe.toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

const BecasDistribucion = ({ distribucion = [], totalConBeca = 0, porcentajeConBeca = 0 }) => {
  const { token } = theme.useToken();

  // Paleta categórica vívida por tramo (verde/dorado/púrpura/rojo), mapeada por
  // porcentaje desde la fuente única `becasTramoColors`.
  const colorTramo = (tramo, index) => getTramoColor(token, tramo?.porcentaje, index);

  const tramos = Array.isArray(distribucion) ? distribucion : [];
  const totalBeneficiados = tramos.reduce((acc, t) => acc + (Number(t?.beneficiados) || 0), 0);
  const hayDatos = totalBeneficiados > 0;

  // Construye los arcos del donut acumulando offsets proporcionales (sin
  // reasignar variables externas: el acumulado se lleva en el reduce).
  const { arcos } = tramos.reduce(
    (acc, tramo, index) => {
      const valor = Number(tramo?.beneficiados) || 0;
      const fraccion = totalBeneficiados > 0 ? valor / totalBeneficiados : 0;
      const longitud = fraccion * CIRCUNFERENCIA;
      acc.arcos.push({
        key: tramo.porcentaje ?? index,
        color: colorTramo(tramo, index),
        dashArray: `${longitud} ${CIRCUNFERENCIA - longitud}`,
        dashOffset: -acc.acumulado,
      });
      return { arcos: acc.arcos, acumulado: acc.acumulado + longitud };
    },
    { arcos: [], acumulado: 0 },
  );

  return (
    <Card variant="outlined" title="Distribución por tipo de beca">
      {hayDatos ? (
        <div className="becas-donut">
          <svg
            width="160"
            height="160"
            viewBox="0 0 140 140"
            role="img"
            aria-label="Distribución de becas por tipo"
          >
            <circle
              cx="70"
              cy="70"
              r={RADIO}
              fill="none"
              stroke={token.colorFillSecondary}
              strokeWidth={GROSOR}
            />
            {arcos.map((arco) => (
              <circle
                key={arco.key}
                cx="70"
                cy="70"
                r={RADIO}
                fill="none"
                stroke={arco.color}
                strokeWidth={GROSOR}
                strokeDasharray={arco.dashArray}
                strokeDashoffset={arco.dashOffset}
                transform="rotate(-90 70 70)"
              />
            ))}
            <text
              x="70"
              y="64"
              textAnchor="middle"
              fontSize="22"
              fontWeight="700"
              fill={token.colorText}
            >
              {totalConBeca || 0}
            </text>
            <text x="70" y="84" textAnchor="middle" fontSize="11" fill={token.colorTextSecondary}>
              {formatPorcentaje(porcentajeConBeca)}% con beca
            </text>
          </svg>

          <div className="becas-donut__leyenda">
            {tramos.map((tramo, index) => {
              const pct = Number(tramo.porcentajeDelTotalConBeca) || 0;
              return (
                <div key={tramo.porcentaje ?? index} className="becas-donut__item">
                  <span
                    className="becas-donut__swatch"
                    style={{ background: colorTramo(tramo, index) }}
                  />
                  <span className="becas-donut__item-label">
                    <Text>{tramo.etiqueta}</Text>
                  </span>
                  <span className="becas-donut__item-valor">
                    <Text type="secondary">
                      {tramo.beneficiados}{' '}
                      {tramo.beneficiados === 1 ? 'beneficiado' : 'beneficiados'} ·{' '}
                      {formatPorcentaje(pct)}%
                    </Text>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <Empty description="Sin becas otorgadas en la gestión" />
      )}
    </Card>
  );
};

export default BecasDistribucion;
