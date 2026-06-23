/**
 * Organismo: SALDO PENDIENTE POR CARRERA (barras horizontales).
 *
 * El repo NO tiene librería de gráficos (sin recharts / @ant-design/plots). Como
 * el donut de becas (`BecasDistribucion`), el gráfico se dibuja con divs nativos:
 * una barra horizontal por carrera, cuyo ancho es proporcional al monto pendiente
 * sobre el máximo de la serie. Cada fila muestra etiqueta (carrera) + valor en Bs
 * + % del total pendiente.
 *
 * La paleta es CATEGÓRICA y se deriva SIEMPRE de los tokens del theme (sin #hex),
 * una entrada por carrera. La transición de ancho de la barra es CSS puro
 * (gemela de `becas-catalogo__bar-fill`), gateada por `prefers-reduced-motion`
 * en el kit. Recibe `carreras` y `totalPendiente` ya mapeados; no hace fetch.
 */

import { Card, Empty, Typography, theme } from 'antd';
import { formatBs } from '@finanzas/reportes/config/cuentasPorCobrarColumns';

const { Text } = Typography;

const formatPorcentaje = (value) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return safe.toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

/** Paleta categórica por carrera, derivada de tokens del theme (nunca #hex). */
const buildCarreraScale = (token) => [
  token.colorPrimary,
  token.colorWarning,
  token.colorInfo,
  token.colorSuccess,
  token.colorError,
  token.colorAccent,
];

const CuentasPorCobrarPendientePorCarrera = ({ carreras = [], totalPendiente = 0 }) => {
  const { token } = theme.useToken();
  const scale = buildCarreraScale(token);

  // Solo carreras con saldo pendiente > 0, ordenadas de mayor a menor (la barra
  // más larga primero comunica de un vistazo la carrera con más cobranza).
  const filas = (Array.isArray(carreras) ? carreras : [])
    .map((carrera, index) => ({
      key: String(carrera.carreraId ?? carrera.carreraNombre ?? index),
      nombre: carrera.carreraNombre ?? 'Sin nombre',
      monto: Number(carrera.totalPendiente) || 0,
      color: scale[index % scale.length],
    }))
    .filter((fila) => fila.monto > 0)
    .sort((a, b) => b.monto - a.monto);

  const maxMonto = filas.reduce((acc, fila) => Math.max(acc, fila.monto), 0);
  const totalSerie = Number(totalPendiente) || filas.reduce((acc, fila) => acc + fila.monto, 0);
  const hayDatos = filas.length > 0 && maxMonto > 0;

  return (
    <Card variant="outlined" title="Saldo pendiente por carrera">
      {hayDatos ? (
        <div className="cobranza-pendiente">
          {filas.map((fila) => {
            const ancho = maxMonto > 0 ? Math.max((fila.monto / maxMonto) * 100, 2) : 0;
            const pct = totalSerie > 0 ? (fila.monto / totalSerie) * 100 : 0;
            return (
              <div key={fila.key} className="cobranza-pendiente__fila">
                <div className="cobranza-pendiente__cab">
                  <span className="cobranza-pendiente__nombre">
                    <span
                      className="cobranza-pendiente__swatch"
                      style={{ background: fila.color }}
                    />
                    <Text>{fila.nombre}</Text>
                  </span>
                  <span className="cobranza-pendiente__valor">
                    <Text strong>{formatBs(fila.monto)} Bs</Text>
                    <Text type="secondary"> · {formatPorcentaje(pct)}%</Text>
                  </span>
                </div>
                <div className="cobranza-pendiente__track">
                  <span
                    className="cobranza-pendiente__bar"
                    style={{ width: `${ancho}%`, background: fila.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Empty description="Sin saldos pendientes por cobrar en la gestión" />
      )}
    </Card>
  );
};

export default CuentasPorCobrarPendientePorCarrera;
