import { Row, Col } from 'antd';
import { KpiCard } from '@institucional/horarios/components/atoms';

const fmt = (v) => (v == null ? '—' : v);

/** Métricas globales de la gestión vigente. */
const GestionActualKpiStrip = ({ kpis }) => (
  <Row gutter={[12, 12]}>
    <Col xs={24} sm={12} xl={6}>
      <KpiCard
        label="Matrículas en cursado"
        value={fmt(kpis?.matriculasCursando)}
        sub="Estado CURSANDO"
        badgeText="Cursado"
        intent="success"
      />
    </Col>
    <Col xs={24} sm={12} xl={6}>
      <KpiCard
        label="Cursos"
        value={fmt(kpis?.totalCursos)}
        sub="Asignaciones docentes"
        badgeText="Total"
        intent="neutral"
      />
    </Col>
    <Col xs={24} sm={12} xl={6}>
      <KpiCard
        label="Docentes"
        value={fmt(kpis?.totalDocentes)}
        sub="Activos en la gestión"
        badgeText="Total"
        intent="info"
      />
    </Col>
    <Col xs={24} sm={12} xl={6}>
      <KpiCard
        label="Bimestre vigente"
        value={kpis?.bimestreVigente ? `B${kpis.bimestreVigente}` : '—'}
        sub="Periodo actual"
        badgeText="Calendario"
        intent="warning"
      />
    </Col>
  </Row>
);

export default GestionActualKpiStrip;
