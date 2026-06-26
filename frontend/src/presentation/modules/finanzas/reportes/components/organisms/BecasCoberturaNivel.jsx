/**
 * Organismo: COBERTURA POR NIVEL (barras horizontales) en su propia card.
 *
 * Un `Segmented` [Carrera · Periodo · Paralelo] cambia el grano de las barras:
 * el ancho de cada barra = % de cobertura de la entidad y la etiqueta numérica
 * trae sus becados. La AGRUPACIÓN es cross-carrera y llega ya resuelta desde el
 * hook de estado (`coberturaPorNivelAgrupado`):
 *   - Carrera: una barra por carrera (color institucional de la carrera).
 *   - Periodo: agrupa por número de periodo cruzando las 3 carreras.
 *   - Paralelo: agrupa por nombre de paralelo cruzando las 3 carreras.
 *
 * Color por entidad: en Carrera usa el color institucional (de datos); en
 * Periodo/Paralelo, la paleta categórica del theme (`getEntidadColor`, sin #hex).
 * El cambio de nivel re-anima las barras (motion motivado, CSS con respeto a
 * `prefers-reduced-motion`).
 */

import { useState } from 'react';
import { Card, Empty, Typography, theme } from 'antd';
import { ReadOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons';
import BecasScopeSegmented from '@finanzas/reportes/components/molecules/BecasScopeSegmented';
import { getEntidadColor } from '@finanzas/reportes/config/becasTramoColors';

const { Text } = Typography;

const NIVEL_OPCIONES = [
  { label: 'Carrera', value: 'carrera', icon: <ReadOutlined /> },
  { label: 'Periodo', value: 'periodo', icon: <CalendarOutlined /> },
  { label: 'Paralelo', value: 'paralelo', icon: <TeamOutlined /> },
];

const formatPorcentaje = (value) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return Math.round(safe).toLocaleString('es-BO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const BecasCoberturaNivel = ({
  coberturaPorNivelAgrupado = { carrera: [], periodo: [], paralelo: [] },
}) => {
  const { token } = theme.useToken();
  const [nivel, setNivel] = useState('carrera');

  const entidades = Array.isArray(coberturaPorNivelAgrupado?.[nivel])
    ? coberturaPorNivelAgrupado[nivel]
    : [];

  return (
    <Card variant="outlined" title="Cobertura por nivel">
      <div className="becas-nivel-chart">
        <BecasScopeSegmented
          options={NIVEL_OPCIONES}
          value={nivel}
          onChange={setNivel}
          ariaLabel="Nivel de agrupación de la cobertura"
        />
        {entidades.length > 0 ? (
          <ul key={nivel} className="becas-nivel-chart__lista">
            {entidades.map((entidad, index) => {
              const cobertura = Number(entidad.porcentajeCobertura) || 0;
              const ancho = Math.max(0, Math.min(100, cobertura));
              const color = entidad.color || getEntidadColor(token, index);
              return (
                <li
                  key={entidad.id ?? index}
                  className="becas-nivel-chart__item"
                  style={{ '--bar-index': index }}
                >
                  <div className="becas-nivel-chart__row">
                    <Text
                      className="becas-nivel-chart__label"
                      ellipsis={{ tooltip: entidad.label }}
                    >
                      {entidad.label}
                    </Text>
                    <Text type="secondary" className="becas-nivel-chart__valor">
                      {entidad.totalConBeca || 0} · {formatPorcentaje(cobertura)}%
                    </Text>
                  </div>
                  {Array.isArray(entidad.carreras) && entidad.carreras.length > 0 && (
                    <ul
                      className="becas-nivel-chart__carreras"
                      aria-label={`Carreras del paralelo ${entidad.label}`}
                    >
                      {entidad.carreras.map((carrera) => (
                        <li
                          key={carrera.carreraId}
                          className="becas-nivel-chart__carrera"
                        >
                          {carrera.color && (
                            // Color de negocio (carrera) ya saneado por la utilidad.
                            <span
                              className="becas-nivel-chart__carrera-dot"
                              style={{ background: carrera.color }}
                              aria-hidden="true"
                            />
                          )}
                          <Text
                            type="secondary"
                            className="becas-nivel-chart__carrera-text"
                            ellipsis={{ tooltip: carrera.carreraNombre }}
                          >
                            {carrera.carreraNombre}
                          </Text>
                        </li>
                      ))}
                    </ul>
                  )}
                  <span className="becas-nivel-chart__bar" aria-hidden="true">
                    <span
                      className="becas-nivel-chart__bar-fill"
                      style={{ width: `${ancho}%`, background: color }}
                    />
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sin datos para este nivel" />
        )}
      </div>
    </Card>
  );
};

export default BecasCoberturaNivel;
