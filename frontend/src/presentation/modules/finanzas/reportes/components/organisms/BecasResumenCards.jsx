/**
 * Organismo: RESUMEN GENERAL de la planilla de becas (KPIs + destacados).
 *
 * Dos bandas:
 *   1) KPIs base con el panel del KIT de planilla (`fin-kpis` / `fin-kpi`, acento
 *      verde): total matriculados, total con beca, % con beca, % sin beca.
 *   2) DESTACADOS derivados del árbol (calculados en el hook `useBecasReportePage`):
 *      carrera con más becados (con su color institucional), periodo de mayor
 *      cobertura y paralelo (agrupado cross-carrera) con más becados.
 *
 * Solo presenta props ya mapeadas: no hace fetch ni deriva nada. Sin literales
 * de color/espaciado salvo el color de carrera, que es de negocio (viene de datos).
 */

import {
  BankOutlined,
  CrownOutlined,
  PercentageOutlined,
  RiseOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { Typography } from 'antd';

const { Text } = Typography;

const formatPorcentaje = (value) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return Math.round(safe).toLocaleString('es-BO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/** Tarjeta de destaque: hito derivado del árbol (nombre + métrica + acento). */
const DestacadoCard = ({ icon, label, value, meta, accent }) => (
  <div className="becas-destacado" style={accent ? { '--becas-destacado-accent': accent } : undefined}>
    <span className="becas-destacado__icon">{icon}</span>
    <span className="becas-destacado__body">
      <span className="becas-destacado__label">{label}</span>
      <Text strong ellipsis={{ tooltip: value }} className="becas-destacado__value">
        {value}
      </Text>
      <span className="becas-destacado__meta">{meta}</span>
    </span>
  </div>
);

const BecasResumenCards = ({ resumen, destacados }) => {
  const data = resumen || {};
  const hitos = destacados || {};

  const items = [
    {
      key: 'matriculados',
      label: 'Total matriculados',
      value: String(data.totalMatriculados || 0),
      icon: <TeamOutlined />,
      variant: '',
    },
    {
      key: 'conBeca',
      label: 'Total con beca',
      value: String(data.totalConBeca || 0),
      icon: <TrophyOutlined />,
      variant: 'fin-kpi--success',
    },
    {
      key: 'porcentajeConBeca',
      label: '% con beca',
      value: `${formatPorcentaje(data.porcentajeConBeca)}%`,
      icon: <PercentageOutlined />,
      variant: 'fin-kpi--success',
    },
    {
      key: 'porcentajeSinBeca',
      label: '% sin beca',
      value: `${formatPorcentaje(data.porcentajeSinBeca)}%`,
      icon: <BankOutlined />,
      variant: 'fin-kpi--warning',
    },
  ];

  const { carreraTopBecados, periodoMayorCobertura, paraleloTopBecados } = hitos;
  const hayDestacados =
    carreraTopBecados || periodoMayorCobertura || paraleloTopBecados;

  return (
    <div className="becas-resumen">
      <div className="fin-kpis">
        {items.map((item) => (
          <div key={item.key} className={`fin-kpi ${item.variant}`.trim()}>
            <span className="fin-kpi__icon">{item.icon}</span>
            <span className="fin-kpi__body">
              <span className="fin-kpi__valor">{item.value}</span>
              <span className="fin-kpi__label">{item.label}</span>
            </span>
          </div>
        ))}
      </div>

      {hayDestacados ? (
        <div className="becas-destacados">
          {carreraTopBecados ? (
            <DestacadoCard
              icon={<CrownOutlined />}
              label="Carrera con más becados"
              value={carreraTopBecados.label}
              meta={`${carreraTopBecados.valor} ${carreraTopBecados.valor === 1 ? 'becado' : 'becados'}`}
              accent={carreraTopBecados.color || undefined}
            />
          ) : null}
          {periodoMayorCobertura ? (
            <DestacadoCard
              icon={<RiseOutlined />}
              label="Periodo de mayor cobertura"
              value={periodoMayorCobertura.label}
              meta={`${formatPorcentaje(periodoMayorCobertura.valor)}% de cobertura`}
            />
          ) : null}
          {paraleloTopBecados ? (
            <DestacadoCard
              icon={<TrophyOutlined />}
              label="Paralelo con más becados"
              value={paraleloTopBecados.label}
              meta={`${paraleloTopBecados.valor} ${paraleloTopBecados.valor === 1 ? 'becado' : 'becados'}`}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default BecasResumenCards;
