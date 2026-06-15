import { Col, Row } from 'antd';
import { KpiCard } from '@institucional/horarios/components/atoms';

/** KPIs del dashboard índice — etiquetas cortas, grid 4 columnas sin desborde. */
const OfertaDashboardKpiStrip = ({ kpis }) => (
  <Row gutter={[12, 12]} className="oferta-dashboard-kpi-row">
    <Col xs={24} sm={12} xl={6}>
      <KpiCard
        label="Gestiones"
        value={kpis.gestionesActivas}
        sub="Activas"
        badgeText="Total"
        intent="neutral"
      />
    </Col>
    <Col xs={24} sm={12} xl={6}>
      <KpiCard
        label="Planes"
        value={kpis.planesHabilitados}
        sub="Gestión vigente"
        badgeText="Planes"
        intent={kpis.planesHabilitados > 0 ? 'success' : 'warning'}
        percent={kpis.planesHabilitados > 0 ? 100 : 0}
      />
    </Col>
    <Col xs={24} sm={12} xl={6}>
      <KpiCard
        label="OFERTADO"
        value={kpis.ofertados}
        sub="Paralelos"
        badgeText="Estado"
        intent="warning"
      />
    </Col>
    <Col xs={24} sm={12} xl={6}>
      <KpiCard
        label="PUBLICADO"
        value={kpis.publicados}
        sub="Con horario"
        badgeText="Estado"
        intent="success"
      />
    </Col>
  </Row>
);

export default OfertaDashboardKpiStrip;
