/**
 * Carga asignada al docente: totales materias / paralelos.
 */

import { ApartmentOutlined, ReadOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import StatusPill from '@atoms/StatusPill';

const { Text } = Typography;

const Linea = ({ icon, valor, etiqueta }) => (
  <li className="cfg-academico-metricas-list__item">
    <span className="cfg-academico-metricas-list__icon" aria-hidden>
      {icon}
    </span>
    <Text type="secondary" className="cfg-academico-metricas-list__label">
      {valor} {etiqueta}
    </Text>
  </li>
);

const DocenteCargaCell = ({ totalMaterias = 0, totalParalelos = 0, hasAsignaciones = false }) => {
  if (!hasAsignaciones) {
    return <StatusPill label="Sin materias" className="cfg-materia-pill cfg-materia-pill--default" />;
  }

  return (
    <ul className="cfg-academico-metricas-list">
      <Linea
        icon={<ReadOutlined />}
        valor={totalMaterias}
        etiqueta={totalMaterias === 1 ? 'materia' : 'materias'}
      />
      <Linea
        icon={<ApartmentOutlined />}
        valor={totalParalelos}
        etiqueta={totalParalelos === 1 ? 'paralelo' : 'paralelos'}
      />
    </ul>
  );
};

export default DocenteCargaCell;
