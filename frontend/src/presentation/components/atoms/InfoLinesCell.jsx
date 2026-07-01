/**
 * Átomo: celda multi-línea de listados (patrón `cfg-academico-metricas-list`).
 *
 * Cada línea = icono opcional + etiqueta. Reemplaza el antiguo combo
 * `Space orientation="vertical"` + `TableCell` con estilos inline en los configs de
 * columnas, para que todas las tablas compartan el mismo lenguaje visual que la
 * referencia (CarreraMetricasCell / LicenciaAcademicoCell). Las líneas con
 * `label` vacío/nulo se omiten; si no queda ninguna, muestra un guion.
 *
 * @param {Array<{key?:string|number, icon?:React.ReactNode, label:React.ReactNode, style?:object, className?:string}>} lines
 */

import { Typography } from 'antd';

const { Text } = Typography;

const InfoLinesCell = ({ lines = [] }) => {
  const visibles = lines.filter((l) => l && l.label != null && l.label !== '');

  if (visibles.length === 0) {
    return (
      <ul className="cfg-academico-metricas-list">
        <li className="cfg-academico-metricas-list__item">
          <Text type="secondary" className="cfg-academico-metricas-list__label">
            —
          </Text>
        </li>
      </ul>
    );
  }

  return (
    <ul className="cfg-academico-metricas-list">
      {visibles.map((l, i) => (
        <li
          key={l.key ?? i}
          className={`cfg-academico-metricas-list__item${l.className ? ` ${l.className}` : ''}`}
        >
          {l.icon ? (
            <span className="cfg-academico-metricas-list__icon" aria-hidden>
              {l.icon}
            </span>
          ) : null}
          <Text type="secondary" className="cfg-academico-metricas-list__label" style={l.style}>
            {l.label}
          </Text>
        </li>
      ))}
    </ul>
  );
};

export default InfoLinesCell;
