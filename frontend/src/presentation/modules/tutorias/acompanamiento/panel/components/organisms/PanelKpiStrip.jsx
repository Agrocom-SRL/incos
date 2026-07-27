/**
 * Organismo: stat-cards del panel de acompañamiento (TUT · A10).
 *
 * Reusa el `KpiCard` compartido de Institucional (mismo patrón que
 * `GestionActualKpiStrip`): SIN librería de gráficos nueva (decisión cerrada
 * del plan). Colores por intención semántica del theme (danger/info/success),
 * nunca hex. El `percent` es acento visual coherente con el dato.
 */

import { Row, Col } from 'antd';
import { KpiCard } from '@institucional/horarios/components/atoms';

const fmt = (v) => (v == null ? '—' : v);

const PanelKpiStrip = ({ totales }) => {
  const pctRiesgo = totales?.pctEstudiantesRiesgo ?? 0;
  const programadas = totales?.sesionesProgramadas ?? 0;
  const realizadas = totales?.sesionesRealizadas ?? 0;
  const pctAsistencia = totales?.pctAsistencia ?? 0;

  return (
    <Row gutter={[12, 12]} align="stretch">
      <Col xs={24} sm={12} xl={6}>
        <KpiCard
          label="Estudiantes en riesgo"
          value={fmt(totales?.estudiantesEnRiesgo)}
          sub={`De ${fmt(totales?.totalEstudiantes)} estudiantes con notas`}
          badgeText={`${pctRiesgo}%`}
          intent="danger"
          percent={pctRiesgo}
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <KpiCard
          label="Estudiantes evaluados"
          value={fmt(totales?.totalEstudiantes)}
          sub="Con notas en la gestión vigente"
          badgeText="Total"
          intent="info"
          percent={totales?.totalEstudiantes ? 100 : 0}
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <KpiCard
          label="Sesiones de refuerzo"
          value={`${realizadas} / ${programadas}`}
          sub="Realizadas de programadas"
          badgeText="Sesiones"
          intent="neutral"
          percent={programadas > 0 ? Math.round((realizadas / programadas) * 100) : 0}
        />
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <KpiCard
          label="Asistencia a sesiones"
          value={`${pctAsistencia}%`}
          sub="Asistencias sobre convocados"
          badgeText="Asistencia"
          intent="success"
          percent={pctAsistencia}
        />
      </Col>
    </Row>
  );
};

export default PanelKpiStrip;
