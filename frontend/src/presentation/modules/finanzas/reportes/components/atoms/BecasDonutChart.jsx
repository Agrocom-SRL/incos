/**
 * Átomo: DONUT de distribución de becas por tramo (SVG nativo).
 *
 * El repo NO tiene librería de gráficos: el donut se dibuja con arcos por
 * `stroke-dasharray`, un segmento por tramo. La paleta es CATEGÓRICA por tramo
 * (fuente única `becasTramoColors`, derivada de tokens del theme, sin #hex).
 *
 * Reutilizable en dos tamaños: `lg` (donut grande de la gestión, con leyenda
 * aparte) y `sm` (mini-donut de la grilla por carrera / periodo). El centro
 * muestra un valor (total con beca) y, opcionalmente, una leyenda corta. Todas
 * las medidas tipográficas del SVG salen de tokens (`theme.useToken`).
 */

import { theme } from 'antd';
import { getTramoColor } from '@finanzas/reportes/config/becasTramoColors';

const RADIO = 54;
const GROSOR = 18;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;

/** Lado renderizado del SVG por tamaño (la geometría interna es la misma). */
const LADO_PX = { lg: 160, sm: 104 };

const BecasDonutChart = ({
  tramos = [],
  size = 'lg',
  centerValue = 0,
  ariaLabel = 'Distribución de becas por tipo',
}) => {
  const { token } = theme.useToken();
  const lado = LADO_PX[size] || LADO_PX.lg;

  const total = tramos.reduce((acc, t) => acc + (Number(t?.beneficiados) || 0), 0);

  // Arcos acumulando offsets proporcionales (acumulado dentro del reduce).
  const { arcos } = tramos.reduce(
    (acc, tramo, index) => {
      const valor = Number(tramo?.beneficiados) || 0;
      const fraccion = total > 0 ? valor / total : 0;
      const longitud = fraccion * CIRCUNFERENCIA;
      acc.arcos.push({
        key: tramo?.porcentaje ?? index,
        color: getTramoColor(token, tramo?.porcentaje, index),
        dashArray: `${longitud} ${CIRCUNFERENCIA - longitud}`,
        dashOffset: -acc.acumulado,
      });
      return { arcos: acc.arcos, acumulado: acc.acumulado + longitud };
    },
    { arcos: [], acumulado: 0 },
  );

  const valueFont = size === 'lg' ? token.fontSizeHeading3 : token.fontSizeLG;

  return (
    <svg
      width={lado}
      height={lado}
      viewBox="0 0 140 140"
      role="img"
      aria-label={ariaLabel}
      className={`becas-donut__svg becas-donut__svg--${size}`}
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
        y="76"
        textAnchor="middle"
        fontSize={valueFont}
        fontWeight="700"
        fill={token.colorText}
      >
        {centerValue}
      </text>
    </svg>
  );
};

export default BecasDonutChart;
