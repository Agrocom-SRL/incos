/**
 * Organismo: DISTRIBUCIÓN POR TIPO DE BECA (donut) con selector de SCOPE.
 *
 * Un `Segmented` [Gestión · Carrera · Periodo] cambia el grano del gráfico:
 *   - Gestión: un donut GRANDE global (tramos de toda la gestión) + leyenda.
 *   - Carrera: GRILLA de mini-donuts, uno por carrera; el título de cada uno
 *     lleva el color institucional de la carrera como acento (superficie teñida).
 *   - Periodo: GRILLA de mini-donuts, uno por periodo AGRUPANDO las carreras
 *     (cross-carrera por número de periodo).
 *
 * Los datos de cada scope llegan ya derivados desde el hook de estado
 * (`distribucionTramosPorScope`); aquí solo se eligen y se pintan. Los colores de
 * tramo salen de la paleta categórica del theme (`becasTramoColors`, sin #hex);
 * el color de carrera sí es de negocio (viene de datos) y se aplica como acento
 * vía la utilidad sanitizada `buildCarreraHeadingSurfaceStyle`.
 */

import { useState } from 'react';
import { Card, Empty, Typography, theme } from 'antd';
import { BankOutlined, ReadOutlined, CalendarOutlined } from '@ant-design/icons';
import BecasDonutChart from '@finanzas/reportes/components/atoms/BecasDonutChart';
import BecasScopeSegmented from '@finanzas/reportes/components/molecules/BecasScopeSegmented';
import { getTramoColor } from '@finanzas/reportes/config/becasTramoColors';
import { buildCarreraHeadingSurfaceStyle } from '@application-institucional/horarios/utils/carreraDashboardColor';

const { Text } = Typography;

const SCOPE_OPCIONES = [
  { label: 'Gestión', value: 'gestion', icon: <BankOutlined /> },
  { label: 'Carrera', value: 'carrera', icon: <ReadOutlined /> },
  { label: 'Periodo', value: 'periodo', icon: <CalendarOutlined /> },
];

const formatPorcentaje = (value) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return Math.round(safe).toLocaleString('es-BO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/** Leyenda compacta de tramos con beneficiados (omite los tramos en 0). */
const MiniLeyenda = ({ tramos, token }) => {
  const visibles = tramos.filter((t) => (Number(t?.beneficiados) || 0) > 0);
  if (visibles.length === 0) return null;
  return (
    <ul className="becas-mini-donut__legend" aria-hidden="true">
      {visibles.map((tramo, index) => (
        <li key={tramo.porcentaje ?? index} className="becas-mini-donut__legend-item">
          <span
            className="becas-mini-donut__legend-swatch"
            style={{ background: getTramoColor(token, tramo.porcentaje, index) }}
          />
          <Text type="secondary" className="becas-mini-donut__legend-text">
            {tramo.porcentaje}% · {tramo.beneficiados}
          </Text>
        </li>
      ))}
    </ul>
  );
};

const BecasDistribucionTipo = ({
  distribucionTramosPorScope = { gestion: [], carrera: [], periodo: [] },
  totalConBeca = 0,
  porcentajeConBeca = 0,
}) => {
  const { token } = theme.useToken();
  const [scope, setScope] = useState('gestion');

  const tramosGestion = Array.isArray(distribucionTramosPorScope?.gestion)
    ? distribucionTramosPorScope.gestion
    : [];
  const grupos = Array.isArray(distribucionTramosPorScope?.[scope])
    ? distribucionTramosPorScope[scope]
    : [];

  const hayGestion =
    tramosGestion.reduce((acc, t) => acc + (Number(t?.beneficiados) || 0), 0) > 0;

  return (
    <Card variant="outlined" title="Distribución por tipo de beca">
      <BecasScopeSegmented
        options={SCOPE_OPCIONES}
        value={scope}
        onChange={setScope}
        ariaLabel="Scope de la distribución por tipo de beca"
      />
      {scope === 'gestion' ? (
        hayGestion ? (
          <div className="becas-donut becas-distribucion__donut">
            <BecasDonutChart
              tramos={tramosGestion}
              size="xl"
              centerValue={`${formatPorcentaje(porcentajeConBeca)}%`}
            />
            <Text type="secondary">
              {`${totalConBeca || 0} estudiantes con beca`}
            </Text>
            <div className="becas-donut__leyenda">
              {tramosGestion.map((tramo, index) => {
                const pct = Number(tramo.porcentajeDelTotalConBeca) || 0;
                return (
                  <div key={tramo.porcentaje ?? index} className="becas-donut__item">
                    <span
                      className="becas-donut__swatch"
                      style={{ background: getTramoColor(token, tramo.porcentaje, index) }}
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
        )
      ) : grupos.length > 0 ? (
        <ul key={scope} className="becas-mini-grid">
          {grupos.map((grupo) => {
            const acento =
              scope === 'carrera' && grupo.color
                ? buildCarreraHeadingSurfaceStyle(grupo.color)
                : undefined;
            return (
              <li key={grupo.id} className="becas-mini-donut">
                <span className="becas-mini-donut__title" style={acento}>
                  {grupo.label}
                </span>
                <BecasDonutChart
                  tramos={grupo.tramos}
                  size="sm"
                  centerValue={grupo.totalConBeca || 0}
                  ariaLabel={`Distribución de becas — ${grupo.label}`}
                />
                <Text type="secondary" className="becas-mini-donut__caption">
                  {grupo.totalConBeca || 0}{' '}
                  {grupo.totalConBeca === 1 ? 'becado' : 'becados'}
                </Text>
                <MiniLeyenda tramos={grupo.tramos} token={token} />
              </li>
            );
          })}
        </ul>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sin datos para este scope" />
      )}
    </Card>
  );
};

export default BecasDistribucionTipo;
