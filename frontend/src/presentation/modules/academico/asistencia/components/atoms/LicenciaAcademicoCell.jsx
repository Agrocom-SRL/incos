/**
 * Celda de información académica de la inscripción de una licencia (lista) — patrón
 * multi-línea de CarreraMetricasCell: carrera, periodo y paralelo en los que está inscrito.
 */

import { Typography } from 'antd';
import { ApartmentOutlined, BankOutlined, ReadOutlined } from '@ant-design/icons';

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

const LicenciaAcademicoCell = ({
  carreraNombre,
  carreraCodigo,
  periodoNombre,
  paraleloNombre,
}) => (
  <ul className="cfg-academico-metricas-list">
    <Linea icon={<BankOutlined />}>
      {carreraNombre ?? '—'}
      {carreraCodigo ? ` · ${carreraCodigo}` : ''}
    </Linea>
    <Linea icon={<ReadOutlined />}>{periodoNombre ?? '—'}</Linea>
    <Linea icon={<ApartmentOutlined />}>
      {paraleloNombre ? `Paralelo ${paraleloNombre}` : '—'}
    </Linea>
  </ul>
);

export default LicenciaAcademicoCell;
