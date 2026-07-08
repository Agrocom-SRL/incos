/**
 * Átomo: usos de un ítem de catálogo complementario (estudiantes / docentes / personal).
 * Gemelo de `CarreraMetricasCell` (tab Académico): lista `cfg-academico-metricas-list`
 * (átomos globales, `styles/components/atoms/table-cells.css`) con icono + "N etiqueta".
 * Sin usos (todos los conteos en 0) → `StatusPill` neutro "Sin uso".
 */

import { SolutionOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import { StatusPill } from '@atoms';

const { Text } = Typography;

/** Etiqueta con singular/plural correcto ("1 estudiante" / "2 estudiantes"). */
const pluralizar = (cantidad, singular, plural) => (cantidad === 1 ? singular : plural);

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

const CatalogoUsosCell = ({ cantidadEstudiantes = 0, cantidadDocentes = 0, cantidadPersonal = 0 }) => {
  const estudiantes = Number(cantidadEstudiantes) || 0;
  const docentes = Number(cantidadDocentes) || 0;
  const personal = Number(cantidadPersonal) || 0;

  if (estudiantes <= 0 && docentes <= 0 && personal <= 0) {
    return <StatusPill label="Sin uso" className="cfg-materia-pill cfg-materia-pill--default" />;
  }

  return (
    <ul className="cfg-academico-metricas-list">
      {estudiantes > 0 && (
        <Linea
          icon={<TeamOutlined />}
          valor={estudiantes}
          etiqueta={pluralizar(estudiantes, 'estudiante', 'estudiantes')}
        />
      )}
      {docentes > 0 && (
        <Linea
          icon={<SolutionOutlined />}
          valor={docentes}
          etiqueta={pluralizar(docentes, 'docente', 'docentes')}
        />
      )}
      {personal > 0 && (
        <Linea icon={<UserOutlined />} valor={personal} etiqueta="personal" />
      )}
    </ul>
  );
};

export default CatalogoUsosCell;
