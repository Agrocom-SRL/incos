import { Col, Row } from 'antd';
import { KpiCard } from '../atoms';

const HorariosKpiStrip = ({ kpis }) => {
    const total = kpis.total || 1;
    return (
        <Row gutter={[12, 12]}>
            <Col xs={24} md={12} xl={8} xxl={4}>
                <KpiCard label="Total paralelos" value={kpis.total} sub="Base de gestion" badgeText="100%" intent="neutral" percent={100} />
            </Col>
            <Col xs={24} md={12} xl={8} xxl={5}>
                <KpiCard label="Incompletos" value={kpis.incompletos} sub="Les faltan cursos" badgeText="Cobertura" intent="warning" percent={Math.round((kpis.incompletos / total) * 100)} />
            </Col>
            <Col xs={24} md={12} xl={8} xxl={5}>
                <KpiCard label="Sin horario" value={kpis.sinHorario} sub="Cursos sin franja" badgeText="Pendiente" intent="info" percent={Math.round((kpis.sinHorario / total) * 100)} />
            </Col>
            <Col xs={24} md={12} xl={12} xxl={5}>
                <KpiCard label="Con conflictos" value={kpis.conConflicto} sub="Colisiones activas" badgeText="Riesgo" intent="danger" percent={Math.round((kpis.conConflicto / total) * 100)} />
            </Col>
            <Col xs={24} md={12} xl={12} xxl={5}>
                <KpiCard label="Completos" value={kpis.completos} sub="Listos para publicar" badgeText="OK" intent="success" percent={Math.round((kpis.completos / total) * 100)} />
            </Col>
        </Row>
    );
};

export default HorariosKpiStrip;
