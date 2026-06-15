/**
 * Celdas de la tabla de coordinación de docentes: icono, carreras con color y
 * métricas apiladas. Compartidas por Calificaciones y Asistencia.
 */

import { Typography } from 'antd';
import {
  AppstoreOutlined,
  BookOutlined,
  ReadOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';

const { Text } = Typography;

const DEFAULT_CARRERA_HEX = '#64748b';

const buildCarreraPillStyle = (hex) => {
  const c = sanitizeDocenteColorHex(hex) || DEFAULT_CARRERA_HEX;
  const r = parseInt(c.slice(1, 3), 16);
  const g = parseInt(c.slice(3, 5), 16);
  const b = parseInt(c.slice(5, 7), 16);
  return {
    borderLeft: `4px solid ${c}`,
    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.14)`,
    color: '#1f2937',
    boxShadow: `inset 0 0 0 1px rgba(${r}, ${g}, ${b}, 0.18)`,
  };
};

export const CoordDocCeldaConIcono = ({ icon, children }) => (
  <div className="coord-doc-celda">
    <span className="coord-doc-celda__icon" aria-hidden>
      {icon}
    </span>
    <div className="coord-doc-celda__contenido">{children}</div>
  </div>
);

export const CoordDocCarrerasCelda = ({ carreras }) => {
  const lista = Array.isArray(carreras) ? carreras : [];
  if (lista.length === 0) {
    return (
      <div className="coord-doc-celda">
        <span className="coord-doc-celda__icon" aria-hidden>
          <BookOutlined />
        </span>
        <Text type="secondary">—</Text>
      </div>
    );
  }

  return (
    <div className="coord-doc-celda coord-doc-celda--carreras">
      <span className="coord-doc-celda__icon" aria-hidden>
        <BookOutlined />
      </span>
      <ul className="coord-doc-carreras-list">
        {lista.map((c) => {
          const key = `${c.nombre}-${c.colorHex ?? ''}`;
          return (
            <li key={key} className="coord-doc-carreras-list__item">
              <span
                className="coord-doc-carrera-pill"
                style={buildCarreraPillStyle(c.colorHex)}
              >
                {c.nombre}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const MetricaLinea = ({ icon, valor, etiqueta }) => (
  <li className="coord-doc-metricas-list__item">
    <span className="coord-doc-metricas-list__icon" aria-hidden>
      {icon}
    </span>
    <span className="coord-doc-metricas-list__texto">
      <Text type="secondary" className="coord-doc-metricas-list__label">
        {valor} {etiqueta != null ? ` ${etiqueta}` : ''}
      </Text>
    </span>
  </li>
);

export const CoordDocMetricasCelda = ({
  cantidadMaterias,
  cantidadCursos,
  cantidadEstudiantes,
}) => (
  <ul className="coord-doc-metricas-list">
    <MetricaLinea
      icon={<ReadOutlined />}
      valor={cantidadMaterias ?? 0}
      etiqueta="materias"
    />
    <MetricaLinea
      icon={<AppstoreOutlined />}
      valor={cantidadCursos ?? 0}
      etiqueta="cursos"
    />
    <MetricaLinea
      icon={<TeamOutlined />}
      valor={cantidadEstudiantes ?? 0}
      etiqueta="estudiantes"
    />
  </ul>
);
