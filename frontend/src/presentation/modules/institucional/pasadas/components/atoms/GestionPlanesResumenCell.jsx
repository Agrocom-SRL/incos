/**
 * Top 3 planes habilitados vigentes por gestión (patrón CarreraMetricasCell).
 */

import { BookOutlined, EllipsisOutlined } from '@ant-design/icons';
import { Typography } from 'antd';

const { Text } = Typography;

const Linea = ({ icon, children }) => (
  <li className="cfg-academico-metricas-list__item">
    <span className="cfg-academico-metricas-list__icon" aria-hidden>
      {icon}
    </span>
    <Text type="secondary" className="cfg-academico-metricas-list__label">
      {children}
    </Text>
  </li>
);

const GestionPlanesResumenCell = ({ resumen, loading }) => {
  if (loading && resumen == null) {
    return <Text type="secondary">…</Text>;
  }

  const nombresTop = Array.isArray(resumen?.nombresTop) ? resumen.nombresTop : [];
  if (nombresTop.length === 0) {
    return <Text type="secondary">—</Text>;
  }

  const restantes = resumen?.restantes ?? 0;

  return (
    <ul className="cfg-academico-metricas-list">
      {nombresTop.map((nombre, index) => (
        <Linea key={`${nombre}-${index}`} icon={<BookOutlined />}>
          {nombre}
        </Linea>
      ))}
      {restantes > 0 ? (
        <Linea icon={<EllipsisOutlined />}>+{restantes} más</Linea>
      ) : null}
    </ul>
  );
};

export default GestionPlanesResumenCell;
